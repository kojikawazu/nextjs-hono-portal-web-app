import type { z } from 'zod';
import type { personalDevItemSchema } from '@/schemas/personal-data';

/**
 * 個人開発データ。
 *
 * `personalDevItemSchema` から導出する。同じ形を手書きで二重定義しない
 * （`typescript.md`「スキーマが単一の真実であり、型はその影である」）。
 */
export type PersonalDevDataType = z.infer<typeof personalDevItemSchema>;
