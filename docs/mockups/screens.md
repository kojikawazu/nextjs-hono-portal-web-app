# nextjs-hono-portal-web-app — 画面仕様

このファイルは**画面仕様の正本**です。`docs/mockups/` 配下の HTML は、このファイルからのレンダリング結果であり、正本ではありません。
仕様を変えるときは**必ずこのファイルを先に更新**し、そのうえで HTML を再生成してください。

## メタ

| 項目 | 値 |
|---|---|
| 対象範囲 | AI 活用方法ページ（`/aiusage`）とその導線 |
| デバイス方針 | 両対応（既存サイトがレスポンシブのため踏襲） |
| 最終更新 | 2026-09-22 |

## ロール定義

| キー | ロール名 | 説明 | 主なデバイス |
|---|---|---|---|
| visitor | 訪問者 | サイトを閲覧する人。認証は無く、全員が同じ画面を見る | 両対応 |

- 本サイトは公開ポータルで**ロールが 1 つしかない**ため、ロールによる画面の出し分けは無い。
- 認証系画面（ログイン・招待・パスワードリセット）は**本サイトに存在しない**ため対象外（`checks/01-screen-coverage.md` の認証フロー観点は該当なし）。

## 画面一覧

| # | 画面ID | 画面名 | ロール | デバイス | ルートパス | 概要 | 主なユーザー操作 |
|---|---|---|---|---|---|---|---|
| 1 | visitor-aiusage | AI 活用方法 | visitor | 両対応 | `/aiusage` | 開発工程ごとに、どの AI ツールをどう使っているかを紹介する | 工程を読む / ツールの公式サイトを別タブで開く / ホームへ戻る |

- `画面ID` は拡張子を除いたファイル名と一致させる（`visitor-aiusage.html` としてレンダリングされる）。
- 既存画面（ホーム `/`・個人開発履歴 `/personaldev`・お問い合わせ `/contact/*`）は本スコープ外。仕様は [docs/03-functional-specification/](../03-functional-specification/) を正本とする。

## 画面詳細

### visitor-aiusage — AI 活用方法

| 項目 | 値 |
|---|---|
| 種別 | 一覧（工程ごとのカードリスト） |
| レイアウト | desktop-frame / mobile-frame 両対応（1 カラム。カード内のツールは折り返し） |

- **主な UI 要素**:
  - Navbar（既存共通コンポーネント。項目に「AI 活用方法」を追加する）
  - 「Homeへ戻る」リンク（`/`。既存ページと同じ位置・同じ体裁）
  - ページ見出し `AI 活用方法` とリード文（1〜2 行）
  - **原則ブロック**（`principle`。ページ冒頭に強調表示する 1 文。「意思決定権は人間にある」）
  - **セクションのリスト**（`sections[]`。取得したデータの配列順に表示する）
    - セクション見出し（`title`）と要約（`summary`）
    - 項目のリスト（`items[]`）
      - 項目名（`title`）
      - 説明（`description`）
      - **人間が決めること**（`decision`。**任意**。ある項目だけ「人間 →」として併記する）
      - 参考リンク（`url`。**任意**。別タブで開く）
  - Footer（既存共通コンポーネント。ホーム以外のページで表示される）

  想定するセクション（**文言はデータ側に持つ**。ここでは構成のみ定める）:

  | # | セクション | 役割 |
  |---|---|---|
  | 1 | 土台をつくる | AI が従うルールとスキルを先に整備していることを示す。**本ページの主題** |
  | 2 | 開発工程で使い分ける | 要件定義〜運用の各工程で、AI の担当と人間の判断を対で示す |
  | 3 | 情報収集を自動化する | 定期実行での収集・蓄積の仕組みを示す |
  | 4 | AI に任せないこと | 委ねない判断（マージ承認・本番データ変更・シークレット・最終設計判断）を示す |

