# ---------------------------------------------
# Terraform configuration
# ---------------------------------------------
terraform {
  # removed ブロック（cloud_run.tf）に 1.7 以上が必要
  required_version = ">=1.7"

  # state は共有バケットに prefix = リポジトリ名で置く（.claude/rules/iac.md）
  backend "gcs" {
    bucket = "my-infra-tfstate"
    prefix = "nextjs-hono-portal-web-app"
  }

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

# ---------------------------------------------
# Provider
# ---------------------------------------------
provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}
