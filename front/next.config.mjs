/** @type {import('next').NextConfig} */

// 本番判定。開発サーバー（`next dev`）は HMR が eval を使うため CSP を一部緩める。
const isProd = process.env.NODE_ENV === 'production';

// Content-Security-Policy（多層防御の一層 = XSS 対策）。
// Next.js はハイドレーション用インラインスクリプトと styled-jsx / framer-motion のインライン
// スタイルを使うため 'unsafe-inline' が必要。開発時のみ HMR 用に 'unsafe-eval' を許可し、
// 本番では外す（nonce 方式は未導入のため現状の妥協点）。
const cspDirectives = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  // 画像は自ドメイン・data URI・任意の https（開発履歴データの外部画像 URL を許容）
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  `script-src 'self' 'unsafe-inline'${isProd ? '' : " 'unsafe-eval'"}`,
  "connect-src 'self'",
];
const contentSecurityPolicy = cspDirectives.join('; ');

// 全レスポンスに付与するセキュリティヘッダー（security.md: HTTPS 強制・XSS・クリックジャッキング対策）。
const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // HTTPS 強制（HSTS）。http 応答では無視されるため dev/E2E に影響しない。
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig = {
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
