import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import { Resend } from 'resend';
import { nanoid } from 'nanoid';
import { getCookie, setCookie } from 'hono/cookie';
import { contactSchema } from '@/schemas/contact';
import { createRateLimiter } from '@/app/api/middleware/rate-limit';

/** CSRF トークン発行とメール送信を担うサブルーター（`/api/mail` 配下にマウント）。 */
const mailRouter = new Hono();

/** CSRF トークンの長さ（文字数）。推測を困難にするのに十分な長さ。 */
const CSRF_TOKEN_LENGTH = 32;
/** CSRF トークンを保持する Cookie 名。送信検証時に同名 Cookie と照合する。 */
const CSRF_COOKIE_NAME = 'csrfToken';

// レートリミットの閾値。送信は 1 通ごとに実メールが飛びコストと迷惑が発生するため厳しく、
// CSRF 発行はフォームを開くたびに呼ばれる正常操作なので緩くする。
/** レートリミットのウィンドウ長（ミリ秒）。 */
const RATE_LIMIT_WINDOW_MS = 60_000;
/** `POST /send` の 1 分あたり許可回数。連続送信の実用上限を踏まえた値。 */
const SEND_RATE_LIMIT = 3;
/** `GET /csrf` の 1 分あたり許可回数。画面遷移や再読み込みでの再取得を妨げない値。 */
const CSRF_RATE_LIMIT = 20;

/** 送信系のレートリミット。超過時は 429 を返す。 */
const sendRateLimiter = createRateLimiter({
    limit: SEND_RATE_LIMIT,
    windowMs: RATE_LIMIT_WINDOW_MS,
});
/** CSRF トークン発行のレートリミット。トークンの大量発行を抑える。 */
const csrfRateLimiter = createRateLimiter({
    limit: CSRF_RATE_LIMIT,
    windowMs: RATE_LIMIT_WINDOW_MS,
});
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

/**
 * CSRF トークンを発行し、HttpOnly Cookie にセットして返す。
 *
 * @param c - Hono コンテキスト
 * @returns 発行した CSRF トークン（200）。同トークンを HttpOnly Cookie にもセットする。
 */
mailRouter.get('/csrf', csrfRateLimiter, (c) => {
    const csrfToken = nanoid(CSRF_TOKEN_LENGTH);
    setCookie(c, CSRF_COOKIE_NAME, csrfToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Strict',
    });

    return c.json({ csrfToken });
});

// トークンを検証するミドルウェア
const csrfMiddleware: MiddlewareHandler = async (c, next) => {
    const csrfTokenFromHeader = c.req.header('x-csrf-token')?.trim();
    const csrfTokenFromCookie = getCookie(c, CSRF_COOKIE_NAME)?.trim();

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

/**
 * Mail API の疎通確認用エンドポイント。
 *
 * @param c - Hono コンテキスト
 * @returns 接続確認メッセージ（200）
 */
mailRouter.get('/', (c) => {
    return c.json({ message: 'Connected to Mail API' });
});

/**
 * お問い合わせ内容をメール送信する（CSRF ミドルウェアで保護）。
 *
 * リクエストは共有スキーマ（contactSchema）で検証し、HTML 本文はエスケープして
 * インジェクションを防ぐ。
 *
 * @param c - Hono コンテキスト
 * @returns 送信結果（200）。入力不正・メール設定欠落は 400、CSRF 不正は 403、送信失敗は 500。
 */
mailRouter.post('/send', sendRateLimiter, csrfMiddleware, async (c) => {
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
