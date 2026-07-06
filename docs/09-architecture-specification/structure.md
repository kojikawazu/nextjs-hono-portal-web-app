# アーキテクチャ仕様書 - ディレクトリ構成・アーキテクチャパターン

## 目次

- [3. ディレクトリ構成](#3-ディレクトリ構成)
- [4. アーキテクチャパターン](#4-アーキテクチャパターン)
  - [4.1 フロントエンド - Client Components](#41-フロントエンド---client-components)
  - [4.2 バックエンド - Hono on Next.js API Routes](#42-バックエンド---hono-on-nextjs-api-routes)
  - [4.3 データ層 - GCS JSON Files](#43-データ層---gcs-json-files)

## 3. ディレクトリ構成

モノレポ構成。アプリ本体（Next.js + Hono 一体型）は **`front/`** に集約し、ルート直下には仕様書・IaC・CI・Claude ルールを置く。

```
nextjs-hono-portal-web-app/         # モノレポのルート
├── .github/workflows/              # CI/CD（run ステップは front/ を working-directory に実行）
│   ├── deploy-to-googlecloud.yml
│   ├── pull-request-test.yml
│   └── test.yml
├── .claude/                        # Claude Code ルール（.claude/rules/）
├── architecture/                   # アーキテクチャ図
├── docs/                           # 仕様書
├── manuals/                        # マニュアル（environments.md 等）
├── terraform/                      # IaC
├── CLAUDE.md / README.md / LICENSE
└── front/                          # ★ アプリ本体（Next.js + Hono 一体型）
    ├── __tests__/api/gcs.test.ts   # ユニットテスト
    ├── e2e/tests/{api,mock,pages}/ # E2Eテスト
    ├── public/                     # 静的ファイル
    ├── src/
    │   ├── app/
    │   │   ├── api/                # バックエンドAPI（Hono）
    │   │   │   ├── [[...route]]/route.ts   # Hono catch-all route
    │   │   │   ├── gcs/gcs.ts      # GCSデータ取得
    │   │   │   └── mail/mail.ts    # メール送信
    │   │   ├── components/         # UI（hero/layout/modal/nav-bar/page-transition）
    │   │   ├── contact/            # お問い合わせページ群（confirm/form/success）
    │   │   ├── contexts/           # React Context
    │   │   ├── hooks/              # カスタムHooks
    │   │   ├── schema/             # Zodスキーマ
    │   │   ├── types/              # 型定義
    │   │   ├── utils/              # ユーティリティ
    │   │   ├── personaldev/        # 個人開発ページ
    │   │   ├── sampledev/          # サンプル開発ページ
    │   │   ├── layout.tsx          # ルートレイアウト
    │   │   ├── page.tsx            # ホームページ
    │   │   └── globals.css         # グローバルCSS
    │   ├── components/ui/          # shadcn/ui（input/label/textarea）
    │   └── lib/utils.ts            # cn()ユーティリティ
    ├── Dockerfile                  # マルチステージビルド
    ├── next.config.mjs             # Next.js設定
    ├── tailwind.config.ts          # Tailwind設定
    ├── package.json / pnpm-lock.yaml
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
