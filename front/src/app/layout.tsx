import type { Metadata } from 'next';
// contexts
import { CommonDataProvider } from './contexts/CommonContext';
// styles
import './globals.css';

export const metadata: Metadata = {
    title: 'My Developers Hub',
    description: 'My Developers Hub',
};

/**
 * ルートレイアウト
 * @param children 子要素
 * @returns JSX.Element
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
