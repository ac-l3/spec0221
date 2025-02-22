/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  distDir: '.next',
  experimental: {
    serverActions: true,
  },
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/app/page',
      },
    ];
  },
}

module.exports = nextConfig 