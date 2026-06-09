# アーキテクチャ仕様書 - ディレクトリ構成・アーキテクチャパターン

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
