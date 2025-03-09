import { createLegacyClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export default async function ProfileRedirectPage() {
  const supabase = createLegacyClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", session.user.id)
    .single();

  if (profile?.username) {
    redirect(`/profile/${profile.username}`);
  } else {
    // Create a default profile if one doesn't exist
    try {
      // Generate a username from the email or name
      const username = (
        session.user.user_metadata?.name ||
        session.user.email?.split("@")[0] ||
        "user"
      )
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");

      await supabase.from("profiles").insert({
        id: session.user.id,
        username: `${username}-${Math.floor(Math.random() * 10000)}`,
        full_name: session.user.user_metadata?.name || session.user.email?.split("@")[0] || "User",
      });

      // Redirect to profile setup
      redirect("/profile/setup");
    } catch (error) {
      console.error("Error creating profile:", error);
      redirect("/profile/setup");
    }
  }
}
