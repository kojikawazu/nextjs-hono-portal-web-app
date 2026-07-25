import { Hono } from 'hono';
import { Storage } from '@google-cloud/storage';

// GCSのインスタンスを作成
// GCS クライアント。統合テスト（IT）ではエミュレータ（fake-gcs-server）へ向けるため、
// GCS_API_ENDPOINT が設定されていれば apiEndpoint として使う。本番では未設定＝通常の GCP 接続。
const storage = new Storage(
    process.env.GCS_API_ENDPOINT
        ? { apiEndpoint: process.env.GCS_API_ENDPOINT, projectId: 'local-emulator' }
        : undefined,
);
/** GCS からデータ（共通 / 個人開発 / サンプル開発）を取得するサブルーター（`/api/gcs` 配下にマウント）。 */
const gcsRouter = new Hono();

/**
 * GCS から JSON ファイルを取得してパースする。
 *
 * @param bucketName - GCS のバケット名
 * @param fileName - GCS の JSON ファイルのパス
 * @returns JSON ファイルの内容（任意の JSON のため unknown。呼び出し側で検証する）
 * @throws {Error} ダウンロードまたは JSON パースに失敗した場合
 */
async function fetchJsonFromGCS(bucketName: string, fileName: string): Promise<unknown> {
    try {
        const bucket = storage.bucket(bucketName);
        const file = bucket.file(fileName);

        const [content] = await file.download();
        return JSON.parse(content.toString());
    } catch (error) {
        if (error instanceof Error) {
            console.error(`Error fetching file from GCS: ${error.message}`, error);
        } else {
            console.error('An unknown error occurred:', error);
        }
        throw error;
    }
}

/**
 * GCS API の疎通確認用エンドポイント。
 *
 * @param c - Hono コンテキスト
 * @returns 接続確認メッセージ（200）
 */
gcsRouter.get('/', (c) => {
    return c.json({ message: 'Connected to GCS API' });
});

/**
 * 共通データ（ポートフォリオ / ブログ / SNS リンク）を GCS から取得して返す。
 *
 * @param c - Hono コンテキスト
 * @returns 共通データ JSON（200）。バケット名/パス未設定は 400、取得失敗は 500。
 */
gcsRouter.get('/common', async (c) => {
    try {
        const bucketName = process.env.GCS_PRIVATE_BUCKET_NAME;
        const fileName = process.env.GCS_COMMON_DATA_PATH;

        if (!bucketName || !fileName) {
            return c.json({ error: 'Bucket name or file name is not set' }, 400);
        }

        const data = await fetchJsonFromGCS(bucketName, fileName);
        return c.json(data);
    } catch (error) {
        console.error('Failed to fetch data from GCS:', error);
        return c.json({ error: 'Failed to fetch data from GCS' }, 500);
    }
});

/**
 * 個人開発データを GCS から取得して返す。
 *
 * @param c - Hono コンテキスト
 * @returns 個人開発データ JSON（200）。バケット名/パス未設定は 400、取得失敗は 500。
 */
gcsRouter.get('/personaldev', async (c) => {
    try {
        const bucketName = process.env.GCS_PRIVATE_BUCKET_NAME;
        const fileName = process.env.GCS_PERSONAL_DATA_PATH;

        if (!bucketName || !fileName) {
            return c.json({ error: 'Bucket name or file name is not set' }, 400);
        }

        const data = await fetchJsonFromGCS(bucketName, fileName);
        return c.json(data);
    } catch (error) {
        console.error('Failed to fetch data from GCS:', error);
        return c.json({ error: 'Failed to fetch data from GCS' }, 500);
    }
});

/**
 * サンプル開発データを GCS から取得して返す。
 *
 * @param c - Hono コンテキスト
 * @returns サンプル開発データ JSON（200）。バケット名/パス未設定は 400、取得失敗は 500。
 */
gcsRouter.get('/sampledev', async (c) => {
    try {
        const bucketName = process.env.GCS_PRIVATE_BUCKET_NAME;
        const fileName = process.env.GCS_SAMPLE_DATA_PATH;

        if (!bucketName || !fileName) {
            return c.json({ error: 'Bucket name or file name is not set' }, 400);
        }

        const data = await fetchJsonFromGCS(bucketName, fileName);
        return c.json(data);
    } catch (error) {
        console.error('Failed to fetch data from GCS:', error);
        return c.json({ error: 'Failed to fetch data from GCS' }, 500);
    }
});

export default gcsRouter;
