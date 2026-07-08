# テスト仕様書（Test Specification）

## 目次

- [1. テスト戦略](#1-テスト戦略)
- [2. テスト実行コマンド](#2-テスト実行コマンド)
- [3. ユニットテスト](#3-ユニットテスト)
  - [3.1 GCS APIテスト (`__tests__/api/gcs.test.ts`)](#31-gcs-apiテスト-__tests__apigcstestts)
  - [3.2 メール送信APIテスト (`__tests__/api/mail.test.ts`)](#32-メール送信apiテスト-__tests__apimailtestts)
  - [3.3 モックデータ](#33-モックデータ)
- [4. 統合テスト（IT）](#4-統合テストit)
- [5. E2Eテスト](#5-e2eテスト)
  - [5.1 テストファイル一覧](#51-テストファイル一覧)
- [6. CI/CDでのテスト](#6-cicdでのテスト)
  - [テストパイプライン（test.yml）](#テストパイプラインtestyml)
- [7. テスト環境](#7-テスト環境)

## 1. テスト戦略

| テストレベル | ツール | 対象 |
|------------|-------|------|
| ユニットテスト | Jest | API Route（GCS API / Mail API）※外部 I/O はモック |
| 統合テスト（IT） | Jest + fake-gcs-server | GCS ルート × 実 GCS SDK（エミュレータ結合） |
| E2Eテスト | Playwright | ページ表示、ユーザーフロー |
| リンティング | ESLint | コード品質 |
| フォーマット | Prettier | コードスタイル |

## 2. テスト実行コマンド

```bash
# ユニットテスト
pnpm test              # 全テスト実行
pnpm run test:watch    # ウォッチモード
pnpm run test:coverage # カバレッジ付き

# 統合テスト（IT）: fake-gcs-server が必要
pnpm run test:it         # エミュレータ起動済みで実行
pnpm run test:it:docker  # エミュレータ起動 → IT → 停止 を自動化

# E2Eテスト
pnpm run test:e2e        # ヘッドレス実行
pnpm run test:e2e:ui     # UIモード
pnpm run test:e2e:headed # ブラウザ表示

# コード品質
pnpm run lint            # ESLint
pnpm run format:check    # Prettierチェック
pnpm run format          # Prettier自動修正
```

## 3. ユニットテスト

### 3.1 GCS APIテスト (`__tests__/api/gcs.test.ts`)

GCSの`@google-cloud/storage`をモックし、Hono Routerのレスポンスを検証する。`file().download()` はテストから制御できる共有モックにし、異常系（500）も再現する。

| 分類 | テストケース | 期待結果 |
|------|------------|---------|
| 正常系 | `GET /common` `/personaldev` `/sampledev` | 200 + モックデータ |
| 準正常系 | 各エンドポイント - 環境変数未設定 | 400 + `Bucket name or file name is not set` |
| 異常系 | `GET /common` - download 例外 / 不正 JSON | 500 + `Failed to fetch data from GCS` |
| 異常系 | `GET /personaldev` `/sampledev` - download 例外 | 500 + `Failed to fetch data from GCS` |

合計: 10テストケース（正常 3 / 準正常 3 / 異常 4）

### 3.2 メール送信APIテスト (`__tests__/api/mail.test.ts`)

`resend`（メール送信）と `nanoid` をモックし、Hono Router のレスポンス・CSRF 検証・入力バリデーション・HTML エスケープ・失敗時の安全な失敗を検証する。

| 分類 | テストケース | 期待結果 |
|------|------------|---------|
| 正常系 | `POST /send` - 正常入力 | 200 + `success: true`（Resend 呼び出し 1 回） |
| 準正常系 | HTML を含む入力 | エスケープして送信（`<script>` 等が生のまま含まれない） |
| 準正常系 | CSRFトークンなし / 不一致 | 403 + `Invalid CSRF token` |
| 準正常系 | 必須フィールド欠落 | 400 + `Missing required fields` |
| 異常系 | Resend 例外 | 500 + `Failed to send email` |
| 異常系 | 不正 JSON ボディ | 500 + `Failed to send email` |

合計: 7テストケース（正常 1 / 準正常 4 / 異常 2）

### 3.3 モックデータ

テスト用のモックJSONファイルは `e2e/tests/mock/` に配置:
- `common.json`
- `personaldev.json`
- `sampledev.json`
- `csrf.json`

## 4. 統合テスト（IT）

`@google-cloud/storage` を**モックせず**、**fake-gcs-server（GCS エミュレータ）** に実接続して GCS ルートを結合検証する。UT（モック）とは別 Jest 設定（`jest.it.config.js`）で実行し、`docker-compose.test.yml` でエミュレータを起動する。

- 接続: `gcs.ts` は `GCS_API_ENDPOINT`（IT のみ設定）が指す fake-gcs-server へ向く。本番では未設定＝通常の GCP 接続
- シード: `e2e/tests/mock/gcs-seed/<bucket>/<object>` を `/data` にマウント

| 分類 | テストケース（`__tests__/it/gcs.it.test.ts`） | 期待結果 |
|------|------------|---------|
| 正常系 | `GET /common` `/personaldev` `/sampledev`（実取得） | 200 + シードデータ |
| 準正常系 | 環境変数未設定 | 400 |
| 異常系 | 存在しないオブジェクト | 500 |

合計: 5テストケース（正常 3 / 準正常 1 / 異常 1）。**DB を使わない構成のため DB コンテナは不要**（結合先は外部 SaaS の GCS で、そのエミュレータを使う）。

## 5. E2Eテスト

### 5.1 テストファイル一覧

| ファイル | 対象ページ |
|---------|-----------|
| `e2e/tests/pages/home.spec.ts` | ホームページ |
| `e2e/tests/pages/personaldev.spec.ts` | 個人開発履歴ページ |
| `e2e/tests/pages/sampledev.spec.ts` | サンプル開発履歴ページ |
| `e2e/tests/pages/contact-form.spec.ts` | お問い合わせフォーム |
| `e2e/tests/pages/contact-confirm.spec.ts` | お問い合わせ確認画面 |
| `e2e/tests/pages/contact-success.spec.ts` | 送信完了画面 |
| `e2e/tests/pages/hello.spec.ts` | トップページ表示確認（タイトル検証） |
| `e2e/tests/api/send-mail.spec.ts` | メール送信API |
| `e2e/tests/scenarios/contact-flow.spec.ts` | お問い合わせ一連フロー（シナリオ） |

シナリオ: `scenarios/contact-flow.spec.ts` は入力→確認→送信完了（＋修正往復）を、sessionStorage を手で seed せず画面横断で通しで検証する。

各ページは正常系・準正常系（No Data / バリデーション）に加え、**異常系**も検証する（`route.fulfill({status:500})` / `route.abort()` を注入）:

- 共通データ取得が 500 → ヒーローはクラッシュせず描画される（`commonData` が null でも耐える）
- 個人開発の取得が 500 / サンプル開発がネットワーク断 → 「No data available」にフォールバック
- お問い合わせ送信が 500 → success へ遷移せず、確認画面にエラー（「エラーが発生しました。」）を表示

## 6. CI/CDでのテスト

GitHub Actionsワークフロー:

| ワークフロー | ファイル | トリガー |
|------------|---------|---------|
| テスト | `test.yml` | `workflow_call`（他ワークフローから呼び出し） |
| PRテスト | `pull-request-test.yml` | `pull_request`（対象パスの変更時） |
| デプロイ | `deploy-to-googlecloud.yml` | `push` to `main`（対象パスの変更時） |

### テストパイプライン（test.yml）
```
install → format:check → lint → unit test (Jest) → IT (fake-gcs-server) → e2e test (Playwright) → (deploy)
```

**注意**: `format:check`（Prettier）・`lint`（ESLint）を install 直後に実行し、失敗時は後続の重いテストへ進まない（fail fast）。`build` ステップは CI に無く、Docker ビルド内で実行される。

## 7. テスト環境

- Jest環境: `node`（APIテストのみのため、jsdomは不使用）
- トランスパイラ: `ts-jest`
- テストレポート: `jest-html-reporters`（Jest）、`html`（Playwright）
- ポリフィル: `cross-fetch/polyfill`（テスト環境でのfetch API提供）
