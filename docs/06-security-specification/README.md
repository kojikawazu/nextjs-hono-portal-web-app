# セキュリティ仕様書（Security Specification）

150 行ルール（[.claude/rules/doc-structure.md](../../.claude/rules/doc-structure.md)）に基づき、トピック単位で分割している。

## index

| ファイル | 内容 |
|---|---|
| [application.md](./application.md) | §1 CORS・§2 CSRF 対策・§3 入力バリデーション・§4 外部リンク・§5 HTTP セキュリティヘッダー |
| [infrastructure.md](./infrastructure.md) | §6 インフラレベルのセキュリティ・§7 環境変数（セキュリティ関連） |
| [audit.md](./audit.md) | §8 セキュリティ監査の履歴・§9 CI によるシークレット混入検出 |

## 関連

- 設計方針としてのセキュリティルール: [.claude/rules/security.md](../../.claude/rules/security.md)
- 監査レポート本体: [security-audit-report.md](../security-audit-report.md) / [security-audit-report-2026-03.md](../security-audit-report-2026-03.md)
