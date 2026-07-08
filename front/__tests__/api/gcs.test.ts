import gcsRouter from '@/app/api/gcs/gcs';

const mockCommonData = require('../../e2e/tests/mock/common.json');
const mockPersonalDevData = require('../../e2e/tests/mock/personaldev.json');
const mockSampleDevData = require('../../e2e/tests/mock/sampledev.json');

// GCS の file().download() をテストから制御できる共有モック。
// 既定は fileName に応じたモックデータを返す。異常系では *Once で失敗を差し込む。
const mockDownload = jest.fn(async (fileName: string) => {
    let data;
    if (fileName.includes('common')) {
        data = mockCommonData;
    } else if (fileName.includes('personaldev')) {
        data = mockPersonalDevData;
    } else if (fileName.includes('sampledev')) {
        data = mockSampleDevData;
    } else {
        data = {};
    }
    return [Buffer.from(JSON.stringify(data))];
});

jest.mock('@google-cloud/storage', () => ({
    Storage: jest.fn().mockImplementation(() => ({
        bucket: jest.fn().mockReturnThis(),
        file: jest.fn((fileName: string) => ({ download: () => mockDownload(fileName) })),
    })),
}));

describe('GCS Router', () => {
    // 既定はすべての環境変数が設定済み（正常系・異常系はこの状態を前提にする）
    beforeEach(() => {
        process.env.GCS_PRIVATE_BUCKET_NAME = 'mock-bucket';
        process.env.GCS_COMMON_DATA_PATH = 'common/mock-data.json';
        process.env.GCS_PERSONAL_DATA_PATH = 'personaldev/mock-data.json';
        process.env.GCS_SAMPLE_DATA_PATH = 'sampledev/mock-data.json';
        // 異常系で意図的に発生する console.error はテスト出力から抑制する
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    // ---- 正常系（Normal）----
    test('GET /api/gcs/common - Normal', async () => {
        const response = await gcsRouter.fetch(new Request('http://localhost/common'));
        expect(response.status).toBe(200);
        expect(await response.json()).toEqual(mockCommonData);
    });

    test('GET /api/gcs/personaldev - Normal', async () => {
        const response = await gcsRouter.fetch(new Request('http://localhost/personaldev'));
        expect(response.status).toBe(200);
        expect(await response.json()).toEqual(mockPersonalDevData);
    });

    test('GET /api/gcs/sampledev - Normal', async () => {
        const response = await gcsRouter.fetch(new Request('http://localhost/sampledev'));
        expect(response.status).toBe(200);
        expect(await response.json()).toEqual(mockSampleDevData);
    });

    // ---- 準正常系（Semi-Normal）: 環境変数未設定 → 400 ----
    test('GET /api/gcs/common - Semi-Normal (環境変数未設定 → 400)', async () => {
        delete process.env.GCS_PRIVATE_BUCKET_NAME;
        const response = await gcsRouter.fetch(new Request('http://localhost/common'));
        expect(response.status).toBe(400);
        expect(await response.json()).toEqual({ error: 'Bucket name or file name is not set' });
    });

    test('GET /api/gcs/personaldev - Semi-Normal (環境変数未設定 → 400)', async () => {
        delete process.env.GCS_PERSONAL_DATA_PATH;
        const response = await gcsRouter.fetch(new Request('http://localhost/personaldev'));
        expect(response.status).toBe(400);
        expect(await response.json()).toEqual({ error: 'Bucket name or file name is not set' });
    });

    test('GET /api/gcs/sampledev - Semi-Normal (環境変数未設定 → 400)', async () => {
        delete process.env.GCS_SAMPLE_DATA_PATH;
        const response = await gcsRouter.fetch(new Request('http://localhost/sampledev'));
        expect(response.status).toBe(400);
        expect(await response.json()).toEqual({ error: 'Bucket name or file name is not set' });
    });

    // ---- 異常系（Abnormal）: 想定外のエラー → 安全な失敗（500）----
    test('GET /api/gcs/common - Abnormal (GCS download 例外 → 500)', async () => {
        mockDownload.mockRejectedValueOnce(new Error('GCS unavailable'));
        const response = await gcsRouter.fetch(new Request('http://localhost/common'));
        expect(response.status).toBe(500);
        expect(await response.json()).toEqual({ error: 'Failed to fetch data from GCS' });
    });

    test('GET /api/gcs/common - Abnormal (不正 JSON → 500)', async () => {
        mockDownload.mockResolvedValueOnce([Buffer.from('this-is-not-json{')]);
        const response = await gcsRouter.fetch(new Request('http://localhost/common'));
        expect(response.status).toBe(500);
        expect(await response.json()).toEqual({ error: 'Failed to fetch data from GCS' });
    });

    test('GET /api/gcs/personaldev - Abnormal (GCS download 例外 → 500)', async () => {
        mockDownload.mockRejectedValueOnce(new Error('GCS unavailable'));
        const response = await gcsRouter.fetch(new Request('http://localhost/personaldev'));
        expect(response.status).toBe(500);
        expect(await response.json()).toEqual({ error: 'Failed to fetch data from GCS' });
    });

    test('GET /api/gcs/sampledev - Abnormal (GCS download 例外 → 500)', async () => {
        mockDownload.mockRejectedValueOnce(new Error('GCS unavailable'));
        const response = await gcsRouter.fetch(new Request('http://localhost/sampledev'));
        expect(response.status).toBe(500);
        expect(await response.json()).toEqual({ error: 'Failed to fetch data from GCS' });
    });
});
