/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    instrumentationHook: true,
  },
  images: {
    domains: [
      'lephbkawjuyyygguxqio.supabase.co', // Supabase storage
      'avatars.githubusercontent.com',
      'lh3.googleusercontent.com',
      '3adfc305-31eb-4741-9506-4d4b5862f73b-00-1phvtd2v60o1t.pike.replit.dev' // Replit domain
    ],
    unoptimized: process.env.NODE_ENV !== 'production',
  },
};

export default nextConfig;