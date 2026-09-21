import { ApiError } from '@/repositories/http';
import { fetchCsrfToken, sendContactMail } from '@/repositories/contact';

const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

const jsonResponse = (body: unknown) =>
    ({ ok: true, status: 200, statusText: 'OK', json: async () => body }) as unknown as Response;

const formData = {
    name: '山田太郎',
    email: 'taro@example.com',
    subjects: 'お問い合わせ',
    messages: '本文',
};

describe('repositories/contact', () => {
    beforeEach(() => {
        mockFetch.mockReset();
    });

    describe('fetchCsrfToken', () => {
        // 正常系
        it('トークンを返し、Cookie 送信のため credentials: include を付ける', async () => {
            mockFetch.mockResolvedValueOnce(jsonResponse({ csrfToken: 'token-123' }));

            await expect(fetchCsrfToken()).resolves.toBe('token-123');
            // credentials を外すとサーバー側で Cookie とヘッダーの突き合わせに失敗する
            expect(mockFetch).toHaveBeenCalledWith('/api/mail/csrf', {
                credentials: 'include',
            });
        });

        // 準正常系
        it('csrfToken が無ければ kind=schema の ApiError を投げる', async () => {
            mockFetch.mockResolvedValueOnce(jsonResponse({}));

            const error = await fetchCsrfToken().catch((e: unknown) => e);

            expect(error).toBeInstanceOf(ApiError);
            expect((error as ApiError).kind).toBe('schema');
        });

        it('非 2xx なら kind=status の ApiError を投げる', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
                json: async () => ({}),
            } as unknown as Response);

            const error = await fetchCsrfToken().catch((e: unknown) => e);

            expect((error as ApiError).kind).toBe('status');
        });

        // 異常系
        it('通信自体が失敗したら kind=network の ApiError を投げる', async () => {
            mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

            const error = await fetchCsrfToken().catch((e: unknown) => e);

            expect((error as ApiError).kind).toBe('network');
        });
    });

    describe('sendContactMail', () => {
        // 正常系
        it('CSRF トークンをヘッダーに載せて POST する', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                statusText: 'OK',
                json: async () => ({}),
            } as unknown as Response);

            await expect(sendContactMail(formData, 'token-123')).resolves.toBeUndefined();

            expect(mockFetch).toHaveBeenCalledWith('/api/mail/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': 'token-123',
                },
                credentials: 'include',
                body: JSON.stringify(formData),
            });
        });

        // 準正常系
        it('CSRF 検証に失敗した 403 では kind=status の ApiError を投げる', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 403,
                statusText: 'Forbidden',
                json: async () => ({}),
            } as unknown as Response);

            const error = await sendContactMail(formData, 'invalid').catch((e: unknown) => e);

            expect(error).toBeInstanceOf(ApiError);
            expect((error as ApiError).status).toBe(403);
        });

        it('サーバーエラー 500 でも kind=status の ApiError を投げる', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
                json: async () => ({}),
            } as unknown as Response);

            const error = await sendContactMail(formData, 'token-123').catch((e: unknown) => e);

            expect((error as ApiError).status).toBe(500);
        });

        // 異常系
        it('通信自体が失敗したら kind=network の ApiError を投げる', async () => {
            mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

            const error = await sendContactMail(formData, 'token-123').catch((e: unknown) => e);

            expect((error as ApiError).kind).toBe('network');
        });
    });
});
