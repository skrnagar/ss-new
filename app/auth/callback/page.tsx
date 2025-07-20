
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
        let { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id, username, full_name")
          .eq("id", session.user.id)
          .single();

        if (profileError && profileError.code !== "PGRST116") {
          console.error("Profile fetch error:", profileError);
        }

        // If profile does not exist, create it
        if (!profile) {
          console.log("No profile found, creating new profile row for user");
          const { error: insertError } = await supabase.from("profiles").insert({
            id: session.user.id,
            email: session.user.email,
            full_name: session.user.user_metadata?.name || "",
            // Add other fields as needed
          });
          if (insertError) {
            console.error("Error creating profile row:", insertError);
          } else {
            // Wait a moment for the DB to update
            await new Promise((r) => setTimeout(r, 500));
            // Refetch the profile after insert
            const { data: newProfile } = await supabase
              .from("profiles")
              .select("id, username, full_name")
              .eq("id", session.user.id)
              .single();
            profile = newProfile;
            console.log("Profile created and fetched:", profile);
          }
        }

        // Always redirect after login
        if (!profile || !profile.username) {
          console.log("Redirecting to /profile/setup", profile);
          window.location.href = "/profile/setup";
        } else {
          console.log("Redirecting to /feed", profile);
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
