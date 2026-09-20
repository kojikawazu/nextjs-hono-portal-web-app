---
description: GitHub Actions のルール — ワークフローの静的解析（actionlint）と発火ルール
globs: ".github/workflows/**"
---

# GitHub Actions のルール

本ルールは 2 つを定める。

1. **ワークフローの静的解析**: ワークフロー自体の誤りを actionlint で機械的に潰す。
2. **発火ルール**: **「変更した内容に関係のあるジョブだけを動かす」**。ドキュメントやルールの更新でテスト・ビルド・デプロイを回さない（CI 時間・コストの浪費、キュー待ちによる他 PR のブロック、無意味なデプロイの発生を防ぐ）。

## ワークフローの静的解析（actionlint）

**ワークフローを追加・変更したら、[actionlint](https://github.com/rhysd/actionlint) による検証を CI で必須にする。** ワークフローの誤りは「push して実際に動かすまで気づけない」ため、CI 時間を溶かす前に機械で潰す。

検出できるもの:

| 検出内容 | 例 |
|---|---|
| ランナーラベルの誤り | `runs-on: ubuntu-lates`（typo）／未登録のセルフホストラベル |
| アクション入力名の誤り | `actions/checkout@v4` に `fetch-dept:`（正: `fetch-depth`） |
| 式・コンテキストの誤り | 存在しない `steps.<id>.outputs.*` の参照、型の不一致 |
| ジョブ依存の誤り | `needs:` が存在しないジョブ ID を指している |
| **スクリプトインジェクション** | `run: echo "${{ github.event.pull_request.title }}"` のように untrusted input を `run:` へ直接埋め込む（環境変数経由に直す） |
| シェルスクリプトの不備 | `run:` の中身（shellcheck 連携。クォート漏れ等） |
| cron 式・glob の誤り | `schedule` の cron 構文、`branches` のパターン |

**検出できないもの**（機械では判断できないため、レビューで見る）: ブランチ名・パスフィルタの内容が意図と合っているか、参照しているシークレットが実在するか、ジョブの実行順序が業務的に正しいか。

### CI での実行

`.github/workflows/actionlint.yml` として**独立したワークフロー**で実行する。

- **パスフィルタをかけず、全 PR で常に実行する。** 本ファイルの「変更内容に関係あるジョブだけ動かす」原則の**例外**であり、理由は次の 3 つ:
  - **実行が数秒で終わる。** パスフィルタで削減できる CI 時間は、テスト・ビルドに比べて無視できる。
  - **判定ジョブ（後述の `dorny/paths-filter`）を新たに足すなら、判定のほうが検査より高くつく。** ただし**判定ジョブを既に持つプロジェクトでは出力を 1 行足すだけ**で済むため、この理由は当てはまらない。その場合も次の理由で常時実行を選ぶ。
  - **必須チェックにする場合、パスフィルタの設計を誤ると PR がマージ不能になる**（後述「パスフィルタの実装（重要な落とし穴）」）。**数秒の削減のために、この事故のリスクを各プロジェクトに負わせない。** 常時起動ならワークフロー自体が必ず走るため、`pending` で詰まる余地が無い。
- **`actions/checkout` を必ず先に置く**。actionlint は Git リポジトリの中から `.github/workflows` を探すため、リポジトリ外で実行するとエラー終了する。
- **バージョンを固定する**。`latest` にすると、コードを変えていないのに新リリースの検査強化で CI が落ちる。更新は依存更新として明示的に行う（`run:` 内のバージョンは Dependabot では更新されない）。
- **公式 Docker イメージ（`rhysd/actionlint`）で実行する**。**actionlint 本体と shellcheck / pyflakes が同梱されている**ため、`run:` の中身まで必ず検査される。バイナリを個別に取得する方式は使わない（理由は次節）。
- **タグを固定する**。イメージのタグ固定で、actionlint と **shellcheck の双方のバージョンが揃う**。バイナリ取得方式にあった「チェックサム検証を伴わない」問題も、タグ固定で同じ水準まで抑えられる。あわせて**このジョブにシークレットを渡さず `permissions: contents: read` に絞る**。

```yaml
name: actionlint

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

permissions:
  contents: read

jobs:
  actionlint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run actionlint
        env:
          ACTIONLINT_VERSION: 1.7.12
        run: docker run --rm -v "$PWD":/repo -w /repo "rhysd/actionlint:${ACTIONLINT_VERSION}" -color
```

### ローカルでの実行

**push する前に手元で実行する。CI とまったく同じイメージ・同じタグを使う。**

```bash
docker run --rm -v "$PWD":/repo -w /repo rhysd/actionlint:1.7.12 -color
```

- **`brew install actionlint` / `go install` を使わない。** これらは **shellcheck を連れてこない**。
- **shellcheck が PATH に無いと、`run:` の検査は「エラーにも警告にもならず、その層だけ静かにスキップ」される。** 終了コードは 0 のままなので、**検査が減ったことに気づけない**。「手元で通ったのに CI で落ちる」を、**レビューで最も見落とされる層**（`run:` の中身）で起こす。
- タスクランナーがあるなら**コマンドを 1 箇所に定義**し、手元と CI の双方がそれを呼ぶ（例: `package.json` の `"lint:workflows"`、`Makefile` のターゲット）。**コマンド文字列を 2 箇所に書き写さない。**
- 引数なしで実行すると、リポジトリ内の `.github/workflows` を自動検出して全ワークフローを検査する。指摘があれば終了コード 1 で落ちる。
- actionlint は `.git` からリポジトリルートを判定するため、**リポジトリ内で実行する**（`node_modules` 等の依存は不要）。

**例外（Docker が使えない環境）**: バイナリを直接入れる場合は、**shellcheck も併せて導入する**（`brew install shellcheck` / `apt install shellcheck`）。**CI とローカルで shellcheck の有無を一致させることが要件**であり、片方だけ検査層が欠けた状態を許さない。

### 抑制と設定

抑制の作法は「**理由を書く・範囲を最小にする・増えたら設定自体を見直す**」に従う。actionlint 固有の手段は以下:

| 目的 | 手段 |
|---|---|
| セルフホストランナーのラベルを認識させる | `.github/actionlint.yaml` の `self-hosted-runner.labels` に登録する（`actionlint -init-config` で雛形を生成できる） |
| 特定のエラーメッセージを無視する | `-ignore <正規表現>`（繰り返し指定可）／`.github/actionlint.yaml` の `paths.<glob>.ignore` |
| shellcheck の特定ルールを無視する | 該当箇所の直前に `# shellcheck disable=SC2086` を書く（`run:` 内の対象行のみ） |

- **リポジトリ単位・ワークフロー単位での一括無効化をしない**。無視するなら対象を絞り、設定ファイルに理由をコメントで残す。
- 設定ファイル（`.github/actionlint.yaml`）は**コミット対象**。ローカル固有設定に依存しない。

## トリガの基本形

| ワークフロー | トリガ | 補足 |
|---|---|---|
| CI（lint / test / build） | `pull_request`（対象: `main`）+ `push`（`main` のみ） | **全ブランチの push で回さない**。PR で回れば十分 |
| CD（デプロイ） | `push`（`main` のみ）または `release` | PR では動かさない |
| 手動運用（再デプロイ・ロールバック） | `workflow_dispatch` | 手動実行の口を必ず用意する |

- **`concurrency` を必ず設定する**。同一 PR で連続 push した際に古い実行をキャンセルする。

  ```yaml
  concurrency:
    group: ${{ github.workflow }}-${{ github.ref }}
    cancel-in-progress: true   # CD（デプロイ）では false にする（中断で不整合が起きるため）
  ```

- **`permissions` は最小権限**を明示する（既定の広い権限に依存しない）。読み取りだけなら `contents: read`。

## 変更内容と実行対象

| 変更内容 | lint / test / build | デプロイ | 実行する軽量チェック |
|---|---|---|---|
| アプリケーションコード | ✅ | ✅（main マージ時） | — |
| テストコード | ✅ | ❌ | — |
| `docs/**`、`*.md`、`README.md` | ❌ | ❌ | markdown lint、リンク切れチェック |
| `.claude/**`（rules / skills） | ❌ | ❌ | markdown lint |
| `.github/workflows/**` | ✅（自身の検証のため） | ❌ | actionlint（全 PR で常時実行するため、この行の変更に限らず走る） |
| 依存関係（ロックファイル） | ✅ | ✅ | — |
| インフラ定義（Terraform 等） | ❌（アプリのテストは不要） | ✅（インフラ側の適用） | plan の差分確認 |

- **ドキュメント変更でも「何も動かさない」にはしない**。markdown lint・リンク切れ・必須ファイル（README.md / CLAUDE.md）の存在検証は軽量なので実行する。

## パスフィルタの実装（重要な落とし穴）

**ワークフローレベルの `paths` / `paths-ignore` を、required status check（ブランチ保護の必須チェック）と併用してはならない。**

- ワークフロー自体が起動しないと、必須チェックは **`pending` のまま永久に完了せず、PR がマージできなくなる**。
- 一方、**ジョブレベルの `if:` でスキップした場合は「skipped」となり、必須チェックとしては成功扱い**になる。

したがって、**必須チェックにするジョブは「常に起動し、中身をスキップする」形にする**。

```yaml
on:
  pull_request:
    branches: [main]

# 既定の広い権限に依存しない
permissions:
  contents: read

jobs:
  changes:                      # 変更範囲を判定する
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: read       # dorny/paths-filter が PR の変更ファイルを読むために必要
    outputs:
      app: ${{ steps.filter.outputs.app }}
    steps:
      - uses: actions/checkout@v4   # push トリガも使う場合に必要（git 差分を取るため）
      - uses: dorny/paths-filter@v3
        id: filter
        with:
          # 除外条件の AND を取る。既定の 'some' では除外リストが成立しない（後述）
          predicate-quantifier: 'every'
          filters: |
            app:
              - '!docs/**'
              - '!**/*.md'
              - '!.claude/**'

  test:                         # 必須チェック。常に起動し、中身だけスキップする
    needs: changes
    if: needs.changes.outputs.app == 'true'
    runs-on: ubuntu-latest
    steps:
      - run: echo "run tests"
```

- **`dorny/paths-filter` を使うジョブには `pull-requests: read` が要る。** `pull_request` イベントでは、変更ファイルの一覧を **GitHub API から取得する**ため（`push` では git の差分を使う）。ワークフローレベルを `contents: read` に絞ると、**このジョブだけジョブレベルで上書きしない限り API 呼び出しが失敗する**。
- **失敗の出方が分かりにくい。** `changes` が落ちると `needs: changes` の全ジョブがスキップされ、**「重いジョブが 1 つも走らない」状態**になる。既定の広い権限のままなら通ってしまうため、**権限を絞った瞬間に初めて顕在化する**。
- `actions/checkout` は `push` イベントで git 差分を取るために必要（`pull_request` だけなら省略可だが、両方のトリガで動かすなら置く）。
- 必須チェックにしないワークフロー（デプロイ等）は、ワークフローレベルの `paths-ignore` を使ってよい（起動そのものを止める方が安価）。
- **判定条件は「除外リスト」で書く**（`docs/**` 以外はアプリ変更とみなす）。「対象リスト」で書くと、**新しいディレクトリが増えたときに黙ってテストが走らなくなる**。安全側に倒す。

### reusable workflow を呼ぶジョブを必須チェックに登録しない

**`uses:` で reusable workflow を呼ぶジョブは、報告されるチェック名が状況で変わる。** そのまま required status check に登録すると詰む。

| 状況 | 報告されるチェック名 |
|---|---|
| ジョブが実行された | `test / test`（**外側ジョブ / 内側ジョブ**） |
| ジョブが `if:` でスキップされた | `test`（内側ワークフローが起動しないため**外側だけ**） |

「skipped は必須チェックの成功として扱われる」は正しいが、**そもそもその名前のチェックが報告されない**ため `pending` のまま残る。`test` を登録すれば今度は実行時に `test` が存在せず、同じ理由で詰む。**どちらの名前を選んでも片方のケースでマージ不能になる。**

**対策: 必ず起動して単一の名前で結果を報告する集約ジョブを置き、そちらを必須チェックにする。**

```yaml
  test:
    needs: changes
    if: needs.changes.outputs.app == 'true'
    uses: ./.github/workflows/test.yml       # ← これは必須チェックにしない
    secrets: inherit

  test-result:                               # ← これを必須チェックにする
    needs: [changes, test]
    if: always()                             # 上流の結果に関わらず必ず起動する
    runs-on: ubuntu-latest
    permissions: {}
    steps:
      - env:
          CHANGES_RESULT: ${{ needs.changes.result }}
          TEST_RESULT: ${{ needs.test.result }}
        run: |
          # changes が落ちると test は needs 未達でスキップされる。成功扱いに
          # すると「テストが 1 本も走らないまま通る」状態になる（fail-unsafe）。
          if [ "$CHANGES_RESULT" != "success" ]; then
            echo "::error::changes ジョブが success ではありません（$CHANGES_RESULT）"
            exit 1
          fi
          # skipped は「アプリに無関係な変更のみ」を意味するので成功扱いにする。
          case "$TEST_RESULT" in
            success | skipped) ;;
            *) echo "::error::test ジョブが $TEST_RESULT で終了しました"; exit 1 ;;
          esac
```

- **判定ジョブ（`changes`）の失敗を必ず失敗として扱う**。上表のコメントのとおり、ここを緩めると検証装置として機能しなくなる。
- `needs.*.result` は **`env:` 経由で参照する**（`run:` に式を直接埋め込まない）。
- 集約ジョブ自体はパスフィルタを持たない。**常に起動することが存在意義**である。

### チェック名は推測せず実物で確認する

**必須チェックに登録する名前は、実際に報告されたものを API から読む。** ワークフローの job id から推測すると、上記のような複合名・条件による変化を見落とす。

```bash
gh api repos/<owner>/<repo>/commits/<sha>/check-runs --jq '.check_runs[].name'
```

- **「本体が実行された PR」と「スキップされた PR」の両方で確認する。** 片方だけでは名前が変わることに気づけない。
- ブランチ保護を設定したら、**代表的な変更パターンごとに実際の PR でマージ可否を確認する**（`gh pr view <n> --json mergeable,mergeStateStatus`）。設定しただけでは検証にならない。

### 除外パターンは extglob で書かない

**除外は「先頭 `!` のパターン」＋ `predicate-quantifier: 'every'` で書く。`'!(a|b|c)'` という extglob で書いてはならない。**

`dorny/paths-filter` は picomatch でマッチングする（`{ dot: true }` 固定）。picomatch では:

- **パターン全体を否定するのは先頭の `!` だけ**。`!(...)` は「列挙したもの以外に一致する通常のパターン」であって、否定ではない。
- **`!(...)` の内側では `**` が階層を跨がない**。さらに `|` で選択肢を並べると結果が選択肢の順序に依存し、論理和の否定にならない。
- **既定の `some`（OR）では除外リストが成立しない**。`- '!docs/**'` と `- '!**/*.md'` を行で並べても `NOT A OR NOT B` になり、**ほぼ全ファイルが `true`** になる。除外条件は AND で結ぶ必要があるため `predicate-quantifier: 'every'` が要る。

このうち **1 つ目と 2 つ目が重なる**ため、`'!(docs/**|**/*.md|.claude/**)'` は**パスの深さによって除外できたりできなかったりする**:

| 変更ファイル | extglob 1 本 | `every` ＋ 先頭 `!` |
|---|---|---|
| `CLAUDE.md`（ルート直下の `.md`） | ❌ 除外されない | ✅ |
| `docs/09-architecture.md`（`docs/` 直下） | ✅ | ✅ |
| `docs/adr/ADR-007.md`（`docs/` の 2 階層目以降） | ❌ 除外されない | ✅ |
| `.claude/rules/git.md` | ✅ | ✅ |
| `.github/PULL_REQUEST_TEMPLATE/bug.md` | ❌ 除外されない | ✅ |

`every` を使うときの注意:

- **`predicate-quantifier` はステップ全体に効く**。同じ `dorny/paths-filter` ステップ内の全 filter が `every` になる。
- **`every` の filter に肯定パターンを混ぜない**。`- '!docs/**'` に `- '.github/workflows/**'` を足すと AND になり、ほぼ全ファイルが不一致になって**必須チェックが永久にスキップされる**（fail-unsafe）。肯定リストの filter が必要なら**別ステップに分ける**か、**単一パターンで書く**（パターンが 1 本なら `every` でも `some` でも結果は同じ）。

### フィルタを書いたら実挙動を検証する

パスフィルタは**レビューでは正しく読めるのに実挙動が違う**典型。書いたら必ず実際のマッチ結果を確認する。

- **仕様確認は固定タグを ref に指定する**。`gh api "repos/dorny/paths-filter/contents/action.yml?ref=v3"` のように、ワークフローで固定しているタグを見る。既定ブランチには**未リリースの入力値**が含まれており（`some-with-excludes` は master のみ。`v3` の有効値は `every` / `some`）、それを読むと CI で `invalid value` エラーになる。
- 検証はアクションと同じ **`{ dot: true }`** を与えた picomatch で行い、**実際のワークフローからパターンを読み出して**判定する（意図した値ではなく実物を検証する）。
- **ルート直下と階層下を別ケースとして両方通す**。この不具合は深さ依存のため、片方だけでは検出できない。
- **fail-safe 側も確認する**（未知のディレクトリ `newmodule/index.ts` が `true` になること）。

## デプロイの発火

- **デプロイは `main` へのマージを唯一のトリガとする**。PR ブランチから本番へデプロイしない。
- **Environments（`environment:`）を使い、本番は承認ゲートを置く**。シークレットは Environment 単位で管理し、PR からは参照できないようにする。
- **fork からの PR で `pull_request_target` を安易に使わない**。`pull_request_target` は base リポジトリの権限とシークレットで動くため、fork のコードをチェックアウトして実行するとシークレットが漏洩する。
- デプロイ workflow には `concurrency.cancel-in-progress: false` を設定し、**デプロイ途中でのキャンセルによる不整合を防ぐ**。

## レビュー観点

- **actionlint が CI に入っているか**。ワークフローを追加・変更する PR で actionlint が実行され、成功しているか。
- **actionlint が shellcheck 込みで動いているか**（CI・ローカルとも公式イメージのタグ固定になっているか）。バイナリ直接取得に戻っていると、`run:` の検査が黙って抜ける。
- actionlint の指摘を `-ignore` や `paths.<glob>.ignore` で握り潰していないか（理由・範囲が最小か）。
- ドキュメント・ルールのみの PR で、テストやデプロイが起動していないか。
- 逆に、**アプリコードを変更したのに必要なジョブがスキップされていないか**（パスフィルタの書き漏れ）。
- パスフィルタの除外を `'!(a|b|c)'` の extglob で書いていないか（先頭 `!` ＋ `predicate-quantifier: 'every'` になっているか）。
- `every` の filter に**肯定パターンが混ざっていないか**（AND になり、必須チェックが永久にスキップされる）。
- パスフィルタの実挙動を検証した記録が PR にあるか（ルート直下と階層下の両方）。
- 必須チェックにしているジョブが、ワークフローレベルの `paths` / `paths-ignore` で止められていないか（PR がマージ不能になる）。
- **`dorny/paths-filter` を使うジョブに `pull-requests: read` があるか**（無いと `pull_request` で API 呼び出しが失敗し、`needs` で繋がった全ジョブがスキップされる）。
- `permissions` が明示され、最小権限になっているか。**本ファイルに新しい YAML 例を足すときも、その例自体がこの規定を満たしているか**を確認する。
