/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['@browserbasehq/stagehand'],
  },
}

module.exports = nextConfig
