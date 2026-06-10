# 機能仕様書 - お問い合わせフロー

## 目次

- [6. お問い合わせフロー](#6-お問い合わせフロー)
  - [6.1 入力画面 (`/contact/form`)](#61-入力画面-contactform)
  - [6.2 確認画面 (`/contact/confirm`)](#62-確認画面-contactconfirm)
  - [6.3 送信完了画面 (`/contact/success`)](#63-送信完了画面-contactsuccess)

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
