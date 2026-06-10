# ドキュメント索引

nextjs-hono-portal-web-app の仕様・設計ドキュメント一覧。プロジェクト概要・セットアップはリポジトリ直下の [`../README.md`](../README.md) を参照。

ドキュメントは 2 層で構成している。

- **標準仕様書（`01`〜`11`）** — 仕様の正準。番号順に読むと全体像をつかめる。150 行を超えたものはフォルダに分割し、各フォルダ直下の `readme.md` を索引としている（[doc-structure.md](../.claude/rules/doc-structure.md) 参照）。
- **監査レポート** — 実施日ごとに追記する時系列ログ（150 行ルール対象外）。

## 読み進め順（おすすめ）

`01 要求 → 02 要件 → 03 機能 → 05 データ → 06 セキュリティ → 07 API → 08 テスト → 09 アーキテクチャ`。
04・10・11 は随時参照。初めて環境構築する場合は [`../README.md`](../README.md) のセットアップ手順から。

## 標準仕様書

| # | ドキュメント | 概要 |
|---|---|---|
| 01 | [要求仕様書](./01-business-requirements.md) | 背景・目的・スコープ・制約 |
| 02 | [要件仕様書](./02-requirements-specification.md) | 機能要件・受け入れ基準 |
| 03 | [機能仕様書](./03-functional-specification/) | ページ構成・共通レイアウト・お問い合わせフロー |
| 04 | [非機能仕様書](./04-non-functional-specification.md) | 性能・可用性・運用 |
| 05 | [データ仕様書](./05-data-specification/) | GCS データモデル・sessionStorage・データフロー |
| 06 | [セキュリティ仕様書](./06-security-specification.md) | CORS・CSRF・入力バリデーション |
| 07 | [API 仕様書](./07-api-specification/) | Hono ルート・エンドポイント・ミドルウェア |
| 08 | [テスト仕様書](./08-test-specification.md) | テスト戦略・テスト分類 |
| 09 | [アーキテクチャ仕様書](./09-architecture-specification/) | 技術スタック・ディレクトリ構成・デプロイ（Cloud Run） |
| 10 | [その他仕様書](./10-miscellaneous-specification.md) | 用語集・環境変数 |
| 11 | [タスク](./11-tasks.md) | 進行中タスク・完了済み実績 |

## 監査レポート — 追記型・時系列ログ

| ドキュメント | 実施日 |
|---|---|
| [security-audit-report](./security-audit-report.md) | 2026-01-31 |
| [security-audit-report-2026-03](./security-audit-report-2026-03.md) | 2026-03-21 |

## 関連

- プロジェクト概要・セットアップ: [`../README.md`](../README.md)
- 開発ルール: [`../CLAUDE.md`](../CLAUDE.md) と [`../.claude/rules/`](../.claude/rules/)
- ドキュメント更新の影響マップ: [`../.claude/rules/documentation.md`](../.claude/rules/documentation.md)
- 環境変数・インフラ手順: [`../manuals/`](../manuals/)
