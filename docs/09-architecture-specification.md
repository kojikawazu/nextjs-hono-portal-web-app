# アーキテクチャ仕様書（Architecture Specification）

## 1. システム構成図

```
[ユーザー]
    ↓ HTTPS
[Cloudflare] (CDN / WAF / SSL)
    ↓
[Google Cloud Run] (コンテナ)
    ├── Next.js 16 (フロントエンド + SSR)
    │   └── Hono API (バックエンド)
    │       ├── /api/gcs/* → [Google Cloud Storage]
    │       └── /api/mail/* → [Resend API]
    └── Port: 8080
```

## 2. 技術スタック

### フロントエンド

| 技術 | バージョン | 用途 |
|------|----------|------|
| Next.js | ^16.1.6 | Reactフレームワーク (App Router) |
| React | ^18 | UIライブラリ |
| TypeScript | ^5 | 型安全性 |
| Tailwind CSS | ^3.4.1 | ユーティリティファーストCSS |
| Framer Motion | ^12.0.6 | アニメーション |
| React Hook Form | ^7.54.2 | フォーム管理 |
| Zod | ^3.24.1 | スキーマバリデーション |
| Radix UI | - | アクセシブルUIコンポーネント (Label) |
| Lucide React | ^0.474.0 | アイコン |
| FontAwesome | ^6.7.2 | SNSアイコン |
| react-spinners | ^0.15.0 | ローディングスピナー |

### バックエンド

| 技術 | バージョン | 用途 |
|------|----------|------|
| Hono | ^4.6.19 | 軽量Webフレームワーク |
| hono/vercel | (hono内蔵) | Vercelアダプター（`handle()`でNext.js API Routeに統合） |
| @hono/node-server | ^1.13.7 | Node.jsアダプター（依存関係として存在、API Routeでは未使用） |
| Resend | ^4.1.1 | メール送信 |
| @google-cloud/storage | ^7.14.0 | GCSアクセス |

### インフラ

| 技術 | 用途 |
|------|------|
| Google Cloud Run | コンテナホスティング |
| Google Cloud Storage | コンテンツデータストレージ |
| Google Cloud Artifact Registry | Dockerイメージレジストリ |
| Cloudflare | CDN、WAF、DNS |
| Docker | コンテナ化 |
| Terraform | IaC |
| GitHub Actions | CI/CD |

### 開発ツール

| 技術 | バージョン | 用途 |
|------|----------|------|
| pnpm | ^9 | パッケージマネージャー |
| ESLint | ^9.39.2 | 静的解析 |
| Prettier | ^3.4.2 | コードフォーマット |
| Jest | ^29.7.0 | ユニットテスト |
| Playwright | ^1.50.1 | E2Eテスト |

## 3. ディレクトリ構成

```
nextjs-hono-portal-web-app/
├── .github/workflows/         # CI/CD
│   ├── deploy-to-googlecloud.yml
│   ├── pull-request-test.yml
│   └── test.yml
├── __tests__/                 # ユニットテスト
│   └── api/
│       └── gcs.test.ts
├── architecture/              # アーキテクチャ図
├── docs/                      # 仕様書
├── e2e/                       # E2Eテスト
│   └── tests/
│       ├── api/
│       ├── mock/
│       └── pages/
├── manuals/                   # マニュアル
│   └── environments.md
├── public/                    # 静的ファイル
├── src/
│   ├── app/
│   │   ├── api/               # バックエンドAPI
│   │   │   ├── [[...route]]/  # Hono catch-all route
│   │   │   │   └── route.ts
│   │   │   ├── gcs/           # GCSデータ取得
│   │   │   │   └── gcs.ts
│   │   │   └── mail/          # メール送信
│   │   │       └── mail.ts
│   │   ├── components/        # UIコンポーネント
│   │   │   ├── hero/
│   │   │   ├── layout/
│   │   │   ├── modal/
│   │   │   ├── nav-bar/
│   │   │   └── page-transition/
│   │   ├── contact/           # お問い合わせページ群
│   │   │   ├── confirm/
│   │   │   ├── form/
│   │   │   └── success/
│   │   ├── contexts/          # React Context
│   │   ├── hooks/             # カスタムHooks
│   │   ├── schema/            # Zodスキーマ
│   │   ├── types/             # 型定義
│   │   ├── utils/             # ユーティリティ
│   │   ├── personaldev/       # 個人開発ページ
│   │   ├── sampledev/         # サンプル開発ページ
│   │   ├── layout.tsx         # ルートレイアウト
│   │   ├── page.tsx           # ホームページ
│   │   └── globals.css        # グローバルCSS
│   ├── components/ui/         # shadcn/uiコンポーネント
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   └── textarea.tsx
│   └── lib/
│       └── utils.ts           # cn()ユーティリティ
├── Dockerfile                 # マルチステージビルド
├── next.config.mjs            # Next.js設定
├── tailwind.config.ts         # Tailwind設定
├── package.json
├── pnpm-lock.yaml
└── tsconfig.json
```

## 4. アーキテクチャパターン

### 4.1 フロントエンド - Client Components
- 全ページが `'use client'` ディレクティブを使用
- クライアントサイドでのデータフェッチ（`useEffect` + `fetch`）
- React Contextによるグローバル状態管理（CommonContext）

### 4.2 バックエンド - Hono on Next.js API Routes
- Next.jsのcatch-all API Route (`[[...route]]`) でHonoアプリをマウント
- `hono/vercel` アダプターで `handle()` を使用
- サブルーターで機能分離（gcsRouter, mailRouter）

### 4.3 データ層 - GCS JSON Files
- サーバーサイドでGCS SDKを使用してJSONファイルを取得
- サービスアカウント認証（Cloud Run環境で自動）
- DBレス構成でシンプルさとコスト効率を優先

## 5. デプロイメント

### 5.1 Docker構成
- マルチステージビルド（builder → production）
- ベースイメージ: `node:20-alpine`
- pnpm は `corepack enable && corepack prepare pnpm@latest --activate` でセットアップ
- コピー対象ファイル: `package.json`, `pnpm-lock.yaml`（`package-lock.json` は使用しない）
- インストール: `pnpm install --frozen-lockfile`
- ビルド成果物: `.next/`, `public/`, `node_modules/`, `package.json`, `.env`
- 環境変数: `NODE_ENV=production`, `PORT=8080`

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
