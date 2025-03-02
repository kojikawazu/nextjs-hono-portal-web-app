import { test, expect } from '@playwright/test';
import mockCommonData from '../mock/common.json';
import mockSampleDevData from '../mock/sampledev.json';

test.beforeEach(async ({ page }) => {
    await Promise.all([
        page.route('**/api/gcs/common', async (route) => {
            await route.fulfill({
                contentType: 'application/json',
                body: JSON.stringify(mockCommonData),
            });
        }),
        page.route('**/api/gcs/sampledev', async (route) => {
            await route.fulfill({
                contentType: 'application/json',
                body: JSON.stringify(mockSampleDevData),
            });
        }),
    ]);
});

test('Sample Dev Page', async ({ page }) => {
    await page.goto('/sampledev');

    // ローディング完了待機
    await page.waitForSelector('text=サンプル開発プロジェクト①');

    // ページタイトル確認
    await expect(page.getByRole('heading', { name: 'サンプル開発履歴' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Homeへ戻る' })).toHaveAttribute('href', '/');

    // サンプル開発プロジェクト①の表示確認
    await expect(page.getByRole('heading', { name: 'サンプル開発プロジェクト①' })).toBeVisible();
    await expect(page.getByText('プロジェクト①の説明文')).toBeVisible();
    await expect(page.getByText('React')).toBeVisible();
    await expect(page.getByText('TypeScript')).toBeVisible();
    await expect(page.getByText('Tailwind CSS')).toBeVisible();
    await expect(page.getByRole('link', { name: 'View Sample Code' }).first()).toHaveAttribute(
        'href',
        'https://example.com/sample1',
    );

    // サンプル開発プロジェクト②の表示確認
    await expect(page.getByRole('heading', { name: 'サンプル開発プロジェクト②' })).toBeVisible();
    await expect(page.getByText('プロジェクト②の説明文')).toBeVisible();
    await expect(page.getByText('Next.js')).toBeVisible();
    await expect(page.getByText('Playwright')).toBeVisible();
    await expect(page.getByText('Zod')).toBeVisible();
    await expect(page.getByRole('link', { name: 'View Sample Code' }).nth(1)).toHaveAttribute(
        'href',
        'https://example.com/sample2',
    );
});

// データが空の場合の表示確認
test('Sample Dev Page (No Data)', async ({ page }) => {
    await page.route('**/api/gcs/sampledev', async (route) => {
        await route.fulfill({
            contentType: 'application/json',
            body: JSON.stringify({ sampledev: [] }),
        });
    });

    await page.goto('/sampledev');
    await expect(page.getByText('No sample development data available.')).toBeVisible();
});
