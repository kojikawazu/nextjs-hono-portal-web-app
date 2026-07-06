import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * className を結合するユーティリティ。clsx で条件付きクラスを合成し、
 * tailwind-merge で Tailwind の競合クラス（例: `px-2` と `px-4`）を後勝ちで解決する。
 *
 * @param inputs - clsx が受け取れる className 値（文字列 / 配列 / オブジェクト等）
 * @returns マージ済みの className 文字列
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
