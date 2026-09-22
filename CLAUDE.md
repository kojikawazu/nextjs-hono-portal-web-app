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
| github-issue.md | 全体 | GitHub issue 運用（ブランチと対で起票・open/close で進捗管理・PR で自動クローズ） |
| pr-description.md | 全体 | PR 本文の必須セクション（変更種別ごとに記載項目を固定） |
| testing.md | 全体 | テスト分類・原則・テストツール（Jest / Playwright） |
| coding-standards.md | 全体 | コーディング規約（TypeScript strict・pnpm・ESLint/Prettier） |
| duplication.md | 全体 | 重複と共通化の判断基準・環境初期化手順の一元化・スクリプトの冪等性 |
| dead-code.md | 全体 | デッドコード禁止（コメントアウト放置・未使用 export・到達不能コードを残さない） |
| static-analysis.md | 全体 | 静的解析の運用（Formatter/Linter の役割分担・CI 必須・警告ゼロ・抑制は理由と範囲を最小に） |
| lessons-learned.md | 全体 | 教訓ログの運用（記録トリガー・フォーマット・ルールへの昇格基準。蓄積先は docs/lessons-learned.md） |
| codex.md | 全体 | Codex 運用（AGENTS.md の階層適用・Claude 固有機能の読み替え・PR 承認/マージを行わない） |
| typescript.md | `front/src/**` | TypeScript 固有規約（type/interface 使い分け・Zod 統一・型/定数/スキーマの配置・any 禁止・enum 回避・import type） |
| error-handling.md | 全体 | エラーハンドリング方針（バリデーション・例外・ログ） |
| security.md | 全体 | セキュリティ設計方針（認証・CORS・インジェクション対策・シークレット管理） |
| jsdoc.md | `front/src/**` | JSDoc（TSDoc）規約（公開シンボルに必須） |
| frontend.md | `front/src/app/**`, `front/src/components/**`, `front/src/hooks/**`, `front/src/repositories/**`, `front/src/schemas/**`, `front/src/lib/**` 等 | Next.js フロントエンド設計・コンポーネント規約・関心別ディレクトリ |
| api.md | `front/src/app/api/**` | Hono API 設計・ルート構成（Next.js 一体型）・レイヤ依存の一方向ルール・バリデーションの二重定義禁止 |
| dry-run.md | `front/src/app/api/**` | DryRun（事前検証）の意味論（経路の形・副作用の禁止範囲・認可・TOCTOU） |
| domain-layer.md | `front/src/app/api/**` | domain 層に置くもの（値オブジェクトを作る基準・ドメインサービス・入口の検証との分担） |
| iac.md | `terraform/**` | IaC の state 運用（リモート backend 必須・除外したファイルは代わりの置き場所とセットで決める・IaC が変更経路から外れない） |
| github-actions.md | `.github/workflows/**` | ワークフローの静的解析（actionlint）・発火ルール（関係あるジョブだけ動かす）・required status check の組み方 |
