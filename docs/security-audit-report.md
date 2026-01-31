# セキュリティ監査レポート

**実施日**: 2026-01-31
**対象プロジェクト**: nextjs-hono-portal-web-app
**検出された脆弱性**: 18件

---

## サマリー

| 重要度 | 件数 | 対応状況 |
|--------|------|---------|
| Critical | 2 | 要対応 |
| High | 9 | 要対応 |
| Moderate | 6 | 要対応 |
| Low | 1 | 要対応 |

---

## Critical（緊急対応推奨）

### 1. form-data (>=4.0.0 <4.0.4 || <2.5.4)

- **脆弱性**: 安全でない乱数関数の使用（boundary生成）
- **参照**: https://github.com/advisories/GHSA-fjxv-7rqg-78g4
- **影響**: フォームデータのboundary生成に予測可能な乱数が使用される
- **対応**: `npm audit fix` で修正可能

### 2. next (0.9.9 - 15.5.9)

- **脆弱性**: 複数の重大な脆弱性
  - 開発サーバーでの情報漏洩（origin検証不足）
  - Image Optimization APIのキャッシュキー混乱
  - ミドルウェアリダイレクト処理によるSSRF
  - Image Optimizationのコンテンツインジェクション
  - キャッシュポイズニングにつながるレースコンディション
  - ミドルウェアの認証バイパス
  - Server ComponentsによるDoS
  - Image OptimizerのremotePatterns設定によるDoS
  - React Server Componentsの安全でないHTTPリクエストデシリアライゼーション
- **参照**:
  - https://github.com/advisories/GHSA-3h52-269p-cp9r
  - https://github.com/advisories/GHSA-g5qg-72qw-gw5v
  - https://github.com/advisories/GHSA-4342-x723-ch2f
  - https://github.com/advisories/GHSA-xv57-4mr9-wg8v
  - https://github.com/advisories/GHSA-qpjv-v59x-3qc4
  - https://github.com/advisories/GHSA-f82v-jwr5-mffw
  - https://github.com/advisories/GHSA-mwv6-3258-q52c
  - https://github.com/advisories/GHSA-5j59-xgg2-r9c4
  - https://github.com/advisories/GHSA-9g9p-9gw9-jx7f
  - https://github.com/advisories/GHSA-h25m-26qc-wcjf
- **対応**: `npm audit fix` で修正可能

---

## High（対応推奨）

### 3. hono (<=4.11.6)

- **脆弱性**: 複数の脆弱性
  - Body Limit Middlewareバイパス
  - 認証の不備
  - Vary Header InjectionによるCORSバイパス
  - JWK Auth MiddlewareのJWTアルゴリズム混乱
  - JWT Middlewareのアルゴリズム混乱によるトークン偽造
  - ErrorBoundaryコンポーネントのXSS
  - Serve static Middlewareの任意キー読み取り
  - Cache MiddlewareのWeb Cache Deception
  - IP Restriction MiddlewareのIPv4検証バイパス
- **参照**:
  - https://github.com/advisories/GHSA-92vj-g62v-jqhh
  - https://github.com/advisories/GHSA-m732-5p4w-x69g
  - https://github.com/advisories/GHSA-q7jf-gf43-6x6p
  - https://github.com/advisories/GHSA-3vhc-576x-3qv4
  - https://github.com/advisories/GHSA-f67f-6cw9-8mq4
  - https://github.com/advisories/GHSA-9r54-q6cx-xmh5
  - https://github.com/advisories/GHSA-w332-q679-j88p
  - https://github.com/advisories/GHSA-6wqw-2p9w-4vw4
  - https://github.com/advisories/GHSA-r354-f388-2fhh
- **影響**: バックエンドAPIで使用中のため優先度高
- **対応**: `npm audit fix` で修正可能

### 4. fast-xml-parser (4.3.6 - 5.3.3)

- **脆弱性**: RangeError DoS（Numeric Entities Bug）
- **参照**: https://github.com/advisories/GHSA-37qj-frw5-hhjh
- **影響**: @google-cloud/storageの依存関係
- **対応**: `npm audit fix --force` が必要（breaking change: @google-cloud/storage@7.12.0）

### 5. glob (10.2.0 - 10.4.5)

- **脆弱性**: CLIコマンドインジェクション（-c/--cmdでshell:true実行）
- **参照**: https://github.com/advisories/GHSA-5j98-mcp5-4vw2
- **影響**: @next/eslint-plugin-nextの依存関係
- **対応**: `npm audit fix --force` が必要（breaking change: eslint-config-next@16.1.6）

### 6. jws (4.0.0)

- **脆弱性**: HMAC署名検証の不備
- **参照**: https://github.com/advisories/GHSA-869p-cjfg-cm3x
- **対応**: `npm audit fix` で修正可能

### 7. playwright (<1.55.1)

- **脆弱性**: ブラウザダウンロード時のSSL証明書検証なし
- **参照**: https://github.com/advisories/GHSA-7mvr-c777-76hp
- **影響**: E2Eテスト環境のみ
- **対応**: `npm audit fix` で修正可能

---

## Moderate（推奨）

### 8. @babel/helpers, @babel/runtime (<7.26.10)

- **脆弱性**: 非効率な正規表現（ReDoS）- named capturing groupsトランスパイル時
- **参照**: https://github.com/advisories/GHSA-968p-4wvh-cqc8
- **対応**: `npm audit fix` で修正可能

### 9. brace-expansion (1.0.0 - 1.1.11 || 2.0.0 - 2.0.1)

