# Cloudflareのセットアップ

## Cloud Run ドメインマッピング

```bash
# Cloud Run ドメインマッピング
gcloud beta run domain-mappings create \
--service=[service-name] \
--domain=[domain-name]

# Cloud Run ドメインマッピング一覧
gcloud beta run domain-mappings list --region=[region]

# Cloud Run ドメインマッピング詳細
gcloud beta run domain-mappings describe \
--domain=[domain-name] \
--region=[region]
```
