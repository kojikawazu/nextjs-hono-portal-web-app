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

## 7. 環境変数（セキュリティ関連）

| 変数名 | 説明 |
|--------|------|
| `ALLOWED_ORIGIN` | CORS許可オリジン |
| `RESEND_API_KEY` | Resend APIキー |
| `MY_MAIL_ADDRESS` | メール送信先アドレス |
| `RESEND_SEND_DOMAIN` | Resend送信ドメイン |

