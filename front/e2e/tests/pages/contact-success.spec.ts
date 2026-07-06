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
});
