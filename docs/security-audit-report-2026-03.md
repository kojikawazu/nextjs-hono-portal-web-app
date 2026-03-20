# セキュリティ監査レポート（2026-03-21）

**実施日**: 2026-03-21
**対象プロジェクト**: nextjs-hono-portal-web-app
**前回監査**: 2026-01-31（`docs/security-audit-report.md` 参照）

---

## サマリー

GitHub Dependabotにて22件のオープンアラートを検出。
`npm audit fix`（breaking change なし）を実行し、21件を解消。

| 状態 | 件数 |
|------|------|
| 修正前（オープンアラート） | 22件 |
| 今回修正済み | 21件 |
| 残存 | 1件（Low severity） |

### 修正前の重要度別内訳

| 重要度 | 件数 |
|--------|------|
| Critical | 1 |
| High | 9 |
| Medium | 8 |
| Low | 4 |

---

## 実行コマンド

```bash
npm audit fix
```

breaking change を伴わない安全な修正のみを適用。

---

## 更新されたパッケージ

| パッケージ | 更新前 | 更新後 | 種別 |
|-----------|--------|--------|------|
| next | 16.1.6 | 16.2.1 | 直接依存 |
| hono | 4.11.7 | 4.12.8 | 直接依存 |
| @hono/node-server | 1.13.7 | 1.19.11 | 直接依存 |
| @google-cloud/storage | 7.14.0 | 7.19.0 | 直接依存 |
| fast-xml-parser | 4.5.3 | 5.5.8 | 間接依存 |
| minimatch | 3.1.2 / 5.1.6 / 9.0.x | 3.1.5 / 5.1.9 / 9.0.9 | 間接依存 |
| flatted | 3.3.3 | 3.4.2 | 間接依存 |
| ajv | 6.12.6 | 6.14.0 | 間接依存 |
| editorconfig | 1.0.4 | 1.0.7 | 間接依存 |
| strnum | 1.1.2 | 2.2.1 | 間接依存 |

新規追加: `path-expression-matcher@1.2.0`, `fast-xml-builder@1.1.4`

---

## 解消されたアラート（21件）

### Critical（1件）

| # | パッケージ | 脆弱性 |
|---|-----------|--------|
| 53 | fast-xml-parser | DOCTYPE entity encoding bypass via regex injection |

### High（9件）

| # | パッケージ | 脆弱性 |
|---|-----------|--------|
| 70 | fast-xml-parser | numeric entity expansion bypass (incomplete fix for CVE-2026-26278) |
| 54 | fast-xml-parser | DoS through entity expansion in DOCTYPE |
| 58 | hono | arbitrary file access via serveStatic |
| 61 | @hono/node-server | authorization bypass via encoded slashes in Serve Static |
| 60 | hono | Cookie Attribute Injection via setCookie() |
| 59 | hono | SSE Control Field Injection via CR/LF in writeSSE() |
| 55 | minimatch | ReDoS: matchOne() combinatorial backtracking |
| 50 | minimatch | ReDoS: nested *() extglobs |
| 45 | minimatch | ReDoS via repeated wildcards |

### Medium（8件）

| # | パッケージ | 脆弱性 |
|---|-----------|--------|
| 71 | next | Unbounded next/image disk cache growth |
| 69 | next | HTTP request smuggling in rewrites |
| 68 | next | Unbounded postponed resume buffering DoS |
| 67 | next | null origin bypass Server Actions CSRF checks |
| 64 | hono | Prototype Pollution via __proto__ in parseBody({ dot: true }) |
| 72 | fast-xml-parser | Entity Expansion Limits Bypassed (falsy evaluation) |
| 49 | minimatch | ReDoS: matchOne() combinatorial backtracking |
| 51 | minimatch | ReDoS: matchOne() combinatorial backtracking |

### Low（3件）

| # | パッケージ | 脆弱性 |
|---|-----------|--------|
| 66 | next | null origin bypass dev HMR websocket CSRF checks |
| 63 | fast-xml-parser | stack overflow in XMLBuilder with preserveOrder |
| 41 | hono | timing comparison hardening in basicAuth/bearerAuth |

---

## 残存するアラート（1件）

| # | パッケージ | 重要度 | 脆弱性 |
|---|-----------|--------|--------|
| 62 | @tootallnate/once | Low | Incorrect Control Flow Scoping |

### 詳細

- **依存チェーン**: `jest-environment-jsdom` → `jsdom` → `http-proxy-agent` → `@tootallnate/once`
- **影響範囲**: テスト環境のみ（本番環境には影響なし）
- **対応に必要な変更**: `jest-environment-jsdom` のメジャーアップグレード（30.3.0）が必要でbreaking changeを伴う
- **対応方針**: Low severity かつテスト環境限定のため、現時点では許容する

---

## テスト結果

| テスト | 結果 |
|-------|------|
| ESLint (`npm run lint`) | 0 errors, 3 warnings（既存の未使用eslint-disable） |
| Jest (`npm test`) | 6 passed, 6 total |
| Build (`npm run build`) | 失敗（`RESEND_API_KEY` 未設定 — 修正前から同様の既存問題。本番ではCloud Run環境変数で設定） |

---

## 備考

- 前回監査（2026-01-31）では18件検出 → 10件修正。その後新たに追加されたアラートを含め、今回22件を対処
- `npm audit fix` のみで対応し、breaking change は一切含まない
- 定期的な `npm audit` 実行と Dependabot アラートの監視を継続すること
