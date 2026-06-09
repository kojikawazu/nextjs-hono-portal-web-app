# 機能仕様書 - 共通データ管理・ユーティリティ

## 7. 共通データ管理

### 7.1 CommonContext (`src/app/contexts/CommonContext.tsx`)
- React Contextで共通データを全ページに提供
- マウント時に `/api/gcs/common` からデータを取得
- ローディング状態を管理

### 7.2 共通データ型
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

### 7.3 GCSレスポンスのマッピング
```
data.portfolio.url → portfolioUrl
data.blog.url → blogUrl
data.link.github → linkUrl.githubUrl
data.link.x → linkUrl.xUrl
data.link.linkedin → linkUrl.linkedinUrl
```

## 8. ユーティリティ

### 8.1 セッションストレージ (`session-utils.ts`)
- `getDataBySessionStorage(key)` - JSON.parseして取得
- `setDataBySessionStorage(key, data)` - JSON.stringifyして保存
- `removeDataBySessionStorage(key)` - 削除

### 8.2 フォームエラー (`form-utils.ts`)
- `setFormError(error, setError)` - React Hook Formのroot.serverErrorにエラーを設定

### 8.3 パス判定 (`path-functions.ts`)
- `useIsHomePath()` - 現在のパスがホーム(`/`)以外かを判定（Footerの表示制御に使用）
