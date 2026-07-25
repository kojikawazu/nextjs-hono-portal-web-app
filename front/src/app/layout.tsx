import type { Metadata } from 'next';
// contexts
import { CommonDataProvider } from './contexts/CommonContext';
// styles
import './globals.css';

/** ページの既定メタデータ（`<title>` / `<meta name="description">`）。 */
export const metadata: Metadata = {
    title: 'My Developers Hub',
    description: 'My Developers Hub',
};

/**
 * ルートレイアウト。全ページ共通の HTML 骨格と共通データ Provider を提供する。
 *
 * @param children - ページ本体の要素
 */
export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="ja">
            <body className="antialiased">
                <CommonDataProvider>{children}</CommonDataProvider>
            </body>
        </html>
    );
}
