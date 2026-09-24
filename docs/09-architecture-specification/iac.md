# インフラ構成管理（Terraform）

`terraform/` で管理するリソースと、state・tfvars の置き場所、変更経路の分担。index は [README.md](./README.md)。操作手順は [manuals/terraform.md](../../manuals/terraform.md)、ルールは [.claude/rules/iac.md](../../.claude/rules/iac.md)。

## 目次

- [7.1 管理対象](#71-管理対象)
- [7.2 state と tfvars の置き場所](#72-state-と-tfvars-の置き場所)
- [7.3 変更経路の分担](#73-変更経路の分担)
- [7.4 state 不在からの復旧（issue #137）](#74-state-不在からの復旧issue-137)

## 7.1 管理対象

GCP プロジェクト `portal-projects-449214` の以下を管理する。

| リソース | 定義 | 備考 |
|---|---|---|
| Cloud Run サービス `nextjs-hono-portal-service` / invoker IAM | `cloud_run.tf` / `cloud_run_iam.tf` | 環境変数もここで定義する（§7.3） |
| サービスアカウント `cloud-run-sa` | `cloud_run.tf` | **共有リソース**。`echo-blog-app` / `nextjs-echo-chat-app-service` もこの SA で動くため `prevent_destroy` で削除を禁止 |
| ドメインマッピング `smartportalcom.com` | `cloud_dns.tf` | |
| Cloud DNS ゾーン `nextjs-hono-portal-app-zone` | `cloud_dns.tf` | レコードは Terraform 管理外 |
| Artifact Registry `nextjs-hono-portal-app-repo` | `gcr.tf` | |
| GCS バケット `portal-projects-449214-portal-app-bucket` / IAM × 2 | `gcs.tf` | IAM は `_member`（非権威的）。data-app 用 SA 等の他メンバーには触れない |
| Secret Manager `nextjs-hono-portal-resend-api-key` / `nextjs-hono-portal-my-mail-address` / IAM × 2 | `secret_manager.tf` | **器と IAM のみ**。値（version）は Terraform 管理外で `gcloud` から投入する（§7.3）。`prevent_destroy` で削除を禁止 |

## 7.2 state と tfvars の置き場所

**共有バケット `gs://my-infra-tfstate` の、リポジトリ名と同じ prefix に置く。** バケットの作成・設定と prefix の命名規約の正本は `my-infra-workspace` リポジトリ（private）で、ここには書き写さない。

```text
gs://my-infra-tfstate/
└── nextjs-hono-portal-web-app/   ← prefix = リポジトリ名（後から変えない）
    ├── default.tfstate           ← backend "gcs" が読み書きする
    └── terraform.tfvars          ← make tf-vars-pull / tf-vars-push で同期する
```

| ファイル | Git | 置き場所 |
|---|---|---|
| `*.tf` / `backend` 設定 | コミットする | `terraform/` |
| `.terraform.lock.hcl` | コミットする | `terraform/`。provider のバージョンとハッシュを固定する（CI 用に `linux_amd64` / 手元用に `darwin_arm64` のハッシュを記録。更新は `terraform providers lock -platform=linux_amd64 -platform=darwin_arm64`） |
| `errored.tfstate` / `*.tfplan` / `crash.log` | 除外 | 作らない・残さない。いずれも秘密を平文で含みうる（`.gitignore` と `secret-scan.yml` の 2 層で防ぐ） |
| `terraform.tfstate` | 除外 | 共有バケット（backend が自動で読み書き） |
| `terraform.tfvars` | 除外（秘密を含む） | 共有バケット。変数名の一覧は [manuals/environments.md](../../manuals/environments.md) |

- gcs backend が workspace として扱うのは `*.tfstate` のみのため、tfvars を同じ prefix に置いても干渉しない。
- 同期は **my-infra-workspace の共通スクリプト `scripts/tfvars.sh` を直接呼ぶ**（本リポジトリへコピーしない。Makefile の `MY_INFRA_DIR` で clone 先を指す）。bucket / prefix は `terraform init` 済みの backend 設定から読むため、値を書き写さない。prefix が同リポジトリの登録簿（`tfstate-prefixes.txt`）に無ければ止まる。
- 信頼境界はバケット単位（[06-security-specification/infrastructure.md](../06-security-specification/infrastructure.md)）。

## 7.3 変更経路の分担

同じ Cloud Run サービスを 2 つの経路が触るため、**どちらが何の正本か**を分ける。

| 変更内容 | 正本 | 経路 |
|---|---|---|
| アプリの更新（コンテナイメージ） | GitHub Actions | `deploy-to-googlecloud.yml` の `gcloud run deploy --image`（環境変数には触れない） |
| インフラ・環境変数・IAM | Terraform | `make tf-vars-pull` → `make tf-plan` → `make tf-apply` |
| 秘密の値（`RESEND_API_KEY` / `MY_MAIL_ADDRESS`） | Secret Manager | `gcloud secrets versions add` → revision の作り直し（[manuals/terraform.md](../../manuals/terraform.md)）。Terraform は参照（`secret_key_ref` の `latest`）だけを持つ |

- CI はイメージを同じ名前（タグ無し）で push するため、イメージ参照は Terraform の定義と一致し差分にならない。
- **環境変数は Terraform だけで変更する。** コンソールや `gcloud run services update --set-env-vars` で変えると、次の `apply` で定義の値に戻される。
- イメージ内 `front/.env`（CI が Secrets から生成）は**フォールバック**。Next.js は既存の `process.env` を `.env` で上書きしないため、Cloud Run サービス側の値が優先される。`.env` だけに変数を足すと、Terraform が知らない値で本番が動く状態になる。**Secret Manager から注入する 2 変数は `.env` に書かない**（イメージに平文で残るため。issue #142）。

## 7.4 state 不在からの復旧（issue #137）

backend 導入前はローカル state のみで、その state は環境の入れ替えで失われていた（#134、[lessons-learned.md](../lessons-learned.md) 2026-09-22）。CI の `gcloud run deploy` でデプロイが回っていたため state が無くても何も壊れず、次の乖離が残っていた。

- 削除済み機能（issue #27）の `GCS_SAMPLE_DATA_PATH` が Cloud Run に残存
- `/aiusage`（issue #132）で追加した `GCS_AIUSAGE_DATA_PATH` が Cloud Run に無く、イメージ内 `.env` のフォールバックだけで動いていた

復旧は `terraform/imports.tf` の `import` ブロックで既存 9 リソースを state に取り込み、`plan` で差分（上記 2 件の env とバケットラベルの表示上の差分のみ、destroy 0）を確認してから `apply` した。取り込み後に `imports.tf` は削除した。

- **`plan` の差分が空であることを定期的に確認する。** 差分が出るなら、定義と実態が乖離している。
