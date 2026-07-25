'use client';

import { useEffect, useState } from 'react';
import { z } from 'zod';
import type { PersonalDevDataType } from '@/app/types/personal-data-types';

/** `/api/gcs/personaldev` の応答形状。外部入力のため unknown で受けてこのスキーマで検証する。 */
const personalDevResponseSchema = z.object({
    personaldev: z.array(
        z.object({
            title: z.string(),
            description: z.string(),
            tech: z.array(z.string()),
            url: z.string(),
        }),
    ),
});

/**
 * 個人開発データを GCS API から取得するフック。
 *
 * @returns 取得したデータ一覧（`personalDevDataList`）と読み込み状態（`isLoading`）
 */
export const usePersonalDevData = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [personalDevDataList, setPersonalDevDataList] = useState<PersonalDevDataType[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const result = await fetch('/api/gcs/personaldev');
                if (result.ok) {
                    // 外部入力は unknown で受け、スキーマ検証でナローイングしてから使う。
                    const data: unknown = await result.json();
                    const parsed = personalDevResponseSchema.safeParse(data);
                    if (parsed.success) {
                        setPersonalDevDataList(parsed.data.personaldev);
                    } else {
                        console.error('Unexpected API response format:', data);
                    }
                }
            } catch (error) {
                console.error('Error fetching personal development data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    return { personalDevDataList, isLoading };
};
