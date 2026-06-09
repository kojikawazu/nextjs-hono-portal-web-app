# データ仕様書 - sessionStorage・データフロー・環境変数

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
