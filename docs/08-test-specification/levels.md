# テストレベル別の内容

ユニットテスト・統合テスト（IT）・E2E テストの対象と構成。index は [README.md](./README.md)。

## 3. ユニットテスト

### 3.1 GCS APIテスト (`__tests__/api/gcs.test.ts`)

GCSの`@google-cloud/storage`をモックし、Hono Routerのレスポンスを検証する。`file().download()` はテストから制御できる共有モックにし、異常系（500）も再現する。

| 分類 | テストケース | 期待結果 |
|------|------------|---------|
| 正常系 | `GET /common` `/personaldev` `/aiusage` | 200 + モックデータ |
| 準正常系 | 各エンドポイント - 環境変数未設定 | 400 + `Bucket name or file name is not set` |
| 異常系 | `GET /common` - download 例外 / 不正 JSON | 500 + `Failed to fetch data from GCS` |
| 異常系 | `GET /personaldev` - download 例外 | 500 + `Failed to fetch data from GCS` |

合計: 10テストケース（正常 3 / 準正常 3 / 異常 4）

### 3.2 メール送信APIテスト (`__tests__/api/mail.test.ts`)

`resend`（メール送信）と `nanoid` をモックし、Hono Router のレスポンス・CSRF 検証・入力バリデーション・HTML エスケープ・失敗時の安全な失敗を検証する。`resend` のモックは実物と同じく**キーが空ならコンストラクタで例外を投げる**（常に成功するモックでは issue #145 を検出できないため）。

| 分類 | テストケース | 期待結果 |
|------|------------|---------|
| 正常系 | `POST /send` - 正常入力 | 200 + `success: true`（Resend 呼び出し 1 回・実行時の env のキーで生成） |
| 準正常系 | `RESEND_API_KEY` 未設定でモジュールを import | 例外にならない（`next build` はキー無しで API ルートを評価する。issue #145） |
| 準正常系 | HTML を含む入力 | エスケープして送信（`<script>` 等が生のまま含まれない） |
| 準正常系 | CSRFトークンなし / 不一致 | 403 + `Invalid CSRF token` |
| 準正常系 | 必須フィールド欠落 / 不正なメールアドレス / 本文の上限超過 | 400 + 共有スキーマ（`contactSchema`）のメッセージ |
| 準正常系 | 必須 env（`RESEND_SEND_DOMAIN`）未設定 | 400 + `Mail service is not configured` |
| 準正常系 | `RESEND_API_KEY` 未設定 | 400 + `Mail service is not configured`（Resend を生成しない） |
| 異常系 | Resend 例外 | 500 + `Failed to send email` |
| 異常系 | 不正 JSON ボディ | 500 + `Failed to send email` |

合計: 12テストケース（正常 1 / 準正常 9 / 異常 2）

### 3.3 リポジトリテスト (`__tests__/repositories/*.test.ts`)

`src/repositories/` の API アクセス層を検証する。外部 I/O（`fetch`）のみモックし、スキーマ検証とエラー分類のロジックはモックしない（`testing.md`「ビジネスロジックをモックしない」）。

| ファイル | 対象 | 主な検証 |
|---|---|---|
| `http.test.ts` | `fetchJson` / `fetchOk` | 共通ヘルパー。`ApiError` の `kind` 分類（`network` / `status` / `schema`）とステータス保持 |
| `common-data.test.ts` | `fetchCommonData` | API 応答から画面用の形への詰め替え |
| `ai-usage.test.ts` | `fetchAiUsageData` | 入れ子構造の検証、任意項目（`decision` / `url`）の扱い |
| `dev-data.test.ts` | `fetchPersonalDevData` | 配列の取り出し、必須項目欠落の検出、**任意項目 `githubUrl` の劣化**（未設定・不正 URL・型違いで `undefined`） |
| `contact.test.ts` | `fetchCsrfToken` / `sendContactMail` | `credentials: 'include'` と `X-CSRF-Token` ヘッダーの付与 |

