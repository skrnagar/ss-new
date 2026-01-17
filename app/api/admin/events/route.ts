import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase-admin";

export async function GET(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use admin client to bypass RLS
    const supabase = createAdminClient();

    // Fetch events
    const { data: events, error } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    // Fetch organizer profiles if events exist
    if (events && events.length > 0) {
      const userIds = [...new Set(events.map((e: any) => e.user_id || e.organizer_id).filter(Boolean))];
      
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, username, avatar_url")
          .in("id", userIds);

        const profilesMap = new Map(profiles?.map((p: any) => [p.id, p]) || []);

        const eventsWithOrganizer = events.map((event: any) => ({
          ...event,
          organizer: profilesMap.get(event.user_id || event.organizer_id) || null,
        }));

        return NextResponse.json({ events: eventsWithOrganizer || [] });
      }
    }

    return NextResponse.json({ events: events || [] });
  } catch (error: any) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching events" },
      { status: 500 }
    );
  }
}

