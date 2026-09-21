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
