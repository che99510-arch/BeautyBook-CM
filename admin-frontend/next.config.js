/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // NEXT_PUBLIC_API_URL must be set in Vercel environment variables:
  //   https://beautybook-cm-api.onrender.com/api/admin
  // Do NOT set a hardcoded fallback here — it would override the Vercel env var at build time.
};

module.exports = nextConfig;
