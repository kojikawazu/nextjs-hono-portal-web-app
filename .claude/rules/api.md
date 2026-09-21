---
description: Hono バックエンド API 設計・ルート構成（Next.js API Routes 一体型）
globs: "front/src/app/api/**"
---

# API ルール（Hono on Next.js）

## アーキテクチャ

- Hono を Next.js の Catch-all API Route（`/api/[[...route]]`）に `hono/vercel` の `handle()` でマウントする一体型構成。
- 機能ごとにサブルーターで分割する（`gcsRouter` / `mailRouter` 等）。
- リクエストバリデーションは Zod（クライアントの `contactSchema` と整合させる）。

## レイヤ依存の一方向ルール

**依存は上位から下位への一方向のみ**。下位レイヤが上位レイヤを import してはならない。

```
routes  →  usecases / queries  →  repositories  →  types / constants / lib
（presentation）  （application）    （data access）        （共通・最下層）
```

| レイヤ | import してよい | import 禁止 |
|---|---|---|
| `routes/` | `usecases/`, `queries/`, `dto/`, `schemas/`, `types/`, `constants/` | （なし。routes は誰からも参照されない） |
| `usecases/` `queries/` | `repositories/`, `dto/`, `types/`, `constants/`, `lib/` | **`routes/`**, `hono` の `Context` / `HTTPException` 等の HTTP 依存 |
| `repositories/` | `types/`, `constants/`, `lib/` | **`routes/`**, **`usecases/`**, **`queries/`** |
| `types/` `constants/` `lib/` | （原則どこにも依存しない） | 上位レイヤすべて |

禁止例:

- `usecases/` が `routes/` の型・定数を import する
- `repositories/` が `usecases/` を呼び出して業務判断を委ねる
- **`queries/` が書き込みを行う**（`create` / `update` / `delete`）。読み取り専用の保証が崩れる
- **`queries/` が `usecases/` を呼ぶ**（読み込みが書き込み経路を経由する。CQRS-lite の分離が崩れる）
- 同一レイヤ間の**相互依存（循環）**（例: `a.usecase.ts` ⇄ `b.usecase.ts` が互いを import）

### 逆流したくなったら「共通化」で解決する

上位のものを下位で使いたくなった時点で、それは**配置場所が間違っている**サイン。逆流 import ではなく、以下のいずれかで解く。

| 逆流したい理由 | 正しい解き方 |
|---|---|
| 上位の型・定数を下位でも使いたい | その型・定数を**`types/` `constants/` へ移動**し、上下双方がそこを参照する |
| 上位のロジックを下位でも使いたい | 共通処理を**`lib/` の純粋関数、またはドメインロジックとして下位へ抽出**し、双方から呼ぶ |
| 下位の処理結果に応じて上位を呼びたい | **呼ばない**。下位は戻り値・例外を返すだけにし、**判断と次の呼び出しは上位に持たせる**（依存性逆転。必要なら上位が渡した関数・ポート型を経由する） |
| 別機能の usecase を呼びたい | usecase 同士を直接繋がず、**共通ロジックを共有 usecase / `lib/` に切り出す**か、上位（route）で順に呼ぶ |
| 書き込み後の結果を返すために `queries/` を呼びたい | **呼ばない**。usecase は自身が保存した結果からレスポンス用の値を組み立てる。`usecases → queries` は読み書きの分離を崩す（`queries/` は `routes/` からのみ呼ぶ） |

**レビュー観点**: import 文の向きを見る。下位レイヤのファイルに上位レイヤ（`routes/` / `usecases/`）へのパスが現れていたら指摘し、上表の「正しい解き方」で共通化できないか検討する。`queries/` のファイルに書き込み操作や `usecases/` の import が無いかも併せて見る。

## 型定義

