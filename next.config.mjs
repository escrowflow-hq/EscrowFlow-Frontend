const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// script-src/style-src need 'unsafe-inline': the App Router streams RSC
// hydration data via inline <script> tags on every statically prerendered
// page (most routes here), and framer-motion sets inline `style` attributes
// directly. A nonce-based CSP only covers dynamically rendered routes, which
// this app intentionally avoids for performance — tightening this further
// would mean giving up static generation.
const CSP = [
  `default-src 'self'`,
  `script-src 'self' 'unsafe-inline'`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob:`,
  `font-src 'self' data:`,
  // jose fetches these JWKS endpoints directly from the browser (see src/lib/oauth/verify.ts).
  `connect-src 'self' https://www.googleapis.com https://appleid.apple.com ${API_URL}`,
  `object-src 'none'`,
  `base-uri 'self'`,
  `form-action 'self'`,
  `frame-ancestors 'none'`,
  `upgrade-insecure-requests`,
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CSP },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [{ source: "/(.*)", headers: SECURITY_HEADERS }];
  },
};

export default nextConfig;
