# ---------------------------------------------
# Cloud Run
# ---------------------------------------------
# Google Cloud Run のサービスアカウントを作成
resource "google_service_account" "cloud_run_sa" {
  account_id   = "cloud-run-sa"
  display_name = "Cloud Run Service Account"

  # 同じ GCP プロジェクトの別サービス（echo-blog-app / nextjs-echo-chat-app-service）もこの SA で動いている。
  # このリポジトリの destroy / replace で消すと他サービスが停止するため、削除を禁止する。
  lifecycle {
    prevent_destroy = true
  }
}

# Google Cloud Run にデプロイするサービス
resource "google_cloud_run_service" "nextjs_hono_portal_app_service" {
  name     = var.service_name
  location = var.gcp_region

  metadata {
    namespace = var.gcp_project_id
  }

  template {
    spec {
      containers {
        image = "${var.gcp_region}-docker.pkg.dev/${var.gcp_project_id}/${google_artifact_registry_repository.nextjs_hono_portal_app_repo.repository_id}/${var.app_name}"

        ports {
          container_port = var.http_port
        }
        resources {
          limits = {
            cpu    = "1000m"
            memory = "512Mi"
          }
        }

        env {
          name  = "NODE_ENV"
          value = var.node_env
        }
        env {
          name  = "ALLOWED_ORIGIN"
          value = var.allowed_origin
        }
        env {
          name  = "BACKEND_API_URL"
          value = var.backend_api_url
        }
        env {
          name  = "GCS_PRIVATE_BUCKET_NAME"
          value = var.gcs_private_bucket_name
        }
        env {
          name  = "GCS_COMMON_DATA_PATH"
          value = var.gcs_common_data_path
        }
        env {
          name  = "GCS_PERSONAL_DATA_PATH"
          value = var.gcs_personal_data_path
        }
        env {
          name  = "GCS_AIUSAGE_DATA_PATH"
          value = var.gcs_aiusage_data_path
        }
        # 秘密は Secret Manager から注入する（値は Terraform を通らない。secret_manager.tf）。
        # latest はインスタンスの起動時に解決される。ローテーション後は、新しい revision を作って
        # 全インスタンスを入れ替える（既存インスタンスは古い値のまま動き続けるため）。
        dynamic "env" {
          for_each = local.app_secrets
          content {
            name = env.key
            value_from {
              secret_key_ref {
                name = google_secret_manager_secret.app[env.key].secret_id
                key  = "latest"
              }
            }
          }
        }
        env {
          name  = "RESEND_SEND_DOMAIN"
          value = var.resend_send_domain
        }
      }
      service_account_name = google_service_account.cloud_run_sa.email
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

  # 読み取り権限が付く前に revision を作ると、secret を解決できず起動に失敗する。
  depends_on = [
    google_artifact_registry_repository.nextjs_hono_portal_app_repo,
    google_secret_manager_secret_iam_member.app_accessor,
  ]
}
