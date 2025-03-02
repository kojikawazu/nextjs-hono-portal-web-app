import { test, expect, APIRequestContext } from '@playwright/test';

// CSRFトークン取得用の関数
async function getCsrfToken(request: APIRequestContext) {
    const response = await request.get('/api/mail/csrf');
    expect(response.ok()).toBeTruthy();
    const data = await response.json();
    return {
        csrfToken: data.csrfToken,
        cookie: response.headers()['set-cookie'],
    };
}

test.describe('Mail API tests', () => {
    test('GET /api/mail/csrf - get csrfToken', async ({ request }) => {
        const response = await request.get('/api/mail/csrf');
        expect(response.ok()).toBeTruthy();

        const data = await response.json();
        expect(data).toHaveProperty('csrfToken');
        expect(typeof data.csrfToken).toBe('string');
        expect(data.csrfToken).toHaveLength(32);
    });

    test('POST /api/mail/send - send mail', async ({ request }) => {
        const { csrfToken, cookie } = await getCsrfToken(request);

        const response = await request.post('/api/mail/send', {
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': JSON.stringify(csrfToken),
                Cookie: cookie,
            },
            data: {
                name: 'Test User',
                email: 'testuser@example.com',
                subjects: 'Test Subject',
                messages: 'Test Message',
            },
        });

        const result = await response.json();
        expect(response.ok()).toBeTruthy();
        expect(result).toHaveProperty('success', true);
    });

    test('POST /api/mail/send - no csrfToken', async ({ request }) => {
        const response = await request.post('/api/mail/send', {
            headers: {
                'Content-Type': 'application/json',
            },
            data: {
                name: 'Test User',
                email: 'testuser@example.com',
                subjects: 'Test Subject',
                messages: 'Test Message',
            },
        });

        const result = await response.json();
        expect(response.status()).toBe(403);
        expect(result).toHaveProperty('error', 'Invalid CSRF token');
    });

    test('POST /api/mail/send - missing parameters', async ({ request }) => {
        const { csrfToken, cookie } = await getCsrfToken(request);

        const response = await request.post('/api/mail/send', {
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': JSON.stringify(csrfToken),
                Cookie: cookie,
            },
            data: {
                name: '',
                email: 'testuser@example.com',
                subjects: 'Test Subject',
                messages: '',
            },
        });

        const result = await response.json();
        expect(response.status()).toBe(400);
        expect(result).toHaveProperty('error', 'Missing required fields');
    });
});
