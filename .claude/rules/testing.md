---
description: テスト分類・原則（スタック非依存）
globs: 
---

# テストルール

## テスト分類

| 分類 | 定義 |
|------|------|
| 正常系（Normal） | 期待通りの入力 → 正しい結果 |
| 準正常系（Semi-Normal） | 想定内の異常入力 → 適切なハンドリング |
| 異常系（Abnormal） | 想定外のエラー → 安全な失敗 |

## 原則

- テストは仕様の証明。テストが失敗したら実装を修正する（テストを実装に合わせない）。
- 正常系 1 : 異常系（準正常系 + 異常系）2 以上の比率を目安とする。
- ビジネスロジックをモックしない。モックは外部 I/O（HTTP通信、DB接続、ファイルシステム）のみ。
- `toBeTruthy()` 等の曖昧なアサーションを避け、具体的な値で検証する。

## テストツール

本プロジェクトは Next.js + Hono 一体型のため、ユニット・E2E ともに以下で統一する。

| テスト種別 | ツール | 対象 |
|-----------|--------|------|
| ユニットテスト | Jest（`ts-jest`, `testEnvironment: node`） | Hono API Route（`app.request()` / Router 経由で GCS・Mail をテスト） |
| E2E テスト | Playwright | 各ページ表示・お問い合わせフロー・メール送信 API |
| スモークテスト | Playwright（トップページ表示確認） | 起動確認・主要ページ表示 |

- 外部 I/O（`@google-cloud/storage` / Resend / `fetch`）はモックする。ポリフィルは `cross-fetch/polyfill`。
- Component テストを追加する場合は Testing Library（React）を併用する。

