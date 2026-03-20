# API仕様書（API Specification）

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

## 3. エンドポイント詳細

### 3.1 `GET /api/hello`

ヘルスチェック用エンドポイント。

**レスポンス (200)**
```json
{
  "message": "Connected to Hono API"
}
```

---

### 3.2 `GET /api/gcs/`

GCS API接続確認用エンドポイント。

**レスポンス (200)**
```json
{
  "message": "Connected to GCS API"
}
```

---

### 3.3 `GET /api/gcs/common`

GCSから共通データを取得する。

**必要な環境変数**
- `GCS_PRIVATE_BUCKET_NAME`
- `GCS_COMMON_DATA_PATH`

**レスポンス (200)**
```json
{
  "portfolio": { "url": "https://..." },
  "blog": { "url": "https://..." },
  "link": {
    "github": "https://...",
    "x": "https://...",
    "linkedin": "https://..."
  }
}
```

**エラーレスポンス (400)**
```json
{
  "error": "Bucket name or file name is not set"
}
```

**エラーレスポンス (500)**
```json
{
  "error": "Failed to fetch data from GCS"
}
```

---

### 3.4 `GET /api/gcs/personaldev`

GCSから個人開発データを取得する。

**必要な環境変数**
- `GCS_PRIVATE_BUCKET_NAME`
- `GCS_PERSONAL_DATA_PATH`

**レスポンス (200)**
```json
{
  "personaldev": [
    {
      "title": "string",
      "description": "string",
      "tech": ["string"],
      "url": "string"
    }
  ]
}
```

**エラーレスポンス**: 3.3と同様

---

### 3.5 `GET /api/gcs/sampledev`

GCSからサンプル開発データを取得する。

**必要な環境変数**
- `GCS_PRIVATE_BUCKET_NAME`
- `GCS_SAMPLE_DATA_PATH`

**レスポンス (200)**
```json
{
  "sampledev": [
    {
      "title": "string",
      "description": "string",
      "tech": ["string"],
      "imageUrl": "string",
      "url": "string"
    }
  ]
}
```

**エラーレスポンス**: 3.3と同様

---

### 3.6 `GET /api/mail/`

Mail API接続確認用エンドポイント。

**レスポンス (200)**
```json
{
  "message": "Connected to Mail API"
}
```

---

### 3.7 `GET /api/mail/csrf`

CSRFトークンを発行する。

**レスポンスヘッダー**
```
Set-Cookie: csrfToken=<32文字のnanoidトークン>; HttpOnly; SameSite=Strict
```
※ `Secure` 属性は本番環境（`NODE_ENV=production`）のときのみ付与される。開発環境では付与されない。

**レスポンス (200)**
```json
{
  "csrfToken": "<32文字のトークン>"
}
```

---

### 3.8 `POST /api/mail/send`

メールを送信する。CSRFミドルウェアで保護。

**リクエストヘッダー**
```
Content-Type: application/json
X-CSRF-Token: "<CSRFトークン（JSON文字列）>"
Cookie: csrfToken=<CSRFトークン>
```

**リクエストボディ**
```json
{
  "name": "string (必須)",
  "email": "string (必須)",
  "subjects": "string (必須)",
  "messages": "string (必須)"
}
```

**レスポンス (200)**
```json
{
  "success": true,
  "response": { ... }
}
```

**エラーレスポンス (400)**
```json
{
  "error": "Missing required fields"
}
```

**エラーレスポンス (403)**
```json
{
  "error": "Invalid CSRF token"
}
```

**エラーレスポンス (500)**
```json
{
  "error": "Failed to send email"
}
```

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
