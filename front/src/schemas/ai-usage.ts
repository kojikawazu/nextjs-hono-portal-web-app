import { z } from 'zod';
import { optionalHttpsUrlSchema } from './url';

/**
 * AI 活用方法の項目 1 件。
 *
 * `decision`（人間が決めること）と `url`（参考リンク）は任意。
 * 非公開リポジトリを題材にする項目にはリンクを付けないため、`url` の無い項目が多数を占める。
 */
const aiUsageItemSchema = z.object({
    title: z.string(),
    description: z.string(),
    decision: z.string().optional(),
    url: optionalHttpsUrlSchema,
});

/** AI 活用方法のセクション 1 件。項目は配列順に表示する。 */
const aiUsageSectionSchema = z.object({
    title: z.string(),
    summary: z.string(),
    items: z.array(aiUsageItemSchema),
});

/**
 * `GET /api/gcs/aiusage` の応答形状。
 *
 * 外部入力のため `unknown` で受け、このスキーマで検証してからドメインへ入れる。
 * 検証は `repositories/ai-usage.ts` で行う。
 */
export const aiUsageResponseSchema = z.object({
    aiusage: z.object({
        principle: z.string(),
        sections: z.array(aiUsageSectionSchema),
    }),
});
