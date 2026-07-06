'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
// types
import type { CommonDataType } from '@/app/types/common-data-types';

// type
type CommonDataState = {
    isLoading: boolean;
    commonData: CommonDataType | null;
};

// Context
const CommonDataContext = createContext<CommonDataState | null>(null);

// hooks
export const useCommonData = () => {
    const context = useContext(CommonDataContext);
    if (!context) {
        throw new Error('useCommonData must be used within a DataProvider');
    }
    return context;
};

// Props
interface CommonDataProviderProps {
    children: ReactNode;
}

// Provider
export const CommonDataProvider: React.FC<CommonDataProviderProps> = ({ children }) => {
    // state
    const [commonData, setCommonData] = useState<CommonDataType | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await fetch(`/api/gcs/common`);

                if (result.ok) {
                    const data = await result.json();
                    setCommonData({
                        portfolioUrl: data.portfolio.url,
                        blogUrl: data.blog.url,
                        linkUrl: {
                            githubUrl: data.link.github,
                            xUrl: data.link.x,
                            linkedinUrl: data.link.linkedin,
                        },
                    });
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
