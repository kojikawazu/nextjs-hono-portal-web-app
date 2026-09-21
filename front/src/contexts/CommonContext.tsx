'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
// repositories
import { fetchCommonData } from '@/repositories/common-data';
// types
import type { CommonDataType } from '@/types/common-data';

/** 共通データ Context の状態。`isLoading` は取得中フラグ、`commonData` は取得結果（未取得時は null）。 */
type CommonDataState = {
    isLoading: boolean;
    commonData: CommonDataType | null;
};

// Context
const CommonDataContext = createContext<CommonDataState | null>(null);

/**
 * 共通データ Context を取得するフック。
 *
 * @returns 共通データの状態（`isLoading` / `commonData`）
 * @throws {Error} `CommonDataProvider` の外側で呼び出された場合
 */
export const useCommonData = () => {
    const context = useContext(CommonDataContext);
    if (!context) {
        throw new Error('useCommonData must be used within a DataProvider');
    }
    return context;
};

// Props
type CommonDataProviderProps = {
    /** Provider 配下に共通データを供給する子要素 */
    children: ReactNode;
};

/**
 * 共通データ（ポートフォリオ / ブログ / SNS リンク）を GCS から取得して配下に供給する Provider。
 * マウント時に `repositories/common-data.ts` 経由で取得し、`CommonDataContext` で提供する。
 */
export const CommonDataProvider: React.FC<CommonDataProviderProps> = ({ children }) => {
    // state
    const [commonData, setCommonData] = useState<CommonDataType | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                setCommonData(await fetchCommonData());
            } catch (error) {
                console.error('Error fetching common data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        load();
    }, []);

    return (
        <CommonDataContext.Provider value={{ isLoading, commonData }}>
            {children}
        </CommonDataContext.Provider>
    );
};
