import { personalDevResponseSchema } from '@/schemas/personal-data';
import { sampleDevResponseSchema } from '@/schemas/sample-data';
import type { PersonalDevDataType } from '@/types/personal-data';
import type { SampleDevDataType } from '@/types/sample-data';
import { fetchJson } from './http';

/** 個人開発データ取得エンドポイント。 */
const PERSONAL_DEV_ENDPOINT = '/api/gcs/personaldev';
/** サンプル開発データ取得エンドポイント。 */
const SAMPLE_DEV_ENDPOINT = '/api/gcs/sampledev';

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

/**
 * サンプル開発データの一覧を取得する。
 *
 * @returns サンプル開発データの配列
 * @throws {ApiError} 通信失敗・非 2xx・応答形状の不一致
 */
export async function fetchSampleDevData(): Promise<SampleDevDataType[]> {
    const { sampledev } = await fetchJson(SAMPLE_DEV_ENDPOINT, sampleDevResponseSchema);
    return sampledev;
}
