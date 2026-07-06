import { test, expect } from '@playwright/test';
import mockCommonData from '../mock/common.json';
import mockCsrfData from '../mock/csrf.json';

test.beforeEach(async ({ page }) => {
    await Promise.all([
        page.route('**/api/gcs/common', async (route) => {
            await route.fulfill({
                contentType: 'application/json',
                body: JSON.stringify(mockCommonData),
            });
        }),
        page.route('**/api/mail/csrf', async (route) => {
            await route.fulfill({
                contentType: 'application/json',
                body: JSON.stringify(mockCsrfData),
            });
        }),
    ]);
});

test('Contact Form Page - input form display', async ({ page }) => {
    await page.goto('/contact/form');

    // ページタイトルとリンクを確認
    await expect(page.getByRole('heading', { name: 'お問い合わせ' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Homeへ戻る' })).toHaveAttribute('href', '/');

    // 各フォーム要素が表示されていることを確認
    await expect(page.getByLabel('お名前')).toBeVisible();
    await expect(page.getByLabel('メールアドレス')).toBeVisible();
    await expect(page.getByLabel('件名')).toBeVisible();
    await expect(page.getByLabel('メッセージ')).toBeVisible();
    await expect(page.getByRole('button', { name: '送信する' })).toBeVisible();
});

test('Contact Form Page - normal send', async ({ page }) => {
    await page.goto('/contact/form');

    // 入力をシミュレーション
    await page.fill('input[name="name"]', 'テスト 太郎');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="subjects"]', 'お問い合わせテスト');
    await page.fill('textarea[name="messages"]', 'これはテストメッセージです。');

    // 送信ボタンクリック後のページ遷移確認
    await page.click('button[type="submit"]');
    await page.waitForURL('**/contact/confirm');

    // 確認ページへの遷移を検証
    expect(page.url()).toContain('/contact/confirm');
});

test('Contact Form Page - input error', async ({ page }) => {
    await page.goto('/contact/form');

    // 空欄で送信
    await page.click('button[type="submit"]');

    // 各入力項目のエラーメッセージ確認
    await expect(page.getByText('名前を入力してください')).toBeVisible();
    await expect(page.getByText('メールアドレスを入力してください')).toBeVisible();
    await expect(page.getByText('件名を入力してください')).toBeVisible();
    await expect(page.getByText('お問い合わせ内容を入力してください')).toBeVisible();
});
