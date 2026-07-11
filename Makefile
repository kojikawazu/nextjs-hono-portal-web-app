# Makefile — nextjs-hono-portal-web-app
#
# ルート直下から、front/ に集約したアプリ（Next.js + Hono）の pnpm スクリプトや
# terraform/ の IaC 操作を、`cd` せずに実行するためのショートカット集。
# コマンド一覧は `make` または `make help` で確認できる。

FRONT := front
TF    := terraform

# front/ で pnpm スクリプトを実行するヘルパー
PNPM  := pnpm --dir $(FRONT)

.DEFAULT_GOAL := help

# ---------------------------------------------------------------------------
# セットアップ
# ---------------------------------------------------------------------------

.PHONY: install
install: ## 依存をインストール（front/）
	$(PNPM) install

.PHONY: setup
setup: ## .env の雛形を作成（front/.env.example → front/.env、既存は保持）
	@if [ -f $(FRONT)/.env ]; then \
		echo "$(FRONT)/.env は既に存在します（上書きしません）"; \
	else \
		cp $(FRONT)/.env.example $(FRONT)/.env && echo "$(FRONT)/.env を作成しました"; \
	fi

# ---------------------------------------------------------------------------
# 開発 / ビルド
# ---------------------------------------------------------------------------

.PHONY: dev
dev: ## 開発サーバ起動（http://localhost:3000）
	$(PNPM) dev

.PHONY: build
build: ## 本番ビルド
	$(PNPM) build

.PHONY: start
start: ## ビルド成果物を起動
	$(PNPM) start

# ---------------------------------------------------------------------------
# 品質（Lint / Format）
# ---------------------------------------------------------------------------

.PHONY: lint
lint: ## ESLint（src/）
	$(PNPM) lint

.PHONY: format
format: ## Prettier で自動整形
	$(PNPM) format

.PHONY: format-check
format-check: ## Prettier でチェックのみ（整形はしない）
	$(PNPM) format:check

# ---------------------------------------------------------------------------
# テスト
# ---------------------------------------------------------------------------

.PHONY: test
test: ## ユニットテスト（Jest）
	$(PNPM) test

.PHONY: test-watch
test-watch: ## ユニットテスト（ウォッチモード）
	$(PNPM) test:watch

.PHONY: test-coverage
test-coverage: ## ユニットテスト（カバレッジ付き）
	$(PNPM) test:coverage

.PHONY: test-it
test-it: ## 統合テスト（fake-gcs-server 起動済み前提）
	$(PNPM) test:it

.PHONY: test-it-docker
test-it-docker: ## 統合テスト（エミュレータ起動 → IT → 停止 を自動化）
	$(PNPM) test:it:docker

.PHONY: e2e
e2e: ## E2E テスト（Playwright / ヘッドレス）
	$(PNPM) test:e2e

.PHONY: e2e-ui
e2e-ui: ## E2E テスト（UI モード）
	$(PNPM) test:e2e:ui

.PHONY: e2e-headed
e2e-headed: ## E2E テスト（ブラウザ表示）
	$(PNPM) test:e2e:headed

.PHONY: ci
ci: format-check lint test test-it-docker ## CI 相当をローカルで実行（format:check → lint → UT → IT）

# ---------------------------------------------------------------------------
# Terraform（IaC）
# ---------------------------------------------------------------------------

.PHONY: tf-init
tf-init: ## terraform init
	terraform -chdir=$(TF) init

.PHONY: tf-plan
tf-plan: ## terraform plan
	terraform -chdir=$(TF) plan

.PHONY: tf-apply
tf-apply: ## terraform apply
	terraform -chdir=$(TF) apply

# ---------------------------------------------------------------------------
# ヘルプ
# ---------------------------------------------------------------------------

.PHONY: help
help: ## このヘルプを表示
	@echo "使い方: make <target>"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'
