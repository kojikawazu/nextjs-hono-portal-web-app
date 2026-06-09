# API仕様書 - GCS系エンドポイント詳細

## 3. エンドポイント詳細（GCS系）

### 3.1 `GET /api/hello`

ヘルスチェック用エンドポイント。

**レスポンス (200)**
```json
{
  "message": "Connected to Hono API"
}
```

---

### 3.2 `GET /api/gcs/`

GCS API接続確認用エンドポイント。

**レスポンス (200)**
```json
{
  "message": "Connected to GCS API"
}
```

---

### 3.3 `GET /api/gcs/common`

GCSから共通データを取得する。

**必要な環境変数**
- `GCS_PRIVATE_BUCKET_NAME`
- `GCS_COMMON_DATA_PATH`

**レスポンス (200)**
```json
{
  "portfolio": { "url": "https://..." },
  "blog": { "url": "https://..." },
  "link": {
    "github": "https://...",
    "x": "https://...",
    "linkedin": "https://..."
  }
}
```

**エラーレスポンス (400)**
```json
{
  "error": "Bucket name or file name is not set"
}
```

**エラーレスポンス (500)**
```json
{
  "error": "Failed to fetch data from GCS"
}
```

---

### 3.4 `GET /api/gcs/personaldev`

GCSから個人開発データを取得する。

**必要な環境変数**
- `GCS_PRIVATE_BUCKET_NAME`
- `GCS_PERSONAL_DATA_PATH`

**レスポンス (200)**
```json
{
  "personaldev": [
    {
      "title": "string",
      "description": "string",
      "tech": ["string"],
      "url": "string"
    }
  ]
}
```

**エラーレスポンス**: 3.3と同様

---

### 3.5 `GET /api/gcs/sampledev`

GCSからサンプル開発データを取得する。

**必要な環境変数**
- `GCS_PRIVATE_BUCKET_NAME`
- `GCS_SAMPLE_DATA_PATH`

**レスポンス (200)**
```json
{
  "sampledev": [
    {
      "title": "string",
      "description": "string",
      "tech": ["string"],
      "imageUrl": "string",
      "url": "string"
    }
  ]
}
```

**エラーレスポンス**: 3.3と同様
