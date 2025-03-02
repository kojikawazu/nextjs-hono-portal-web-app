import { test, expect } from '@playwright/test';
import mockCommonData from '../mock/common.json';

test.beforeEach(async ({ page }) => {
    // APIモック
    await page.route('**/api/gcs/common', async (route) => {
        await route.fulfill({
            contentType: 'application/json',
            body: JSON.stringify(mockCommonData),
        });
    });
});

test('Top Page', async ({ page }) => {
    await page.goto('/');

    // ページタイトル確認
    await expect(page).toHaveTitle('My Developers Hub');

    // ナビゲーションバーのリンク確認
    await expect(page.getByRole('link', { name: 'My Tech Hub' })).toHaveAttribute('href', '/');

    await expect(page.getByRole('link', { name: 'ポートフォリオ' })).toHaveAttribute(
        'href',
        'https://mock-portfolio.com',
    );
    await expect(page.getByRole('link', { name: '個人開発履歴' })).toHaveAttribute(
        'href',
        '/personaldev',
    );
    await expect(page.getByRole('link', { name: 'サンプル開発履歴' })).toHaveAttribute(
        'href',
        '/sampledev',
    );
    await expect(page.getByRole('link', { name: 'ブログ' })).toHaveAttribute(
        'href',
        'https://mock-blog.com',
    );
    await expect(page.getByRole('link', { name: 'Contact' })).toHaveAttribute(
        'href',
        '/contact/form',
    );

    // メインコンテンツのテキスト確認
    await expect(page.getByText('Developers Hub')).toBeVisible();
    await expect(page.getByText(/Crafting Digital\s*Experiences/)).toBeVisible();
    await expect(page.getByText('フロントエンド、バックエンド、インフラまで。')).toBeVisible();

    // ボタンリンク確認
    await expect(page.getByRole('link', { name: 'View Portfolio' })).toHaveAttribute(
        'href',
        'https://mock-portfolio.com',
    );
    await expect(page.getByRole('link', { name: 'Contact' })).toHaveAttribute(
        'href',
        '/contact/form',
    );
});

test('My Tech Hub Page', async ({ page }) => {
    await page.goto('/');

    await page.click('a[href="/"]');
    await expect(page).toHaveURL('/');
});

test('Personal Dev Page', async ({ page }) => {
    await page.goto('/');

    await page.click('a[href="/personaldev"]');
    await expect(page).toHaveURL('/personaldev');
});

test('Sample Dev Page', async ({ page }) => {
    await page.goto('/');

    await page.click('a[href="/sampledev"]');
    await expect(page).toHaveURL('/sampledev');
});

test('Contact Form Page', async ({ page }) => {
    await page.goto('/');

    await page.click('a[href="/contact/form"]');
    await expect(page).toHaveURL('/contact/form');
});
