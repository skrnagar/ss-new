
"use client";

import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Setting up your account...");

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth callback error:", error);
          window.location.href = "/auth/login?error=Authentication failed";
          return;
        }

        if (!session) {
          console.error("No session found");
          window.location.href = "/auth/login?error=No session found";
          return;
        }

        // Check if user has a profile
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("username, full_name")
          .eq("id", session.user.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          console.error("Profile fetch error:", profileError);
        }

        // Immediate redirect based on profile status
        if (!profile || !profile.username) {
          window.location.href = "/profile/setup";
        } else {
          window.location.href = "/feed";
        }
      } catch (err) {
        console.error("Callback error:", err);
        window.location.href = "/auth/login?error=Unexpected error";
      }
    };

    handleAuthCallback();
  }, []);

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
