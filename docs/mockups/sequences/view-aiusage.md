# view-aiusage

このファイルは**シーケンス仕様の正本**です。`docs/mockups/sequence-view-aiusage.html` は、このファイルからのレンダリング結果です。

## 概要

訪問者が Navbar から AI 活用方法ページを開き、GCS 上の JSON から取得した AI 活用の内容（原則・4 セクション）を閲覧する。取得に失敗した場合もページはクラッシュさせず、空状態の表示にフォールバックする。

## アクター

| キー | 名称 | 種別 |
|---|---|---|
| U | 訪問者 | user |
| F | フロントエンド（`/aiusage`） | front |
| A | Hono API（`GET /api/gcs/aiusage`） | server |
| G | Google Cloud Storage | external |

## シーケンス

```mermaid
sequenceDiagram
    autonumber
    actor U as 訪問者
    participant F as フロントエンド(/aiusage)
    participant A as Hono API(/api/gcs/aiusage)
    participant G as Google Cloud Storage

    U->>F: Navbar の「AI 活用方法」をクリック
    F-->>U: ローディング表示(PulseLoader)
    F->>A: GET /api/gcs/aiusage
    A->>G: aiusage.json をダウンロード
    G-->>A: JSON(サービスアカウント権限で取得)
    A-->>F: 200 { aiusage: [...] }
    F->>F: Zod スキーマで検証(url は https 限定・不正は undefined へ劣化)
    F-->>U: 原則ブロックとセクションを配列順に表示

    opt ツールの公式サイトを開く
        U->>F: ツールのリンクをクリック
        F-->>U: 別タブで外部サイトを開く(target=_blank / rel=noopener noreferrer)
    end

    alt 環境変数(バケット名・パス)が未設定
        A-->>F: 400 { error: "Bucket name or file name is not set" }
        F-->>U: No AI usage data available.
    else GCS 取得に失敗
        A-->>F: 500 { error: "Failed to fetch data from GCS" }
        F-->>U: No AI usage data available.
    else データが 0 件
        A-->>F: 200 { aiusage: [] }
        F-->>U: No AI usage data available.
    end
```

## 補足ノート

| ステップ | 補足 |
|---|---|
| 3 | 取得は `repositories/` の関数からのみ行う（`frontend.md`「`fetch` を書いてよいのは `repositories/` だけ」）。フックは状態管理に専念する |
| 4 | バケットは private。ブラウザから直接は読めず、**サーバー（Hono）がサービスアカウント権限で取得して中継**する |
| 7 | 検証は `schemas/` の Zod スキーマ。`url` は `optionalHttpsUrlSchema` を合成し、`javascript:` 等は `undefined` へ劣化させる（[06-security-specification/application.md](../../06-security-specification/application.md) §4）。`decision` も任意項目 |
| 9-10 | 外部リンクは必ず `rel="noopener noreferrer"` を付ける。**非公開リポジトリには `url` を付けない**ため、リンクを持たない項目が多数を占める |
| alt 全体 | **失敗の種類を利用者に出し分けない**。既存ページと同じく空状態へ倒し、原因はサーバーログに残す（`error-handling.md`） |

## 関連画面

| 画面ID | このフローでの役割 |
|---|---|
| visitor-aiusage | 入口かつ終了（単一画面で完結する） |
