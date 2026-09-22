'use client';

import { useEffect, useState } from 'react';
import { fetchAiUsageData } from '@/repositories/ai-usage';
import type { AiUsageDataType } from '@/types/ai-usage';

/**
 * AI 活用方法データを取得するフック。
 *
 * 通信とスキーマ検証は `repositories/ai-usage.ts` が担う。本フックは状態管理と
 * 副作用の制御に専念する（`frontend.md`「`fetch` を書いてよいのは `repositories/` だけ」）。
 *
 * @returns 取得したデータ（`aiUsageData`。失敗時は `null`）と読み込み状態（`isLoading`）
 */
export const useAiUsageData = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [aiUsageData, setAiUsageData] = useState<AiUsageDataType | null>(null);

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            try {
                setAiUsageData(await fetchAiUsageData());
            } catch (error) {
                console.error('Error fetching AI usage data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        load();
    }, []);

    return { aiUsageData, isLoading };
};
