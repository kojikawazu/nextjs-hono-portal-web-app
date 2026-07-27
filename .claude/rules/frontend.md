---
description: Next.js (App Router) フロントエンド設計・コンポーネント規約
globs: "front/src/app/**,front/src/components/**,front/src/hooks/**,front/src/contexts/**,front/src/repositories/**,front/src/schemas/**,front/src/constants/**,front/src/types/**,front/src/lib/**"
---

# フロントエンドルール（Next.js App Router）

## コンポーネント設計

プロジェクト規模・ドメイン数に応じて以下のいずれかを選択する:

| パターン | 構成 | 採用基準 |
|---|---|---|
| **アトミックデザイン** | Atoms / Molecules / Organisms / Pages | 小〜中規模・ドメインが少ない |
| **ドメイン別構成** | features/ 配下にドメイン単位で分割 | 中〜大規模・ドメインが多い |

> 補足: 現状は小規模（コンポーネント数が少ない）ため、`app/components/` 配下を**機能種類別のフラット構成**（`hero/` `layout/` `modal/` `nav-bar/` 等）とし、汎用 UI プリミティブは `components/ui/`（shadcn）に置く。規模拡大時は上記いずれかのパターンへ移行する。

## サーバー/クライアント分離

- **server-first** を基本とする。データ取得・SEO はサーバーコンポーネントで行う。
- server/client 境界を明確にするためファイルを分離する:
  - `page.tsx` — サーバーコンポーネント（データ取得・SEO・props 受け渡し）
  - `client.tsx` — クライアントコンポーネント（インタラクション・状態管理）

> 補足: 現状の実装は全ページ `'use client'` のクライアントコンポーネント + `useEffect` フェッチ構成（[docs/09-architecture-specification/structure.md](../../docs/09-architecture-specification/structure.md) 参照）。新規・リファクタ時は上記 server-first を目標とする。

## ロジック分離

- **クライアントコンポーネント**のロジックは**カスタムフック**（`hooks/`）に切り出す。コンポーネントは UI 描画に専念する。
- **サーバーコンポーネント**のデータ取得は `page.tsx` から `repositories/` の関数を呼んで行う（hooks は使用しない）。

## 関心別にディレクトリを切る

`types/` `constants/` `schemas/` `repositories/` は**それぞれ独立したディレクトリ**として `src/` 直下に置く。いずれも**単一ファイルにまとめない**（`src/types.ts` / `lib/validation.ts` のような形は禁止。ドメイン単位でファイルを分ける）。詳細は `typescript.md`「型定義の配置」「定数の配置」「スキーマの配置」に従う。

| ディレクトリ | 置くもの | 置かないもの |
|---|---|---|
| `types/` | 2 箇所以上から参照される型 | 値・ロジック |
| `constants/` | 全環境で不変な値 | 環境変数・型を導出する定数（`types/` 側へ） |
| `schemas/` | Zod スキーマ（フォーム・API レスポンスの検証） | 検証を伴わない型定義（`types/` へ） |
| `repositories/` | **API アクセス**（`fetch` / API クライアント呼び出し） | UI・画面都合の整形・業務判断 |
| `lib/` | **通信を持たない純粋ユーティリティ**（日付整形・計算等） | API アクセス（`repositories/` へ）・定数・型 |

- **`fetch` を書いてよいのは `repositories/` だけ**。コンポーネント・hooks・`lib/` から直接叩かない。呼び出し口を 1 箇所に閉じることで、認証ヘッダ・エラー処理・リトライの実装が散らばらない。
- ディレクトリ名は**複数形で統一**する（`types` / `constants` / `schemas` / `repositories`）。

### 目標ディレクトリ構成

```
front/src/
├── app/                    # ルーティング（App Router）・API ルート（Hono）
├── components/             # UI（ui/ は shadcn プリミティブ）
├── hooks/                  # クライアントロジック（useXxx）
├── contexts/               # Context 定義（関心事ごとに分割）
├── repositories/           # API アクセス（fetch はここだけ・ドメイン単位で分割）
├── schemas/                # Zod スキーマ（フォーム・API レスポンス検証）
├── lib/                    # 純粋ユーティリティ（通信しない）
├── constants/              # 共通定数（環境変数は置かない）
└── types/                  # 型定義
```

> 現状: 実装は `front/src/app/` 配下に `types/` `schema/` `constants/` `hooks/` `contexts/` `utils/` を置き、`fetch` は hooks・contexts に散在している。**新規追加・リファクタ時は上記構成を目標とする**（移行は別 issue で扱う）。

## インポート

- `@/*` パスエイリアスを使用する（相対パスの深いネストを避ける）。

## テスト

- E2E: Playwright（`e2e/` ディレクトリ）
- Base URL: `http://localhost:3000`
