# セキュリティ監査レポート（2026-09-20）

**実施日**: 2026-09-20
**対象プロジェクト**: nextjs-hono-portal-web-app
**前回監査**: 2026-03-21（`docs/security-audit-report-2026-03.md` 参照）
**関連 issue**: #108

---

## サマリー

`pnpm audit` による実測。前回監査から半年が経過し、その間に公開された advisory が積み上がっていた。

| 状態 | ユニーク advisory |
|------|------|
| 修正前 | **106件** |
| 修正後 | **38件** |
| 解決率 | **64%** |

### 重要度別

| 重要度 | 修正前 | 修正後 |
|--------|--------|--------|
| critical | 2 | **0** |
| high | 44 | 22 |
| moderate | 53 | 13 |
| low | 7 | 3 |

**critical をゼロにした。** 残存はすべて間接依存で、直接依存に critical / high はない。

### きっかけ

`docs/11-tasks.md` の T-B01 が「残存する npm 脆弱性（8件）」のままだった。これは Next.js 16 化以前の数字で、実態と大きく乖離していた（issue #107 の作業中に発見）。

---

## 実施した更新

| パッケージ | 更新前 | 更新後 | 区分 |
|---|---|---|---|
| `next` | 16.2.1 | **16.3.5** | dependencies |
| `eslint-config-next` | 16.1.6 | 16.3.5 | devDependencies |
| `hono` | 4.12.8 | **4.13.8** | dependencies |
| `nanoid` | 5.1.7 | **5.1.16** | dependencies |
| `@google-cloud/storage` | 7.19.0 | 7.22.0 | dependencies |
| `postcss` | 8.5.1 | 8.5.28 | devDependencies |
| `@hono/node-server` | 1.19.11 | **削除** | dependencies |

いずれも**メジャーバージョンを上げていない**。`nanoid` は 6.0.1 が出ているが修正版 5.1.16 が存在するため 5.x に留め、`@google-cloud/storage` も 8.2.0 ではなく 7.x 最新に留めた。

### `@hono/node-server` の削除

**未使用の依存だった。** 本アプリは `hono/vercel` の `handle()` で Next.js の Route Handler にマウントする構成で、Node アダプターを使わない。コード・設定のいずれからも参照がなく、`docs/09-architecture-specification/tech-stack.md` にも「API Route では未使用」と記載済みだった。

moderate の advisory（Serve Static のエンコード済みスラッシュによる認可バイパス）を抱えていたが、**メジャー更新（2.x）ではなく削除で解消**した。`.claude/rules/dead-code.md`「使われていないコードを残さない」の適用。

---

## 修正前 critical の適用可否（評価済み）

件数の割に実害が限定的だったため、更新前に実コードで適用可否を評価した。

| advisory | 深刻度 | 本構成での適用 | 根拠 |
|---|---|---|---|
| Next.js: Unauthenticated RCE on windows-hosted servers | critical | **非該当** | Cloud Run 上の `node:20-alpine`（Linux） |
| Next.js: Unauthenticated RCE in Image Optimization API（AVIF） | critical | **非該当** | `next.config.mjs` で `images: { unoptimized: true }` |
| Next.js: Middleware / Proxy bypass（複数） | high | **非該当** | `middleware.ts` が存在せず rewrites もない |
| hono: CORS Middleware reflects any Origin with credentials | high | **非該当** | `origin` を関数で明示指定し、不一致は `null` を返す。advisory は「`origin` が既定のワイルドカードのとき」が条件 |
| nanoid: 負のサイズ / サイズ 0 で無限ループ | high | **非該当** | 呼び出しは `nanoid(CSRF_TOKEN_LENGTH)` の固定値（32） |

**非該当でも更新した。** 個別に「今は当たらない」と判断し続けるより追随するほうが安全かつ安価で、設定変更（例: T-B02 の画像最適化有効化）で前提が崩れると該当化するため。

> **T-B02（画像最適化の有効化）に着手する場合の注意**: `images.unoptimized` を `false` にすると Image Optimization API が有効になる。本更新で `next` を 16.3.5 にしたため上記 critical は解消済みだが、この依存関係は覚えておくこと。

---

## 残存する脆弱性（38件）

**すべて間接依存。直接依存に critical / high はない。**

### 実行時に載るもの（6件）

| パッケージ | 深刻度 | 依存元 | 判断 |
|---|---|---|---|
| `fast-xml-builder` | high | `@google-cloud/storage` | **上流の修正待ち**。7.22.0 でも `fast-xml-parser@5.5.8` に固定されており、修正版 5.11.1 を引かない |
| `fast-xml-parser` | moderate | `@google-cloud/storage` | 同上。前回監査（2026-03）から継続 |
| `uuid` | moderate | `@google-cloud/storage` | 同上 |
| `form-data` | high | `@google-cloud/storage` | 依存経路が `@types/request`（型定義パッケージ）→ `retry-request` のため、実行時には載らない |
| `js-cookie` | high | `resend` | `@react-email/render` → `js-beautify` 経由。ブラウザ用 Cookie ライブラリでサーバー側のメール描画では実行されない。解消には `resend` 4.x → 6.x のメジャー 2 段更新が必要なため見送り |
| `baseline-browser-mapping` | moderate | `next` | ビルド時のみ |

