import { z } from 'zod';
import { optionalHttpsUrlSchema } from './url';

/**
 * 個人開発データ 1 件の形状。`types/personal-data.ts` の `PersonalDevDataType` は
 * このスキーマから導出する（同じ形を手書きで二重定義しない）。
 */
export const personalDevItemSchema = z.object({
    title: z.string(),
    description: z.string(),
    tech: z.array(z.string()),
    /**
     * 公開サイトの URL。カード全体のリンク先。
     *
     * 必須データだが、検証に通らない場合も**カードごと消さずリンクだけ落とす**
     * （タイトル・説明・技術スタックは URL が無くても表示する価値がある）。
     */
    url: optionalHttpsUrlSchema,
    /**
     * GitHub リポジトリの URL。任意項目。
     *
     * 非公開リポジトリ・複数リポジトリ構成のプロジェクトには値が無いため optional。
     */
    githubUrl: optionalHttpsUrlSchema,
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
