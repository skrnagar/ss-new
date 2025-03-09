
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
      'media.licdn.com', // LinkedIn profile pictures
      'platform-lookaside.fbsbx.com', // Facebook profile pictures
    ],
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has TypeScript errors.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
