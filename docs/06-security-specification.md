# セキュリティ仕様書（Security Specification）

## 目次

- [1. CORS（Cross-Origin Resource Sharing）](#1-corscross-origin-resource-sharing)
  - [実装箇所](#実装箇所)
  - [仕様](#仕様)
- [2. CSRF（Cross-Site Request Forgery）対策](#2-csrfcross-site-request-forgery対策)
  - [実装箇所](#実装箇所)
  - [トークン発行](#トークン発行)
  - [トークン検証](#トークン検証)
  - [フロー](#フロー)
- [3. 入力バリデーション](#3-入力バリデーション)
  - [クライアントサイド](#クライアントサイド)
  - [サーバーサイド](#サーバーサイド)
- [4. 外部リンクのセキュリティ](#4-外部リンクのセキュリティ)
- [5. HTTP セキュリティヘッダー](#5-http-セキュリティヘッダー)
- [6. インフラレベルのセキュリティ](#6-インフラレベルのセキュリティ)
- [7. 環境変数（セキュリティ関連）](#7-環境変数セキュリティ関連)
- [8. セキュリティ監査](#8-セキュリティ監査)

## 1. CORS（Cross-Origin Resource Sharing）

### 実装箇所
`front/src/app/api/[[...route]]/route.ts`

### 仕様
- 環境変数 `ALLOWED_ORIGIN` で許可オリジンを指定（デフォルト: `http://localhost:3000`）
- 許可メソッド: `GET`, `POST`, `OPTIONS`
- 許可ヘッダー: `Content-Type`
- オリジンが一致しない場合は `null` を返し、リクエストを拒否

```typescript
cors({
    origin: (origin) => {
        if (origin === allowedOrigin) return origin;
        return null;
    },
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type'],
})
```

## 2. CSRF（Cross-Site Request Forgery）対策

### 実装箇所
`front/src/app/api/mail/mail.ts`

### トークン発行
- エンドポイント: `GET /api/mail/csrf`
- nanoidで32文字のランダムトークンを生成
- Cookie設定:
  - `httpOnly: true` — JavaScriptからのアクセス不可
  - `secure: true`（本番環境のみ）
  - `sameSite: 'Strict'` — 同一サイトからのリクエストのみ

### トークン検証
- ミドルウェア `csrfMiddleware` で検証
- ヘッダー `X-CSRF-Token` はJSON文字列として送信されるため、サーバー側で `JSON.parse` してからCookie `csrfToken` の値と比較する
- 不一致の場合は `403 Forbidden` を返す
- ヘッダーが不正な JSON の場合も検証失敗（`403`）として扱い、`JSON.parse` の例外を `500` として漏らさない

### フロー
```
1. クライアント → GET /api/mail/csrf
2. サーバー → トークン生成、Cookie設定、JSONレスポンスでトークン返却
3. クライアント → sessionStorageにトークン保存
4. クライアント → POST /api/mail/send (X-CSRF-Token ヘッダー + Cookie)
5. サーバー → ヘッダーとCookieのトークンを照合
```

## 3. 入力バリデーション

### クライアントサイド
- Zodスキーマによるバリデーション（`contactSchema`）
- React Hook Form + `zodResolver` で統合

| フィールド | ルール | エラーメッセージ |
|-----------|--------|----------------|
| name | `string().min(1)` | 名前を入力してください |
| email | `string().email()` | 有効なメールアドレスを入力してください |
| subjects | `string().min(1)` | 件名を入力してください |
| messages | `string().min(1)` | お問い合わせ内容を入力してください |

### サーバーサイド
- メール送信APIで必須フィールドのnullチェック
- 不足時は `400 Bad Request` を返す
- **HTML エスケープ（メール本文）**: メール HTML に埋め込む入力値（`name` / `email` / `messages`）は `escapeHtml` で HTML エンティティ化してから埋め込み、受信者（サイト運営者）宛の **HTML インジェクション**（偽装・フィッシング）を防止する。プレーンテキスト版（`text`）も併せて送信する。

## 4. 外部リンクのセキュリティ

- すべての外部リンク（`target="_blank"`）に `rel="noopener noreferrer"` を付与
- 外部URLのXSS防止

## 5. HTTP セキュリティヘッダー

`front/next.config.mjs` の `headers()` で全レスポンス（`/:path*`）に付与する（多層防御）。

| ヘッダー | 値（要約） | 目的 |
|---------|-----------|------|
| `Content-Security-Policy` | `default-src 'self'` を基点。script/style は `'unsafe-inline'`（Next.js ハイドレーション・framer-motion 由来）、img は `'self' data: https:` | XSS の緩和 |
| `X-Frame-Options` | `DENY` | クリックジャッキング防止（CSP `frame-ancestors 'none'` と二重化） |
| `X-Content-Type-Options` | `nosniff` | MIME スニッフィング防止 |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | リファラ漏洩の抑制 |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` | HTTPS 強制（HSTS） |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | 不要な機能 API の無効化 |

### 補足

- CSP は nonce 方式ではなく `'unsafe-inline'` を許容する妥協実装（Next.js のインラインスクリプト/スタイル都合）。`'unsafe-eval'` は開発時（HMR）のみ許可し、本番では外す。
- HSTS は http 応答では無視されるため、開発・E2E には影響しない。

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

## 8. セキュリティ監査

2026-01-31にnpm auditを実施。18件の脆弱性を検出し、10件を修正済み。
残存する8件はNext.js/ESLintのメジャーアップグレードが必要。
詳細は `docs/security-audit-report.md` を参照。
