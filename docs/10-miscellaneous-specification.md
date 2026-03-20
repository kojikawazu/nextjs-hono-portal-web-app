# その他仕様書（Miscellaneous Specification）

## 1. 用語集

| 用語 | 説明 |
|------|------|
| GCS | Google Cloud Storage。コンテンツデータの保存先 |
| Cloud Run | Googleのサーバーレスコンテナ実行環境 |
| Hono | 軽量なWebフレームワーク。本プロジェクトではNext.js API Route内で使用 |
| Resend | メール送信SaaS。お問い合わせフォームからのメール送信に使用 |
| CSRF | Cross-Site Request Forgery。CSRFトークンによる対策を実装 |
| sessionStorage | ブラウザのセッションストレージ。お問い合わせフォームの一時データ保持に使用 |
| shadcn/ui | Radix UIベースのUIコンポーネントライブラリ。Input, Label, Textarea で使用 |
| Catch-all Route | Next.js App Routerの `[[...route]]` パターン。全APIパスをHonoにルーティング |
| PulseLoader | react-spinnersのローディングコンポーネント |

## 2. 環境変数一覧

### アプリケーション

| 変数名 | 説明 | 必須 |
|--------|------|------|
| `NODE_ENV` | 実行環境 (`development` / `production`) | はい |
| `ALLOWED_ORIGIN` | CORS許可オリジン | はい |
| `BACKEND_API_URL` | バックエンドAPIのURL | いいえ |
| `GCS_PRIVATE_BUCKET_NAME` | GCSプライベートバケット名 | はい |
| `GCS_COMMON_DATA_PATH` | 共通データJSONのパス | はい |
| `GCS_PERSONAL_DATA_PATH` | 個人開発データJSONのパス | はい |
| `GCS_SAMPLE_DATA_PATH` | サンプル開発データJSONのパス | はい |
| `MY_MAIL_ADDRESS` | メール送信先アドレス | はい |
| `RESEND_API_KEY` | Resend APIキー | はい |
| `RESEND_SEND_DOMAIN` | Resend送信ドメイン | はい |

### Terraform

Terraform変数の詳細は `manuals/environments.md` を参照。

### GitHub Actions Secrets

CI/CDで使用するシークレットの詳細は `manuals/environments.md` を参照。

## 3. 外部サービス

| サービス | 用途 | 接続方法 |
|---------|------|---------|
| Google Cloud Storage | コンテンツデータ保存 | `@google-cloud/storage` SDK |
| Resend | メール送信 | `resend` SDK |
| Cloudflare | CDN / WAF / DNS | インフラレベル（コード接続なし） |
| GitHub | ソースコード管理 / CI/CD | GitHub Actions |

## 4. 既知の制限事項

- 画像最適化が無効（`unoptimized: true`）のため、画像のパフォーマンス最適化は行われない
- GCSデータの更新にはJSONファイルの直接編集が必要（CMS未導入）
- CSRFトークンのヘッダー値がJSON文字列として送信されるため、サーバー側で `JSON.parse` が必要
- `useIsHomePath` の名前が実装と逆（`pathname !== '/'` を返すため、ホーム以外で `true`）

## 5. 参考リンク

- 公開サイト: smartportalcom.com
- アーキテクチャ図: `architecture/architecture.drawio.png`
- 環境変数マニュアル: `manuals/environments.md`
- セキュリティ監査: `docs/security-audit-report.md`
