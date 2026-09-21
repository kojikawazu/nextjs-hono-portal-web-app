# アプリケーションセキュリティ

CORS・CSRF・入力バリデーション・外部リンク・HTTP セキュリティヘッダー・レートリミット。index は [README.md](./README.md)。

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


## 6. レートリミット

送信系エンドポイントを Hono ミドルウェア（`src/app/api/middleware/rate-limit.ts`）で IP ベースに制限する。超過時は **429** と統一エラーレスポンス `{ "error": "..." }`、および残り秒数を示す `Retry-After` ヘッダーを返す。

### 適用と閾値

| エンドポイント | 上限 | 根拠 |
|---|---|---|
| `POST /api/mail/send` | **3 回 / 分** | 1 通ごとに実メールが飛び、コストと迷惑が発生するため厳しく設定する |
| `GET /api/mail/csrf` | **20 回 / 分** | フォームを開くたびに呼ばれる正常操作。画面遷移や再読み込みを妨げない値にする |

`POST /send` ではレートリミットを **CSRF 検証より前**に置く。後段にすると、不正トークンでの連打がリミットに数えられず素通りしてしまう。

### 方式

**スライディングウィンドウ**（リクエスト時刻を保持してウィンドウ内の件数で判定）。固定ウィンドウだと境界をまたいで短時間に上限の 2 倍を通せるため採用しない。

追跡クライアント数に上限（既定 10,000）を設け、超過分は古い順に捨てる。上限が無いと、送信元を変えながら叩くだけでメモリを食い潰せてしまい、**レートリミッター自体が攻撃経路になる**。

### 既知の限界

**厳密な保証ではなく、無制限状態からの現実的な緩和として位置づける。**

| 限界 | 内容 |
|---|---|
| インスタンス単位 | カウントは各インスタンスのメモリに持つ。Cloud Run は水平スケールするため実効上限は「閾値 × 稼働インスタンス数」になり、インスタンス再起動でリセットされる |
| ヘッダーの詐称 | クライアント識別に `cf-connecting-ip` →`x-forwarded-for` の順で使う。Cloud Run は `--allow-unauthenticated` で公開されており Cloudflare を迂回して直接叩けるため、これらのヘッダーは詐称しうる |

したがって本ミドルウェアが抑えるのは「善意の利用者による過剰送信」と「素朴なスパム」まで。**分散・詐称を伴う攻撃にはエッジ側（Cloudflare のレートリミット）の併用が必要**で、そちらは未導入（`docs/11-tasks.md` 参照）。
