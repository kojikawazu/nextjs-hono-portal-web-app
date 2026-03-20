# 機能仕様書（Functional Specification）

## 1. ページ構成

```
/ (ホーム)
├── /personaldev (個人開発履歴)
├── /sampledev (サンプル開発履歴)
└── /contact
    ├── /form (お問い合わせ入力)
    ├── /confirm (お問い合わせ確認)
    └── /success (送信完了)
```

## 2. 共通レイアウト

### 2.1 RootLayout (`src/app/layout.tsx`)
- `<html lang="ja">` で日本語を指定
- `CommonDataProvider` で共通データ（ポートフォリオURL、ブログURL、SNSリンク）を全ページに提供
- メタデータ: `title: "My Developers Hub"`, `description: "My Developers Hub"`

### 2.2 Navbar (`src/app/components/nav-bar/Navbar.tsx`)
- 固定位置（`fixed`）、背景は半透明ダーク（`bg-dark/80 backdrop-blur-sm`）
- ロゴ "My Tech Hub" → `/` にリンク
- メニュー項目:

| メニュー名 | 遷移先 | データソース |
|-----------|--------|-------------|
| ポートフォリオ | 外部URL | GCS共通データ |
| 個人開発履歴 | `/personaldev` | 内部リンク |
| サンプル開発履歴 | `/sampledev` | 内部リンク |
| ブログ | 外部URL | GCS共通データ |
| お問い合わせ | `/contact/form` | 内部リンク |

- モバイル: ハンバーガーメニュー（Lucide `Menu`/`X` アイコン）

### 2.3 Footer (`src/app/components/layout/Footer.tsx`)
- ホームページ以外のページ（`pathname !== '/'`のとき）でのみ表示
- SNSリンク（GitHub、X、LinkedIn）をアイコンで表示
- コピーライト表示（動的に現在の年を取得）

### 2.4 PageTransition (`src/app/components/page-transition/PageTransition.tsx`)
- Framer Motionによるフェードイン/フェードアウトアニメーション
- `duration: 0.5s`

## 3. ホームページ (`/`)

### 3.1 Hero (`src/app/components/hero/Hero.tsx`)
- 全画面表示のヒーローセクション
- 背景: ダークカラー + ぼかし円形グラデーション（primary/20, blue-500/10）
- "Developers Hub" バッジ
- メインタイトル: "Crafting Digital Experiences"（グラデーションテキスト）
- サブテキスト: フロントエンド〜インフラの技術紹介
- CTAボタン:
  - "View Portfolio" → 外部ポートフォリオURL（GCSデータ）
  - "Contact" → `/contact/form`

## 4. 個人開発履歴ページ (`/personaldev`)

### 4.1 データ取得
- マウント時に `/api/gcs/personaldev` からデータを取得
- レスポンス形式: `{ personaldev: PersonalDevDataType[] }`

### 4.2 表示
- 縦並びのカードリスト（`space-y-12`）
- 各カード: タイトル、説明文、技術スタックタグ
- ホバーエフェクト: `scale: 1.02`、primaryカラーのシャドウ
- 技術タグは `max-w-[150px] truncate` で省略表示

### 4.3 データ型
```typescript
type PersonalDevDataType = {
    title: string;
    description: string;
    tech: string[];
    url: string;
};
```

## 5. サンプル開発履歴ページ (`/sampledev`)

### 5.1 データ取得
- マウント時に `/api/gcs/sampledev` からデータを取得
- レスポンス形式: `{ sampledev: SampleDevDataType[] }`

### 5.2 表示
- 2列グリッドレイアウト（`grid-cols-1 md:grid-cols-2`）
- 各カード: 画像（`next/image`、`h-48`、`object-cover`）、タイトル、説明文、技術スタックタグ、"View Sample Code" リンク
- ホバーエフェクト: `scale: 1.03`

### 5.3 データ型
```typescript
type SampleDevDataType = {
    title: string;
    description: string;
    tech: string[];
    imageUrl: string;
    url: string;
};
```

## 6. お問い合わせフロー

### 6.1 入力画面 (`/contact/form`)

#### フォームフィールド

| フィールド | 型 | バリデーション | コンポーネント |
|-----------|-----|--------------|--------------|
| name | string | 必須 (min: 1) | Input |
| email | string | 必須, メール形式 | Input |
| subjects | string | 必須 (min: 1) | Input |
| messages | string | 必須 (min: 1) | Textarea (rows: 6) |

#### 処理フロー
1. ページ読み込み時に `/api/mail/csrf` からCSRFトークンを取得
2. sessionStorageに保存済みデータがあればフォームに復元
3. バリデーション通過後、データとCSRFトークンをsessionStorageに保存
4. `/contact/confirm` に遷移

### 6.2 確認画面 (`/contact/confirm`)

#### 処理フロー
1. sessionStorageからフォームデータとCSRFトークンを復元
2. データがない場合は `/contact/form` にリダイレクト
3. 入力内容を読み取り専用で表示
4. 「修正する」ボタン: sessionStorageをクリアし `/contact/form` に遷移
5. 「確認して送信」ボタン: 確認モーダルを表示
6. モーダルで「送信する」: `/api/mail/send` にPOSTリクエスト
7. 送信成功: `contactFormData` をsessionStorageから削除し `/contact/success` に遷移（※ `csrfToken` はsessionStorageに残る）

#### 確認モーダル (`ConfirmModal`)
- オーバーレイ付きモーダルダイアログ
- "本当に送信してもよろしいでしょうか？" メッセージ
- 「キャンセル」「送信する」ボタン

### 6.3 送信完了画面 (`/contact/success`)
- 送信完了メッセージとお礼テキスト
- 「ホームへ戻る」「再度お問い合わせ」ボタン

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
