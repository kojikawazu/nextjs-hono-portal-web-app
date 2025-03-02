import gcsRouter from '@/app/api/gcs/gcs';
import { Storage } from '@google-cloud/storage';

const mockCommonData = require('../../e2e/tests/mock/common.json');
const mockPersonalDevData = require('../../e2e/tests/mock/personaldev.json');
const mockSampleDevData = require('../../e2e/tests/mock/sampledev.json');

jest.mock('@google-cloud/storage', () => {
    return {
        Storage: jest.fn().mockImplementation(() => ({
            bucket: jest.fn().mockReturnThis(),
            file: jest.fn().mockImplementation(function (fileName: string) {
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
                return {
                    download: jest.fn().mockResolvedValue([Buffer.from(JSON.stringify(data))]),
                };
            }),
        })),
    };
});

describe('GCS Router', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('GET /api/gcs/common - Normal', async () => {
        process.env.GCS_PRIVATE_BUCKET_NAME = 'mock-bucket';
        process.env.GCS_COMMON_DATA_PATH = 'common/mock-data.json';

        const req = new Request('http://localhost/common', { method: 'GET' });
        const response = await gcsRouter.fetch(req);

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data).toEqual(mockCommonData);
    });

    test('GET /api/gcs/common - Abnormal (Environment variable not set)', async () => {
        delete process.env.GCS_PRIVATE_BUCKET_NAME;
        delete process.env.GCS_COMMON_DATA_PATH;

        const req = new Request('http://localhost/common', { method: 'GET' });
        const response = await gcsRouter.fetch(req);

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data).toEqual({ error: 'Bucket name or file name is not set' });
    });

    test('GET /api/gcs/personaldev - Normal', async () => {
        process.env.GCS_PRIVATE_BUCKET_NAME = 'mock-bucket';
        process.env.GCS_PERSONAL_DATA_PATH = 'personaldev/mock-data.json';

        const req = new Request('http://localhost/personaldev', { method: 'GET' });
        const response = await gcsRouter.fetch(req);

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data).toEqual(mockPersonalDevData);
    });

    test('GET /api/gcs/personaldev - Abnormal (Environment variable not set)', async () => {
        delete process.env.GCS_PRIVATE_BUCKET_NAME;
        delete process.env.GCS_PERSONAL_DATA_PATH;

        const req = new Request('http://localhost/personaldev', { method: 'GET' });
        const response = await gcsRouter.fetch(req);

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data).toEqual({ error: 'Bucket name or file name is not set' });
    });

    test('GET /api/gcs/sampledev - Normal', async () => {
        process.env.GCS_PRIVATE_BUCKET_NAME = 'mock-bucket';
        process.env.GCS_SAMPLE_DATA_PATH = 'sampledev/mock-data.json';

        const req = new Request('http://localhost/sampledev', { method: 'GET' });
        const response = await gcsRouter.fetch(req);

        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data).toEqual(mockSampleDevData);
    });

    test('GET /api/gcs/sampledev - Abnormal (Environment variable not set)', async () => {
        delete process.env.GCS_PRIVATE_BUCKET_NAME;
        delete process.env.GCS_SAMPLE_DATA_PATH;

        const req = new Request('http://localhost/sampledev', { method: 'GET' });
        const response = await gcsRouter.fetch(req);

        expect(response.status).toBe(400);
        const data = await response.json();
        expect(data).toEqual({ error: 'Bucket name or file name is not set' });
    });
});
