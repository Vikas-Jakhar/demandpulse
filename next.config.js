/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: { bodySizeLimit: "50mb" }, // matches the 50MB ingestion limit
  },
};

module.exports = nextConfig;
