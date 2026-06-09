---
description: ドキュメント更新・設計書管理ルール（影響マップ + opt-out の完了条件）
globs:
---

# ドキュメント

コード変更がドキュメント（CLAUDE.md / README.md / docs/）と乖離しないことを構造的に担保する。

## 完了条件（opt-out）

変更は、下記「影響マップ」の対応ドキュメントを**同一 PR 内で更新する**ことを完了条件とする。

- 更新不要と判断した場合は、**PR 説明にその理由を明記する**（省略＝未対応とみなす）。
- この乖離チェックは `/self-review` と `/pr-create` の確認対象に含まれる。

## 影響マップ（変更種別 → 更新必須ドキュメント）

「どのドキュメントだっけ？」を考えさせないための逆引き表。

| 変更種別 | 更新必須ドキュメント |
|---|---|
| ページ・画面・機能の追加/変更 | docs/03-functional-specification/ |
| 非機能要件（性能・可用性・運用）の変更 | docs/04-non-functional-specification.md |
| データモデル・ストア・スキーマの変更 | docs/05-data-specification/ |
| 認証・認可・CORS などセキュリティ仕様の変更 | docs/06-security-specification.md |
| API エンドポイント（Hono ルート）の追加/変更/削除 | docs/07-api-specification/ |
| テスト戦略・テスト分類・テスト方針の変更 | docs/08-test-specification.md |
| システム構成・デプロイ構成（Cloud Run 等）・依存技術の変更 | docs/09-architecture-specification/, CLAUDE.md |
| 用語・運用ルールなどその他仕様の変更 | docs/10-miscellaneous-specification.md |
| ビジネス要件・要求仕様レベルの変更 | docs/01-business-requirements.md, docs/02-requirements-specification.md |
| `.claude/rules/` の追加/変更 | CLAUDE.md（Rules テーブル） |
| セットアップ・実行手順・プロジェクト概要の変更 | README.md |
| 進行中タスク・完了タスクの更新 | docs/11-tasks.md |

該当する変更がない場合はスキップする。

## 補足

- **ドキュメント更新**: 作業が完了したら、ルートドキュメント（CLAUDE.md / README.md / docs/）の更新が必要かどうか確認し、必要であれば更新する。
- **設計書の管理**: タスクごとに設計書を新規作成しない。既存の仕様書ドキュメント（docs/01〜11-*.md）に追記・更新する。
