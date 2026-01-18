import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase-admin";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createAdminClient();
    const notifications: any[] = [];

    // Get pending admin approvals (if super admin)
    if (admin.role === "super_admin") {
      const { data: pendingAdmins } = await supabase
        .from("admin_users")
        .select("id, email, full_name, created_at")
        .eq("is_approved", false)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      pendingAdmins?.forEach((pending) => {
        notifications.push({
          id: `pending-admin-${pending.id}`,
          type: "pending_approval",
          title: "New Admin User Pending Approval",
          message: `${pending.full_name} (${pending.email}) requested admin access`,
          link: "/admin/admin-users",
          created_at: pending.created_at,
          read: false,
        });
      });
    }

    // Get recent admin activities (important actions)
    const { data: recentActivities } = await supabase
      .from("admin_activity_log")
      .select(
        `
        *,
        admin_user:admin_users(id, full_name, email)
      `
      )
      .order("created_at", { ascending: false })
      .limit(10);

    // Add recent important activities as notifications
    recentActivities?.slice(0, 5).forEach((activity) => {
      if (activity.admin_user_id !== admin.id) {
        // Only show activities from other admins
        notifications.push({
          id: `activity-${activity.id}`,
          type: "activity",
          title: activity.action || "Admin Activity",
          message: `${activity.admin_user?.full_name || "Admin"} ${activity.action || "performed an action"}`,
          link: "/admin/activity",
          created_at: activity.created_at,
          read: false,
        });
      }
    });

    // Sort by created_at descending
    notifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const unreadCount = notifications.length;

    return NextResponse.json({
      notifications,
      unreadCount,
    });
  } catch (error: any) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching notifications" },
      { status: 500 }
    );
  }
}

