
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Processing authentication...");

  useEffect(() => {
    // This code only runs on the client side
    const handleAuthCallback = async () => {
      try {
        setStatus("Verifying authentication...");
        console.log("Auth callback: Processing authentication");
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error during auth callback:", error);
          setStatus("Authentication failed. Redirecting...");
          router.push("/auth/login?error=Authentication failed");
          return;
        }

        if (!data.session) {
          console.error("No session found in auth callback");
          setStatus("No session found. Redirecting...");
          router.push("/auth/login?error=No session found");
          return;
        }
        
        console.log("Auth callback: Session verified, checking profile");
        setStatus("Checking profile...");
        
        // Check if user has a profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", data.session.user.id)
          .single();
        
        if (profileError && profileError.code !== "PGRST116") {
          console.error("Error fetching profile:", profileError);
        }
        
        // Redirect based on profile existence
        if (profile) {
          console.log("Auth callback: Profile found, redirecting to feed");
          setStatus("Profile found. Redirecting to feed...");
          router.push("/feed");
        } else {
          console.log("Auth callback: No profile found, redirecting to profile setup");
          setStatus("Profile setup needed. Redirecting...");
          router.push("/profile/setup");
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setStatus("Unexpected error. Redirecting...");
        router.push("/auth/login?error=Unexpected error");
      }
    };
    
    handleAuthCallback();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-4">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <div className="flex flex-col items-center">
          <div className="mb-4">
            <Image
              src="/sslogo.webp"
              alt="Safety Shaper Logo"
              width={120}
              height={40}
              priority
            />
          </div>
          <h2 className="text-xl font-semibold mb-4">Authentication in Progress</h2>
          <div className="flex items-center space-x-4 mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            <p>{status}</p>
          </div>
        </div>
      </div>
    </div>
  );

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
