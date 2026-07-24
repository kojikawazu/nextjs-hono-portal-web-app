'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { z } from 'zod';
// types
import type { CommonDataType } from '@/app/types/common-data-types';

/** `/api/gcs/common` の応答形状。外部入力のため unknown で受けてこのスキーマで検証する。 */
const commonResponseSchema = z.object({
    portfolio: z.object({ url: z.string() }),
    blog: z.object({ url: z.string() }),
    link: z.object({
        github: z.string(),
        x: z.string(),
        linkedin: z.string(),
    }),
});

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
interface CommonDataProviderProps {
    /** Provider 配下に共通データを供給する子要素 */
    children: ReactNode;
}

/**
 * 共通データ（ポートフォリオ / ブログ / SNS リンク）を GCS から取得して配下に供給する Provider。
 * マウント時に `/api/gcs/common` を fetch し、`CommonDataContext` 経由で提供する。
 */
export const CommonDataProvider: React.FC<CommonDataProviderProps> = ({ children }) => {
    // state
    const [commonData, setCommonData] = useState<CommonDataType | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await fetch(`/api/gcs/common`);

                if (result.ok) {
                    // 外部入力は unknown で受け、スキーマ検証でナローイングしてから使う。
                    const data: unknown = await result.json();
                    const parsed = commonResponseSchema.safeParse(data);
                    if (parsed.success) {
                        const { portfolio, blog, link } = parsed.data;
                        setCommonData({
                            portfolioUrl: portfolio.url,
                            blogUrl: blog.url,
                            linkUrl: {
                                githubUrl: link.github,
                                xUrl: link.x,
                                linkedinUrl: link.linkedin,
                            },
                        });
                    } else {
                        console.error('Unexpected common data format:', data);
                    }
                }
            } catch (error) {
                console.error('Error fetching common data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <CommonDataContext.Provider value={{ isLoading, commonData }}>
            {children}
        </CommonDataContext.Provider>
    );
};
