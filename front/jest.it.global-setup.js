// IT 実行前に fake-gcs-server の起動完了を待つ（最大 30 秒ポーリング）。
module.exports = async () => {
    const base = process.env.GCS_API_ENDPOINT || 'http://localhost:4443';
    const url = `${base}/storage/v1/b?project=test`;
    const deadline = Date.now() + 30000;
    while (Date.now() < deadline) {
        try {
            const res = await fetch(url);
            if (res.ok) return;
        } catch {
            // まだ起動していない
        }
        await new Promise((resolve) => setTimeout(resolve, 500));
    }
    throw new Error(
        `fake-gcs-server が起動していません: ${base}\n` +
            '先に `docker compose -f docker-compose.test.yml up -d` を実行してください。',
    );
};
