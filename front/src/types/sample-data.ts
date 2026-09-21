import type { z } from 'zod';
import type { sampleDevItemSchema } from '@/schemas/sample-data';

/**
 * サンプル開発データ。
 *
 * `sampleDevItemSchema` から導出する。同じ形を手書きで二重定義しない
 * （`typescript.md`「スキーマが単一の真実であり、型はその影である」）。
 */
export type SampleDevDataType = z.infer<typeof sampleDevItemSchema>;
