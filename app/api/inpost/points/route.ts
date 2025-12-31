import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Build URL with query params
  const params = new URLSearchParams();
  params.set("type", searchParams.get("type") || "parcel_locker");
  params.set("status", "Operating");
  params.set("per_page", searchParams.get("per_page") || "100");

  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (lat && lng) {
    params.set("relative_point", `${lat},${lng}`);
    params.set("sort_by", "distance_asc");
  }

  try {
    const response = await fetch(
      `https://api-pl-points.easypack24.net/v1/points?${params.toString()}`,
      {
        headers: {
          "Accept": "application/json",
        },
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    );

    if (!response.ok) {
      throw new Error(`InPost API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching InPost points:", error);
    return NextResponse.json(
      { error: "Failed to fetch points" },
      { status: 500 }
    );
  }
}
