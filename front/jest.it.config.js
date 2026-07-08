// 統合テスト（IT）用の Jest 設定。ユニットテスト（jest.config.js）とは分離し、
// __tests__/it/ 配下のみを対象にする。fake-gcs-server（docker-compose.test.yml）が必要。
const base = require('./jest.config.js');

module.exports = {
    ...base,
    // IT のみを対象にする（UT の testPathIgnorePatterns による it/ 除外を打ち消す）
    testMatch: ['<rootDir>/__tests__/it/**/*.test.ts'],
    testPathIgnorePatterns: ['/node_modules/', '/dist/', '/e2e/'],
    // new Storage() 読み込み前に接続先の環境変数を設定
    setupFiles: ['<rootDir>/jest.it.setup-env.js'],
    // エミュレータの起動完了を待つ
    globalSetup: '<rootDir>/jest.it.global-setup.js',
    reporters: ['default'],
};
