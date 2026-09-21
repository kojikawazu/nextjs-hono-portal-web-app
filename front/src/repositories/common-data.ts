import { commonDataResponseSchema } from '@/schemas/common-data';
import type { CommonDataType } from '@/types/common-data';
import { fetchJson } from './http';

/** 共通データ取得エンドポイント。 */
const COMMON_DATA_ENDPOINT = '/api/gcs/common';

/**
 * 共通データ（ポートフォリオ / ブログ / SNS リンク）を取得する。
 *
 * API の応答形状と画面が扱う形が異なるため、ここで詰め替える。呼び出し側は
 * API の契約を知らずに済む。
 *
 * @returns 画面が扱う形の共通データ
 * @throws {ApiError} 通信失敗・非 2xx・応答形状の不一致
 */
export async function fetchCommonData(): Promise<CommonDataType> {
    const { portfolio, blog, link } = await fetchJson(
        COMMON_DATA_ENDPOINT,
        commonDataResponseSchema,
    );

    return {
        portfolioUrl: portfolio.url,
        blogUrl: blog.url,
        linkUrl: {
            githubUrl: link.github,
            xUrl: link.x,
            linkedinUrl: link.linkedin,
        },
    };
}
