import { ApiError } from '@/repositories/http';
import { fetchPersonalDevData } from '@/repositories/dev-data';

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
        it('要素に必須項目（title）が欠けていれば kind=schema の ApiError を投げる', async () => {
            const { title: _omitted, ...incomplete } = personalItem;
            mockFetch.mockResolvedValueOnce(jsonResponse({ personaldev: [incomplete] }));

            const error = await fetchPersonalDevData().catch((e: unknown) => e);

            expect(error).toBeInstanceOf(ApiError);
            expect((error as ApiError).kind).toBe('schema');
        });

        // URL は「リンクを出さない」側へ劣化させる。カードの本文は URL が無くても表示する
        it.each([
            ['javascript: スキーム', 'javascript:alert(1)'],
            ['http（https でない）', 'http://example.com/a'],
            ['URL ではない文字列', 'not a url'],
        ])('url が %s でも例外にせず undefined へ劣化する', async (_label, value) => {
            mockFetch.mockResolvedValueOnce(
                jsonResponse({ personaldev: [{ ...personalItem, url: value }] }),
            );

            const [item] = await fetchPersonalDevData();

            expect(item.url).toBeUndefined();
            expect(item.title).toBe(personalItem.title);
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

    describe('fetchPersonalDevData - githubUrl（任意項目）', () => {
        // 正常系
        it('githubUrl があればそのまま返す', async () => {
            const withGithub = { ...personalItem, githubUrl: 'https://github.com/owner/repo' };
            mockFetch.mockResolvedValueOnce(jsonResponse({ personaldev: [withGithub] }));

            await expect(fetchPersonalDevData()).resolves.toEqual([withGithub]);
        });

        // 準正常系: 任意項目のため、欠けていても一覧は成立する
        it('githubUrl が無くても検証を通る（GCS のデータが追いつく前でも一覧が壊れない）', async () => {
            mockFetch.mockResolvedValueOnce(jsonResponse({ personaldev: [personalItem] }));

            const [item] = await fetchPersonalDevData();

            expect(item.githubUrl).toBeUndefined();
            expect(item.title).toBe(personalItem.title);
        });

        // 準正常系: 壊れた値は「一覧ごと落とす」のではなく「リンクを出さない」へ劣化させる
        it('githubUrl が URL として不正なら undefined に劣化し、他の項目は残る', async () => {
            const broken = { ...personalItem, githubUrl: 'javascript:alert(1)' };
            mockFetch.mockResolvedValueOnce(jsonResponse({ personaldev: [broken] }));

            const [item] = await fetchPersonalDevData();

            expect(item.githubUrl).toBeUndefined();
            expect(item.title).toBe(personalItem.title);
        });

        it('githubUrl が文字列でなくても undefined に劣化する', async () => {
            const broken = { ...personalItem, githubUrl: 123 };
            mockFetch.mockResolvedValueOnce(jsonResponse({ personaldev: [broken] }));

            const [item] = await fetchPersonalDevData();

            expect(item.githubUrl).toBeUndefined();
        });
    });
});
