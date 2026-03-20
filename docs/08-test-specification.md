# テスト仕様書（Test Specification）

## 1. テスト戦略

| テストレベル | ツール | 対象 |
|------------|-------|------|
| ユニットテスト | Jest | API Route（GCS APIのみ） |
| E2Eテスト | Playwright | ページ表示、ユーザーフロー |
| リンティング | ESLint | コード品質 |
| フォーマット | Prettier | コードスタイル |

## 2. テスト実行コマンド

```bash
# ユニットテスト
npm test              # 全テスト実行
npm run test:watch    # ウォッチモード
npm run test:coverage # カバレッジ付き

# E2Eテスト
npm run test:e2e        # ヘッドレス実行
npm run test:e2e:ui     # UIモード
npm run test:e2e:headed # ブラウザ表示

# コード品質
npm run lint            # ESLint
npm run format:check    # Prettierチェック
npm run format          # Prettier自動修正
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

### 3.2 モックデータ

テスト用のモックJSONファイルは `e2e/tests/mock/` に配置:
- `common.json`
- `personaldev.json`
- `sampledev.json`

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
install → unit test (Jest) → e2e test (Playwright) → (deploy)
```

**注意**: CIワークフローに `npm run lint` や `npm run build` のステップは含まれていない。lint・buildはローカル開発時に手動で実行する。

## 6. テスト環境

- Jest環境: `node`（APIテストのみのため、jsdomは不使用）
- トランスパイラ: `ts-jest`
- テストレポート: `jest-html-reporters`（Jest）、`html`（Playwright）
- ポリフィル: `cross-fetch/polyfill`（テスト環境でのfetch API提供）
