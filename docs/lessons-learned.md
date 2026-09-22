# 教訓ログ

誤り・失敗・ハマりから得た教訓を蓄積する。記録の運用ルール（記録トリガー・フォーマット・ルールへの昇格基準）は [`../.claude/rules/lessons-learned.md`](../.claude/rules/lessons-learned.md) を参照。

新しいエントリはこの見出しの直下に追記する（新しいものが上）。

## 2026-09-22 Terraform の state をローカルのみに置いた結果、環境の入れ替えで失われた

### 概要

`terraform.tfvars` が無いことに気づいて調査したところ、**より深刻な問題として state 自体が失われている**ことが判明した。backend を設定しておらず、`.gitignore` で `terraform.tfstate` を除外していたため、state はローカルにしか存在せず、環境を入れ替えた時点で消えていた。この状態で `apply` すると既存リソースを新規作成しようとするため、実行できない。

### 詳細

- **何が起きたか**: `/aiusage` 追加に伴う `terraform apply` を案内しようとして、`terraform.tfvars` が無いことに気づいた。調べると `main.tf` に `backend` ブロックが無く（ローカル state）、`terraform.tfstate` は `.gitignore` で除外され、Git 履歴にも存在しなかった。**インフラ定義はコードにあるが適用できない**状態。実害は出ていない（後述）。

- **なぜ起きたか（根本原因）**: 2 つ重なっていた。
  1. **`.gitignore` の判断を「秘密かどうか」だけで行った。** `terraform.tfvars`（秘密を含む）と `terraform.tfstate`（秘密ではないが巨大で競合しやすい）を同じ「除外」に括った結果、**state だけが行き場を失った**。tfvars は「各自のローカルに置く」で成立するが、state は共有される必要があり、除外するならリモート backend が要る。
  2. **IaC が実際の変更経路から外れていた。** デプロイは `gcloud run deploy`、アプリの環境変数は Docker イメージに焼いた `.env` 経由で回っており、**Terraform は初期構築時にしか使われていなかった**。そのため state を失っても何も壊れず、**誰も気づかない**状態が続いた。

- **教訓 / 次からどうする**:
  - **除外するファイルは「代わりの置き場所」とセットで決める。** `.gitignore` に足すとき、「これはどこに置くのか」を必ず答える。state ならリモート backend、tfvars なら変数名の一覧をドキュメントに残す。ルール化した（[`iac.md`](../.claude/rules/iac.md)）。
  - **IaC が実際の変更経路に乗っているかを確認する。** 乗っていないなら、その定義は「適用されない飾り」であり、壊れても検知できない。`plan` の差分が空であることを定期的に確認する。
  - **「壊れても誰も気づかない」構造を疑う。** `duplication.md` の「CI は README を読まないので、README が腐っても CI は緑のまま」と同じ形。今回も、偶然 `tfvars` を探さなければ発覚しなかった。

- **関連**: issue #134（復元方針の検討）/ issue #132・PR #133（発覚の経緯）/ [`.claude/rules/iac.md`](../.claude/rules/iac.md) / [`.claude/rules/duplication.md`](../.claude/rules/duplication.md)

## 2026-09-22 zod の `.url()` は `javascript:` を妥当な URL と判定する

### 概要

個人開発カードに GitHub リンクを足す際、`z.string().url()` で検証すれば危険なスキームは弾けると考え、JSDoc にもそう書いた。実際には `javascript:alert(1)` が検証を通過し、追加したユニットテストが失敗して誤りが判明した。`href` に入れば XSS の実行経路になる。

### 詳細

- **何が起きたか**: `githubUrl: z.string().url().optional()` と定義し、「`javascript:` 等の危険なスキームも `.url()` で弾かれる」とコメントに明記した。`githubUrl: 'javascript:alert(1)'` が `undefined` に劣化することを期待したテストが `Received: "javascript:alert(1)"` で失敗した。影響範囲は本番へ出る前に検出できたため実害なし。

- **なぜ起きたか（根本原因）**: **zod の `.url()` は内部で `new URL()` を使って成否を判定しているだけ**で、スキームを制限しない。`new URL('javascript:alert(1)')` は成功する（`javascript:` はスキーム付き URI として構文上妥当）ため、`.url()` も妥当と判定する。実測（zod 3.24.1）では `javascript:` / `data:` / `vbscript:` がいずれも通過し、**拒否されるのは「URL として解釈できない文字列」だけ**だった。「URL として妥当」と「`href` に入れて安全」は**別の概念**であり、前者しか検証していなかった。

- **教訓 / 次からどうする**:
  - **`href` / `src` に入る値は `.url()` だけで検証を終わらせない。** `.refine()` で `https://` 始まりを要求するなど、**許可するスキームを明示的に限定**する。ルール化した（[`typescript.md`](../.claude/rules/typescript.md)「URL の検証」）。
  - **「弾かれるはず」と書く前に、弾かれることをテストで示す。** 今回コメントに書いた安全性の根拠は事実と違っていた。**危険な入力を通すテストケースを書けば、思い込みはその場で壊れる**。
  - **表示専用の任意項目は、不正値で一覧全体を落とさない。** `.catch(undefined)` で「リンクを出さない」側へ劣化させる。1 件の壊れた値で `ApiError(kind='schema')` を投げると、ページ全体が「No data」表示になる。

- **関連**: issue #125 / PR #127 / issue #128（本記録）/ issue #129（既存 `url` フィールドの棚卸し）/ [`.claude/rules/typescript.md`](../.claude/rules/typescript.md) / [`.claude/rules/security.md`](../.claude/rules/security.md)

