# =======================================================================
# ベースイメージを指定
# =======================================================================
FROM node:20-alpine AS builder

# pnpm のセットアップ
RUN corepack enable && corepack prepare pnpm@latest --activate

# 作業ディレクトリを設定
WORKDIR /app

# package.json と pnpm-lock.yaml をコピー
COPY package.json pnpm-lock.yaml ./

# 依存関係をインストール
RUN pnpm install --frozen-lockfile

# プロジェクトのソースコードをコピー
COPY . .

# ビルド
RUN pnpm run build

# =======================================================================
# 実行フェーズ
# =======================================================================
FROM node:20-alpine

# 作業ディレクトリを設定
WORKDIR /app

# 依存関係のみコピー
COPY --from=builder /app/node_modules ./node_modules

# ビルド成果物をコピー
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/.env .env

# 環境変数
ENV NODE_ENV=production
ENV PORT=8080

# ポートを開放
EXPOSE 8080

# 実行コマンド
CMD ["pnpm", "run", "start"]

# =======================================================================
