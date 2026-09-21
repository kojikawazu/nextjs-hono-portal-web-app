import { personalDevResponseSchema } from '@/schemas/personal-data';
import type { PersonalDevDataType } from '@/types/personal-data';
import { fetchJson } from './http';

/** 個人開発データ取得エンドポイント。 */
const PERSONAL_DEV_ENDPOINT = '/api/gcs/personaldev';

/**
 * 個人開発データの一覧を取得する。
 *
 * @returns 個人開発データの配列
 * @throws {ApiError} 通信失敗・非 2xx・応答形状の不一致
 */
export async function fetchPersonalDevData(): Promise<PersonalDevDataType[]> {
    const { personaldev } = await fetchJson(PERSONAL_DEV_ENDPOINT, personalDevResponseSchema);
    return personaldev;
}
