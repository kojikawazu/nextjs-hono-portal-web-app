# ---------------------------------------------
# Secret Manager
# ---------------------------------------------
# Terraform は secret の器・IAM・参照だけを持ち、値（version）は持たない。
# google_secret_manager_secret_version に値を書くと tfvars / state に平文が戻るため使わない。
# 値の投入・ローテーションは manuals/terraform.md の手順で gcloud から行う（issue #142）。
locals {
  # Cloud Run の環境変数名 → secret_id。
  # 同じ GCP プロジェクトに他アプリの secret があるため、アプリ名の接頭辞を付ける。
  app_secrets = {
    RESEND_API_KEY  = "nextjs-hono-portal-resend-api-key"
    MY_MAIL_ADDRESS = "nextjs-hono-portal-my-mail-address"
  }
}

resource "google_secret_manager_secret" "app" {
  for_each  = local.app_secrets
  secret_id = each.value

  replication {
    auto {}
  }

  # 削除すると全 version が消え、値を復元できない。
  lifecycle {
    prevent_destroy = true
  }
}

# secret 単位で、portal 専用の実行 SA にだけ付与する（プロジェクト単位にしない）。
resource "google_secret_manager_secret_iam_member" "app_accessor" {
  for_each  = local.app_secrets
  secret_id = google_secret_manager_secret.app[each.key].secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.portal_run.email}"

  # member の変更は置き換えになる。既定の「削除 → 作成」だと、Cloud Run が新 SA へ切り替わる前に
  # 旧 SA の権限が消え、旧 revision で起動するインスタンスが secret を解決できない。
  # 先に作成し、旧付与の削除をこれに依存する Cloud Run の更新後まで遅らせる。
  lifecycle {
    create_before_destroy = true
  }
}
