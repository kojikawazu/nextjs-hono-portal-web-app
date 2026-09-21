import { ApiError } from '@/repositories/http';
import { fetchPersonalDevData, fetchSampleDevData } from '@/repositories/dev-data';

const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

const jsonResponse = (body: unknown) =>
    ({ ok: true, status: 200, statusText: 'OK', json: async () => body }) as unknown as Response;

const personalItem = {
    title: '個人開発A',
    description: '説明',
    tech: ['Next.js', 'Hono'],
    url: 'https://example.com/a',
};
/** サンプル開発は個人開発に imageUrl が加わった形。 */
const sampleItem = { ...personalItem, imageUrl: 'https://example.com/a.png' };

describe('repositories/dev-data', () => {
    beforeEach(() => {
        mockFetch.mockReset();
    });

    describe('fetchPersonalDevData', () => {
        // 正常系
        it('personaldev 配列を取り出して返す', async () => {
            mockFetch.mockResolvedValueOnce(jsonResponse({ personaldev: [personalItem] }));

            await expect(fetchPersonalDevData()).resolves.toEqual([personalItem]);
            expect(mockFetch).toHaveBeenCalledWith('/api/gcs/personaldev', undefined);
        });

        it('空配列もそのまま返す（データ未登録は異常ではない）', async () => {
            mockFetch.mockResolvedValueOnce(jsonResponse({ personaldev: [] }));

            await expect(fetchPersonalDevData()).resolves.toEqual([]);
        });

        // 準正常系
        it('要素に必須項目が欠けていれば kind=schema の ApiError を投げる', async () => {
            const { url: _omitted, ...incomplete } = personalItem;
            mockFetch.mockResolvedValueOnce(jsonResponse({ personaldev: [incomplete] }));

            const error = await fetchPersonalDevData().catch((e: unknown) => e);

            expect(error).toBeInstanceOf(ApiError);
            expect((error as ApiError).kind).toBe('schema');
        });

        it('ラッパーのキー名が違えば kind=schema の ApiError を投げる', async () => {
            mockFetch.mockResolvedValueOnce(jsonResponse({ items: [personalItem] }));

            expect(((await fetchPersonalDevData().catch((e: unknown) => e)) as ApiError).kind).toBe(
                'schema',
            );
        });

        it('非 2xx なら kind=status の ApiError を投げる', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 404,
                statusText: 'Not Found',
                json: async () => ({}),
            } as unknown as Response);

            const error = await fetchPersonalDevData().catch((e: unknown) => e);

            expect((error as ApiError).status).toBe(404);
        });

        // 異常系
        it('通信自体が失敗したら kind=network の ApiError を投げる', async () => {
            mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

            const error = await fetchPersonalDevData().catch((e: unknown) => e);

            expect((error as ApiError).kind).toBe('network');
        });
    });

    describe('fetchSampleDevData', () => {
        // 正常系
        it('sampledev 配列を取り出して返す', async () => {
            mockFetch.mockResolvedValueOnce(jsonResponse({ sampledev: [sampleItem] }));

            await expect(fetchSampleDevData()).resolves.toEqual([sampleItem]);
            expect(mockFetch).toHaveBeenCalledWith('/api/gcs/sampledev', undefined);
        });

        // 準正常系
        it('imageUrl が欠けていれば kind=schema の ApiError を投げる（個人開発とは必須項目が違う）', async () => {
            const { imageUrl: _omitted, ...withoutImage } = sampleItem;
            mockFetch.mockResolvedValueOnce(jsonResponse({ sampledev: [withoutImage] }));

            const error = await fetchSampleDevData().catch((e: unknown) => e);

            expect((error as ApiError).kind).toBe('schema');
        });

        it('非 2xx なら kind=status の ApiError を投げる', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 503,
                statusText: 'Service Unavailable',
                json: async () => ({}),
            } as unknown as Response);

            const error = await fetchSampleDevData().catch((e: unknown) => e);

            expect((error as ApiError).status).toBe(503);
        });
    });
});
