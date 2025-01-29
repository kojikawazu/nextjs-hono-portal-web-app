import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { cors } from 'hono/cors';
// router
import gcsRouter from '@/app/api/gcs/gcs';
import mailRouter from '@/app/api/mail/mail';
export const runtime = 'nodejs';

// Honoのインスタンスを作成
const app = new Hono().basePath('/api');

// 許可するオリジンを設定（この開発プロジェクトのオリジンのみを指定）
const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:3000';

// CORS ミドルウェアを追加
app.use(
    '*',
    cors({
        origin: (origin) => {
            // 許可するオリジンかを判定
            if (origin === allowedOrigin) {
                return origin;
            }
            return null;
        },
        allowMethods: ['GET', 'POST', 'OPTIONS'],
        allowHeaders: ['Content-Type'],
    }),
);

// ルーティング
app.get('/hello', (c) => {
    return c.json({ message: 'Connected to Hono API' });
});

// サブルーティング
app.route('/gcs', gcsRouter);
app.route('/mail', mailRouter);

export const GET = handle(app);
export const POST = handle(app);
