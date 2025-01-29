import { Hono } from 'hono';
import { MiddlewareHandler } from 'hono';
import { Resend } from 'resend';
import { nanoid } from 'nanoid';
import { getCookie, setCookie } from 'hono/cookie';

// Honoのインスタンスを作成
const mailRouter = new Hono();
// Resendクライアントの初期化
const resend = new Resend(process.env.RESEND_API_KEY);

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

    const parsedCsrfTokenFromHeader = csrfTokenFromHeader ? JSON.parse(csrfTokenFromHeader) : null;

    console.log('csrfTokenFromHeader:', parsedCsrfTokenFromHeader);
    console.log('csrfTokenFromCookie:', csrfTokenFromCookie);
    console.log(
        'parsedCsrfTokenFromHeader === csrfTokenFromCookie: ',
        parsedCsrfTokenFromHeader === csrfTokenFromCookie,
    );

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
        console.log('send mail...');

        const { name, email, subjects, messages } = await c.req.json();
        if (!name || !email || !subjects || !messages) {
            return c.json({ error: 'Missing required fields' }, 400);
        }

        console.log(`${name}: send mail...`);
        const response = await resend.emails.send({
            from: `Resend <${process.env.RESEND_SEND_DOMAIN}@resend.dev>`,
            to: process.env.MY_MAIL_ADDRESS || 'no-reply@example.com',
            subject: subjects,
            html: `<p><b>From:</b> ${name} (${email})</p><p>${messages}</p>`,
        });

        console.log(`${name}: use resend end.`);
        return c.json({ success: true, response: response });
    } catch (error) {
        if (error instanceof Error) {
            console.error('Resend Error:', error.message);
        } else {
            console.error('Resend Error:', error);
        }
        return c.json({ error: 'Failed to send email' }, 500);
    }
});

export default mailRouter;
