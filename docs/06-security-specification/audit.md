# セキュリティ監査と CI ガード

脆弱性監査の履歴と、CI によるシークレット混入検出。index は [README.md](./README.md)。

## 8. セキュリティ監査

| 実施日 | 検出 | 対応 | 残存 | レポート |
|---|---|---|---|---|
| 2026-01-31 | 18件 | `npm audit fix` で10件、Next.js 16 アップグレードで6件を修正 | 2件（`fast-xml-parser` / `@google-cloud/storage`。上流の修正待ち） | [security-audit-report.md](../security-audit-report.md) |
| 2026-03-21 | 22件（Dependabot） | `npm audit fix` で21件を修正 | 1件（`@tootallnate/once`。Low・テスト環境限定のため許容） | [security-audit-report-2026-03.md](../security-audit-report-2026-03.md) |
| 2026-09-20〜21 | 106件（`pnpm audit` 実測） | 直接依存を更新（`next` 16.3.5 / `hono` 4.13.8 等）し未使用の `@hono/node-server` を削除。さらに `pnpm.overrides` で間接依存の解決先を修正版に固定 | **1件**（`uuid` 9.0.1。`@google-cloud/storage` が `uuid@^9` 依存でメジャー 2 段跨ぎのため据え置き） | [security-audit-report-2026-09.md](../security-audit-report-2026-09.md) |

最新の状況は表の最終行を参照する。個々の脆弱性の内訳・対応内容は各レポートが正本。

> **件数をこの表の外へ転記しない。** 2026-01-31 の結論が「残存 8 件・Next.js 16 アップグレード待ち」のままタスク表に写され、実態（残存 2 件・対応済み）と乖離した事例がある。

## 9. CI によるシークレット混入検出

`.github/workflows/secret-scan.yml` が、鍵・`.env` などの秘匿ファイルが Git 管理下に入っていないかを全 PR と main への push で検査する。

**`.gitignore` だけでは足りない理由**:

- `.gitignore` は**未追跡ファイルにしか効かない**。一度追跡されたファイルには無視が効かず、`git add -f` や新規ディレクトリでの書き漏れも止められない。
- **Git の履歴は追記型**。一度 push した秘匿ファイルは追跡除外しても履歴に残る。本リポジトリは公開のため誰でも取得でき、対処は履歴の書き換えではなく**鍵・トークンのローテーション**しかなくなる。

`.gitignore`（混入させない）に対して、本ジョブは**追跡された時点で落とす**側を担う。

| 項目 | 内容 |
|---|---|
| 検査方法 | `git ls-files`（名前）と `git grep --cached`（中身）でインデックスを走査（履歴・ワーキングツリーは見ない。数秒で完了） |
| 検出対象（鍵） | `*.key` / `*.pem` / `*.p12` / `*.pfx` / `*.jks` / `*.keystore` / `id_rsa` / `id_ed25519` / `id_dsa` / `credentials.json` / サービスアカウント鍵（`service-account.json` / `service_account.json` / `serviceAccountKey.json` など区切り違い、およびコンソールからダウンロードした既定名 `<project-id>-<12桁の16進>.json` を含む） |
| 検出対象（中身） | 追跡中の `*.json` のうち、SA 鍵の構造（`type` が `service_account` かつ `private_key` を持つ）に一致するもの。**ファイル名を変えても検出する**。`*.json` に絞るのは、ワークフロー・ドキュメント自体が両方の語を含むため |
| 検出対象（設定） | `.env` 系（`.env`, `.env.local`, `.env.production` 等）/ Terraform の `*.tfvars` / `*.tfvars.json` / `*.tfstate`（`errored.tfstate`・`*.tfstate.backup` 含む）/ `*.tfplan`（いずれも秘密を平文で含む） |
| 除外 | `*.example` / `*.sample` / `*.template` / `*.dist` / `*.env.d.ts`（テンプレートと型定義は誤検知になるため） |
| 発火 | 変更種別を問わず常に実行（パスフィルタをかけない） |

**サービスアカウント鍵は区切り違いをまとめて検出する。** GCP では `service-account.json` が最も一般的だが、当初はキャメルケースの `serviceAccountKey.json` しか見ておらず素通りしていた（issue #122）。`.gitignore` 側にも同名を追加し、2 層で守る。

検出時は該当パスを出力して失敗する。**`.gitignore` への追加や `git rm --cached` では履歴から消えない**ため、発生した場合は鍵・トークンのローテーションを行う。
