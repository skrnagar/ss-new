import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";

/** Server-side geocoding (keeps API key off the client). Set GOOGLE_MAPS_GEOCODING_KEY or GOOGLE_MAPS_API_KEY. */
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const q = request.nextUrl.searchParams.get("address")?.trim();
    if (!q) {
      return NextResponse.json({ error: "address query required" }, { status: 400 });
    }

    const key = process.env.GOOGLE_MAPS_GEOCODING_KEY || process.env.GOOGLE_MAPS_API_KEY;
    if (!key) {
      return NextResponse.json(
        {
          error: "Geocoding not configured",
          hint: "Set GOOGLE_MAPS_GEOCODING_KEY (or GOOGLE_MAPS_API_KEY) for server geocoding.",
        },
        { status: 503 }
      );
    }

    const url = new URL("https://maps.googleapis.com/maps/api/geocode/json");
    url.searchParams.set("address", q);
    url.searchParams.set("key", key);

    const res = await fetch(url.toString());
    const json = (await res.json()) as {
      status: string;
      results?: Array<{ geometry: { location: { lat: number; lng: number } }; formatted_address: string }>;
      error_message?: string;
    };

    if (json.status !== "OK" || !json.results?.length) {
      return NextResponse.json(
        {
          error: json.error_message || `Geocode status: ${json.status}`,
          results: [],
        },
        { status: 422 }
      );
    }

    const top = json.results[0]!;
    return NextResponse.json({
      lat: top.geometry.location.lat,
      lng: top.geometry.location.lng,
      formatted_address: top.formatted_address,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