- Hono は関数・データ中心のため**原則 `type`** を使う（`typescript.md` の type/interface 方針に従う）。`c.set()` / `c.get()` の型付け（`ContextVariableMap` 拡張）のみ宣言マージが必要なので `interface`。
- 置き場所は**参照範囲**で決める。1 ファイルに閉じる型はコロケーション、2 箇所以上（route ⇄ usecase ⇄ query 等）から参照される型は `types/` へ集約する。詳細は `typescript.md`「型定義の配置」に従う。
- Zod スキーマから導出できる型は `z.infer<typeof schema>` を使い、**同じ形を手書きで二重定義しない**。
- `type` / `interface` は型本体・各メンバーともにコメント必須（`jsdoc.md`）。
- **共通定数は `constants/` に集約する**（判断軸は型と同じ「参照範囲」。マジックナンバー・マジック文字列を直接書かない）。ただし union の元になる定数は、導出される型と**同じファイルに同居**させる。環境変数は `constants/` に置かない。詳細は `typescript.md`「定数の配置」に従う。

## バリデーションの二重定義禁止

**同じ検証内容を 2 箇所に書かない**。検証は種類ごとに担当レイヤを 1 つに決め、そこだけで行う。

| 検証の種類 | 例 | 担当レイヤ（ここだけで書く） |
|---|---|---|
| 形式・構文 | 必須、型、文字数、フォーマット（メール・URL）、範囲、enum 値 | **Zod スキーマ**（`schemas/` + `@hono/zod-validator`） |
| 業務ルール | 重複不可、状態遷移の可否、権限、在庫・残高の充足、DB 参照が要る整合性 | **usecase / ドメインロジック** |
| データ整合性の最終防衛 | UNIQUE、NOT NULL、外部キー | **DB 制約**（アプリ側の業務チェックとは役割が別。重複ではない） |

**種類が違えば二重定義ではない**。形式検証（Zod）と業務ルール（usecase の個別検証）は別の検証なので、別のレイヤに置いてよい。禁止されるのは「**同じ**検証」の重複であり、担当は「usecase が検証してよいか」ではなく「**その検証がどの種類か**」で決まる。

**項目間の相関チェック**（`startDate <= endDate` 等）は、**受け取った値だけで判定できるなら形式・構文側**に閉じ込める（Zod の `.refine()` / `.superRefine()`）。**DB 参照や外部状態の照会が要るものだけが業務ルール側**。

**DryRun / 事前検証を持つエンドポイントでは、業務ルールの検証を usecase 本体に書かず集約 Validator に集約する**（`dry-run.md`「業務検証を Usecase 本体に書かない」参照）。DryRun 経路は usecase を通らないため、**本体に直書きした検証は DryRun から見えず**、「DryRun は通るのに本登録で落ちる」を招く。DryRun を持たないエンドポイントは、上表のとおり usecase / ドメインロジックに置いてよい。

禁止例:

- Zod で `z.string().max(50)` を書いた上で、usecase でも `if (name.length > 50) throw ...` と再チェックする
- 同じ形式チェックをルートハンドラーとミドルウェアの両方に書く
- 同じ業務ルールを複数の usecase にコピーして書く
- **同じ業務ルールを別経路に書き写す**（事前チェック / プレビュー API と本実行 API、バッチと同期処理など）。1 箇所に定義して両方から呼ぶ
- Zod スキーマと同じ形の型を手書きで別定義する（`z.infer<typeof schema>` で導出する）

### 同じルールを 2 箇所で使いたくなったら

コピーせず、**単一の定義から導出・共有**する。

| やりたいこと | 解き方 |
|---|---|
| 複数スキーマで同じ制約を使う | 制約値を**`constants/` の定数に定義**して各スキーマへ渡す、または**部分スキーマを定義して合成**する（`baseSchema.extend({...})`） |
| 更新スキーマが作成スキーマと同じ制約 | `.partial()` / `.pick()` / `.omit()` で**既存スキーマから導出**する。同じ制約を書き直さない |
| 同じ業務ルールを複数の usecase / 経路（事前チェック API と本実行など）で使う | 1 箇所に定義して各所から呼ぶ。**置き場所は依存の向きから決まる**（`routes → usecases → repositories` の一方向なので、共通化先は必ず**呼び出し元より下位**。usecase 同士なら**ドメイン関数へ抽出**し、routes 同士なら `usecases/` へ置く） |

