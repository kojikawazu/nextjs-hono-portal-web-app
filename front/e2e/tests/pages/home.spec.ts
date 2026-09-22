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
    await expect(page.getByRole('link', { name: 'AI 活用方法' })).toHaveAttribute(
        'href',
        '/aiusage',
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

// 異常系: 共通データ取得が 500 でもページはクラッシュせずヒーローが描画される
test('Top Page (common data error → graceful render)', async ({ page }) => {
    await page.route('**/api/gcs/common', async (route) => {
        await route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Failed to fetch data from GCS' }),
        });
    });

    await page.goto('/');

    // commonData が null でも静的なヒーローは表示される
    await expect(page.getByText('Developers Hub')).toBeVisible();
    await expect(page.getByText(/Crafting Digital\s*Experiences/)).toBeVisible();
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

test('AI Usage Page', async ({ page }) => {
    await page.goto('/');

    await page.click('a[href="/aiusage"]');
    await expect(page).toHaveURL('/aiusage');
});

test('Contact Form Page', async ({ page }) => {
    await page.goto('/');

    await page.click('a[href="/contact/form"]');
    await expect(page).toHaveURL('/contact/form');
});

// 不正な URL（javascript: / http / 壊れた文字列）はリンクごと描画しない。
// href="" の「押すとリロードされるだけのリンク」を作らないことの回帰テスト。
test('Top Page (不正な URL はリンクごと非表示)', async ({ page }) => {
    await page.route('**/api/gcs/common', async (route) => {
        await route.fulfill({
            contentType: 'application/json',
            body: JSON.stringify({
                portfolio: { url: 'javascript:alert(1)' },
                blog: { url: 'http://mock-blog.com' },
                link: {
                    github: 'https://github.com/mock-user',
                    x: 'not a url',
                    linkedin: 'https://linkedin.com/mock-user',
                },
            }),
        });
    });

    await page.goto('/');

    // Navbar: ポートフォリオ（javascript:）とブログ（http）は項目ごと消える
    await expect(page.getByRole('link', { name: 'ポートフォリオ' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'ブログ' })).toHaveCount(0);
    // Hero のボタンも消える
    await expect(page.getByRole('link', { name: 'View Portfolio' })).toHaveCount(0);

    // 内部リンクは影響を受けない
    await expect(page.getByRole('link', { name: '個人開発履歴' })).toHaveAttribute(
        'href',
        '/personaldev',
    );

    // href="" のリンクがページ内に 1 つも無い
    await expect(page.locator('a[href=""]')).toHaveCount(0);
});
