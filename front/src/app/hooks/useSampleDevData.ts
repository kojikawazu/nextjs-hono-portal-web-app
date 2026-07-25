'use client';

import { useEffect, useState } from 'react';
import { z } from 'zod';
import type { SampleDevDataType } from '@/app/types/sample-data-types';

/** `/api/gcs/sampledev` の応答形状。外部入力のため unknown で受けてこのスキーマで検証する。 */
const sampleDevResponseSchema = z.object({
    sampledev: z.array(
        z.object({
            title: z.string(),
            description: z.string(),
            tech: z.array(z.string()),
            imageUrl: z.string(),
            url: z.string(),
        }),
    ),
});

/**
 * サンプル開発データを GCS API から取得するフック。
 *
 * @returns 取得したデータ一覧（`sampleDevDataList`）と読み込み状態（`isLoading`）
 */
export const useSampleDevData = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [sampleDevDataList, setSampleDevDataList] = useState<SampleDevDataType[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const result = await fetch('/api/gcs/sampledev');
                if (result.ok) {
                    // 外部入力は unknown で受け、スキーマ検証でナローイングしてから使う。
                    const data: unknown = await result.json();
                    const parsed = sampleDevResponseSchema.safeParse(data);
                    if (parsed.success) {
                        setSampleDevDataList(parsed.data.sampledev);
                    } else {
                        console.error('Unexpected API response format:', data);
                    }
                }
            } catch (error) {
                console.error('Error fetching sample development data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    return { sampleDevDataList, isLoading };
};
