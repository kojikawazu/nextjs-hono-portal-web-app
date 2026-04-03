# タスク（Tasks）

## 1. 完了済みタスク

| ID | タスク | 状態 |
|----|-------|------|
| T-01 | ホームページ（Hero + Navbar）の実装 | 完了 |
| T-02 | 個人開発履歴ページの実装 | 完了 |
| T-03 | サンプル開発履歴ページの実装 | 完了 |
| T-04 | お問い合わせフォーム（入力→確認→完了）の実装 | 完了 |
| T-05 | GCSデータ取得APIの実装 | 完了 |
| T-06 | メール送信API（Resend）の実装 | 完了 |
| T-07 | CSRF対策の実装 | 完了 |
| T-08 | CORS設定の実装 | 完了 |
| T-09 | レスポンシブデザイン対応 | 完了 |
| T-10 | ページ遷移アニメーションの実装 | 完了 |
| T-11 | Dockerマルチステージビルド構成 | 完了 |
| T-12 | GitHub Actions CI/CDパイプライン構築 | 完了 |
| T-13 | Terraform IaC構築 | 完了 |
| T-14 | Cloudflare導入 | 完了 |
| T-15 | Jest ユニットテスト作成（GCS API） | 完了 |
| T-16 | Playwright E2Eテスト作成 | 完了 |
| T-17 | Next.js 16へのアップグレード | 完了 |
| T-18 | セキュリティ脆弱性修正（npm audit fix） | 完了 |
| T-19 | 仕様書の作成 | 完了 |

## 2. 未対応・検討中タスク

| ID | タスク | 優先度 | 備考 |
|----|-------|--------|------|
| T-B01 | 残存するnpm脆弱性の対応（8件） | 中 | ESLint/Next.js関連、本番影響は限定的 |
| T-B02 | 画像最適化の有効化 | 低 | `next/image`の`unoptimized`をfalseに変更 |
| T-B03 | `useIsHomePath`の命名修正 | 低 | 名前と実装が逆 |
| T-B04 | npmからpnpmへのパッケージマネージャー移行 | 中 | package.json・Dockerfile・GitHub Actions・ロックファイルの変更が必要。[#25](https://github.com/kojikawazu/nextjs-hono-portal-web-app/issues/25) |

## 3. マイルストーン

| マイルストーン | 状態 |
|-------------|------|
| v1.0 サイトリニューアル公開 | 完了 |
| v1.1 セキュリティ強化（Next.js 16対応） | 完了 |
