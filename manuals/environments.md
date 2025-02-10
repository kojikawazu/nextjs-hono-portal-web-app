# 環境変数の設定

## アプリケーション側の設定

.envに以下の環境変数を設定します。

```bash
NODE_ENV=
ALLOWED_ORIGIN=
BACKEND_API_URL=
GCS_PRIVATE_BUCKET_NAME=
GCS_COMMON_DATA_PATH=
GCS_PERSONAL_DATA_PATH=
GCS_SAMPLE_DATA_PATH=
MY_MAIL_ADDRESS=
RESEND_API_KEY=
RESEND_SEND_DOMAIN=
```

## Terraformの設定

terraform.tfvarsに以下の環境変数を設定します。

```bash
project = ""
environment = ""
gcp_project_id = ""
gcp_region = ""
service_account_email = ""
http_port = 
invoker_member = ""
invoker_role = ""
service_name = ""
repository_id = ""
app_name = ""
custom_domain_name = ""
domain_zone_name = ""
domain_zone_dns_name = ""
gcs_private_bucket_name = ""
gcs_common_data_path = ""
gcs_personal_data_path = ""
gcs_sample_data_path = ""
node_env = ""
allowed_origin = ""
backend_api_url = ""
my_mail_address = ""
resend_api_key = ""
resend_send_domain = ""
```

## GitHub Actionsの設定

.github/workflows/deploy-to-googlecloud.ymlに以下のシークレットを使用します。
GitHubのリポジトリのSettingsからSecrets and variablesを選択し、以下のシークレットを設定します。

```bash
GCP_SERVICE_ACCOUNT_KEY
GCP_PROJECT_ID
GCP_REGION
REPO_NAME
APP_NAME
GCP_CLOUD_RUN_SERVICE_NAME
NODE_ENV
ALLOWED_ORIGIN
BACKEND_API_URL
GCS_PRIVATE_BUCKET_NAME
GCS_COMMON_DATA_PATH
GCS_PERSONAL_DATA_PATH
GCS_SAMPLE_DATA_PATH
MY_MAIL_ADDRESS
RESEND_API_KEY
RESEND_SEND_DOMAIN
API_VALIDATE_SECRET_TOKEN
API_SECRET_TOKEN
NEXT_PUBLIC_API_TOKEN
```
