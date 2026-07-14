/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    // environment variable preserved for future backend integration;
    // currently the app uses a mock service and ignores this value
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/admin',
  },
};

module.exports = nextConfig;
