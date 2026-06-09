# ドキュメント目次

本プロジェクトの仕様書一覧。番号で体系化しており、150 行を超えたものはフォルダに分割し各フォルダ直下の `README.md` を索引としている。ファイルサイズ・分割ルールは [.claude/rules/doc-structure.md](../.claude/rules/doc-structure.md) を参照。

| # | ドキュメント | 内容 |
|---|---|---|
| 01 | [business-requirements](./01-business-requirements.md) | 要求仕様（背景・目的・スコープ） |
| 02 | [requirements-specification](./02-requirements-specification.md) | 要件仕様（機能要件・受入基準） |
| 03 | [functional-specification/](./03-functional-specification/) | 機能仕様（画面・コンポーネント・フロー） |
| 04 | [non-functional-specification](./04-non-functional-specification.md) | 非機能仕様（性能・可用性・運用） |
| 05 | [data-specification/](./05-data-specification/) | データ仕様（GCS モデル・sessionStorage） |
| 06 | [security-specification](./06-security-specification.md) | セキュリティ仕様（CORS・CSRF） |
| 07 | [api-specification/](./07-api-specification/) | API 仕様（Hono ルート） |
| 08 | [test-specification](./08-test-specification.md) | テスト仕様（戦略・分類） |
| 09 | [architecture-specification/](./09-architecture-specification/) | アーキテクチャ仕様（構成・デプロイ） |
| 10 | [miscellaneous-specification](./10-miscellaneous-specification.md) | その他（用語・環境変数） |
| 11 | [tasks](./11-tasks.md) | タスク・進捗 |

## 監査レポート（追記型・150行ルール対象外）

- [security-audit-report.md](./security-audit-report.md)（2026-01-31）
- [security-audit-report-2026-03.md](./security-audit-report-2026-03.md)（2026-03-21）

## 関連

- プロジェクト概要・セットアップ: [../README.md](../README.md)
- 開発ルール: [../.claude/rules/](../.claude/rules/)
- 環境変数・インフラ手順: [../manuals/](../manuals/)
