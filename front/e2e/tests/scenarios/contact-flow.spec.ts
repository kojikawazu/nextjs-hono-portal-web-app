import { test, expect } from '@playwright/test';
import mockCommonData from '../mock/common.json';
import mockCsrfData from '../mock/csrf.json';

// お問い合わせの一連フロー（入力 → 確認 → 送信完了）を、画面をまたいで通しで検証するシナリオテスト。
// 各画面を個別に検証する pages/ 配下と違い、sessionStorage を手で seed せず、
// 実際のユーザー操作（フォーム入力 → 遷移 → 送信）だけで状態を引き継ぐ。
test.beforeEach(async ({ page }) => {
    await page.route('**/api/gcs/common', async (route) => {
        await route.fulfill({
            contentType: 'application/json',
            body: JSON.stringify(mockCommonData),
        });
    });
    // フォーム読み込み時に CSRF トークンを取得する
    await page.route('**/api/mail/csrf', async (route) => {
        await route.fulfill({
            contentType: 'application/json',
            body: JSON.stringify(mockCsrfData),
        });
    });
    // 送信は成功（実 Resend は叩かない）
    await page.route('**/api/mail/send', async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ success: true }),
        });
    });
});

const input = {
    name: 'シナリオ 太郎',
    email: 'scenario@example.com',
    subjects: 'シナリオテスト',
    messages: 'これは入力→確認→送信完了までの一連フローのテストです。',
};

async function fillForm(page: import('@playwright/test').Page) {
    await page.fill('input[name="name"]', input.name);
    await page.fill('input[name="email"]', input.email);
    await page.fill('input[name="subjects"]', input.subjects);
    await page.fill('textarea[name="messages"]', input.messages);
}

test('お問い合わせ: 入力 → 確認 → 送信完了 の一連フロー', async ({ page }) => {
    // 1. フォーム入力
    await page.goto('/contact/form');
    await expect(page.getByRole('heading', { name: 'お問い合わせ' })).toBeVisible();
    await fillForm(page);

    // 2. 送信 → 確認画面へ遷移し、入力内容が引き継がれている
    await page.click('button[type="submit"]');
    await page.waitForURL('**/contact/confirm');
    await expect(page.getByText(input.name)).toBeVisible();
    await expect(page.getByText(input.email)).toBeVisible();
    await expect(page.getByText(input.subjects)).toBeVisible();
    await expect(page.getByText(input.messages)).toBeVisible();

    // 3. 確認して送信 → モーダル → 送信する
    await page.getByRole('button', { name: '確認して送信' }).click();
    await page.waitForSelector('text=本当に送信してもよろしいでしょうか？');
    await page.getByRole('button', { name: '送信する' }).click();

    // 4. 送信完了画面へ
    await expect(page).toHaveURL('/contact/success');
    await expect(page.getByRole('heading', { name: '送信が完了しました！' })).toBeVisible();
});

test('お問い合わせ: 入力 → 確認 → 修正 → 再入力 → 送信完了 の往復フロー', async ({ page }) => {
    // 1. 入力して確認画面へ
    await page.goto('/contact/form');
    await fillForm(page);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/contact/confirm');

    // 2. 「修正する」でフォームへ戻る（sessionStorage はクリアされ、フォームは空）
    await page.getByRole('button', { name: '修正する' }).click();
    await expect(page).toHaveURL('/contact/form');
    await expect(page.locator('input[name="name"]')).toHaveValue('');

    // 3. 再入力して確認 → 送信 → 完了
    await fillForm(page);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/contact/confirm');
    await expect(page.getByText(input.name)).toBeVisible();

    await page.getByRole('button', { name: '確認して送信' }).click();
    await page.waitForSelector('text=本当に送信してもよろしいでしょうか？');
    await page.getByRole('button', { name: '送信する' }).click();

    await expect(page).toHaveURL('/contact/success');
    await expect(page.getByRole('heading', { name: '送信が完了しました！' })).toBeVisible();
});
