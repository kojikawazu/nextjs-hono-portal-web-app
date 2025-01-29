'use client';

import { usePathname } from 'next/navigation';

/**
 * ホームパスかどうかを判断する
 * @returns true: ホームパス, false: ホームパス以外
 */
export const useIsHomePath = () => {
    const pathname = usePathname();
    return pathname !== '/';
};