**例外（重複してよいもの）**: フロントエンドのバリデーションとバックエンドのバリデーションは、信頼境界が異なるため**両方に必要**（UX のための即時フィードバックと、改ざん可能なクライアントを信用しないためのサーバー検証）。ただし**重複してよいのは検証の「実行」であって「定義」ではない**。**Zod スキーマは共有パッケージに 1 つだけ置き、フロントと API の双方がそれを import する**（同じ閾値をフロント側に書き写さない）。

**レビュー観点**: 同じ条件式・同じ閾値が 2 箇所以上に現れていないか。usecase 内の `if` が、Zod スキーマで既に保証済みの形式チェックになっていないか。逆に、受け取った値だけで判定できる相関チェックが usecase に流れ出していないか。

### 1 ハンドラが複数モードを持つ場合（DryRun / 事前検証）

**DryRun そのものの意味論**（経路の形・検証専用エンドポイントを立てない根拠・集約 Validator の置き場所・副作用の禁止範囲・認可・TOCTOU）は `dry-run.md` が持つ。本節は **Hono でどう実装するか**だけを扱う。

**`zValidator()` が使えるのは「1 ルート = 1 検証」のとき**。`zValidator` は**ルート定義時にミドルウェアとして固定される**ため、リクエストの内容（`?dryRun=true`）で当てるスキーマや検証後の分岐を変えられない。DryRun をルートのモードとして実装する場合は、**`zValidator` を使わずハンドラ本体でスキーマを当てる**。

```ts
app.post('/tasks', async (c) => {
  const userId = c.get('userId')                    // 認証ミドルウェアが設定した値
  const body = await c.req.json()
  const dto = parseOrThrow(createTaskSchema, body)  // ハンドラ本体でスキーマを当てる

  if (isDryRun(c.req.query('dryRun'))) return c.body(null, 204)  // 永続化経路に入らない
  return c.json(await createTask({ userId, title: dto.title, dueDate: dto.dueDate }), 201)
})
```

- **`parseOrThrow(schema, value)` 相当のヘルパを共通モジュールに置く**。ZodError から統一エラーレスポンスへの整形を `app.onError` と揃え、**`zValidator` 経由かハンドラ経由かでエラー形式が変わらない**ようにする。
- **`c.req.valid('json')` の型推論は効かなくなる**。DTO の型は `z.infer<typeof createTaskSchema>` から取る（スキーマ自体は 1 つのままなので、型の出どころは変わらない）。
- **DryRun の応答は 204 No Content** が扱いやすい。本処理の 200 / 201 と status で分かれるため、レスポンス型が union にならずに済む。

**レビュー観点**: ハンドラ本体でスキーマを当てている箇所のエラー形式が、`zValidator` 経由のものと揃っているか。**経路の形・副作用・認可・TOCTOU のレビュー観点は `dry-run.md`** を参照する（永続化以外の副作用も対象になる）。

## ディレクトリ構成（現行）

```
front/src/app/api/
├── [[...route]]/
│   └── route.ts        # Hono エントリ。basePath: /api、CORS 適用、サブルーターをマウント
├── gcs/
│   └── gcs.ts          # gcsRouter（GCS からのデータ取得）
└── mail/
    └── mail.ts         # mailRouter（CSRF トークン発行・メール送信、csrfMiddleware）
```

- ルートが増える場合は機能単位のサブルーター（`front/src/app/api/<feature>/<feature>.ts`）を追加し、`route.ts` にマウントする。
- ビジネスロジックが肥大化する場合は service / lib 層へ切り出し、ルートハンドラーは薄く保つ。

