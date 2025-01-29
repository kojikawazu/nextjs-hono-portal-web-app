# ---------------------------------------------
# Google Cloud Storage
# ---------------------------------------------
resource "google_storage_bucket" "nextjs_hono_gcs_portal_app_bkt" {
  name          = "${var.gcp_project_id}-portal-app-bucket"
  location      = var.gcp_region
  storage_class = "STANDARD"

  versioning {
    enabled = true
  }

  cors {
    #origin          = ["https://example.com"] # 許可するオリジン
    method          = ["GET", "PUT", "POST", "DELETE"]
    response_header = ["*"]
    max_age_seconds = 3600
  }

  labels = {
    environment = var.environment
  }
}

resource "google_storage_bucket_iam_member" "viewer" {
  bucket = google_storage_bucket.nextjs_hono_gcs_portal_app_bkt.name
  role   = "roles/storage.objectViewer"
  member = "serviceAccount:${var.service_account_email}"
}

resource "google_storage_bucket_iam_member" "editor" {
  bucket = google_storage_bucket.nextjs_hono_gcs_portal_app_bkt.name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${var.service_account_email}"
}
