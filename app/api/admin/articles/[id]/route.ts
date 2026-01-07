import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createClient } from "@/lib/supabase-server";
import { logAdminActivity } from "@/lib/admin-auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient();
    const articleId = params.id;

    const { error } = await supabase.from("articles").delete().eq("id", articleId);

    if (error) {
      throw error;
    }

    await logAdminActivity(admin.id, "delete_article", "article", articleId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting article:", error);
    return NextResponse.json(
      { error: "An error occurred while deleting article" },
      { status: 500 }
    );
  }
}

