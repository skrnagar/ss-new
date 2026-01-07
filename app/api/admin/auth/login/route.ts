import { NextRequest, NextResponse } from "next/server";
import { authenticateAdmin } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    console.log("Attempting login for:", email);
    const result = await authenticateAdmin(email, password);

    if (!result.success) {
      console.log("Login failed:", result.error);
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    console.log("Login successful for:", email);
    return NextResponse.json({
      success: true,
      admin: result.admin,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred during login" },
      { status: 500 }
    );
  }
}

