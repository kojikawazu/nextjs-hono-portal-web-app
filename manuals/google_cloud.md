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

```bash
# GCSバケットのIAMポリシーを取得
gcloud storage buckets get-iam-policy gs://[project-id]-[bucket-name]

# 必要な IAM 権限を付与
gcloud storage buckets add-iam-policy-binding gs://[project-id]-[bucket-name] \
 --member="serviceAccount:cloud-run-sa@[project-id].iam.gserviceaccount.com" \
 --role="roles/storage.objectViewer"

# GCSバケットのIAMポリシーを取得
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
