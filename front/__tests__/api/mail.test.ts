// nanoid v5 は pure ESM のため、Jest（ts-jest / pnpm の .pnpm レイアウト）では
// 変換対象外となり読み込めない。/send のテストでは未使用なのでモックで置き換える。
jest.mock('nanoid', () => ({ nanoid: () => 'test-token' }));

// Resend（外部 I/O）をモックし、送信内容を検証できるようにする
const mockSend = jest.fn().mockResolvedValue({ id: 'mock-email-id' });
jest.mock('resend', () => ({
    Resend: jest.fn().mockImplementation(() => ({
        emails: { send: mockSend },
    })),
}));

import mailRouter from '@/app/api/mail/mail';

// 有効な CSRF トークン（ヘッダーは JSON 文字列 / Cookie は生値）を付けた /send リクエストを作る
function buildSendRequest(body: unknown, token = 'valid-token') {
    return new Request('http://localhost/send', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': JSON.stringify(token),
            Cookie: `csrfToken=${token}`,
        },
        body: JSON.stringify(body),
    });
}

describe('Mail Router - /send', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    // 正常系
    test('POST /send - Normal: 正常入力でメール送信し 200 を返す', async () => {
        const res = await mailRouter.fetch(
            buildSendRequest({
                name: 'Taro',
                email: 'taro@example.com',
                subjects: 'Hello',
                messages: 'Nice to meet you',
            }),
        );

        expect(res.status).toBe(200);
        expect(await res.json()).toEqual({ success: true, response: { id: 'mock-email-id' } });
        expect(mockSend).toHaveBeenCalledTimes(1);
    });

    // 準正常系: HTML を含む入力はエスケープして送信する（HTML インジェクション対策）
    test('POST /send - Semi-Normal: 入力の HTML をエスケープする', async () => {
        await mailRouter.fetch(
            buildSendRequest({
                name: '<script>alert(1)</script>',
                email: 'a@b.com',
                subjects: 'x',
                messages: 'line1\n<b>bold</b> & "q"',
            }),
        );

        expect(mockSend).toHaveBeenCalledTimes(1);
        const arg = mockSend.mock.calls[0][0];

        // 生の攻撃者制御タグは HTML 本文に含まれない
        expect(arg.html).not.toContain('<script>');
        expect(arg.html).not.toContain('<b>bold</b>');
        // エスケープ済みエンティティが含まれる
        expect(arg.html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
        expect(arg.html).toContain('&amp;');
        expect(arg.html).toContain('&quot;');
        // 改行は <br> に変換される
        expect(arg.html).toContain('line1<br>');
        // text 版はプレーンテキストなので生値のまま
        expect(arg.text).toContain('line1\n<b>bold</b> & "q"');
    });

    // 異常系: CSRF トークンなし → 403、送信は呼ばれない
    test('POST /send - Abnormal: CSRF トークンなしは 403', async () => {
        const res = await mailRouter.fetch(
            new Request('http://localhost/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'Taro',
                    email: 'taro@example.com',
                    subjects: 'Hello',
                    messages: 'Hi',
                }),
            }),
        );

        expect(res.status).toBe(403);
        expect(await res.json()).toEqual({ error: 'Invalid CSRF token' });
        expect(mockSend).not.toHaveBeenCalled();
    });

    // 異常系: ヘッダーとCookieのトークン不一致 → 403
    test('POST /send - Abnormal: トークン不一致は 403', async () => {
        const req = new Request('http://localhost/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': JSON.stringify('header-token'),
                Cookie: 'csrfToken=cookie-token',
            },
            body: JSON.stringify({
                name: 'Taro',
                email: 'taro@example.com',
                subjects: 'Hello',
                messages: 'Hi',
            }),
        });
        const res = await mailRouter.fetch(req);

        expect(res.status).toBe(403);
        expect(mockSend).not.toHaveBeenCalled();
    });

    // 異常系: 必須フィールド欠落 → 400
    test('POST /send - Abnormal: 必須フィールド欠落は 400', async () => {
        const res = await mailRouter.fetch(
            buildSendRequest({ name: '', email: 'a@b.com', subjects: 's', messages: '' }),
        );

        expect(res.status).toBe(400);
        expect(await res.json()).toEqual({ error: 'Missing required fields' });
        expect(mockSend).not.toHaveBeenCalled();
    });
});
