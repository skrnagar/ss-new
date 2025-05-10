
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreatePostPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Trigger post dialog open and redirect back to feed
    const createPostEvent = new CustomEvent('openPostDialog');
    window.dispatchEvent(createPostEvent);
    router.push('/feed');
  }, [router]);

  return null;
}