| 分類 | テストケース | 期待結果 |
|------|------------|---------|
| 正常系 | スキーマに一致する 2xx 応答 | 検証済みデータを返す |
| 正常系 | 空配列の応答（データ未登録） | 空配列を返す（異常としない） |
| 準正常系 | 非 2xx（403 / 404 / 500 / 503） | `ApiError`（`kind='status'`）+ ステータス保持 |
| 準正常系 | 必須項目の欠落・キー名違い・型違い | `ApiError`（`kind='schema'`） |
| 準正常系 | JSON として解釈できない応答 | `ApiError`（`kind='schema'`） |
| 異常系 | `fetch` が reject（通信断） | `ApiError`（`kind='network'`） |
| 準正常系 | URL が不正（`javascript:` / `data:` / `http` / 非 URL 文字列） | 例外にせず `undefined` へ劣化（他の項目は巻き添えにならない） |
| 準正常系 | 構造そのものの破損（オブジェクトの欠落・必須項目の欠落） | `ApiError`（`kind='schema'`） |

**`kind` を検証するのは呼び出し側の分岐を保証するため。** 単に「throw する」だけを確認すると、通信断とスキーマ不一致を取り違えても気づけない。

### 3.4 モックデータ

テスト用のモックJSONファイルは `e2e/tests/mock/` に配置:
- `common.json`
- `personaldev.json`
- `aiusage.json`
- `csrf.json`

## 4. 統合テスト（IT）

`@google-cloud/storage` を**モックせず**、**fake-gcs-server（GCS エミュレータ）** に実接続して GCS ルートを結合検証する。UT（モック）とは別 Jest 設定（`jest.it.config.js`）で実行し、`docker-compose.test.yml` でエミュレータを起動する。

- 接続: `gcs.ts` は `GCS_API_ENDPOINT`（IT のみ設定）が指す fake-gcs-server へ向く。本番では未設定＝通常の GCP 接続
- シード: `e2e/tests/mock/gcs-seed/<bucket>/<object>` を `/data` にマウント

| 分類 | テストケース（`__tests__/it/gcs.it.test.ts`） | 期待結果 |
|------|------------|---------|
| 正常系 | `GET /common` `/personaldev` `/aiusage`（実取得） | 200 + シードデータ |
| 準正常系 | 環境変数未設定 | 400 |
| 異常系 | 存在しないオブジェクト | 500 |

合計: 8テストケース（正常 3 / 準正常 2 / 異常 3）。**DB を使わない構成のため DB コンテナは不要**（結合先は外部 SaaS の GCS で、そのエミュレータを使う）。

## 5. E2Eテスト

### 5.1 テストファイル一覧

| ファイル | 対象ページ |
|---------|-----------|
| `e2e/tests/pages/home.spec.ts` | ホームページ |
| `e2e/tests/pages/personaldev.spec.ts` | 個人開発履歴ページ |
| `e2e/tests/pages/aiusage.spec.ts` | AI 活用方法ページ |
| `e2e/tests/pages/contact-form.spec.ts` | お問い合わせフォーム |
| `e2e/tests/pages/contact-confirm.spec.ts` | お問い合わせ確認画面 |
| `e2e/tests/pages/contact-success.spec.ts` | 送信完了画面 |
| `e2e/tests/pages/hello.spec.ts` | トップページ表示確認（タイトル検証） |
| `e2e/tests/api/send-mail.spec.ts` | メール送信API |
| `e2e/tests/scenarios/contact-flow.spec.ts` | お問い合わせ一連フロー（シナリオ） |

シナリオ: `scenarios/contact-flow.spec.ts` は入力→確認→送信完了（＋修正往復）を、sessionStorage を手で seed せず画面横断で通しで検証する。

各ページは正常系・準正常系（No Data / バリデーション）に加え、**異常系**も検証する（`route.fulfill({status:500})` / `route.abort()` を注入）:

- 共通データ取得が 500 → ヒーローはクラッシュせず描画される（`commonData` が null でも耐える）
- 個人開発の取得が 500 / ネットワーク断 → 「No data available」にフォールバック
- `githubUrl` を持つカードにのみ GitHub リンクが出る（持たないカードでは出ない・`target` / `rel` も検証）
- 不正な URL は Navbar 項目・Hero ボタン・Footer アイコン・カードのリンクごと描画されない。**`a[href=""]` がページ内に 1 つも無いこと**を不変条件として検証する
- お問い合わせ送信が 500 → success へ遷移せず、確認画面にエラー（「エラーが発生しました。」）を表示

