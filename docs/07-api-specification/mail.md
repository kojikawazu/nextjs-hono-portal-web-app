# API仕様書 - Mail系エンドポイント詳細

## 目次

- [3. エンドポイント詳細（Mail系）](#3-エンドポイント詳細mail系)
  - [3.6 `GET /api/mail/`](#36-get-apimail)
  - [3.7 `GET /api/mail/csrf`](#37-get-apimailcsrf)
  - [3.8 `POST /api/mail/send`](#38-post-apimailsend)

## 3. エンドポイント詳細（Mail系）

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

クライアントと共有する `contactSchema`（Zod）で検証する。各フィールドは必須かつ長さ上限を持つ。

```json
{
  "name": "string (必須, 1〜100文字)",
  "email": "string (必須, 有効なメール形式, 最大254文字)",
  "subjects": "string (必須, 1〜200文字)",
  "messages": "string (必須, 1〜5000文字)"
}
```

**レスポンス (200)**
```json
{
  "success": true,
  "response": { ... }
}
```

**エラーレスポンス (400) — バリデーション失敗**

`contactSchema` の検証に失敗した場合、最初の違反メッセージを返す（例）。
```json
{
  "error": "有効なメールアドレスを入力してください"
}
```

**エラーレスポンス (400) — メール設定の欠落**

送信に必要な環境変数（`RESEND_API_KEY` / `RESEND_SEND_DOMAIN` / `MY_MAIL_ADDRESS`）が未設定の場合、暗黙のフォールバックはせず明示的に返す。
```json
{
  "error": "Mail service is not configured"
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
