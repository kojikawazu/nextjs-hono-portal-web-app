import type { z } from 'zod';
import type { contactSchema } from '@/app/schema/contact-schema';

/**
 * お問い合わせフォームデータ
 */
export type contactFormData = z.infer<typeof contactSchema>;
