# ---------------------------------------------
# Variables
# ---------------------------------------------
variable "project" {
  type = string
}

variable "environment" {
  type = string
}

variable "gcp_project_id" {
  type = string
}

variable "gcp_region" {
  type = string
}

variable "service_account_email" {
  type = string
}

variable "http_port" {
  type = number
}

variable "invoker_member" {
  type = string
}

variable "invoker_role" {
  type = string
}

variable "service_name" {
  type = string
}

variable "repository_id" {
  type = string
}

variable "app_name" {
  type = string
}

variable "custom_domain_name" {
  type = string
}

variable "domain_zone_name" {
  type = string
}

variable "domain_zone_dns_name" {
  type = string
}

variable "gcs_private_bucket_name" {
  type = string
}

variable "gcs_common_data_path" {
  type = string
}

variable "gcs_personal_data_path" {
  type = string
}

variable "gcs_sample_data_path" {
  type = string
}

variable "node_env" {
  type = string
}

variable "allowed_origin" {
  type = string
}

variable "backend_api_url" {
  type = string
}

variable "my_mail_address" {
  type = string
}

variable "resend_api_key" {
  type = string
}

variable "resend_send_domain" {
  type = string
}

# variable "api_validate_secret_token" {
#   type = string
# }

# variable "api_secret_token" {
#   type = string
# }

# variable "next_public_api_token" {
#   type = string
# }
