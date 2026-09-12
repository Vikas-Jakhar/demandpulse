/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Produces a self-contained .next/standalone/server.js with only the
  // production dependencies actually used, traced automatically. The
  // Dockerfile's runtime stage copies exactly this output — without this
  // setting, .next/standalone doesn't exist and that COPY is empty.
  output: "standalone",
  experimental: {
    serverActions: { bodySizeLimit: "50mb" },
    serverComponentsExternalPackages: ["pdfkit"],
  },
  // pdfkit (app/api/export/route.ts) loads its built-in .afm font metrics
  // from disk at runtime via fs, relative to its own package directory.
  // Next.js's default bundling traces and rewrites that require() in a way
  // that breaks the relative path on serverless deploys (Vercel and
  // similar) — the fix is telling Next to leave this package alone and let
  // Node's normal module resolution handle it server-side, where the full
  // node_modules/pdfkit directory (fonts included) is actually present.
  
  async headers() {
    return [
      {
        // Applies to every route, including API routes — these are cheap
        // to send and there's no page in this app that needs to be framed,
        // sniffed as a different content-type, or leak a full referrer URL
        // to a third party.
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // HSTS only matters (and is only safe to send) once you're
          // actually serving over HTTPS in production — sending it in dev
          // over plain http is harmless (browsers only honor it for https
          // origins) but it's still worth knowing this header is a promise
          // to browsers to remember; don't ship it if you might need to
          // roll back to HTTP for this domain.
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