## 2026-09-21 environment.url にシークレット由来の値を入れると GitHub は記録しない

### 概要

`deploy` ジョブの `environment.url` に、`gcloud` から動的取得した Cloud Run のサービス URL を渡したが、デプロイ成功後も `environment_url` が空のままだった。URL にシークレット（サービス名・リージョン）が含まれ、マスク対象になったため。

### 詳細

- **何が起きたか**: `environment: { name: production, url: ${{ steps.service-url.outputs.url }} }` と設定し、`gcloud run services describe --format='value(status.url)'` の結果を渡した。ワークフローもステップも success で終わるが、`deployments/<id>/statuses` API の `environment_url` は空。**どこにもエラーが出ない**ため、API を叩くまで失敗に気づけない。

- **なぜ起きたか（根本原因）**: 2 つ重なっていた。
  1. **`environment.url` はシークレットを含む値を受け付けない。** Cloud Run URL は `https://<service>-<hash>.<region>.run.app` の形で、本リポジトリは `GCP_CLOUD_RUN_SERVICE_NAME` と `GCP_REGION` をシークレット管理しているため、URL 全体がマスク対象になる。ステップのログでも `SERVICE_NAME: ***` と表示されていた。
  2. **そもそも設計が誤り。** `environment.url` に置くべきは**利用者が実際に開く URL**。本サイトは Cloudflare を挟んでおり、Cloud Run の直 URL は利用者向けではない。公開サイト URL は `README.md` とリポジトリの homepage に既にあり、**動的取得する必要がなかった**。

- **教訓 / 次からどうする**:
  - **`environment.url` にシークレット由来の値を組み立てない。** 公開しても差し支えない固定値（公開サイト URL）を使う。ドメインがシークレットなら、そもそも `url` を設定しない。
  - **「エラーが出ない失敗」は API で結果を確認する。** 設定したら `gh api repos/<owner>/<repo>/deployments?environment=<env>` と `.../deployments/<id>/statuses` で `environment_url` が入っているかを見る。ワークフローの success は URL 記録の成否を意味しない。
  - **動的に組み立てる前に「その値は本当に必要か」を問う。** 今回は固定値のほうが正しく、かつ壊れなかった。

- **関連**: issue #113（`environment` 導入）/ issue #115（本件）/ PR #114・#116 / `docs/09-architecture-specification/deploy-design.md`

## 2026-09-20 reusable workflow を呼ぶジョブは、実行時とスキップ時で報告されるチェック名が変わる

### 概要

`pull-request-test.yml` の `test`（`uses:` で `test.yml` を呼ぶジョブ）を required status check に登録したところ、ドキュメントのみの PR がマージ不能になった。実行時とスキップ時でチェック名が異なり、登録した名前が片方のケースで存在しなかったため。

### 詳細

- **何が起きたか**: main のブランチ保護で `test / test` を必須チェックに登録した直後、`docs/` のみを変更した PR が `mergeStateStatus=BLOCKED` になった。ジョブレベル `if:` でスキップさせる対応（`github-actions.md`「パスフィルタの実装」）は済んでいたにもかかわらず詰んだ。

- **なぜ起きたか（根本原因）**: **reusable workflow の呼び出しジョブは、報告されるチェック名が状況で変わる。**

  | 状況 | 報告名 |
  |---|---|
  | 実行された | `test / test`（外側ジョブ / 内側ジョブ） |
  | `if:` でスキップされた | `test`（内側ワークフローが起動しないため外側だけ） |

  「skipped は必須チェックの成功として扱われる」は正しいが、**そもそもその名前のチェックが報告されない**ため pending のまま残る。`test` を登録すれば今度はテスト実行時に `test` が存在せず、同じ理由で詰む。どちらの名前を選んでも片方で詰む。

- **教訓 / 次からどうする**: **必須チェックには、条件に関わらず必ず起動して単一の名前で結果を報告する「集約ジョブ」を登録する。** `needs: [changes, test]` + `if: always()` のジョブを置き、`needs.test.result` が `success` または `skipped` なら成功、それ以外なら失敗とする。判定ジョブ（`changes`）が落ちた場合も失敗させる（落ちると `test` が needs 未達でスキップされ、テストが 1 本も走らないまま通ってしまうため）。
  - **チェック名は推測せず実物で確認する**。`gh api repos/<owner>/<repo>/commits/<sha>/check-runs --jq '.check_runs[].name'` で、**実行された PR とスキップされた PR の両方**を見る。今回も両方を突き合わせて初めて原因が分かった。
  - ブランチ保護を入れたら、**代表的な変更パターンごとに実際の PR でマージ可否を確認する**。設定しただけでは検証にならない。

- **関連**: **ルールへ昇格済み** — `.claude/rules/github-actions.md`「reusable workflow を呼ぶジョブを必須チェックに登録しない」「チェック名は推測せず実物で確認する」（issue #105）。ほかに同ファイルの「パスフィルタの実装（重要な落とし穴）」 / issue #102 / PR #103・#104 / `docs/11-tasks.md` T-34〜T-36

<!-- 記入例（実際のエントリを追記する際は、この例より下に残さず先頭へ追加する）

## YYYY-MM-DD 何が起きたかが一読で分かる一文

### 概要

何が起きて何が問題だったかを 1〜3 行で。ここだけ読んで内容が掴める粒度にする。

### 詳細

- 何が起きたか: 事象・影響範囲（対象データ・ユーザー・期間）
- なぜ起きたか（根本原因）: どのコード・設定・判断が原因か
- 教訓 / 次からどうする: 次に同じ状況でとるべき具体的な行動
- 関連: 関連するルールファイル・PR・issue・コミットへの参照

-->
