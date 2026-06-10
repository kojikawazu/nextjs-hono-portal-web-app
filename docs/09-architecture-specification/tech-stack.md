# アーキテクチャ仕様書 - システム構成図・技術スタック

## 目次

- [1. システム構成図](#1-システム構成図)
- [2. 技術スタック](#2-技術スタック)
  - [フロントエンド](#フロントエンド)
  - [バックエンド](#バックエンド)
  - [インフラ](#インフラ)
  - [開発ツール](#開発ツール)

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
| pnpm | 10.33.0 | パッケージマネージャー |
| ESLint | ^9.39.2 | 静的解析 |
| Prettier | ^3.4.2 | コードフォーマット |
| Jest | ^29.7.0 | ユニットテスト |
| Playwright | ^1.50.1 | E2Eテスト |
