import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import { Resend } from 'resend';
import { nanoid } from 'nanoid';
import { getCookie, setCookie } from 'hono/cookie';
import { contactSchema } from '@/app/schema/contact-schema';

// Honoのインスタンスを作成
const mailRouter = new Hono();
// Resendクライアントの初期化
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * HTML の特殊文字をエスケープする。
 *
 * お問い合わせフォームの入力値をメール本文（HTML）へ埋め込む際、受信者（サイト運営者）宛の
 * HTML インジェクション（偽装リンク・なりすまし等のフィッシング）を防ぐために使用する。
 *
 * @param value - エスケープ対象の文字列
 * @returns HTML エンティティ化した文字列
 */
const escapeHtml = (value: string): string =>
    value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

// CSRFトークンを発行するエンドポイント
mailRouter.get('/csrf', (c) => {
    const csrfToken = nanoid(32);
    setCookie(c, 'csrfToken', csrfToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
    });

    return c.json({ csrfToken });
});

// トークンを検証するミドルウェア
const csrfMiddleware: MiddlewareHandler = async (c, next) => {
    const csrfTokenFromHeader = c.req.header('x-csrf-token')?.trim();
    const csrfTokenFromCookie = getCookie(c, 'csrfToken')?.trim();

    // ヘッダーは JSON 文字列で送られてくる。不正な JSON は検証失敗（403）として扱い、
    // JSON.parse の例外が 500 として漏れないようにする。
    let parsedCsrfTokenFromHeader: unknown = null;
    try {
        parsedCsrfTokenFromHeader = csrfTokenFromHeader ? JSON.parse(csrfTokenFromHeader) : null;
    } catch {
        parsedCsrfTokenFromHeader = null;
    }

    if (!parsedCsrfTokenFromHeader || parsedCsrfTokenFromHeader !== csrfTokenFromCookie) {
        return c.json({ error: 'Invalid CSRF token' }, 403);
    }

    await next();
};

// 動作確認用のエンドポイント
mailRouter.get('/', (c) => {
    return c.json({ message: 'Connected to Mail API' });
});

// メール送信のエンドポイント
mailRouter.post('/send', csrfMiddleware, async (c) => {
    try {
        // c.req.json() は any を返すため unknown 相当で受け、共有スキーマ（クライアントと同一）で検証する。
        const parsed = contactSchema.safeParse(await c.req.json());
        if (!parsed.success) {
            // 最初のバリデーションエラーメッセージを返す（統一エラーレスポンス）
            return c.json(
                { error: parsed.error.issues[0]?.message ?? 'Invalid request body' },
                400,
            );
        }
        const { name, email, subjects, messages } = parsed.data;

        // 送信に必要な環境変数が未設定なら暗黙フォールバックせず明示的に 400 を返す（GCS ルートと対称）。
        const sendDomain = process.env.RESEND_SEND_DOMAIN;
        const toAddress = process.env.MY_MAIL_ADDRESS;
        if (!process.env.RESEND_API_KEY || !sendDomain || !toAddress) {
            return c.json({ error: 'Mail service is not configured' }, 400);
        }

        const response = await resend.emails.send({
            from: `Resend <${sendDomain}@resend.dev>`,
            to: toAddress,
            subject: subjects,
            // 入力値は HTML エスケープしてから埋め込む（HTML インジェクション対策）。
            // 本文の改行は <br> に変換して表示を保つ。
            html: `<p><b>From:</b> ${escapeHtml(name)} (${escapeHtml(email)})</p><p>${escapeHtml(
                messages,
            ).replace(/\n/g, '<br>')}</p>`,
            // プレーンテキスト版（エスケープ不要）も併せて送る
            text: `From: ${name} (${email})\n\n${messages}`,
        });

        return c.json({ success: true, response: response });
    } catch (error) {
        // スタックトレースを残すため error オブジェクト自体を渡す（GCS ルートと対称）。
        // メール本文・APIキー等のセンシティブ情報はログに含めない。
        if (error instanceof Error) {
            console.error('Resend Error:', error.message, error);
        } else {
            console.error('Resend Error:', error);
        }
        return c.json({ error: 'Failed to send email' }, 500);
    }
});

export default mailRouter;
