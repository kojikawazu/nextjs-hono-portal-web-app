# Terraform のセットアップ

state と `terraform.tfvars` は、共有バケット `gs://my-infra-tfstate` の prefix `nextjs-hono-portal-web-app/` に置く（設計は [docs/09-architecture-specification/iac.md](../docs/09-architecture-specification/iac.md)、ルールは `.claude/rules/iac.md`、バケットと命名規約の正本は `my-infra-workspace`）。

```
gs://my-infra-tfstate/nextjs-hono-portal-web-app/
├── default.tfstate      # backend "gcs" が読み書きする
└── terraform.tfvars     # make tf-vars-pull / tf-vars-push で同期する
```

## 前提

- `my-infra-workspace`（private）を clone しておく。tfvars の同期は同リポジトリの `scripts/tfvars.sh` を Makefile から呼ぶ。既定の clone 先は `~/developer/claude/my-infra-workspace`。違う場合は `MY_INFRA_DIR=<path>` を付ける。
- 同期スクリプトは `terraform init` 済みの backend 設定から bucket / prefix を読むため、**`tf-init` を先に実行する**。

## 手順

```bash
# 初期化（backend "gcs" に接続）
make tf-init

# tfvars をバケットから取得（ローカルと内容が異なる場合は止まる）
make tf-vars-pull

# 計画。差分が空であることを確認する
make tf-plan

# 適用（差分を読んでから実行する）
make tf-apply

# tfvars を変更したらバケットへ保存（バケット側と内容が異なる場合は止まる）
make tf-vars-push
```

- 相手側を上書きしてよいと判断したときだけ `FORCE=--force` を付ける（バケット側はバージョニングで旧版が残る）。
- 変数の一覧は [environments.md](./environments.md) を参照。
- **state を失った状態で `apply` しない。** 復元（import）が先。

## 環境変数の正本

Cloud Run の環境変数は **Terraform が正本**、イメージ内 `.env` はフォールバック。変数を追加・削除するときは Terraform 側を更新して `apply` する。分担の詳細は [docs/09-architecture-specification/iac.md](../docs/09-architecture-specification/iac.md) §7.3。
