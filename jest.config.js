const { pathsToModuleNameMapper } = require('ts-jest');
const { compilerOptions } = require('./tsconfig.json');

module.exports = {
  // プリセット
  preset: 'ts-jest',
  // テスト環境
  testEnvironment: 'node',
  // モジュール名マッパー
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
  // テストパス除外
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/e2e/'],
  // モジュールディレクトリ
  moduleDirectories: ['node_modules', '<rootDir>/__tests__'],
  // セットアップファイル
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  // 変換除外パターン
  transformIgnorePatterns: ['/node_modules/(?!(uuid|@google-cloud/storage)/)'],
};
