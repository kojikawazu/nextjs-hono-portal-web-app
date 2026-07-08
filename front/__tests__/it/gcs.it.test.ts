import gcsRouter from '@/app/api/gcs/gcs';

// 実際に fake-gcs-server（エミュレータ）へ接続し、実 SDK・実ルーティングを結合検証する。
// 期待値はシード（docker-compose がマウントする実データ）と同一。
const commonSeed = require('../../e2e/tests/mock/gcs-seed/it-bucket/common.json');
const personalSeed = require('../../e2e/tests/mock/gcs-seed/it-bucket/personaldev.json');
const sampleSeed = require('../../e2e/tests/mock/gcs-seed/it-bucket/sampledev.json');

describe('GCS Router (IT: fake-gcs-server 実結合)', () => {
    beforeEach(() => {
        // 各テストで既定の（正常な）環境変数へ戻す。GCS_API_ENDPOINT は setupFiles で設定済み。
        process.env.GCS_PRIVATE_BUCKET_NAME = 'it-bucket';
        process.env.GCS_COMMON_DATA_PATH = 'common.json';
        process.env.GCS_PERSONAL_DATA_PATH = 'personaldev.json';
        process.env.GCS_SAMPLE_DATA_PATH = 'sampledev.json';
        // 異常系で出る console.error は抑制
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    // ---- 正常系（Normal）: エミュレータから実際に取得 ----
    test('GET /common - 正常系: エミュレータから取得', async () => {
        const res = await gcsRouter.fetch(new Request('http://localhost/common'));
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual(commonSeed);
    });

    test('GET /personaldev - 正常系: エミュレータから取得', async () => {
        const res = await gcsRouter.fetch(new Request('http://localhost/personaldev'));
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual(personalSeed);
    });

    test('GET /sampledev - 正常系: エミュレータから取得', async () => {
        const res = await gcsRouter.fetch(new Request('http://localhost/sampledev'));
        expect(res.status).toBe(200);
        expect(await res.json()).toEqual(sampleSeed);
    });

    // ---- 準正常系（Semi-Normal）: 環境変数未設定 → 400 ----
    test('GET /common - 準正常系: 環境変数未設定 → 400', async () => {
        delete process.env.GCS_PRIVATE_BUCKET_NAME;
        const res = await gcsRouter.fetch(new Request('http://localhost/common'));
        expect(res.status).toBe(400);
        expect(await res.json()).toEqual({ error: 'Bucket name or file name is not set' });
    });

    // ---- 異常系（Abnormal）: 存在しないオブジェクト → 500 ----
    test('GET /common - 異常系: 存在しないオブジェクト → 500', async () => {
        process.env.GCS_COMMON_DATA_PATH = 'does-not-exist.json';
        const res = await gcsRouter.fetch(new Request('http://localhost/common'));
        expect(res.status).toBe(500);
        expect(await res.json()).toEqual({ error: 'Failed to fetch data from GCS' });
    });
});
