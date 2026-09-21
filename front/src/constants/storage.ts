/**
 * クライアントの sessionStorage キー。
 * お問い合わせフォームの入力値と CSRF トークンの一時保持に使う。
 * サーバー側の Cookie 名（mail API の CSRF Cookie）とは別管理。
 */
export const STORAGE_KEYS = {
    /** お問い合わせフォームの入力値 */
    CONTACT_FORM: 'contactFormData',
    /** CSRF トークン（クライアント保持分） */
    CSRF_TOKEN: 'csrfToken',
} as const;
