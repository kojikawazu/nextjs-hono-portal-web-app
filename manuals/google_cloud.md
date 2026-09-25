# Google Cloud のセットアップ

## API の有効リスト

- Artifact Registry API の有効化
- Cloud Run API の有効化
- Cloud DNS API の有効化

## Google Cloud のセットアップ

```bash
# 認証情報の設定
gcloud auth application-default login

# プロジェクト設定
gcloud config set project [project-id]

# プロジェクト取得
gcloud config get-value project
```

## Artifact Registryへデプロイ

```bash
# ビルド
docker build -t asia-northeast1-docker.pkg.dev/[project-id]/[repository-id]/[image-name] .

# テスト
docker run -p 8000:8000 asia-northeast1-docker.pkg.dev/[project-id]/[repository-id]/[image-name]

# (上手くいかない場合のデバッグ用)
docker run -it --rm asia-northeast1-docker.pkg.dev/[project-id]/[repository-id]/[image-name] bash
npm run dev

# 認証
gcloud auth configure-docker asia-northeast1-docker.pkg.dev

# プッシュ
docker push asia-northeast1-docker.pkg.dev/[project-id]/[repository-id]/[image-name]

# リスト
gcloud artifacts docker images list asia-northeast1-docker.pkg.dev/[project-id]/[repository-id]
```

## Cloud Run から GCS へのアクセス設定

Cloud Run の実行 SA（`nextjs-hono-portal-run`）への `roles/storage.objectViewer` は **Terraform（`terraform/gcs.tf` の `run_viewer`）で付与する**。`gcloud` で手動付与しない（Terraform 管理外の付与が残り、他アプリと共有の SA に権限が漏れていた。issue #143）。付与の確認だけは以下で行える。

```bash
gcloud storage buckets get-iam-policy gs://[project-id]-[bucket-name]
```

## GitHub Actions 用のロール設定

サービスアカウントのプリンシパルに以下ロールを追加します。

- Artifact Registry リポジトリ管理者
- Artifact Registry 書き込み
- Cloud Build 編集者
- Cloud Run 管理者
- Project IAM 管理者
- Service Usage 管理者
- サービス アカウント ユーザー
- ストレージ管理者
- リソース設定閲覧者
