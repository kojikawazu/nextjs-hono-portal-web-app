# nextjs-hono-portal-web-app

Next.js + Hono によるポータルWebアプリケーション（フロント＋バックエンド一体型、Cloud Run デプロイ）

## Rules

明示的な指示がなくても、`.claude/rules/` 内のルールを常に守ってください。

| ファイル | スコープ | 内容 |
|---------|---------|------|
| shortcuts.md | 全体 | 指示ショートカット（PR出して、PR承認しました 等） |
| workflow.md | 全体 | 開発フロー（ブランチ運用・テスト必須） |
| quality-gate.md | 全体 | 品質ゲート（セルフレビュー・設計/実装レビュー） |
| documentation.md | 全体 | ドキュメント更新ルール |
| doc-structure.md | 全体 | docs ファイルサイズ上限（150行）・分割・index |
| git.md | 全体 | GitHub Flow・ブランチ命名・push 禁止物 |
| testing.md | 全体 | テスト分類・原則・テストツール（Jest / Playwright） |
| coding-standards.md | 全体 | コーディング規約（TypeScript strict・pnpm・ESLint/Prettier） |
| error-handling.md | 全体 | エラーハンドリング方針（バリデーション・例外・ログ） |
| security.md | 全体 | セキュリティ設計方針（認証・CORS・インジェクション対策・シークレット管理） |
| jsdoc.md | `front/src/**` | JSDoc（TSDoc）規約（公開シンボルに必須） |
| frontend.md | `front/src/app/**`, `front/src/components/**`, `front/src/lib/**` | Next.js フロントエンド設計・コンポーネント規約 |
| api.md | `front/src/app/api/**` | Hono API 設計・ルート構成（Next.js 一体型） |
