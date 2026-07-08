// 統合テスト（IT）用の環境変数。テストモジュール（gcs.ts の `new Storage()`）が
// 読み込まれる前に設定する必要があるため、setupFiles で注入する。
// GCS_API_ENDPOINT は fake-gcs-server（docker-compose.test.yml）を指す。
process.env.GCS_API_ENDPOINT = process.env.GCS_API_ENDPOINT || 'http://localhost:4443';
process.env.GCS_PRIVATE_BUCKET_NAME = 'it-bucket';
process.env.GCS_COMMON_DATA_PATH = 'common.json';
process.env.GCS_PERSONAL_DATA_PATH = 'personaldev.json';
process.env.GCS_SAMPLE_DATA_PATH = 'sampledev.json';
