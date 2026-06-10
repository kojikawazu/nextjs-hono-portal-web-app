# 機能仕様書 - ページ構成・共通レイアウト

## 目次

- [1. ページ構成](#1-ページ構成)
- [2. 共通レイアウト](#2-共通レイアウト)
  - [2.1 RootLayout (`src/app/layout.tsx`)](#21-rootlayout-srcapplayouttsx)
  - [2.2 Navbar (`src/app/components/nav-bar/Navbar.tsx`)](#22-navbar-srcappcomponentsnav-barnavbartsx)
  - [2.3 Footer (`src/app/components/layout/Footer.tsx`)](#23-footer-srcappcomponentslayoutfootertsx)
  - [2.4 PageTransition (`src/app/components/page-transition/PageTransition.tsx`)](#24-pagetransition-srcappcomponentspage-transitionpagetransitiontsx)

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
