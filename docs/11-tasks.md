# タスク（Tasks）

## 目次

- [1. 完了済みタスク](#1-完了済みタスク)
- [2. 未対応・検討中タスク](#2-未対応検討中タスク)
- [3. マイルストーン](#3-マイルストーン)

## 1. 完了済みタスク

| ID | タスク | 状態 |
|----|-------|------|
| T-01 | ホームページ（Hero + Navbar）の実装 | 完了 |
| T-02 | 個人開発履歴ページの実装 | 完了 |
| T-03 | サンプル開発履歴ページの実装 | 完了 |
| T-04 | お問い合わせフォーム（入力→確認→完了）の実装 | 完了 |
| T-05 | GCSデータ取得APIの実装 | 完了 |
| T-06 | メール送信API（Resend）の実装 | 完了 |
| T-07 | CSRF対策の実装 | 完了 |
| T-08 | CORS設定の実装 | 完了 |
| T-09 | レスポンシブデザイン対応 | 完了 |
| T-10 | ページ遷移アニメーションの実装 | 完了 |
| T-11 | Dockerマルチステージビルド構成 | 完了 |
| T-12 | GitHub Actions CI/CDパイプライン構築 | 完了 |
| T-13 | Terraform IaC構築 | 完了 |
| T-14 | Cloudflare導入 | 完了 |
| T-15 | Jest ユニットテスト作成（GCS API） | 完了 |
| T-16 | Playwright E2Eテスト作成 | 完了 |
| T-17 | Next.js 16へのアップグレード | 完了 |
| T-18 | セキュリティ脆弱性修正（npm audit fix） | 完了 |
| T-19 | 仕様書の作成 | 完了 |
| T-20 | npmからpnpmへのパッケージマネージャー移行 | 完了 |
| T-21 | モノレポ化（アプリ本体を `front/` に集約。一体型は維持） | 完了 |
| T-22 | メール送信の HTML インジェクション修正（入力の HTML エスケープ + text 併送 + Mail API ユニットテスト追加） | 完了 |
| T-23 | ESLint に JSDoc(TSDoc) lint を導入（eslint-plugin-jsdoc。`youtube-my-collection` を参考） | 完了 |
| T-24 | JSDoc 未記載の公開シンボルを補強（hook / Provider / shadcn UI / cn / route・metadata 等） | 完了 |
| T-25 | CI（test.yml）に format:check・lint ステップを追加（install 直後・fail fast） | 完了 |
| T-26 | API ユニットテストに異常系（500 パス）を補強（GCS download 例外・不正 JSON / Resend 例外・不正ボディ） | 完了 |
| T-27 | メール送信 API テストの実 Resend 依存を除去（CI で実メール送信しない。成功系は UT でカバー） | 完了 |
| T-28 | GCS 統合テスト（IT）を新設（fake-gcs-server + `GCS_API_ENDPOINT`。docker-compose + CI ステップ） | 完了 |
| T-29 | E2E に異常系を補強（API 500 / ネットワーク断時のグレースフル劣化・送信失敗のエラー表示） | 完了 |
| T-30 | E2E シナリオテストを追加（お問い合わせ 入力→確認→送信完了 の一連フロー／修正往復） | 完了 |
| T-31 | 未整備の共通ルールを追加（duplication / dead-code / static-analysis / github-actions / pr-description / lessons-learned / dry-run / domain-layer / codex）。actionlint ワークフロー・PR テンプレート・AGENTS.md・教訓ログを新設し、api.md に欠落 5 節を追記 | 完了 |
| T-32 | actionlint が検出した既存ワークフローの指摘 8 件を解消（`actions/checkout@v3`→v4、`google-github-actions/auth@v1`・`setup-gcloud@v1`→v2、SC2129 のリダイレクトまとめ、未使用変数 `KEEP_IMAGES` の削除） | 完了 |
| T-33 | セキュリティ監査記録の訂正（2026-01-31 監査の結論が「Next.js 16 アップグレード待ち」のままだった。実施済み・残存 2 件に修正し、06-security-specification.md / 2026-03 レポートの整合も取る） | 完了 |
| T-34 | `pull-request-test.yml` のワークフローレベル `paths` を `dorny/paths-filter` + ジョブレベル `if:` へ移行（必須チェック化しても pending で詰まらない形にする） | 完了 |
| T-35 | main のブランチ保護を有効化（strict=false・PR 必須／承認数 0・enforce_admins=false・force push とブランチ削除を禁止） | 完了 |
| T-36 | 必須チェック用の集約ジョブ `test-result` を追加。reusable workflow を呼ぶジョブは報告名が実行時 `test / test`／スキップ時 `test` と変わり、どちらを必須チェックに登録しても他方で pending のまま詰むため、名前が変わらない受け皿を用意した（required status check: `actionlint` / `changes` / `test-result`） | 完了 |
| T-37 | 上記の罠を `github-actions.md` へルール昇格（reusable workflow 呼び出しジョブを必須チェックに登録しない／チェック名は check-runs API で実物を確認する） | 完了 |
| T-38 | 全ワークフローに `permissions: contents: read` を明示（既定の広い権限に依存しない）。GCP 認証は SA キーで `GITHUB_TOKEN` を使わないため最小権限で足りる | 完了 |
| T-39 | シークレット混入検出ジョブ `secret-scan.yml` を追加（鍵・`.env`・`*.tfvars` が Git 管理下に入っていないか `git ls-files` で検査。パスフィルタなしで常時実行） | 完了 |
| T-40 | `docs/06-security-specification.md` が 150 行を超えたため `docs/06-security-specification/` へ分割（application / infrastructure / audit + README 索引）。参照 3 箇所を更新 | 完了 |

## 2. 未対応・検討中タスク

| ID | タスク | 優先度 | 備考 |
|----|-------|--------|------|
| T-B01 | 依存パッケージの脆弱性対応（2026-09-20 実測: ユニーク 106 件 / critical 2・high 44・moderate 53・low 7） | 高 | 「8件」は Next.js 16 化以前の古い数字だったため実測値に更新。適用可否の評価は issue #108。critical 2 件（Next.js RCE）は Windows ホスト／画像最適化 API 有効が条件で本構成は非該当、Hono の CORS 脆弱性も `origin` を明示指定しているため非該当。ただし next が 16.2.1 と 16.3.3 に大きく遅れており追随が必要 |
| T-B02 | 画像最適化の有効化 | 低 | `next/image`の`unoptimized`をfalseに変更 |
| T-B03 | `useIsHomePath`の命名修正 | 低 | 名前と実装が逆 |
| T-B04 | CI に型チェック（`tsc --noEmit`）を追加 | 中 | `static-analysis.md`「型チェックはビルドとは別に明示実行する」に未対応。`package.json` に `typecheck` スクリプトがなく、`test.yml` も format:check / lint / test のみ |
| T-B06 | デプロイに `environment:` の承認ゲートと `concurrency.cancel-in-progress: false` を追加 | 中 | `github-actions.md`「デプロイの発火」に未対応。キャンセルによるデプロイ不整合を防ぐ |

## 3. マイルストーン

| マイルストーン | 状態 |
|-------------|------|
| v1.0 サイトリニューアル公開 | 完了 |
| v1.1 セキュリティ強化（Next.js 16対応） | 完了 |
