import type { contactFormData } from '@/schemas/contact';
import { csrfResponseSchema } from '@/schemas/contact';
import { fetchJson, fetchOk } from './http';

/** CSRF トークン発行エンドポイント。 */
const CSRF_ENDPOINT = '/api/mail/csrf';
/** メール送信エンドポイント。 */
const SEND_MAIL_ENDPOINT = '/api/mail/send';

/**
 * CSRF トークンを取得する。
 *
 * トークンはサーバーが Cookie にも設置するため、`credentials: 'include'` が必須。
 * これを外すと送信時に Cookie とヘッダーの突き合わせに失敗する。
 *
 * @returns 発行された CSRF トークン
 * @throws {ApiError} 通信失敗・非 2xx・応答形状の不一致
 */
export async function fetchCsrfToken(): Promise<string> {
    const { csrfToken } = await fetchJson(CSRF_ENDPOINT, csrfResponseSchema, {
        credentials: 'include',
    });
    return csrfToken;
}

/**
 * お問い合わせ内容をメール送信する。
 *
 * @param data - 送信するフォームデータ（呼び出し側で `contactSchema` 検証済み）
 * @param csrfToken - `fetchCsrfToken` で取得したトークン。Cookie 側の値と突き合わせられる
 * @throws {ApiError} 通信失敗・非 2xx
 */
export async function sendContactMail(data: contactFormData, csrfToken: string): Promise<void> {
    await fetchOk(SEND_MAIL_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken,
        },
        credentials: 'include',
        body: JSON.stringify(data),
    });
}
