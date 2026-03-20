# データ仕様書（Data Specification）

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

## 3. sessionStorageデータ

### 3.1 お問い合わせフォームデータ

| キー | 型 | ライフサイクル |
|------|-----|-------------|
| `contactFormData` | `contactFormData` | フォームsubmit時（バリデーション通過後）に保存、送信完了または修正時に削除 |
| `csrfToken` | `string` | フォームsubmit時（バリデーション通過後）に保存、修正時に削除（※送信成功時は削除されず残存する） |

```typescript
// contactFormData の構造
type contactFormData = {
    name: string;      // 必須
    email: string;     // 必須、メール形式
    subjects: string;  // 必須
    messages: string;  // 必須
};
```

## 4. データフロー

```
[GCS JSONファイル]
    ↓ (GCS SDK)
[Hono API Route (/api/gcs/*)]
    ↓ (HTTP Response)
[React Client Component]
    ↓ (useState / Context)
[UI表示]
```

### 4.1 共通データフロー
1. `RootLayout` → `CommonDataProvider` がマウント
2. `useEffect` で `/api/gcs/common` を fetch
3. レスポンスを `CommonDataType` にマッピング
4. `CommonDataContext` 経由で子コンポーネントに提供
5. `Navbar`, `Hero`, `Footer` が `useCommonData()` で取得

### 4.2 お問い合わせデータフロー
1. フォームsubmit（バリデーション通過後） → sessionStorageに保存
2. 確認画面 → sessionStorageから復元・表示
3. 送信 → `/api/mail/send` にPOST
4. Hono API → Resend SDK でメール送信
5. 完了 → `contactFormData` をsessionStorageから削除（`csrfToken` は残存）

## 5. 環境変数（データ関連）

| 変数名 | 説明 |
|--------|------|
| `GCS_PRIVATE_BUCKET_NAME` | GCSプライベートバケット名 |
| `GCS_COMMON_DATA_PATH` | 共通データJSONファイルのパス |
| `GCS_PERSONAL_DATA_PATH` | 個人開発データJSONファイルのパス |
| `GCS_SAMPLE_DATA_PATH` | サンプル開発データJSONファイルのパス |
