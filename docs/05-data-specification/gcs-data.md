# データ仕様書 - データストア・GCSデータモデル

## 目次

- [1. データストア](#1-データストア)
- [2. GCSデータモデル](#2-gcsデータモデル)
  - [2.1 共通データ (`GCS_COMMON_DATA_PATH`)](#21-共通データ-gcs_common_data_path)
  - [2.2 個人開発データ (`GCS_PERSONAL_DATA_PATH`)](#22-個人開発データ-gcs_personal_data_path)
  - [2.3 サンプル開発データ (`GCS_SAMPLE_DATA_PATH`)](#23-サンプル開発データ-gcs_sample_data_path)

## 1. データストア

本プロジェクトではデータベースを使用せず、Google Cloud Storage（GCS）上のJSONファイルでコンテンツデータを管理する。

| データストア | 用途 |
|------------|------|
| GCS（プライベートバケット） | コンテンツデータ（共通、個人開発、サンプル開発） |
| sessionStorage（ブラウザ） | お問い合わせフォームの一時データ、CSRFトークン |

## 2. GCSデータモデル

### 2.1 共通データ (`GCS_COMMON_DATA_PATH`)

GCS上のJSONファイル構造:

```json
{
  "portfolio": {
    "url": "https://..."
  },
  "blog": {
    "url": "https://..."
  },
  "link": {
    "github": "https://github.com/...",
    "x": "https://x.com/...",
    "linkedin": "https://linkedin.com/..."
  }
}
```

アプリケーション内の型定義:

```typescript
type CommonDataType = {
    portfolioUrl: string;
    blogUrl: string;
    linkUrl: {
        githubUrl: string;
        xUrl: string;
        linkedinUrl: string;
    };
};
```

### 2.2 個人開発データ (`GCS_PERSONAL_DATA_PATH`)

GCS上のJSONファイル構造:

```json
{
  "personaldev": [
    {
      "title": "プロジェクト名",
      "description": "プロジェクトの説明",
      "tech": ["Next.js", "TypeScript", "..."],
      "url": "https://github.com/..."
    }
  ]
}
```

アプリケーション内の型定義:

```typescript
type PersonalDevDataType = {
    title: string;
    description: string;
    tech: string[];
    url: string;
};
```

### 2.3 サンプル開発データ (`GCS_SAMPLE_DATA_PATH`)

GCS上のJSONファイル構造:

```json
{
  "sampledev": [
    {
      "title": "サンプル名",
      "description": "サンプルの説明",
      "tech": ["React", "Tailwind CSS", "..."],
      "imageUrl": "https://storage.googleapis.com/.../image.png",
      "url": "https://github.com/..."
    }
  ]
}
```

アプリケーション内の型定義:

```typescript
type SampleDevDataType = {
    title: string;
    description: string;
    tech: string[];
    imageUrl: string;
    url: string;
};
```
