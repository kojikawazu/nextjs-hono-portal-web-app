import { z } from 'zod';
import { ApiError, fetchJson, fetchOk } from '@/repositories/http';

// 外部 I/O（HTTP 通信）のみモックする。スキーマ検証・エラー分類のロジックはモックしない。
const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

/** 2xx の JSON 応答を作る。 */
const jsonResponse = (body: unknown) =>
    ({ ok: true, status: 200, statusText: 'OK', json: async () => body }) as unknown as Response;

const schema = z.object({ value: z.string() });

describe('repositories/http', () => {
    beforeEach(() => {
        mockFetch.mockReset();
    });

    describe('fetchJson', () => {
        // 正常系
        it('スキーマ検証を通った応答を返す', async () => {
            mockFetch.mockResolvedValueOnce(jsonResponse({ value: 'ok' }));

            await expect(fetchJson('/api/x', schema)).resolves.toEqual({ value: 'ok' });
            expect(mockFetch).toHaveBeenCalledWith('/api/x', undefined);
        });

        it('init をそのまま fetch へ渡す', async () => {
            mockFetch.mockResolvedValueOnce(jsonResponse({ value: 'ok' }));

            await fetchJson('/api/x', schema, { credentials: 'include' });

            expect(mockFetch).toHaveBeenCalledWith('/api/x', { credentials: 'include' });
        });

        // 準正常系: 想定内の異常応答
        it('非 2xx なら kind=status の ApiError を投げ、ステータスを保持する', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error',
                json: async () => ({}),
            } as unknown as Response);

            const error = await fetchJson('/api/x', schema).catch((e: unknown) => e);

            expect(error).toBeInstanceOf(ApiError);
            expect((error as ApiError).kind).toBe('status');
            expect((error as ApiError).status).toBe(500);
        });

        it('応答がスキーマと一致しなければ kind=schema の ApiError を投げる', async () => {
            mockFetch.mockResolvedValueOnce(jsonResponse({ value: 123 }));

            const error = await fetchJson('/api/x', schema).catch((e: unknown) => e);

            expect(error).toBeInstanceOf(ApiError);
            expect((error as ApiError).kind).toBe('schema');
        });

        it('応答が JSON として解釈できなければ kind=schema の ApiError を投げる', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 200,
                statusText: 'OK',
                json: async () => {
                    throw new SyntaxError('Unexpected token');
                },
            } as unknown as Response);

            const error = await fetchJson('/api/x', schema).catch((e: unknown) => e);

            expect(error).toBeInstanceOf(ApiError);
            expect((error as ApiError).kind).toBe('schema');
        });

        // 異常系: 想定外の失敗
        it('通信自体が失敗したら kind=network の ApiError を投げる', async () => {
            mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

            const error = await fetchJson('/api/x', schema).catch((e: unknown) => e);

            expect(error).toBeInstanceOf(ApiError);
            expect((error as ApiError).kind).toBe('network');
        });
    });

    describe('fetchOk', () => {
        // 正常系
        it('2xx なら解決し、応答本文を読まない', async () => {
            const json = jest.fn();
            mockFetch.mockResolvedValueOnce({
                ok: true,
                status: 204,
                statusText: 'No Content',
                json,
            } as unknown as Response);

            await expect(fetchOk('/api/x', { method: 'POST' })).resolves.toBeUndefined();
            expect(json).not.toHaveBeenCalled();
        });

        // 準正常系・異常系
        it('非 2xx なら kind=status の ApiError を投げる', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 403,
                statusText: 'Forbidden',
                json: async () => ({}),
            } as unknown as Response);

            const error = await fetchOk('/api/x').catch((e: unknown) => e);

            expect(error).toBeInstanceOf(ApiError);
            expect((error as ApiError).status).toBe(403);
        });

        it('通信自体が失敗したら kind=network の ApiError を投げる', async () => {
            mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

            const error = await fetchOk('/api/x').catch((e: unknown) => e);

            expect((error as ApiError).kind).toBe('network');
        });
    });
});
