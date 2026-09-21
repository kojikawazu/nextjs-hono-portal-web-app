import { z } from 'zod';

/**
 * サンプル開発データ 1 件の形状。`types/sample-data.ts` の `SampleDevDataType` は
 * このスキーマから導出する（同じ形を手書きで二重定義しない）。
 */
export const sampleDevItemSchema = z.object({
    title: z.string(),
    description: z.string(),
    tech: z.array(z.string()),
    imageUrl: z.string(),
    url: z.string(),
});

/**
 * `GET /api/gcs/sampledev` の応答形状。
 *
 * 外部入力のため `unknown` で受け、このスキーマで検証してからドメインへ入れる。
 * 検証は `repositories/dev-data.ts` で行う。
 */
export const sampleDevResponseSchema = z.object({
    sampledev: z.array(sampleDevItemSchema),
});
