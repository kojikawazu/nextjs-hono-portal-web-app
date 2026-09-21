import { Hono } from 'hono';
import { createRateLimiter } from '@/app/api/middleware/rate-limit';

const WINDOW_MS = 60_000;

/**
 * レートリミッターだけを載せた検証用アプリを組み立てる。
 *
 * リミッターの状態は生成した関数が抱えるため、テストごとに作り直して分離する。
 *
 * @param limit - ウィンドウ内に許可する回数
 * @param maxTrackedClients - 追跡クライアント数の上限
 * @returns `GET /` が 200 を返すだけの Hono アプリ
 */
const buildApp = (limit: number, maxTrackedClients?: number) => {
    const app = new Hono();
    app.use('*', createRateLimiter({ limit, windowMs: WINDOW_MS, maxTrackedClients }));
    app.get('/', (c) => c.json({ ok: true }));
    return app;
};

/**
 * 指定クライアントからのリクエストを作る。
 *
 * @param headers - 付与するヘッダー（IP 識別用）
 * @returns 検証用アプリへのリクエスト
 */
const request = (headers: Record<string, string> = {}) =>
    new Request('http://localhost/', { headers });

describe('createRateLimiter', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2026-09-21T00:00:00Z'));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    // 正常系
    it('上限までは通す', async () => {
        const app = buildApp(3);
        const ip = { 'CF-Connecting-IP': '203.0.113.1' };

        for (let i = 0; i < 3; i += 1) {
            expect((await app.fetch(request(ip))).status).toBe(200);
        }
    });

    it('別のクライアントは独立して数える', async () => {
        const app = buildApp(1);

        expect((await app.fetch(request({ 'CF-Connecting-IP': '203.0.113.1' }))).status).toBe(200);
        // 1 件目のクライアントは使い切っているが、別 IP は影響を受けない
        expect((await app.fetch(request({ 'CF-Connecting-IP': '203.0.113.2' }))).status).toBe(200);
        expect((await app.fetch(request({ 'CF-Connecting-IP': '203.0.113.1' }))).status).toBe(429);
    });

    // 準正常系: 想定内の超過
    it('上限を超えたら 429 と統一エラーレスポンスを返す', async () => {
        const app = buildApp(2);
        const ip = { 'CF-Connecting-IP': '203.0.113.1' };

        await app.fetch(request(ip));
        await app.fetch(request(ip));
        const res = await app.fetch(request(ip));

        expect(res.status).toBe(429);
        expect(await res.json()).toEqual({ error: 'Too many requests. Please try again later.' });
    });

    it('429 には Retry-After を秒数で付ける', async () => {
        const app = buildApp(1);
        const ip = { 'CF-Connecting-IP': '203.0.113.1' };

        await app.fetch(request(ip));
        jest.advanceTimersByTime(20_000);
        const res = await app.fetch(request(ip));

        expect(res.status).toBe(429);
        // 最初の記録から 60 秒後に空きが出るため、20 秒経過時点の残りは 40 秒
        expect(res.headers.get('Retry-After')).toBe('40');
    });

    it('ウィンドウを過ぎれば再び通す', async () => {
        const app = buildApp(1);
        const ip = { 'CF-Connecting-IP': '203.0.113.1' };

        expect((await app.fetch(request(ip))).status).toBe(200);
        expect((await app.fetch(request(ip))).status).toBe(429);

        jest.advanceTimersByTime(WINDOW_MS + 1);

        expect((await app.fetch(request(ip))).status).toBe(200);
    });

    it('固定ウィンドウではなくスライディングウィンドウで数える', async () => {
        const app = buildApp(2);
        const ip = { 'CF-Connecting-IP': '203.0.113.1' };

        // ウィンドウ境界の直前に上限まで使い切る
        jest.advanceTimersByTime(59_000);
        expect((await app.fetch(request(ip))).status).toBe(200);
        expect((await app.fetch(request(ip))).status).toBe(200);

        // 固定ウィンドウ（分単位のバケット）なら 60 秒を跨いだ時点で枠がリセットされ、
        // 1.5 秒の間に上限の 2 倍を通せてしまう。スライディングでは 59 秒時点の 2 件が
        // まだウィンドウ内に残るため通さない。
        jest.advanceTimersByTime(1_500);
        expect((await app.fetch(request(ip))).status).toBe(429);
    });

    // クライアント識別
    it('cf-connecting-ip を x-forwarded-for より優先する', async () => {
        const app = buildApp(1);

        await app.fetch(
            request({ 'CF-Connecting-IP': '203.0.113.1', 'X-Forwarded-For': '198.51.100.1' }),
        );
        // cf-connecting-ip が同じなら、x-forwarded-for が違っても同一クライアント
        const res = await app.fetch(
            request({ 'CF-Connecting-IP': '203.0.113.1', 'X-Forwarded-For': '198.51.100.9' }),
        );

        expect(res.status).toBe(429);
    });

    it('x-forwarded-for は先頭のアドレスを使う', async () => {
        const app = buildApp(1);

        await app.fetch(request({ 'X-Forwarded-For': '198.51.100.1, 10.0.0.1' }));
        const res = await app.fetch(request({ 'X-Forwarded-For': '198.51.100.1, 10.0.0.2' }));

        // 経由プロキシ（2 番目以降）が違っても、元のクライアントが同じなら同一とみなす
        expect(res.status).toBe(429);
    });

    // 異常系
    it('識別ヘッダーが無い場合はまとめて絞る', async () => {
        const app = buildApp(1);

        expect((await app.fetch(request())).status).toBe(200);
        // 個別に通すより、識別できないものはまとめて制限するほうが安全側
        expect((await app.fetch(request())).status).toBe(429);
    });

    it('追跡クライアント数が上限を超えたら古いものから捨てる', async () => {
        const app = buildApp(1, 2);

        await app.fetch(request({ 'CF-Connecting-IP': '203.0.113.1' }));
        await app.fetch(request({ 'CF-Connecting-IP': '203.0.113.2' }));
        // 3 件目の登録で最も古い 203.0.113.1 が押し出される
        await app.fetch(request({ 'CF-Connecting-IP': '203.0.113.3' }));

        // 押し出された結果、記録が消えて再び通る（メモリ非有界化を防ぐ代償）
        expect((await app.fetch(request({ 'CF-Connecting-IP': '203.0.113.1' }))).status).toBe(200);
        // 直近のクライアントは記録が残っているため引き続き 429
        expect((await app.fetch(request({ 'CF-Connecting-IP': '203.0.113.3' }))).status).toBe(429);
    });
});
