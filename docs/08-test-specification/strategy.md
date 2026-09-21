# テスト戦略と実行コマンド

テストレベルの分類と、ローカルでの実行コマンド。index は [README.md](./README.md)。

## 1. テスト戦略

| テストレベル | ツール | 対象 |
|------------|-------|------|
| ユニットテスト | Jest | API Route（GCS API / Mail API）※外部 I/O はモック |
| 統合テスト（IT） | Jest + fake-gcs-server | GCS ルート × 実 GCS SDK（エミュレータ結合） |
| E2Eテスト | Playwright | ページ表示、ユーザーフロー |
| リンティング | ESLint | コード品質 |
| 型チェック | TypeScript (`tsc --noEmit`) | 型の不整合（ビルドとは別に明示実行） |
| フォーマット | Prettier | コードスタイル |

## 2. テスト実行コマンド

```bash
# ユニットテスト
pnpm test              # 全テスト実行
pnpm run test:watch    # ウォッチモード
pnpm run test:coverage # カバレッジ付き

# 統合テスト（IT）: fake-gcs-server が必要
pnpm run test:it         # エミュレータ起動済みで実行
pnpm run test:it:docker  # エミュレータ起動 → IT → 停止 を自動化

# E2Eテスト
pnpm run test:e2e        # ヘッドレス実行
pnpm run test:e2e:ui     # UIモード
pnpm run test:e2e:headed # ブラウザ表示

# コード品質
pnpm run lint            # ESLint
pnpm run typecheck       # TypeScript 型チェック（tsc --noEmit）
pnpm run format:check    # Prettierチェック
pnpm run format          # Prettier自動修正
```

