let userConfig = undefined
try {
  userConfig = await import('./v0-user-next.config')
} catch (e) {
  // ignore error
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true
  },
  images: {
    domains: ['utfs.io', 'placekitten.com', 'lh3.googleusercontent.com', 'lephbkawjuyyygguxqio.supabase.co']
  },
  webpack: (config) => {
    config.externals = [...config.externals, 'canvas', 'jsdom'];
    return config;
  }
};

export default nextConfig;

// app/api/supabase/route.ts (New file for server components)
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase'; // Assuming this type is defined elsewhere

export async function POST(req: Request) {
  try {
    const client = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies }
    );
    const { data, error } = await client.auth.getSession();
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
    const supabase = createServerComponentClient(client);
    //Your server side logic here using supabase
    return new Response(JSON.stringify({ session: data }));
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}


// app/feed/page.tsx (Modified to use the new server component)
import { MetadataRoute } from 'next/server';
import {getServerSession} from '@supabase/auth-helpers-nextjs';

export default async function Feed() {
    const session = await getServerSession();
    // ... rest of your component logic
}

export const metadata: MetadataRoute = {
  title: 'Feed',
};


//app/page.tsx (Modified to use app router client)
import {getServerSession} from '@supabase/auth-helpers-nextjs';

async function Page(){
  const session = await getServerSession();
  // ... rest of your component logic
  return <p>Hello</p>
}

export default Page;