### 開発・ビルド時のみ（32件）

`eslint` / `eslint-config-next` / `jest` / `jest-environment-jsdom` / `@testing-library/jest-dom` / `@types/jest` / `tailwindcss` の依存ツリー。`brace-expansion` / `browserslist` / `js-yaml` / `lodash` / `picomatch` / `ws` / `@humanfs/node` / `yaml` / `@babel/core` / `@tootallnate/once` / `postcss-selector-parser`。

**本番成果物に含まれず、CI とローカル開発でのみ実行される。** いずれも上流ツールが依存を更新すれば解消する。

---

## テスト結果

| 項目 | 結果 |
|-------|------|
| Prettier (`pnpm run format:check`) | ✅ All matched files use Prettier code style |
| ESLint (`pnpm run lint`) | ✅ 0 errors |
| Jest (`pnpm run test`) | ✅ 20 passed, 20 total |
| Build (`pnpm run build`) | ✅ 成功（TypeScript / 静的生成 9 ページとも通過） |

**ビルドは環境変数を与えれば成功する。** 環境変数なしでは `RESEND_API_KEY` 未設定で失敗するが、これは前回監査でも記録された既存問題で、本更新とは無関係（本番は Cloud Run の環境変数で設定）。

IT（fake-gcs-server）と E2E（Playwright）はローカルでは Docker・環境変数を要するため CI で確認した。

---

## 次回に向けて

- **`@google-cloud/storage` の `fast-xml-parser` 固定**は 2 回連続で残存している。上流（`googleapis/nodejs-storage`）の更新を追うか、メジャー更新（8.x）の検討時期。
- `resend` の 4.x → 6.x は破壊的変更を含むため、独立した issue で扱う。
- 定期的な `pnpm audit` 実行と Dependabot アラートの監視を継続する。**タスク表に件数を転記すると今回のように陳腐化する**ため、件数の正本は本レポート群に置く。

---

## 追加対応（2026-09-21）: pnpm overrides による間接依存の解消

**関連 issue**: #120

上記の更新後も Dependabot に **33 件**（high 19 / medium 11 / low 3）が残っていた。すべて間接依存で、直接依存を上げても上流が固定している限り解消しない。

**上流待ちをやめ、`package.json` の `pnpm.overrides` で解決先を修正版に固定した。**

### 結果

| | ユニーク advisory |
|---|---|
| override 前 | 38件 |
| **override 後** | **1件** |

| 重要度 | override 前 | override 後 |
|--------|---|---|
| critical | 0 | 0 |
| high | 22 | **0** |
| moderate | 13 | **1** |
| low | 3 | **0** |

### 適用した override（20 件）

同一メジャー内の patch / minor 更新に限定した。同一パッケージが複数メジャー同居する場合は `"pkg@1": "..."` のセレクタ構文で分けている。

| パッケージ | 解決先 |
|---|---|
| `brace-expansion` | 1.1.21 / 2.1.4 |
| `js-yaml` | 3.15.2 / 4.3.2 |
| `picomatch` | 2.3.2 / 4.0.4 |
| `form-data` | 2.5.6 / 4.0.6 |
| `browserslist` | 4.28.7 |
| `lodash` | 4.18.0 |
| `ws` | 8.21.0 |
| `js-cookie` | 3.0.8 |
| `@humanfs/node` | 0.16.8 |
| `postcss-selector-parser` | 6.1.3 |
| `yaml` | 2.8.3 |
| `@babel/core` | 7.29.6 |
| `baseline-browser-mapping` | 2.11.0 |
| `@tootallnate/once` | 2.0.1 |
| **`fast-xml-parser`** | **5.7.0** |
| **`fast-xml-builder`** | **1.1.7** |

### `fast-xml-parser` の 3 回越しの解消

`@google-cloud/storage` が `fast-xml-parser@5.5.8` に固定しているため、**2026-01-31・2026-03-21・2026-09-20 の 3 回連続で「上流の修正待ち」として残ってきた**項目。GCS SDK を 7.22.0 に上げても解消しなかった。

同一メジャー内の更新であるため override で解決できた。**GCS はアプリのデータ取得経路そのもの**なので、IT（fake-gcs-server による実 SDK 結合）と E2E を CI で通して実挙動を確認している。

### 残存（1 件）

| パッケージ | 現在 | 修正版 | 判断 |
|---|---|---|---|
| `uuid` | 9.0.1 | 11.1.1 | **対応しない。** メジャー 2 段跨ぎで、`@google-cloud/storage` が `uuid@^9` に依存しているため強制すると壊れる恐れがある。9.x 系の修正版は提供されていない。moderate 1 件・GCS SDK 内部での ID 生成用途であり、上流が uuid を上げるのを待つ |

### override の運用上の注意

**override は上流がテストしていない組み合わせを強制する。** 次回以降も以下を守る。

- **同一メジャー内に限定する。** メジャー跨ぎは上流の依存宣言（`^9` 等）と矛盾し、実行時に壊れうる
- **入れたら必ずテストで実挙動を確認する。** とくに GCS・メール送信のような外部連携は IT / E2E まで通す
- **上流が追いついたら override を外す。** 放置すると、上流が意図的に上げない理由（互換性の問題等）を踏み抜いたまま固定し続けることになる
