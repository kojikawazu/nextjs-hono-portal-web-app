import { test, expect } from '@playwright/test';
import mockCommonData from '../mock/common.json';

const mockFormData = {
    name: '山田太郎',
    email: 'taro@example.com',
    subjects: 'お問い合わせテスト',
    messages: 'お問い合わせ内容のテストです。',
};

test.beforeEach(async ({ page }) => {
    // セッションストレージにモックデータをセット
    await page.addInitScript((data) => {
        sessionStorage.setItem('contactFormData', JSON.stringify(data));
        sessionStorage.setItem('csrfToken', 'mock-csrf-token');
    }, mockFormData);

    // APIモック
    await Promise.all([
        page.route('**/api/gcs/common', async (route) => {
            await route.fulfill({
                contentType: 'application/json',
                body: JSON.stringify(mockCommonData),
            });
        }),
        await page.route('**/api/mail/send', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({ success: true }),
            });
        }),
    ]);
});

// 表示テスト
test('Contact Confirm Page - display check', async ({ page }) => {
    await page.goto('/contact/confirm');

    // ローディング完了待機
    await page.waitForSelector('text=確認画面');

    await expect(page.getByRole('heading', { name: '確認画面' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'フォームへ戻る' })).toBeVisible();
    await expect(page.getByText('この内容でよろしいでしょうか？')).toBeVisible();

    await expect(page.getByText('お名前:')).toBeVisible();
    await expect(page.getByText(mockFormData.name)).toBeVisible();

    await expect(page.getByText('メールアドレス:')).toBeVisible();
    await expect(page.getByText(mockFormData.email)).toBeVisible();

    await expect(page.getByText('件名:')).toBeVisible();
    await expect(page.getByText(mockFormData.subjects)).toBeVisible();

    await expect(page.getByText('メッセージ:')).toBeVisible();
    await expect(page.getByText(mockFormData.messages)).toBeVisible();

    await expect(page.getByRole('button', { name: '確認して送信' })).toBeVisible();
    await expect(page.getByRole('button', { name: '修正する' })).toBeVisible();
});

// フォームへ戻るテスト
test('Contact Confirm Page - back to form', async ({ page }) => {
    await page.goto('/contact/confirm');

    // ローディング完了待機
    await page.waitForSelector('text=確認画面');

    // フォームへ戻るボタンをクリック
    await page.getByRole('button', { name: 'フォームへ戻る' }).click();
    await expect(page).toHaveURL('/contact/form');
});

// 修正ボタンテスト
test('Contact Confirm Page - correction button check', async ({ page }) => {
    await page.goto('/contact/confirm');

    // ローディング完了待機
    await page.waitForSelector('text=確認画面');

    // 修正ボタンをクリック
    await page.getByRole('button', { name: '修正する' }).click();
    await expect(page).toHaveURL('/contact/form');
});

// 送信テスト (モーダル確認〜送信完了まで)
test('Contact Confirm Page - send process check', async ({ page }) => {
    await page.goto('/contact/confirm');

    // ローディング完了待機
    await page.waitForSelector('text=確認画面');

    // 「確認して送信」ボタンをクリック
    await page.getByRole('button', { name: '確認して送信' }).click();

    // 確認モーダー表示待ち
    await page.waitForSelector('text=本当に送信してもよろしいでしょうか？');

    // 確認モーダル表示を確認
    await expect(page.getByRole('heading', { name: '確認', exact: true })).toBeVisible();
    await expect(page.getByText('本当に送信してもよろしいでしょうか？')).toBeVisible();
    await expect(page.getByRole('button', { name: '送信する' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'キャンセル' })).toBeVisible();

    // モーダー内の「送信する」ボタンをクリック
    await page.getByRole('button', { name: '送信する' }).click();

    // 送信成功後にページ遷移確認
    await expect(page).toHaveURL('/contact/success');
});

// 送信しないテスト
test('Contact Confirm Page - send not', async ({ page }) => {
    await page.goto('/contact/confirm');

    // ローディング完了待機
    await page.waitForSelector('text=確認画面');

    // 「修正する」ボタンをクリック
    await page.getByRole('button', { name: '確認して送信' }).click();

    // 確認モーダー表示を確認
    await expect(page.getByText('本当に送信してもよろしいでしょうか？')).toBeVisible();
    // モーダー内の「キャンセル」ボタンをクリック
    await page.getByRole('button', { name: 'キャンセル' }).click();

    // ページ遷移確認
    await expect(page).toHaveURL('/contact/confirm');
});
