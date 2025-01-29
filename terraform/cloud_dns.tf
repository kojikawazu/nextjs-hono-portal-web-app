# --------------------------------------------------------------
# Cloud DNS の管理ゾーンを作成
# --------------------------------------------------------------
resource "google_dns_managed_zone" "domain_zone" {
  name        = var.domain_zone_name
  dns_name    = var.domain_zone_dns_name
  description = "Managed zone for ${var.domain_zone_dns_name}"
}

# --------------------------------------------------------------
# Google Cloud Run ドメインマッピング (カスタムドメイン)
# --------------------------------------------------------------
resource "google_cloud_run_domain_mapping" "custom_domain" {
  name     = var.custom_domain_name
  location = var.gcp_region

  metadata {
    namespace = var.gcp_project_id
  }

  spec {
    route_name       = google_cloud_run_service.nextjs_hono_portal_app_service.name
    certificate_mode = "AUTOMATIC"
  }

  depends_on = [
    google_cloud_run_service.nextjs_hono_portal_app_service
  ]
}
