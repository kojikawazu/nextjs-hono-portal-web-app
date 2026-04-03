# 非機能仕様書（Non-Functional Specification）

## 1. パフォーマンス

| 項目 | 要件 |
|------|------|
| 初回読み込み | GCSデータ取得中はPulseLoaderでローディング表示 |
| ページ遷移 | Framer Motionで0.5秒のフェードアニメーション |
| 画像最適化 | `next/image` 使用（現在は `unoptimized: true` で無効化） |
| コンテナ起動 | Cloud Run上でNode.js 20-alpineベースの軽量コンテナ |

## 2. 可用性

| 項目 | 要件 |
|------|------|
| ホスティング | Google Cloud Run（マネージドサービス） |
| CDN/WAF | Cloudflare経由でのアクセス |
| 自動スケーリング | Cloud Runの自動スケーリング機能を活用 |
| エラーハンドリング | API呼び出し失敗時はconsole.errorでログ出力。GCSデータ取得失敗時はcommonDataがnullのままとなり、Navbar・Hero・Footerのリンクは空href（`''`）で描画される。個人開発・サンプル開発ページではデータ未取得時に空配列となり「No data available」メッセージを表示 |

## 3. セキュリティ

| 項目 | 要件 |
|------|------|
| CORS | 環境変数 `ALLOWED_ORIGIN` で許可オリジンを制限 |
| CSRF対策 | nanoidによるトークン生成、httpOnly Cookie + ヘッダーの二重検証 |
| HTTPSメソッド制限 | CORS: GET, POST, OPTIONSのみ許可 |
| Cloudflare | DDoS保護、WAF |
| 外部リンク | `rel="noopener noreferrer"` 付与 |

## 4. 保守性

| 項目 | 要件 |
|------|------|
| 言語 | TypeScript（型安全性の確保） |
| コード品質 | ESLint + Prettier |
| パッケージマネージャー | pnpm（高速インストール・ディスク効率・厳格な依存解決） |
| テスト | Jest（ユニットテスト）、Playwright（E2Eテスト） |
| CI/CD | GitHub Actions（テスト→デプロイ）※CIにlint・buildステップはない |
| コンテナ化 | Dockerマルチステージビルド |

## 5. デプロイ

| 項目 | 要件 |
|------|------|
| コンテナレジストリ | Google Cloud Artifact Registry |
| デプロイ先 | Google Cloud Run |
| ポート | 8080 |
| 環境変数管理 | Cloud Run環境変数 + GitHub Secrets |
| IaC | Terraform |

## 6. ブラウザ対応

| 項目 | 要件 |
|------|------|
| レスポンシブ | モバイル（< md）/ デスクトップ（>= md） |
| ブレークポイント | Tailwind CSSのmd（768px）を基準 |
| スクロールバー | WebKit向けカスタムスタイリング |
