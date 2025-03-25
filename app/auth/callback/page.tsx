"use client";

import { supabase } from "@/lib/supabase";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [_status, setStatus] = useState("Processing authentication...");

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
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="text-center">
        <p className="text-lg mb-4">We are setting up your account. This may take a few moments.</p>
        <div className="animate-pulse inline-block rounded-full bg-primary/10 p-4">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      </div>
    </div>
  );
}
