/** @type {import('next').NextConfig} */
const nextConfig = {
  // ❌ Removed output: 'export'
  distDir: 'out',
  eslint: {
    // we use biome for linting
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
