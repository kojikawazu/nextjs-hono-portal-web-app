import { z } from 'zod';

/**
 * 個人開発データ 1 件の形状。`types/personal-data.ts` の `PersonalDevDataType` は
 * このスキーマから導出する（同じ形を手書きで二重定義しない）。
 */
export const personalDevItemSchema = z.object({
    title: z.string(),
    description: z.string(),
    tech: z.array(z.string()),
    url: z.string(),
    /**
     * GitHub リポジトリの URL。任意項目。
     *
     * - 非公開リポジトリ・複数リポジトリ構成のプロジェクトには値が無いため optional にする。
     * - **`.url()` だけでは `javascript:` を通す**（内部が `new URL()` のため、スキーム付き
     *   URI ならすべて妥当と判定される）。`href` に入ると XSS の経路になるので、
     *   `https:` のみに絞る（GitHub の URL は常に https）。
     * - `.catch(undefined)` は「不正な値が 1 件混じっただけで一覧全体が
     *   `ApiError(kind='schema')` になり、ページが No data 表示に落ちる」のを避けるため。
     *   表示専用の任意項目なので、リンクを出さない側へ劣化させる。
     */
    githubUrl: z
        .string()
        .url()
        .refine((value) => value.startsWith('https://'), {
            message: 'githubUrl は https の URL のみ許可する',
        })
        .optional()
        .catch(undefined),
});

/**
 * `GET /api/gcs/personaldev` の応答形状。
 *
 * 外部入力のため `unknown` で受け、このスキーマで検証してからドメインへ入れる。
 * 検証は `repositories/dev-data.ts` で行う。
 */
export const personalDevResponseSchema = z.object({
    personaldev: z.array(personalDevItemSchema),
});