> 補足: 現行はサブルーター 2 本のみで、「レイヤ依存の一方向ルール」が挙げる `usecases/` `queries/` `repositories/` はまだ存在しない。**ハンドラから切り出す段になったら、`service/` のような曖昧な受け皿を作らず上記のレイヤ名で分ける**（書き込み = `usecases/`、読み込み = `queries/`、データアクセス境界 = `repositories/`）。切り出し先が 1 つだと、そこが「置けなかったものの集積所」になり一方向ルールを検証できなくなる。

## リクエストの受け渡し（必要なものだけ下流へ）

レスポンスと対に、**入力も「必要なものだけ」を下流へ渡す**。ルートハンドラーは受け取ったものを丸ごと流さない。

- **`Context`（`c`）を usecase / query-service に渡さない**。`c` を渡すと usecase が Hono に依存し、レイヤ一方向ルールに違反する。必要な値（`userId`、`ip` 等）をハンドラーで取り出して**プリミティブまたは入力型で渡す**。
- **バリデーション済みの入力（`c.req.valid('json')`）をそのまま usecase に渡さない**。Zod スキーマは API 契約であり、usecase の入力とは**変わる理由が違う**。ハンドラーで**usecase 入力型に詰め替える**。
- **認証ユーザーは必ずサーバー側の情報から解決する**。`userId` / `role` / `tenantId` をリクエストボディから受け取らない（認証ミドルウェアが `c.set()` した値をハンドラーで取り出して渡す）。**クライアントが送った ID を信用すると、他人のリソースを操作できる**。
- **リクエストをそのまま ORM に流さない**（マスアサインメント）。`db.insert({ ...body })` のようにスプレッドで丸ごと渡さず、**代入するフィールドを明示列挙**する。Zod の `.strict()` で未知キーを弾くのも併用する。
- 引数が増えて読みにくい場合は、**位置引数を並べずに入力型 1 つにまとめる**。

**例外**: 項目数が多い純粋な登録・更新で、スキーマの型と usecase 入力が完全に一致し詰め替えが恒久的に無意味なら、`z.infer` した型を直接渡してよい。ただし**HTTP 都合の項目（ページング・ソート指定等）を含み始めたら分離する**。

**レビュー観点**: usecase / query-service のシグネチャに `Context` や Hono の型が出ていないか。ボディから受け取った ID で認可判定していないか。ORM への保存がスプレッドで丸ごと渡されていないか。

## レスポンス DTO（DB をそのまま返さない）

- ORM エンティティ・DB 行をそのまま `c.json()` しない。**レスポンス DTO** にマッピングし、公開してよいフィールドだけを厳選して返す（内部 ID・監査カラム・機密の漏洩防止）。
- 変換は明示的に行う（mapper 関数、または query-service 内でマッピング）。

## 共通方針

- RESTful 設計（リソース指向エンドポイント）
- レスポンス形式: JSON（`c.json()`）
- ミドルウェア: `cors()` は全体、CSRF 検証（`csrfMiddleware`）は `POST /api/mail/send` に適用。レートリミット（`createRateLimiter`）は `POST /api/mail/send`（3 回/分）と `GET /api/mail/csrf`（20 回/分）に適用し、**送信系では CSRF 検証より前に置く**（後段だと不正トークンでの連打が数えられない）
- ランタイムは `nodejs`（`@google-cloud/storage` 等の Node 依存 SDK を使用するため）
- 環境変数: `process.env` から読む。未設定時は 400 で明示的にエラーを返す（詳細は [docs/07-api-specification/](../../docs/07-api-specification/)）
- 統一エラーレスポンス（`{ "error": "..." }`）と適切な HTTP ステータス（400/403/500）
- センシティブ情報（APIキー・トークン・メール本文）をログに含めない
