import type { NextConfig } from "next";

// Security headers for production (Vercel or Coolify)
// Local network testing needs HTTP, so we only enable HTTPS headers in cloud deployments
const isProduction = process.env.NODE_ENV === "production" &&
  (process.env.VERCEL === "1" || process.env.COOLIFY_URL || process.env.FORCE_HTTPS === "true");

const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  // HSTS only in cloud deployments - breaks local network testing
  ...(isProduction ? [{
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  }] : []),
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), interest-cohort=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe needed for Next.js
      "style-src 'self' 'unsafe-inline' https://unpkg.com", // unsafe-inline needed for styled components + Leaflet
      "img-src 'self' data: blob: https://presta.trkhspl.com https://images.unsplash.com https://blog.trkhspl.com https://*.tile.openstreetmap.org https://cdnjs.cloudflare.com https://unpkg.com https://static.easypack24.net https://sklep.bizonmobile.pl",
      "font-src 'self' data:",
      "connect-src 'self' https://presta.trkhspl.com https://blog.trkhspl.com https://nominatim.openstreetmap.org",
      "frame-src 'self' https://www.google.com https://maps.google.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      // Only upgrade to HTTPS in production
      ...(isProduction ? ["upgrade-insecure-requests"] : []),
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // Security headers
  async headers() {
    return [
      {
        // Apply to all routes
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },

  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 dni cache
    remotePatterns: [
      {
        protocol: "https",
        hostname: "presta.trkhspl.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "blog.trkhspl.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "sklep.bizonmobile.pl",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8080",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
