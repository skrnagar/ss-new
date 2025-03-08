/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'lephbkawjuyyygguxqio.supabase.co',
      'ui-avatars.com',
      'api.dicebear.com',
      'placehold.co'
    ],
  },
};

export default nextConfig;