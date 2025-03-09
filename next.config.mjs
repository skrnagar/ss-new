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
      'lh3.googleusercontent.com'
    ],
  },
};

export default nextConfig;