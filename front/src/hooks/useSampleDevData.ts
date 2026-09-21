'use client';

import { useEffect, useState } from 'react';
import { fetchSampleDevData } from '@/repositories/dev-data';
import type { SampleDevDataType } from '@/types/sample-data';

/**
 * サンプル開発データを取得するフック。
 *
 * 通信とスキーマ検証は `repositories/dev-data.ts` が担う。本フックは状態管理と
 * 副作用の制御に専念する（`frontend.md`「`fetch` を書いてよいのは `repositories/` だけ」）。
 *
 * @returns 取得したデータ一覧（`sampleDevDataList`）と読み込み状態（`isLoading`）
 */
export const useSampleDevData = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [sampleDevDataList, setSampleDevDataList] = useState<SampleDevDataType[]>([]);

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            try {
                setSampleDevDataList(await fetchSampleDevData());
            } catch (error) {
                console.error('Error fetching sample development data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        load();
    }, []);

    return { sampleDevDataList, isLoading };
};
