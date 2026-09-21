# 教訓ログ

誤り・失敗・ハマりから得た教訓を蓄積する。記録の運用ルール（記録トリガー・フォーマット・ルールへの昇格基準）は [`../.claude/rules/lessons-learned.md`](../.claude/rules/lessons-learned.md) を参照。

新しいエントリはこの見出しの直下に追記する（新しいものが上）。

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