- **遷移**:
  - 入口: Navbar の「AI 活用方法」（全ページ共通）
  - `/`（「Homeへ戻る」リンク）
  - 外部サイト（ツールの `url`。`target="_blank"` + `rel="noopener noreferrer"` で別タブ）
- **備考**:
  - **ローディング中**: 既存ページと同じ `PulseLoader` を中央に表示する
  - **空状態**: データが 0 件のとき `No AI usage data available.` を中央に表示する（`/personaldev` の `No personal development data available.` と同じ体裁）
  - **取得失敗**: 空状態と同じ表示にフォールバックする（ページはクラッシュさせない。既存ページと同じ方針）
  - **`url` が未設定・不正**: ツール名と用途は表示し、**リンクだけ出さない**（[06-security-specification/application.md](../06-security-specification/application.md) §4 の方針に従い、`schemas/url.ts` の `optionalHttpsUrlSchema` を合成する）
  - 404 / 500 の専用画面は本サイトに無い（Next.js の既定 404 に委ねる。既存ページと同様）
  - **リンクを出せない題材がある**。スキル管理・定期実行・情報収集の各リポジトリは非公開のため、
    `url` を付けず**文章だけで説明する**。リンクを張るのは公開されているもの（本リポジトリの
    `.claude/rules/` 等）に限る — 非公開 URL は訪問者に GitHub の 404 を見せるだけになるため

## データモデルヒント

本プロジェクトは**データベースを使わず、GCS 上の JSON でコンテンツを管理する**（[docs/05-data-specification/](../05-data-specification/)）。そのためテーブル候補ではなく **JSON 構造の候補**を示す。確定した設計ではなく、レビューの入力とする。

| 構造候補 | 主要フィールド | 導出元（画面ID） |
|---|---|---|
| `aiusage`（ルート） | `principle`（原則の 1 文・必須） / `sections[]` | visitor-aiusage |
| `aiusage.sections[]` | `title`（必須） / `summary`（必須） / `items[]` | visitor-aiusage |
| `aiusage.sections[].items[]` | `title`（必須） / `description`（必須） / `decision`（**任意**） / `url`（**任意**） | visitor-aiusage |

想定する JSON（`data-app` の `json/aiusage.json`）:

```json
{
  "aiusage": {
    "principle": "意思決定権は人間にある。AI には選択肢とトレードオフを出させ、手を動かさせる。",
    "sections": [
      {
        "title": "土台をつくる",
        "summary": "AI に仕事を任せる前に、従うべき規約と定型作業の手順を明文化している。",
        "items": [
          {
            "title": "ルールの明文化",
            "description": "設計・テスト・Git 運用・ドキュメント更新の規約をルールファイルに分割して置き、AI が常に参照する。",
            "decision": "どのルールを採用し、どこまで縛るかは人間が決める",
            "url": "https://github.com/kojikawazu/nextjs-hono-portal-web-app/tree/main/.claude/rules"
          }
        ]
      }
    ]
  }
}
```

- **ラッパーキーはルートパスに合わせる**（`/aiusage` → `aiusage`）。既存の `personaldev` / `common` と同じ規則。
- `decision` は**工程セクションで主に使う**。「AI がやること」と「人間が決めること」を対で見せるためのフィールド。
- `url` は**公開されている参照先がある項目にだけ**付ける（「備考」の非公開リポジトリの扱いを参照）。
- **文言そのものはデータ側（`aiusage.json`）に持つ。** 本ファイルは構造だけを定め、文章の修正でこの仕様書を更新しなくて済むようにする。

## シーケンス

ユースケース別のシーケンスは `sequences/` 配下を正本とする。

| ユースケース | ファイル |
|---|---|
| view-aiusage（訪問者がページを閲覧する） | [sequences/view-aiusage.md](sequences/view-aiusage.md) |
| publish-aiusage-data（掲載内容を更新して反映する） | [sequences/publish-aiusage-data.md](sequences/publish-aiusage-data.md) |
