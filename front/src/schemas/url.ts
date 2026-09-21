import { z } from 'zod';

/**
 * `href` / `src` に入れて安全な URL のスキーマ。
 *
 * **`z.string().url()` だけでは不十分**。内部が `new URL()` のため、スキーム付き URI で
 * あれば `javascript:` / `data:` / `vbscript:` も「妥当な URL」として通す（実測: zod 3.24.1）。
 * これらは `href` に入ると XSS の実行経路になるため、`https` に限定する。
 *
 * 制約の定義はこのファイルだけに置き、各スキーマはここから合成する
 * （`duplication.md`「同じ制約を書き写さない」／`typescript.md`「URL の検証」）。
 */
export const httpsUrlSchema = z
    .string()
    .url()
    .refine((value) => value.startsWith('https://'), {
        message: 'https の URL のみ許可する',
    });

/**
 * 表示用リンクの URL スキーマ。検証に通らない値は `undefined` に劣化させる。
 *
 * 例外にすると**値が 1 つ壊れただけでページ全体が描画できなくなる**（応答全体が
 * `ApiError(kind='schema')` になる）。リンクは無くても本文・アイコンには価値があるため、
 * 「リンクを描画しない」側へ倒す。未設定（キー無し）も同じ扱いになる。
 */
export const optionalHttpsUrlSchema = httpsUrlSchema.optional().catch(undefined);
