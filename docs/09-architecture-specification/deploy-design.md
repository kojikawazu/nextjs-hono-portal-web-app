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
    ├── pnpm exec playwright install --with-deps chromium
    ├── unit test (pnpm run test)
    └── e2e test (pnpm run test:e2e)
        ↓ (mainブランチのみ)
[GitHub Actions - deploy]
    ├── Docker build (.env生成含む)
    ├── Push to Artifact Registry
    ├── Deploy to Cloud Run
    └── Cleanup old images
```

**注意**: CIにlint・buildステップは含まれていない。ビルドはDockerビルド内で実行される。

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
