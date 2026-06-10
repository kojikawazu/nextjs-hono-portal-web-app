# API仕様書 - 概要・エンドポイント一覧・ミドルウェア

## 目次

- [1. 概要](#1-概要)
- [2. エンドポイント一覧](#2-エンドポイント一覧)
- [4. ミドルウェア](#4-ミドルウェア)
  - [4.1 CORSミドルウェア](#41-corsミドルウェア)
  - [4.2 CSRFミドルウェア](#42-csrfミドルウェア)
- [5. ルーティング構成](#5-ルーティング構成)

## 1. 概要

バックエンドAPIはHonoフレームワークを使用し、Next.jsのCatch-all API Route (`/api/[[...route]]`) として動作する。ランタイムは `nodejs`。

ベースパス: `/api`

## 2. エンドポイント一覧

| メソッド | パス | 説明 | 認証 |
|---------|------|------|------|
| GET | `/api/hello` | ヘルスチェック | なし |
| GET | `/api/gcs/` | GCS API接続確認 | なし |
| GET | `/api/gcs/common` | 共通データ取得 | なし |
| GET | `/api/gcs/personaldev` | 個人開発データ取得 | なし |
| GET | `/api/gcs/sampledev` | サンプル開発データ取得 | なし |
| GET | `/api/mail/` | Mail API接続確認 | なし |
| GET | `/api/mail/csrf` | CSRFトークン発行 | なし |
| POST | `/api/mail/send` | メール送信 | CSRF |

各エンドポイントの詳細は [gcs.md](./gcs.md)（GCS系）と [mail.md](./mail.md)（Mail系）を参照。

## 4. ミドルウェア

### 4.1 CORSミドルウェア
- 全エンドポイント（`*`）に適用
- 詳細はセキュリティ仕様書を参照

### 4.2 CSRFミドルウェア
- `POST /api/mail/send` にのみ適用
- ヘッダー `X-CSRF-Token` をJSON.parseしてCookieの `csrfToken` と比較

## 5. ルーティング構成

```
Hono App (basePath: /api)
├── GET /hello
├── /gcs (gcsRouter)
│   ├── GET /
│   ├── GET /common
│   ├── GET /personaldev
│   └── GET /sampledev
└── /mail (mailRouter)
    ├── GET /
    ├── GET /csrf
    └── POST /send [csrfMiddleware]
```
