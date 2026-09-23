# ---------------------------------------------
# Terraform configuration
# ---------------------------------------------
terraform {
  required_version = ">=1.6"

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
