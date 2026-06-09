# マニュアル集

ローカル開発・各種ツール導入の補足手順。日常的なセットアップ手順は [../README.md](../README.md) の「セットアップ（ローカル開発）」を参照。本書は依存追加・再導入時の参考。

## 前提

- Node.js 20+ / pnpm 10.33.0（`corepack enable` で有効化）

## 依存パッケージ

```bash
pnpm install          # package.json / pnpm-lock.yaml から復元（通常はこれだけ）

pnpm add <pkg>        # 本体依存を追加
pnpm add -D <pkg>     # 開発依存を追加
```

主な依存（参考）:

- ランタイム: `hono`, `@hono/node-server`, `@google-cloud/storage`, `resend`
- UI: `lucide-react`, `framer-motion`, `react-spinners`, `@fortawesome/*`, `tailwindcss-animate`
- フォーム: `zod`, `react-hook-form`, `@hookform/resolvers`

## shadcn/ui コンポーネントの追加

初期化済み（`components.json` 参照）。コンポーネント追加は:

```bash
pnpm dlx shadcn@latest add <component>   # 例: input / textarea / label
```

## テスト

```bash
pnpm test          # Jest（ユニット）
pnpm test:e2e      # Playwright（E2E）

# E2E ブラウザの初回インストール
pnpm exec playwright install --with-deps chromium
```

## 関連マニュアル

- [environments.md](./environments.md) — 環境変数・シークレット
- [google_cloud.md](./google_cloud.md) — GCP 構築
- [cloudflare.md](./cloudflare.md) — Cloudflare
- [terraform.md](./terraform.md) — Terraform
