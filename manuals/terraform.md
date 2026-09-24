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

## 秘密の値（Secret Manager）

`RESEND_API_KEY` / `MY_MAIL_ADDRESS` は Secret Manager に置き、Cloud Run が起動時に注入する。**Terraform は secret の器と読み取り権限だけを管理し、値は持たない**（tfvars / state に平文を残さないため）。

| 環境変数 | secret |
|---|---|
| `RESEND_API_KEY` | `nextjs-hono-portal-resend-api-key` |
| `MY_MAIL_ADDRESS` | `nextjs-hono-portal-my-mail-address` |

### 値を登録・ローテーションする

```bash
# 値を標準入力から渡す（シェル履歴に残さない。末尾に改行を付けない）
read -rs VALUE && printf '%s' "$VALUE" \
  | gcloud secrets versions add nextjs-hono-portal-resend-api-key \
      --project portal-projects-449214 --data-file=- ; unset VALUE

# 新しい revision を作って全インスタンスへ反映する（latest はインスタンス起動時に解決されるため）
# main へのデプロイでも revision は作り直される。変更が無いときは Deploy を手動実行する
gh workflow run deploy-to-googlecloud.yml --ref main

# 動作を確認したら古い version を無効化する（すぐに消さない。戻せなくなるため）
gcloud secrets versions disable <旧 version 番号> \
  --secret nextjs-hono-portal-resend-api-key --project portal-projects-449214
```

- `echo` で渡さない。末尾の改行が値に含まれ、API キーの認証に失敗する。
- revision の作り直しに `gcloud run services update --update-env-vars` 等を使わない。環境変数の正本は Terraform のため、次の `apply` で戻される（[iac.md](../docs/09-architecture-specification/iac.md) §7.3）。
