# アーキテクチャ仕様書 - デプロイメント・デザインシステム

## 目次

- [5. デプロイメント](#5-デプロイメント)
  - [5.1 Docker構成](#51-docker構成)
  - [5.2 CI/CDパイプライン](#52-cicdパイプライン)
- [6. デザインシステム](#6-デザインシステム)
  - [カラーパレット](#カラーパレット)
  - [アニメーション](#アニメーション)

## 5. デプロイメント

### 5.1 Docker構成
- マルチステージビルド（builder → production）
- **ビルドコンテキストは `front/`**: `Dockerfile` はモノレポ配下の `front/` に置き、`docker build … front/`（deploy ジョブの `working-directory: front` で実現）。`.env` も `front/` 直下に生成する。
- ベースイメージ: `node:20-alpine`
- pnpm は `corepack enable && corepack prepare pnpm@latest --activate` でセットアップ
- コピー対象ファイル: `package.json`, `pnpm-lock.yaml`（`package-lock.json` は使用しない）
- インストール: `pnpm install --frozen-lockfile`
- ビルド成果物: `.next/`, `public/`, `node_modules/`, `package.json`, `.env`
- 環境変数: `NODE_ENV=production`, `PORT=8080`
- 起動コマンド: 実行ステージには pnpm/corepack をセットアップしないため、`node_modules/.bin/next start` を直接実行する（パッケージマネージャに依存しない）。ポートは `next start` が `PORT` を読む。

### 5.2 CI/CDパイプライン
```
[GitHub Push/PR]
    ↓
[GitHub Actions - test.yml]
    ├── pnpm/action-setup でpnpmセットアップ
    ├── pnpm install --frozen-lockfile
    ├── format:check (pnpm run format:check)
    ├── lint (pnpm run lint)
    ├── typecheck (pnpm run typecheck)
    ├── pnpm exec playwright install --with-deps chromium
    ├── unit test (pnpm run test)
    ├── IT: fake-gcs-server 起動 → pnpm run test:it → 停止
    └── e2e test (pnpm run test:e2e)
        ↓ (mainブランチのみ)
[GitHub Actions - deploy]  ※ environment: production
    ├── Docker build (.env生成含む)
    ├── Push to Artifact Registry
    ├── Deploy to Cloud Run
    ├── Resolve service URL (environment.url に記録)
    └── Cleanup old images
```

### デプロイの発火制御

| 設定 | 値 | 理由 |
|---|---|---|
| トリガ | `push` to `main`（`paths`: `.github/**`, `front/**`） | PR ではデプロイしない |
| `concurrency.group` | `${{ github.workflow }}-${{ github.ref }}` | 同一ブランチのデプロイを直列化する |
| `concurrency.cancel-in-progress` | **`false`** | **CI とは逆**。実行途中でキャンセルすると Cloud Run のリビジョン切り替えや古いイメージ削除が中断され、不整合が残る。連続マージ時は後発が前発の完了を待つ |
| `environment` | `production`（`url` に Cloud Run の実サービス URL） | デプロイ履歴と URL を GitHub に記録する |
| 承認ゲート | **なし** | main マージでそのままデプロイする運用を維持（issue #113 の判断） |

**シークレットは Environment ではなくリポジトリレベルで管理している。** `github-actions.md` は「シークレットは Environment 単位で管理し、PR からは参照できないようにする」と定めるが、`test.yml` が PR で同じ 14 個のシークレット（GCP SA キー・Resend・GCS パス等）を使うため、`production` Environment へ移すと PR の CI が動かなくなる。分離にはテスト用と本番用でシークレットを別立てにする必要があり、未対応として `docs/11-tasks.md` に残している。

**注意**: CI に `format:check`・`lint`・`typecheck` を追加済み（install 直後、fail fast）。`build` ステップは CI に無く、Docker ビルド内で実行される。型チェックを CI に独立して置いているのは、これが無いと型エラーが main マージ後のデプロイまで検出されないため。

## 6. デザインシステム

### カラーパレット

| 名前 | 値 | 用途 |
|------|-----|------|
| primary | `#4ADE80` | アクセントカラー、CTAボタン、リンク |
| primary-hover | `#86EFAC` | ホバー状態 |
| primary-dark | `#22C55E` | ダークバリアント |
| secondary | `#1E293B` | セカンダリ背景 |
| dark | `#0F172A` | メイン背景 |
| dark-lighter | `#1E293B` | カード背景 |

### アニメーション
- `fade-in`: 0.5秒、translateY(10px→0) + opacity(0→1)
- `fade-in-slow`: 0.8秒、opacity(0→1)
- Framer Motionによるstaggered animation
