/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    instrumentationHook: true,
  },
  images: {
    domains: ['lephbkawjuyyygguxqio.supabase.co'],
  },
  // ESLint configuration removed
};

export default nextConfig;