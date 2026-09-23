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
| T-03 | サンプル開発履歴ページの実装 | 完了（T-51 で削除） |
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
| T-41 | 依存パッケージの脆弱性対応（106件 → 38件・critical 2 → 0）。`next` 16.3.5 / `hono` 4.13.8 / `nanoid` 5.1.16 / `@google-cloud/storage` 7.22.0 / `postcss` 8.5.28 へ更新し、未使用の `@hono/node-server` を削除 | 完了 |
| T-42 | CI に型チェック（`tsc --noEmit`）を追加。`typecheck` スクリプトを新設し、lint 直後・Playwright install より前に配置（fail fast）。従来は型エラーが `next build`（= main マージ後のデプロイ）まで検出されなかった | 完了 |
| T-43 | `docs/08-test-specification.md` が 150 行を超えたため `docs/08-test-specification/` へ分割（strategy / levels / ci + README 索引）。参照 4 箇所を更新 | 完了 |
| T-44 | デプロイに `concurrency`（`cancel-in-progress: false`）と `environment: production`（Cloud Run の実 URL を記録）を設定。承認ゲートは置かない | 完了 |
| T-45 | `environment.url` が記録されない不具合を修正。Cloud Run URL の動的取得をやめ公開サイトの固定値にした（サービス名・リージョンがシークレットのため URL がマスクされていた） | 完了 |
| T-46 | 関心別ディレクトリを `front/src/` 直下へ移行（`types` / `schemas` / `constants` / `hooks` / `contexts` / `lib`）。`schema`→`schemas` の複数形化、`utils`→`lib` の統合、`contactFormData` を `schemas/contact.ts` へ移設 | 完了 |
| T-47 | `fetch` を `repositories/` へ集約（`http` / `common-data` / `dev-data` / `contact`）。共通ヘルパー `fetchJson` / `fetchOk` と `ApiError`（network / status / schema）を導入し、レスポンススキーマを `schemas/` へ移動。リポジトリのユニットテスト 30 件を追加（20 → 50 件） | 完了 |
| T-48 | 送信系エンドポイントに IP ベースのレートリミットを導入（`POST /api/mail/send` 3 回/分・`GET /api/mail/csrf` 20 回/分）。スライディングウィンドウ方式、超過時 429 + `Retry-After`、追跡クライアント数に上限 | 完了 |
| T-49 | Dependabot alerts 33 件を `pnpm.overrides` で解消（ユニーク advisory 38 → 1 件、high 22 → 0）。3 回の監査で「上流待ち」だった `fast-xml-parser` も同一メジャー内更新で解決 | 完了 |
| T-50 | secret-scan の検出漏れを修正（`service-account.json` などの区切り違いが素通りしていた）。`.gitignore` にも鍵・認証情報を追加し 2 層にする | 完了 |
| T-51 | 「サンプル開発履歴」ページ（`/sampledev`）を削除（issue #27）。ページ・hook・repository 関数・schema / types・Hono ルート `GET /api/gcs/sampledev`・ナビリンク・UT / IT / E2E の該当ケースと、どこからも読まれなくなる環境変数 `GCS_SAMPLE_DATA_PATH`（`.env.example` / ワークフロー / Terraform）まで一括で撤去 | 完了 |
| T-52 | 個人開発カードに GitHub リンクを追加（issue #125・親 #28）。`githubUrl` を optional + https 限定で検証し、不正値は例外にせず `undefined` へ劣化させる（1 件の壊れた値で一覧全体を落とさない）。データ側は data-app #36 | 完了 |
| T-53 | `href` に入る外部由来 URL のスキーム検証を横断適用（issue #129）。`schemas/url.ts` に制約を 1 箇所定義し、`personaldev` 2 件・`common` 5 件へ合成。不正・未設定はリンクごと非表示に統一し、`href=""` を作らない | 完了 |
| T-54 | AI 活用方法ページ `/aiusage` を新設（issue #132）。画面仕様の正本を `docs/mockups/` に作成（mock-screen）し、Hono ルート・スキーマ・repository・hook・ページ・Navbar・環境変数 `GCS_AIUSAGE_DATA_PATH` を追加。データは data-app #40 | 完了 |
| T-55 | Terraform の state 復旧（issue #137・発端 #134）。`backend "gcs"`（`gs://my-infra-tfstate/nextjs-hono-portal-web-app`）を設定し、既存 9 リソースを `import {}` ブロックで取り込む。`terraform.tfvars` も同じ prefix に置き `make tf-vars-pull` / `tf-vars-push` で同期。Cloud Run から `GCS_SAMPLE_DATA_PATH` を削除し `GCS_AIUSAGE_DATA_PATH` を反映。共有 SA に `prevent_destroy`、秘密変数に `sensitive`、PR CI に `terraform fmt` / `validate` を追加（[iac.md](./09-architecture-specification/iac.md)） | 完了 |

## 2. 未対応・検討中タスク

| ID | タスク | 優先度 | 備考 |
|----|-------|--------|------|
| T-B02 | 画像最適化の有効化 | 低 | `next/image`の`unoptimized`をfalseに変更。**有効化すると Image Optimization API が動き出す**ため、`next` のバージョン追随を怠らないこと（2026-09 監査時点の critical RCE は 16.3.3 で修正済み）。T-51（`/sampledev` 削除）で `next/image` の利用箇所が無くなったため、現状この設定は無効果。**画像を再導入する issue #28 と同時に判断する** |
| T-B03 | `useIsHomePath`の命名修正 | 低 | 名前と実装が逆 |
| T-B10 | `resend` を 4.1.1 → 6.x へ更新（`js-cookie` の high を解消） | 低 | メジャー 2 段更新で破壊的変更を含む。`js-cookie` はブラウザ用 Cookie ライブラリで、サーバー側のメール描画では実行されないため緊急性は低い（[security-audit-report-2026-09.md](./security-audit-report-2026-09.md)） |
| T-B12 | Cloudflare 側のレートリミット導入（エッジで止める） | 中 | アプリ側のレートリミット（T-48）は**インスタンス単位**で、実効上限が「閾値 × インスタンス数」になり、`cf-connecting-ip` / `x-forwarded-for` も詐称しうる（Cloud Run が `--allow-unauthenticated` で直接到達可能なため）。分散・詐称を伴う攻撃にはエッジ側が必要（[application.md §6](./06-security-specification/application.md)） |
| T-B11 | テスト用と本番用でシークレットを分離し、本番シークレットを `production` Environment へ移す | 中 | `github-actions.md`「シークレットは Environment 単位で管理し、PR からは参照できないようにする」に未対応。`test.yml` が PR で同じ 14 個のシークレット（GCP SA キー・Resend・GCS パス等）を使うため、そのまま移すと PR の CI が全滅する。テスト専用の認証情報を用意するのが前提（[deploy-design.md](./09-architecture-specification/deploy-design.md)） |
| T-B13 | Terraform の秘密変数（`resend_api_key` / `my_mail_address`）を Secret Manager 参照へ移す | 中 | 現状は tfvars と state に平文で入る（`plan` 出力は `sensitive = true` でマスク済み）。移行すれば tfvars から秘密が消え、Cloud Run の環境変数も Secret 参照になる（issue #137 で積み残し） |

## 3. マイルストーン

| マイルストーン | 状態 |
|-------------|------|
| v1.0 サイトリニューアル公開 | 完了 |
| v1.1 セキュリティ強化（Next.js 16対応） | 完了 |
