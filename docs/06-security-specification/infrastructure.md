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
| Terraform state / tfvars | 共有バケット `gs://my-infra-tfstate/nextjs-hono-portal-web-app/` に置き Git に含めない。**秘密（`RESEND_API_KEY` / `MY_MAIL_ADDRESS`）は含まない**（下記 Secret Manager）。ただしバージョニングにより、移行前（issue #142 以前）の state の旧版には平文が残る。バケットは公開アクセス防止（`enforced`）・均一バケットレベルアクセス・バージョニングを有効化済み（[09-architecture-specification/iac.md](../09-architecture-specification/iac.md)） |
| state の信頼境界 | GCS の権限はバケット単位のため、**バケットへの read 権限を持つ主体は全プロジェクトの state / tfvars を読める**（prefix は権限境界ではない）。バケットは本アプリと同じ GCP プロジェクトにあるため、プロジェクト権限を継承する主体（デフォルト Compute SA 等）も対象になりうる。主体の整理は `my-infra-workspace` 側で扱う |
| Secret Manager | `RESEND_API_KEY` / `MY_MAIL_ADDRESS` は secret（`nextjs-hono-portal-*`）に置き、Cloud Run が `latest` 版を起動時に注入する。**Terraform は器と IAM だけを管理し値を持たない**ため、tfvars・state・`plan` 出力・イメージ内 `.env` のいずれにも値が入らない（issue #142）。値の投入・ローテーションは [manuals/terraform.md](../../manuals/terraform.md) |
| 実行 SA と読み取り権限 | Cloud Run は **portal 専用の実行 SA `nextjs-hono-portal-run`** で動く。`secretAccessor`（**secret 単位**。プロジェクト単位にしない）とバケットの `objectViewer` はこの SA にだけ付与し、同じプロジェクトの他アプリ（共有 SA `cloud-run-sa` で動く `echo-blog-app` 等）からは読めない。付与はすべて Terraform 管理（issue #143） |

## 7. 環境変数（セキュリティ関連）

| 変数名 | 説明 |
|--------|------|
| `ALLOWED_ORIGIN` | CORS許可オリジン |
| `RESEND_API_KEY` | Resend APIキー |
| `MY_MAIL_ADDRESS` | メール送信先アドレス |
| `RESEND_SEND_DOMAIN` | Resend送信ドメイン |

