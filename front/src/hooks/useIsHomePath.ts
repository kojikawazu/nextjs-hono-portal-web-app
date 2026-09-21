'use client';

import { usePathname } from 'next/navigation';

/**
 * 現在のパスがホーム（`/`）以外かどうかを判断する。
 *
 * @returns ホーム以外なら true（Footer 等の表示制御に使う）
 */
export const useIsHomePath = () => {
    const pathname = usePathname();
    return pathname !== '/';
};
