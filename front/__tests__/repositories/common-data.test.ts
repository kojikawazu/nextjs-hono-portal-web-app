import { ApiError } from '@/repositories/http';
import { fetchCommonData } from '@/repositories/common-data';

const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

const jsonResponse = (body: unknown) =>
    ({ ok: true, status: 200, statusText: 'OK', json: async () => body }) as unknown as Response;

/** API が返す形（画面が扱う CommonDataType とは形が違う）。 */
const apiShape = {
    portfolio: { url: 'https://portfolio.example.com' },
    blog: { url: 'https://blog.example.com' },
    link: {
        github: 'https://github.com/example',
        x: 'https://x.com/example',
        linkedin: 'https://linkedin.com/in/example',
    },
};

describe('repositories/common-data', () => {
    beforeEach(() => {
        mockFetch.mockReset();
    });

    // 正常系
    it('API の応答を画面が扱う形へ詰め替えて返す', async () => {
        mockFetch.mockResolvedValueOnce(jsonResponse(apiShape));

        await expect(fetchCommonData()).resolves.toEqual({
            portfolioUrl: 'https://portfolio.example.com',
            blogUrl: 'https://blog.example.com',
            linkUrl: {
                githubUrl: 'https://github.com/example',
                xUrl: 'https://x.com/example',
                linkedinUrl: 'https://linkedin.com/in/example',
            },
        });
        expect(mockFetch).toHaveBeenCalledWith('/api/gcs/common', undefined);
    });

    // 準正常系
    it('link の一部が欠けていれば kind=schema の ApiError を投げる', async () => {
        const { linkedin: _omitted, ...incompleteLink } = apiShape.link;
        mockFetch.mockResolvedValueOnce(jsonResponse({ ...apiShape, link: incompleteLink }));

        const error = await fetchCommonData().catch((e: unknown) => e);

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

        const error = await fetchCommonData().catch((e: unknown) => e);

        expect((error as ApiError).kind).toBe('status');
    });

    // 異常系
    it('通信自体が失敗したら kind=network の ApiError を投げる', async () => {
        mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

        const error = await fetchCommonData().catch((e: unknown) => e);

        expect((error as ApiError).kind).toBe('network');
    });
});
