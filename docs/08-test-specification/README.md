# テスト仕様書（Test Specification）

150 行ルール（[.claude/rules/doc-structure.md](../../.claude/rules/doc-structure.md)）に基づき、トピック単位で分割している。

## index

| ファイル | 内容 |
|---|---|
| [strategy.md](./strategy.md) | §1 テスト戦略（テストレベルの分類）・§2 テスト実行コマンド |
| [levels.md](./levels.md) | §3 ユニットテスト・§4 統合テスト（IT）・§5 E2E テスト |
| [ci.md](./ci.md) | §6 CI/CD でのテスト（パイプライン構成）・§7 テスト環境 |

## 関連

- テストの原則・分類の定義（正常系 / 準正常系 / 異常系）: [.claude/rules/testing.md](../../.claude/rules/testing.md)
- CI ワークフローの発火ルール・静的解析: [.claude/rules/github-actions.md](../../.claude/rules/github-actions.md)
- デプロイパイプライン全体: [09-architecture-specification/deploy-design.md](../09-architecture-specification/deploy-design.md)
