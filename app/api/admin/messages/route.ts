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

    // Fetch messages from messages table
    const { data: messages, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) {
      throw error;
    }

    // Fetch sender and receiver profiles separately
    if (messages && messages.length > 0) {
      const senderIds = [...new Set(messages.map((m: any) => m.sender_id).filter(Boolean))];
      const receiverIds = [...new Set(messages.map((m: any) => m.receiver_id).filter(Boolean))];
      const allUserIds = [...new Set([...senderIds, ...receiverIds])];

      if (allUserIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, username, avatar_url")
          .in("id", allUserIds);

        const profilesMap = new Map(profiles?.map((p: any) => [p.id, p]) || []);

        const messagesWithProfiles = messages.map((message: any) => ({
          ...message,
          sender: profilesMap.get(message.sender_id) || null,
          receiver: profilesMap.get(message.receiver_id) || null,
        }));

        return NextResponse.json({ messages: messagesWithProfiles || [] });
      }
    }

    return NextResponse.json({ messages: messages || [] });
  } catch (error: any) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching messages" },
      { status: 500 }
    );
  }
}

