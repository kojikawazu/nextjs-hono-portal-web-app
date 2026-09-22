# Codex instructions

このリポジトリでは `.claude/rules/` が開発ルールの唯一の正本です。作業を始める前に、変更対象に応じて次のルールを読み、守ってください。ルール本文をこのファイルへ複製しないでください。

プロジェクト概要: Next.js + Hono によるポータル Web アプリケーション（フロント＋バックエンド一体型、Cloud Run デプロイ）。アプリ本体は `front/` に集約されています。

## 常に適用するルール

- `.claude/rules/shortcuts.md`
- `.claude/rules/workflow.md`
- `.claude/rules/quality-gate.md`
- `.claude/rules/documentation.md`
- `.claude/rules/doc-structure.md`
- `.claude/rules/git.md`
- `.claude/rules/github-issue.md`
- `.claude/rules/pr-description.md`
- `.claude/rules/testing.md`
- `.claude/rules/coding-standards.md`
- `.claude/rules/error-handling.md`
- `.claude/rules/security.md`
- `.claude/rules/duplication.md`
- `.claude/rules/dead-code.md`
- `.claude/rules/static-analysis.md`
- `.claude/rules/lessons-learned.md`
- `.claude/rules/codex.md`

## スタック別ルール

以下は front matter の `globs` で適用範囲が限定されています。変更対象のパスが一致する場合に追加で読み、守ってください。

| 変更対象のパス | 追加で読むルール |
|---|---|
| `front/src/**` | `.claude/rules/typescript.md`, `.claude/rules/jsdoc.md` |
| `front/src/app/**`, `front/src/components/**`, `front/src/hooks/**`, `front/src/contexts/**`, `front/src/repositories/**`, `front/src/schemas/**`, `front/src/constants/**`, `front/src/types/**`, `front/src/lib/**` | `.claude/rules/frontend.md` |
| `front/src/app/api/**` | `.claude/rules/api.md`, `.claude/rules/dry-run.md`, `.claude/rules/domain-layer.md` |
| `terraform/**` | `.claude/rules/iac.md` |
| `.github/workflows/**` | `.claude/rules/github-actions.md` |

`front/src/app/api/**` は `front/src/**` と `front/src/app/**` の内側にあるため、API を変更する場合は上表の 3 行すべて（TypeScript / フロントエンド / API）が同時に該当します。

`/rules-update` 実行後は、同スキルがこの一覧を同期します。

## ルール構成を変更するとき

`.claude/rules/` の本文が唯一の正本です。ルールファイルの追加・削除・改名・適用範囲変更時は、同一変更で `CLAUDE.md`、該当する `AGENTS.md`、README の AI エージェント向けルールを同期してください。ルール本文だけの変更では、各入口ファイルを更新する必要はありません。
