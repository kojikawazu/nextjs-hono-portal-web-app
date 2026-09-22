import { aiUsageResponseSchema } from '@/schemas/ai-usage';
import type { AiUsageDataType } from '@/types/ai-usage';
import { fetchJson } from './http';

/** AI 活用方法データ取得エンドポイント。 */
const AI_USAGE_ENDPOINT = '/api/gcs/aiusage';

/**
 * AI 活用方法データを取得する。
 *
 * @returns 原則とセクション一覧
 * @throws {ApiError} 通信失敗・非 2xx・応答形状の不一致
 */
export async function fetchAiUsageData(): Promise<AiUsageDataType> {
    const { aiusage } = await fetchJson(AI_USAGE_ENDPOINT, aiUsageResponseSchema);
    return aiusage;
}
