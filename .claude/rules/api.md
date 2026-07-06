---
description: Hono バックエンド API 設計・ルート構成（Next.js API Routes 一体型）
globs: "src/app/api/**"
---

# API ルール（Hono on Next.js）

## アーキテクチャ

- Hono を Next.js の Catch-all API Route（`/api/[[...route]]`）に `hono/vercel` の `handle()` でマウントする一体型構成。
- 機能ごとにサブルーターで分割する（`gcsRouter` / `mailRouter` 等）。
- リクエストバリデーションは Zod（クライアントの `contactSchema` と整合させる）。

## ディレクトリ構成（現行）

```
src/app/api/
├── [[...route]]/
│   └── route.ts        # Hono エントリ。basePath: /api、CORS 適用、サブルーターをマウント
├── gcs/
│   └── gcs.ts          # gcsRouter（GCS からのデータ取得）
└── mail/
    └── mail.ts         # mailRouter（CSRF トークン発行・メール送信、csrfMiddleware）
```

- ルートが増える場合は機能単位のサブルーター（`src/app/api/<feature>/<feature>.ts`）を追加し、`route.ts` にマウントする。
- ビジネスロジックが肥大化する場合は service / lib 層へ切り出し、ルートハンドラーは薄く保つ。

## 共通方針

- RESTful 設計（リソース指向エンドポイント）
- レスポンス形式: JSON（`c.json()`）
- ミドルウェア: `cors()` は全体、CSRF 検証（`csrfMiddleware`）は `POST /api/mail/send` に適用
- ランタイムは `nodejs`（`@google-cloud/storage` 等の Node 依存 SDK を使用するため）
- 環境変数: `process.env` から読む。未設定時は 400 で明示的にエラーを返す（詳細は [docs/07-api-specification/](../../docs/07-api-specification/)）
- 統一エラーレスポンス（`{ "error": "..." }`）と適切な HTTP ステータス（400/403/500）
- センシティブ情報（APIキー・トークン・メール本文）をログに含めない
