# データ仕様書 - データストア・GCSデータモデル

## 目次

- [1. データストア](#1-データストア)
- [2. GCSデータモデル](#2-gcsデータモデル)
  - [2.1 共通データ (`GCS_COMMON_DATA_PATH`)](#21-共通データ-gcs_common_data_path)
  - [2.2 個人開発データ (`GCS_PERSONAL_DATA_PATH`)](#22-個人開発データ-gcs_personal_data_path)

## 1. データストア

本プロジェクトではデータベースを使用せず、Google Cloud Storage（GCS）上のJSONファイルでコンテンツデータを管理する。

| データストア | 用途 |
|------------|------|
| GCS（プライベートバケット） | コンテンツデータ（共通、個人開発） |
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
      "url": "https://example.com",
      "githubUrl": "https://github.com/..."
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
    /** GitHub リポジトリの URL（任意。https のみ許可） */
    githubUrl?: string;
};
```

`githubUrl` は**任意項目**。非公開リポジトリ・複数リポジトリ構成のプロジェクトには値が無いため、キーごと省略できる。

検証は `schemas/personal-data.ts` で行い、**`https:` 以外は `undefined` に劣化させる**（`.catch(undefined)`）:

- zod の `.url()` は内部が `new URL()` のため **`javascript:` を妥当と判定する**。`href` に入ると XSS の経路になるので `https://` で始まることを別途 `.refine()` で要求する
- 1 件の値が壊れただけで一覧全体が `ApiError(kind='schema')` になりページが「No data」に落ちるのを避けるため、例外にせず**リンクを出さない側へ劣化**させる
