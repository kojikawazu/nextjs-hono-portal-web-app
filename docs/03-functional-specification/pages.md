# 機能仕様書 - ページ詳細

## 目次

- [3. ホームページ (`/`)](#3-ホームページ-)
  - [3.1 Hero (`src/app/components/hero/Hero.tsx`)](#31-hero-srcappcomponentsheroherotsx)
- [4. 個人開発履歴ページ (`/personaldev`)](#4-個人開発履歴ページ-personaldev)
  - [4.1 データ取得](#41-データ取得)
  - [4.2 表示](#42-表示)
  - [4.3 GitHub リンク](#43-github-リンク)
  - [4.4 データ型](#44-データ型)

## 3. ホームページ (`/`)

### 3.1 Hero (`src/app/components/hero/Hero.tsx`)
- 全画面表示のヒーローセクション
- 背景: ダークカラー + ぼかし円形グラデーション（primary/20, blue-500/10）
- "Developers Hub" バッジ
- メインタイトル: "Crafting Digital Experiences"（グラデーションテキスト）
- サブテキスト: 「フロントエンド、バックエンド、インフラまで。多様な技術を探求し、最適な価値を提供します。」
- CTAボタン:
  - "View Portfolio" → 外部ポートフォリオURL（GCSデータ）
  - "Contact" → `/contact/form`

## 4. 個人開発履歴ページ (`/personaldev`)

### 4.1 データ取得
- マウント時に `/api/gcs/personaldev` からデータを取得
- レスポンス形式: `{ personaldev: PersonalDevDataType[] }`

### 4.2 表示
- 縦並びのカードリスト（`space-y-12`）
- 各カード: タイトル、説明文、技術スタックタグ、GitHub リンク（`githubUrl` がある場合のみ）
- ホバーエフェクト: `scale: 1.02`、primaryカラーのシャドウ
- 技術タグは `max-w-[150px] truncate` で省略表示

### 4.3 GitHub リンク
- `githubUrl` を持つカードにのみ表示する。**無い要素では要素ごと描画しない**（非公開リポジトリ・複数リポジトリ構成のプロジェクトがあるため）
- `target="_blank"` + `rel="noopener noreferrer"` で別タブに開く
- アクセシブル名は `<プロジェクト名> のGitHubリポジトリ`（リンクが「GitHub」だけだと、読み上げ時にどのプロジェクトのものか分からないため）
- **カード全体を包む公開サイトへのリンクの外側**に置く。内側だと `<a>` の入れ子になり HTML として不正になる

### 4.4 データ型
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
