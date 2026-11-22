# CI/CD でのテストとテスト環境

CI のパイプライン構成と、テスト実行環境。index は [README.md](./README.md)。

## 6. CI/CDでのテスト

GitHub Actionsワークフロー:

| ワークフロー | ファイル | トリガー |
|------------|---------|---------|
| テスト | `test.yml` | `workflow_call`（他ワークフローから呼び出し） |
| PRテスト | `pull-request-test.yml` | `pull_request`（対象パスの変更時） |
| デプロイ | `deploy-to-googlecloud.yml` | `push` to `main`（対象パスの変更時） |

### テストパイプライン（test.yml）
```
install → format:check → lint → typecheck → unit test (Jest) → IT (fake-gcs-server) → e2e test (Playwright) → (deploy)
```

**注意**: `format:check`（Prettier）・`lint`（ESLint）・`typecheck`（`tsc --noEmit`）を install 直後に実行し、失敗時は後続の重いテストへ進まない（fail fast）。

**テストはシークレットを使わない**（GCP 認証・`.env.test` 生成なし。issue #161）。外部 I/O は各レベルで置き換えている。unit は外部 I/O をモックし、IT は `jest.it.setup-env.js` が fake-gcs-server 向けの値を注入する。E2E は `/api/gcs/*` を `page.route` でモックし、`send-mail.spec` は送信前に 400 / 403 で止まるケースだけを扱う。

- **理由**: 依存更新 PR（第三者のコード）が本番の SA キーを持った CI で動く経路を作らない。Dependabot の PR にはシークレットが渡らないため、以前は認証ステップで必ず失敗していた。
- **テストを追加するとき**: 実 GCS・実 Resend・本番の env を前提にしない。必要な値はテストのセットアップで注入する。

`build` ステップは CI に無く、Docker ビルド内で実行される。**型チェックを CI に独立して置いているのはこのため**で、これが無いと型エラーは main マージ後のデプロイまで検出されない（ESLint は型を見ず、E2E の `webServer` は `pnpm dev` なので型エラーで止まらない）。`build` を型の検証手段にしないのは、ビルドが環境変数を要求するのに対し `tsc --noEmit` は依存しないため。

## 7. テスト環境

- Jest環境: `node`（APIテストのみのため、jsdomは不使用）
- トランスパイラ: `ts-jest`
- テストレポート: `jest-html-reporters`（Jest）、`html`（Playwright）
- ポリフィル: `cross-fetch/polyfill`（テスト環境でのfetch API提供）
