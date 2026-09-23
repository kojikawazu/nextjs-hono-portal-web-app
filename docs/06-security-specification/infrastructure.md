# インフラ・環境変数のセキュリティ

インフラレベルの防御と、セキュリティに関わる環境変数。index は [README.md](./README.md)。

## 6. インフラレベルのセキュリティ

| レイヤー | 対策 |
|---------|------|
| Cloudflare | DDoS保護、WAF、SSL/TLS終端 |
| Cloud Run | IAMによるアクセス制御 |
| GCS | プライベートバケット（サービスアカウント認証） |
| Docker | alpineベースの最小イメージ |
| GitHub Actions | Secretsによる機密情報管理 |
| Terraform state / tfvars | 共有バケット `gs://my-infra-tfstate/nextjs-hono-portal-web-app/` に置き Git に含めない。**state には Cloud Run の環境変数（`RESEND_API_KEY` 等）が平文で入る**ため、tfvars を同じバケットに置いても読める範囲は広がらない。バケットは公開アクセス防止（`enforced`）・均一バケットレベルアクセス・バージョニングを有効化済み（[09-architecture-specification/iac.md](../09-architecture-specification/iac.md)） |
| state の信頼境界 | GCS の権限はバケット単位のため、**バケットへの read 権限を持つ主体は全プロジェクトの state / tfvars を読める**（prefix は権限境界ではない）。バケットは本アプリと同じ GCP プロジェクトにあるため、プロジェクト権限を継承する主体（デフォルト Compute SA 等）も対象になりうる。主体の整理は `my-infra-workspace` 側で扱う |
| plan 出力のマスク | `resend_api_key` / `my_mail_address` は `sensitive = true` とし、`plan` / `apply` の出力に値を出さない |

## 7. 環境変数（セキュリティ関連）

| 変数名 | 説明 |
|--------|------|
| `ALLOWED_ORIGIN` | CORS許可オリジン |
| `RESEND_API_KEY` | Resend APIキー |
| `MY_MAIL_ADDRESS` | メール送信先アドレス |
| `RESEND_SEND_DOMAIN` | Resend送信ドメイン |

