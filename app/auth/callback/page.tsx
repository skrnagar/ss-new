"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Processing authentication...");

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        setStatus("Verifying authentication...");
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Error during auth callback:", error);
          setStatus("Authentication failed. Redirecting...");
          router.replace("/auth/login?error=Authentication failed");
          return;
        }

        if (!session) {
          console.error("No session found in auth callback");
          setStatus("No session found. Redirecting...");
          router.replace("/auth/login?error=No session found");
          return;
        }

        setStatus("Checking profile...");

        // Check if user has a profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", session.user.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          console.error("Error fetching profile:", profileError);
        }

        // Force a hard redirect to clear any OAuth state
        if (profile?.username) {
          window.location.href = "/feed";
        } else {
          window.location.href = "/profile/setup";
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        window.location.href = "/auth/login?error=Unexpected error";
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="text-center">
        <p className="text-lg mb-4">{status}</p>
        <div className="animate-pulse inline-block rounded-full bg-primary/10 p-4">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      </div>
    </div>
  );
}