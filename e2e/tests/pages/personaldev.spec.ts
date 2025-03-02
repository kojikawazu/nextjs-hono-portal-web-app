import { test, expect } from '@playwright/test';
import mockCommonData from '../mock/common.json';
import mockPersonalDevData from '../mock/personaldev.json';

test.beforeEach(async ({ page }) => {
    await Promise.all([
        page.route('**/api/gcs/common', async (route) => {
            await route.fulfill({
                contentType: 'application/json',
                body: JSON.stringify(mockCommonData),
            });
        }),
        page.route('**/api/gcs/personaldev', async (route) => {
            await route.fulfill({
                contentType: 'application/json',
                body: JSON.stringify(mockPersonalDevData),
            });
        }),
    ]);
});

// テストケース
test('Personal Dev Page', async ({ page }) => {
    await page.goto('/personaldev');

    // ローディング完了を待つ
    await page.waitForSelector('text=個人開発プロジェクト①');

    // ページタイトルや主要テキスト
    await expect(page.getByRole('heading', { name: '個人開発履歴' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Homeへ戻る' })).toHaveAttribute('href', '/');

    // 個人開発プロジェクト①の表示を確認
    await expect(page.getByRole('heading', { name: '個人開発プロジェクト①' })).toBeVisible();
    await expect(page.getByText('プロジェクト①の説明文')).toBeVisible();
    await expect(page.getByText('React')).toBeVisible();
    await expect(page.getByText('TypeScript')).toBeVisible();
    await expect(page.getByText('Tailwind CSS')).toBeVisible();
    await expect(page.getByRole('link', { name: '個人開発プロジェクト①' })).toHaveAttribute(
        'href',
        'https://example.com/project1',
    );

    // 個人開発プロジェクト②の表示を確認
    await expect(page.getByRole('heading', { name: '個人開発プロジェクト②' })).toBeVisible();
    await expect(page.getByText('プロジェクト②の説明文')).toBeVisible();
    await expect(page.getByText('Next.js')).toBeVisible();
    await expect(page.getByText('Playwright')).toBeVisible();
    await expect(page.getByText('Zod')).toBeVisible();
    await expect(page.getByRole('link', { name: '個人開発プロジェクト②' })).toHaveAttribute(
        'href',
        'https://example.com/project2',
    );
});

// データがない場合の表示確認
test('Personal Dev Page (No Data)', async ({ page }) => {
    // 空のモックデータ
    await page.route('**/api/gcs/personaldev', async (route) => {
        await route.fulfill({
            contentType: 'application/json',
            body: JSON.stringify({ personaldev: [] }),
        });
    });

    await page.goto('/personaldev');

    await expect(page.getByText('No personal development data available.')).toBeVisible();
});

test('Footer', async ({ page }) => {
    await page.goto('/personaldev');

    await page.waitForSelector('text=個人開発プロジェクト①');

    // Footerのテキスト確認
    const footer = page.locator('footer');
    await expect(footer.getByText('My Tech Hub. All rights reserved.')).toBeVisible();

    // My Tech Hubリンク
    await expect(footer.getByRole('link', { name: 'My Tech Hub' })).toHaveAttribute('href', '/');

    // GitHubリンク
    await expect(footer.locator('a[href="https://github.com/mock-user"]')).toBeVisible();

    // Xリンク
    await expect(footer.locator('a[href="https://x.com/mock-user"]')).toBeVisible();

    // LinkedInリンク
    await expect(footer.locator('a[href="https://linkedin.com/mock-user"]')).toBeVisible();
});