- **脆弱性**: 正規表現によるDoS（ReDoS）
- **参照**: https://github.com/advisories/GHSA-v6h2-p8h4-qcjw
- **対応**: `npm audit fix` で修正可能

### 10. eslint (<9.26.0)

- **脆弱性**: 循環参照オブジェクトシリアライズ時のスタックオーバーフロー
- **参照**: https://github.com/advisories/GHSA-p5wg-g6qr-c7cg
- **対応**: `npm audit fix --force` が必要（breaking change: eslint@9.39.2）

### 11. js-yaml (<3.14.2 || >=4.0.0 <4.1.1)

- **脆弱性**: merge (<<) でのプロトタイプ汚染
- **参照**: https://github.com/advisories/GHSA-mh29-5h37-fv8m
- **対応**: `npm audit fix` で修正可能

### 12. lodash (4.0.0 - 4.17.21)

- **脆弱性**: `_.unset` と `_.omit` 関数でのプロトタイプ汚染
- **参照**: https://github.com/advisories/GHSA-xxjr-mmjv-4gpg
- **対応**: `npm audit fix` で修正可能

---

## 対応手順

### Step 1: 安全な修正を実行

```bash
npm audit fix
```

これによりbreaking changeなしで修正できる脆弱性が解消されます。

### Step 2: テスト実行

```bash
npm run lint
npm test
npm run build
```

### Step 3: breaking changeを伴う修正（必要に応じて）

```bash
npm audit fix --force
```

影響を受けるパッケージ:
- eslint: 9.39.2 へアップグレード
- @google-cloud/storage: 7.12.0 へアップグレード
- eslint-config-next: 16.1.6 へアップグレード

### Step 4: 再度テスト実行

```bash
npm run lint
npm test
npm run build
npm run test:e2e
```

---

## 備考

- 本番環境（Cloud Run）で稼働中のため、Next.jsとHonoの脆弱性は特に優先して対応すること
- breaking changeを伴う修正は、ステージング環境でのテスト後に本番適用を推奨
- 定期的な `npm audit` の実行をCI/CDパイプラインに組み込むことを推奨

---

## 対応結果（2026-01-31 実施）

### 実行コマンド

```bash
npm audit fix
```

### 結果

- **修正前**: 18件の脆弱性（Critical: 2, High: 9, Moderate: 6, Low: 1）
- **修正後**: 8件の脆弱性（High: 6, Moderate: 2）

### 修正された脆弱性

| パッケージ | 脆弱性 | 状態 |
|-----------|--------|------|
| form-data | 安全でない乱数関数 | ✅ 修正済 |
| next | 複数の脆弱性（一部） | ✅ 修正済 |
| hono | 複数の脆弱性 | ✅ 修正済 |
| jws | HMAC署名検証の不備 | ✅ 修正済 |
| playwright | SSL証明書検証なし | ✅ 修正済 |
| @babel/helpers, @babel/runtime | ReDoS | ✅ 修正済 |
| brace-expansion | ReDoS | ✅ 修正済 |
| js-yaml | プロトタイプ汚染 | ✅ 修正済 |
| lodash | プロトタイプ汚染 | ✅ 修正済 |

### 残存する脆弱性（breaking change必要）

| パッケージ | 脆弱性 | 備考 |
|-----------|--------|------|
| eslint (<9.26.0) | スタックオーバーフロー | Next.js 16へのアップグレードが必要 |
| eslint-config-next | eslint依存 | 同上 |
| eslint-plugin-react-hooks | eslint依存 | 同上 |
| fast-xml-parser | DoS攻撃 | @google-cloud/storage上流の修正待ち |
| glob | コマンドインジェクション | Next.js 16へのアップグレードが必要 |
| @next/eslint-plugin-next | glob依存 | 同上 |
| next | DoS（一部未修正） | 同上 |

### テスト結果

- ✅ ESLint: No warnings or errors
- ✅ Jest: 6 passed, 6 total

### 追加対応（Next.js 16アップグレード）

残存する8件の脆弱性を解消するため、Next.js 16へのアップグレードを実施しました。

#### 実行内容

```bash
npm install next@16 eslint@9 eslint-config-next@16
```

#### 結果

- **修正後**: 2件の脆弱性（High: 2）
- **解決した脆弱性**: 6件追加（合計16件解決）

| パッケージ | 脆弱性 | 状態 |
|-----------|--------|------|
| next | DoS（Image Optimizer、Server Components） | ✅ 修正済 |
| glob | コマンドインジェクション | ✅ 修正済 |
| @next/eslint-plugin-next | glob依存 | ✅ 修正済 |
| eslint | スタックオーバーフロー | ✅ 修正済 |
| eslint-config-next | eslint依存 | ✅ 修正済 |
| eslint-plugin-react-hooks | eslint依存 | ✅ 修正済 |

#### 付随する変更

- Dockerfile: `node:18-alpine` → `node:20-alpine`（Next.js 16はNode.js 20.9.0以上が必要）
- ESLint設定: flat config形式に移行
- `.eslintrc.json` 削除

### 最終結果

| 項目 | 値 |
|------|-----|
| 修正前 | 18件 |
| 修正後 | **2件** |
| 解決率 | **89%** |

### 残存する脆弱性（2件）

| パッケージ | 脆弱性 | 備考 |
|-----------|--------|------|
| fast-xml-parser | DoS攻撃 | @google-cloud/storage上流の修正待ち |
| @google-cloud/storage | fast-xml-parser依存 | 同上 |

これらは上流パッケージ（Google Cloud Storage SDK）の依存関係であり、Google側の修正を待つ必要があります。
