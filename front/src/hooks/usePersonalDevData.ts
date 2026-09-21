'use client';

import { useEffect, useState } from 'react';
import { fetchPersonalDevData } from '@/repositories/dev-data';
import type { PersonalDevDataType } from '@/types/personal-data';

/**
 * 個人開発データを取得するフック。
 *
 * 通信とスキーマ検証は `repositories/dev-data.ts` が担う。本フックは状態管理と
 * 副作用の制御に専念する（`frontend.md`「`fetch` を書いてよいのは `repositories/` だけ」）。
 *
 * @returns 取得したデータ一覧（`personalDevDataList`）と読み込み状態（`isLoading`）
 */
export const usePersonalDevData = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [personalDevDataList, setPersonalDevDataList] = useState<PersonalDevDataType[]>([]);

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            try {
                setPersonalDevDataList(await fetchPersonalDevData());
            } catch (error) {
                console.error('Error fetching personal development data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        load();
    }, []);

    return { personalDevDataList, isLoading };
};
