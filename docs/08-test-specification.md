# テスト仕様書（Test Specification）

## 目次

- [1. テスト戦略](#1-テスト戦略)
- [2. テスト実行コマンド](#2-テスト実行コマンド)
- [3. ユニットテスト](#3-ユニットテスト)
  - [3.1 GCS APIテスト (`__tests__/api/gcs.test.ts`)](#31-gcs-apiテスト-__tests__apigcstestts)
  - [3.2 メール送信APIテスト (`__tests__/api/mail.test.ts`)](#32-メール送信apiテスト-__tests__apimailtestts)
  - [3.3 モックデータ](#33-モックデータ)
- [4. E2Eテスト](#4-e2eテスト)
  - [4.1 テストファイル一覧](#41-テストファイル一覧)
- [5. CI/CDでのテスト](#5-cicdでのテスト)
  - [テストパイプライン（test.yml）](#テストパイプラインtestyml)
- [6. テスト環境](#6-テスト環境)

## 1. テスト戦略

| テストレベル | ツール | 対象 |
|------------|-------|------|
| ユニットテスト | Jest | API Route（GCS API / Mail API） |
| E2Eテスト | Playwright | ページ表示、ユーザーフロー |
| リンティング | ESLint | コード品質 |
| フォーマット | Prettier | コードスタイル |

## 2. テスト実行コマンド

```bash
# ユニットテスト
pnpm test              # 全テスト実行
pnpm run test:watch    # ウォッチモード
pnpm run test:coverage # カバレッジ付き

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

GCSの`@google-cloud/storage`をモックし、Hono Routerのレスポンスを検証する。

| テストケース | 期待結果 |
|------------|---------|
| `GET /common` - 正常系 | 200 + モックデータ |
| `GET /common` - 環境変数未設定 | 400 + エラーメッセージ |
| `GET /personaldev` - 正常系 | 200 + モックデータ |
| `GET /personaldev` - 環境変数未設定 | 400 + エラーメッセージ |
| `GET /sampledev` - 正常系 | 200 + モックデータ |
| `GET /sampledev` - 環境変数未設定 | 400 + エラーメッセージ |

合計: 6テストケース

### 3.2 メール送信APIテスト (`__tests__/api/mail.test.ts`)

`resend`（メール送信）と `nanoid` をモックし、Hono Router のレスポンス・CSRF 検証・入力バリデーション・HTML エスケープを検証する。

| テストケース | 期待結果 |
|------------|---------|
| `POST /send` - 正常系 | 200 + `success: true`（Resend 呼び出し 1 回） |
| `POST /send` - HTMLエスケープ（準正常系） | 入力の HTML をエスケープして送信（`<script>` 等が生のまま含まれない） |
| `POST /send` - CSRFトークンなし（異常系） | 403 + `Invalid CSRF token` |
| `POST /send` - トークン不一致（異常系） | 403 |
| `POST /send` - 必須フィールド欠落（異常系） | 400 + `Missing required fields` |

合計: 5テストケース

### 3.3 モックデータ

テスト用のモックJSONファイルは `e2e/tests/mock/` に配置:
- `common.json`
- `personaldev.json`
- `sampledev.json`
- `csrf.json`

## 4. E2Eテスト

### 4.1 テストファイル一覧

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

## 5. CI/CDでのテスト

GitHub Actionsワークフロー:

| ワークフロー | ファイル | トリガー |
|------------|---------|---------|
| テスト | `test.yml` | `workflow_call`（他ワークフローから呼び出し） |
| PRテスト | `pull-request-test.yml` | `pull_request`（対象パスの変更時） |
| デプロイ | `deploy-to-googlecloud.yml` | `push` to `main`（対象パスの変更時） |

### テストパイプライン（test.yml）
```
install → format:check → lint → unit test (Jest) → e2e test (Playwright) → (deploy)
```

**注意**: `format:check`（Prettier）・`lint`（ESLint）を install 直後に実行し、失敗時は後続の重いテストへ進まない（fail fast）。`build` ステップは CI に無く、Docker ビルド内で実行される。

## 6. テスト環境

- Jest環境: `node`（APIテストのみのため、jsdomは不使用）
- トランスパイラ: `ts-jest`
- テストレポート: `jest-html-reporters`（Jest）、`html`（Playwright）
- ポリフィル: `cross-fetch/polyfill`（テスト環境でのfetch API提供）
