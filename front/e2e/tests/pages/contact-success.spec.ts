import { test, expect } from '@playwright/test';
import mockCommonData from '../mock/common.json';
test.beforeEach(async ({ page }) => {
    // APIモック
    await Promise.all([
        page.route('**/api/gcs/common', async (route) => {
            await route.fulfill({
                contentType: 'application/json',
                body: JSON.stringify(mockCommonData),
            });
        }),
    ]);
});

test.describe('Contact Success Page', () => {
    test('送信成功画面の表示確認', async ({ page }) => {
        await page.goto('/contact/success');

        // ローディング完了待機
        await page.waitForSelector('text=送信が完了しました！');

        await expect(page.getByRole('heading', { name: '送信が完了しました！' })).toBeVisible();
        await expect(page.getByText('お問い合わせいただきありがとうございます。')).toBeVisible();
    });

    test('ホームへ戻るボタンの動作確認', async ({ page }) => {
        await page.goto('/contact/success');

        // ローディング完了待機
        await page.waitForSelector('text=送信が完了しました！');

        await page.getByRole('button', { name: 'ホームへ戻る' }).click();
        await expect(page).toHaveURL('/');
    });

    test('再度お問い合わせリンクの動作確認', async ({ page }) => {
        await page.goto('/contact/success');

        // ローディング完了待機
        await page.waitForSelector('text=送信が完了しました！');

        await page.getByRole('link', { name: '再度お問い合わせ' }).click();
        await expect(page).toHaveURL('/contact/form');
    });

    // 異常系: 共通データ取得が 500 でも完了画面はクラッシュせず表示される
    test('共通データ取得失敗（500）でも表示される', async ({ page }) => {
        await page.route('**/api/gcs/common', async (route) => {
            await route.fulfill({
                status: 500,
                contentType: 'application/json',
                body: JSON.stringify({ error: 'Failed to fetch data from GCS' }),
            });
        });

        await page.goto('/contact/success');

        await page.waitForSelector('text=送信が完了しました！');
        await expect(page.getByRole('heading', { name: '送信が完了しました！' })).toBeVisible();
    });
});
