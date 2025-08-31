/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // This was causing double-invocation of effects
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '**',
      },
    ],
  },
};

module.exports = nextConfig;
