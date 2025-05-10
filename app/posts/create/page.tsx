
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CreatePostPage() {
  const router = useRouter();
  
  useEffect(() => {
    router.push("/feed");
  }, [router]);

  return null;
}
