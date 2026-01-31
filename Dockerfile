# =======================================================================
# ベースイメージを指定
# =======================================================================
FROM node:20-alpine AS builder

# 作業ディレクトリを設定
WORKDIR /app

# package.json と package-lock.json をコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm install

# プロジェクトのソースコードをコピー
COPY . .

# ビルド
RUN npm run build

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
CMD ["npm", "run", "start"]

# =======================================================================
