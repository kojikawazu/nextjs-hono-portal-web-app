import { ApiError } from '@/repositories/http';
import { fetchAiUsageData } from '@/repositories/ai-usage';

const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

const jsonResponse = (body: unknown) =>
    ({ ok: true, status: 200, statusText: 'OK', json: async () => body }) as unknown as Response;

const item = { title: 'ルールの明文化', description: '規約を明文化する' };
const section = { title: '土台をつくる', summary: '土台を先に作る', items: [item] };
const apiShape = { aiusage: { principle: '意思決定権は人間にある。', sections: [section] } };

describe('repositories/ai-usage', () => {
    beforeEach(() => {
        mockFetch.mockReset();
    });

    // 正常系
    it('aiusage オブジェクトを取り出して返す', async () => {
        mockFetch.mockResolvedValueOnce(jsonResponse(apiShape));

        await expect(fetchAiUsageData()).resolves.toEqual(apiShape.aiusage);
        expect(mockFetch).toHaveBeenCalledWith('/api/gcs/aiusage', undefined);
    });

    it('セクションが空でもそのまま返す（データ未登録は異常ではない）', async () => {
        mockFetch.mockResolvedValueOnce(
            jsonResponse({ aiusage: { principle: '原則', sections: [] } }),
        );

        const data = await fetchAiUsageData();

        expect(data.sections).toEqual([]);
    });

    it('decision / url は任意（無くても検証を通る）', async () => {
        mockFetch.mockResolvedValueOnce(jsonResponse(apiShape));

        const [first] = (await fetchAiUsageData()).sections;

        expect(first.items[0].decision).toBeUndefined();
        expect(first.items[0].url).toBeUndefined();
    });

    // 準正常系
    it('principle が欠けていれば kind=schema の ApiError を投げる（構造の破損は例外）', async () => {
        mockFetch.mockResolvedValueOnce(jsonResponse({ aiusage: { sections: [section] } }));

        const error = await fetchAiUsageData().catch((e: unknown) => e);

        expect(error).toBeInstanceOf(ApiError);
        expect((error as ApiError).kind).toBe('schema');
    });

    it('項目の必須項目（description）が欠けていれば kind=schema の ApiError を投げる', async () => {
        const { description: _omitted, ...incomplete } = item;
        mockFetch.mockResolvedValueOnce(
            jsonResponse({
                aiusage: { principle: '原則', sections: [{ ...section, items: [incomplete] }] },
            }),
        );

        expect(((await fetchAiUsageData().catch((e: unknown) => e)) as ApiError).kind).toBe(
            'schema',
        );
    });

    it.each([
        ['javascript: スキーム', 'javascript:alert(1)'],
        ['http（https でない）', 'http://example.com'],
        ['URL ではない文字列', 'not a url'],
    ])('url が %s なら undefined へ劣化し、項目自体は残る', async (_label, value) => {
        mockFetch.mockResolvedValueOnce(
            jsonResponse({
                aiusage: {
                    principle: '原則',
                    sections: [{ ...section, items: [{ ...item, url: value }] }],
                },
            }),
        );

        const [first] = (await fetchAiUsageData()).sections;

        expect(first.items[0].url).toBeUndefined();
        expect(first.items[0].title).toBe(item.title);
    });

    it('非 2xx なら kind=status の ApiError を投げる', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
            json: async () => ({}),
        } as unknown as Response);

        expect(((await fetchAiUsageData().catch((e: unknown) => e)) as ApiError).status).toBe(500);
    });

    // 異常系
    it('通信自体が失敗したら kind=network の ApiError を投げる', async () => {
        mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

        expect(((await fetchAiUsageData().catch((e: unknown) => e)) as ApiError).kind).toBe(
            'network',
        );
    });
});
