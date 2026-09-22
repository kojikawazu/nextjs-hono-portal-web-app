import { test, expect } from '@playwright/test';
import mockCommonData from '../mock/common.json';
import mockAiUsageData from '../mock/aiusage.json';

test.beforeEach(async ({ page }) => {
    await Promise.all([
        page.route('**/api/gcs/common', async (route) => {
            await route.fulfill({
                contentType: 'application/json',
                body: JSON.stringify(mockCommonData),
            });
        }),
        page.route('**/api/gcs/aiusage', async (route) => {
            await route.fulfill({
                contentType: 'application/json',
                body: JSON.stringify(mockAiUsageData),
            });
        }),
    ]);
});

test('AI Usage Page', async ({ page }) => {
    await page.goto('/aiusage');
    await page.waitForSelector('text=土台をつくる');

    await expect(page.getByRole('heading', { name: 'AI 活用方法' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Homeへ戻る' })).toHaveAttribute('href', '/');

    // 原則がセクションより前に表示される
    await expect(page.getByText('意思決定権は人間にある。', { exact: false })).toBeVisible();

    // 4 セクションがデータの配列順に並ぶ
    const sectionTitles = await page.getByRole('heading', { level: 2 }).allTextContents();
    expect(sectionTitles).toEqual([
        '土台をつくる',
        '開発工程で使い分ける',
        '情報収集を自動化する',
        'AIに任せないこと',
    ]);

    // decision を持つ項目にだけ「人間 →」が出る（データ上は 9 件）
    await expect(page.getByText('人間 →')).toHaveCount(9);

    // url を持つ項目にだけリンクが出る（データ上は 1 件）
    const refLinks = page.getByRole('link', { name: /参考リンク/ });
    await expect(refLinks).toHaveCount(1);
    await expect(refLinks.first()).toHaveAttribute('target', '_blank');
    await expect(refLinks.first()).toHaveAttribute('rel', 'noopener noreferrer');

    // href="" のリンクが無い
    await expect(page.locator('a[href=""]')).toHaveCount(0);
});

// 準正常系: データが空
test('AI Usage Page (No Data)', async ({ page }) => {
    await page.route('**/api/gcs/aiusage', async (route) => {
        await route.fulfill({
            contentType: 'application/json',
            body: JSON.stringify({ aiusage: { principle: '原則', sections: [] } }),
        });
    });

    await page.goto('/aiusage');
    await expect(page.getByText('No AI usage data available.')).toBeVisible();
});

// 異常系: API 500 でもクラッシュせず空状態へフォールバックする
test('AI Usage Page (API Error 500 → graceful fallback)', async ({ page }) => {
    await page.route('**/api/gcs/aiusage', async (route) => {
        await route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Failed to fetch data from GCS' }),
        });
    });

    await page.goto('/aiusage');
    await expect(page.getByText('No AI usage data available.')).toBeVisible();
});

// 異常系: ネットワーク断でも同様にフォールバックする
test('AI Usage Page (Network Error → graceful fallback)', async ({ page }) => {
    await page.route('**/api/gcs/aiusage', async (route) => {
        await route.abort();
    });

    await page.goto('/aiusage');
    await expect(page.getByText('No AI usage data available.')).toBeVisible();
});
