import type { NextConfig } from "next";

// Security headers for production
const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
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
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://geowidget.inpost.pl", // unsafe needed for Next.js + InPost Geowidget
      "style-src 'self' 'unsafe-inline' https://geowidget.inpost.pl https://unpkg.com", // unsafe-inline needed for styled components + InPost + Leaflet
      "img-src 'self' data: blob: https://presta.trkhspl.com https://images.unsplash.com https://upload.wikimedia.org https://blog.trkhspl.com https://*.tile.openstreetmap.org https://geowidget.inpost.pl https://cdnjs.cloudflare.com https://unpkg.com https://static.easypack24.net https://sklep.bizonmobile.pl",
      "font-src 'self' data: https://geowidget.inpost.pl",
      "connect-src 'self' https://presta.trkhspl.com https://blog.trkhspl.com https://geowidget.inpost.pl https://api-pl-points.inpost.pl https://nominatim.openstreetmap.org",
      "frame-src 'self' https://geowidget.inpost.pl https://geowidget-app.inpost.pl",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
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
        hostname: "upload.wikimedia.org",
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
