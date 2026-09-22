import type { z } from 'zod';
import type { aiUsageResponseSchema } from '@/schemas/ai-usage';

/**
 * AI 活用方法データ（画面が扱う形）。
 *
 * `aiUsageResponseSchema` から導出する。同じ形を手書きで二重定義しない
 * （`typescript.md`「スキーマが単一の真実であり、型はその影である」）。
 */
export type AiUsageDataType = z.infer<typeof aiUsageResponseSchema>['aiusage'];

/** AI 活用方法のセクション 1 件。 */
export type AiUsageSectionType = AiUsageDataType['sections'][number];
