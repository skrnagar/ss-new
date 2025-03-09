
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // This code only runs on the client side
    const handleAuthCallback = async () => {
      const { error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Error during auth callback:", error);
        router.push("/auth/login?error=Authentication failed");
        return;
      }
      
      // Check if user has a profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .single();
      
      if (profileError && profileError.code !== "PGRST116") {
        console.error("Error fetching profile:", profileError);
      }
      
      // Redirect based on profile existence
      if (profile) {
        router.push("/feed");
      } else {
        router.push("/profile/setup");
      }
    };
    
    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="text-center">
        <div className="mb-4">
          <Image src="/slogos.png" alt="Safety Shaper Logo" width={80} height={80} priority />
        </div>
        <h1 className="text-2xl font-bold mb-2">Processing Authentication</h1>
        <p className="text-muted-foreground mb-6">Please wait while we complete your authentication...</p>
        <div className="animate-pulse inline-block rounded-full bg-primary/10 p-4">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
        </div>
      </div>
    </div>
  );
}
