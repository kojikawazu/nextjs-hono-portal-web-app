# データ仕様書 - データストア・GCSデータモデル

## 目次

- [1. データストア](#1-データストア)
- [2. GCSデータモデル](#2-gcsデータモデル)
  - [2.1 共通データ (`GCS_COMMON_DATA_PATH`)](#21-共通データ-gcs_common_data_path)
  - [2.2 個人開発データ (`GCS_PERSONAL_DATA_PATH`)](#22-個人開発データ-gcs_personal_data_path)
  - [2.3 AI 活用方法データ (`GCS_AIUSAGE_DATA_PATH`)](#23-ai-活用方法データ-gcs_aiusage_data_path)

## 1. データストア

本プロジェクトではデータベースを使用せず、Google Cloud Storage（GCS）上のJSONファイルでコンテンツデータを管理する。

| データストア | 用途 |
|------------|------|
| GCS（プライベートバケット） | コンテンツデータ（共通、個人開発、AI 活用方法） |
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

**URL 系フィールドの検証**: `portfolio.url` / `blog.url` / `link.*` は `schemas/url.ts` の
`optionalHttpsUrlSchema` で検証する。`https` 以外（`javascript:` 等）と未設定は `undefined` へ劣化し、
**描画側はリンクごと表示しない**。詳細は [06-security-specification/application.md](../06-security-specification/application.md) §4。

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

`url` / `githubUrl` はいずれも `schemas/url.ts` の `optionalHttpsUrlSchema` で検証し、
**`https` 以外・未設定は `undefined` へ劣化**する（リンクを描画しない）。`url` が劣化した場合も
**カードごと消さず、タイトル・説明・技術スタックは表示する**。方針の詳細は
[06-security-specification/application.md](../06-security-specification/application.md) §4。

### 2.3 AI 活用方法データ (`GCS_AIUSAGE_DATA_PATH`)

GCS上のJSONファイル構造（正本は data-app の `docs/05-data-specification.md`）:

```json
{
  "aiusage": {
    "principle": "意思決定権は人間にある。…",
    "sections": [
      {
        "title": "土台をつくる",
        "summary": "…",
        "items": [
          { "title": "ルールの明文化", "description": "…", "decision": "…", "url": "https://…" }
        ]
      }
    ]
  }
}
```

- `decision`（人間が決めること）と `url`（参考リンク）は**任意**
- `url` は `schemas/url.ts` の `optionalHttpsUrlSchema` で検証し、`https` 以外は `undefined` へ劣化する
- **非公開リポジトリを題材にする項目には `url` を付けない**（訪問者に GitHub の 404 を見せないため）
