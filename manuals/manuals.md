# マニュアル集

## パッケージのインストール

```bash
npm i hono @hono/node-server
npm i @google-cloud/storage
npm i lucide-react framer-motion
npm i tailwindcss-animate
npm i react-spinners
npm i @fortawesome/react-fontawesome @fortawesome/free-brands-svg-icons
npm i resend
npm i zod react-hook-form @hookform/resolvers
```

## shadcnのインストール

```bash
npx shadcn@latest init
npx shadcn@latest add input
npx shadcn@latest add textarea
npx shadcn@latest add label
```

## テストの導入

### パッケージのインストール

```bash
# jestテスト
npm install -D jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom ts-jest node-mocks-http\n
npm install -D @types/jest

# e2eテスト
npm install -D @playwright/test
npx playwright install
npx playwright install-deps
```

### 初期設定

### jestテスト

```bash
npx ts-jest config:init
touch jest.setup.ts
```

### e2eテスト

```bash
touch playwright.config.ts
mkdir -p e2e/tests
```
