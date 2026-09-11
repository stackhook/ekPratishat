import baseConfig from '@repo/next-config'

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...baseConfig,
  reactStrictMode: true,
   images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '10.0.2.2',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '192.168.0.103',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.ekpratishat.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '15mb',
    }
  }
};

export default nextConfig;
