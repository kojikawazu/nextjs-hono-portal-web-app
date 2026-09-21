import { z } from 'zod';
import { optionalHttpsUrlSchema } from './url';

/**
 * `GET /api/gcs/common` の応答形状。
 *
 * 外部入力のため `unknown` で受け、このスキーマで検証してからドメインへ入れる。
 * 検証は `repositories/common-data.ts` で行う。
 */
export const commonDataResponseSchema = z.object({
    portfolio: z.object({ url: optionalHttpsUrlSchema }),
    blog: z.object({ url: optionalHttpsUrlSchema }),
    link: z.object({
        github: optionalHttpsUrlSchema,
        x: optionalHttpsUrlSchema,
        linkedin: optionalHttpsUrlSchema,
    }),
});

/** `GET /api/gcs/common` の応答。API の契約であり、画面が使う `CommonDataType` とは別物。 */
export type CommonDataResponse = z.infer<typeof commonDataResponseSchema>;
