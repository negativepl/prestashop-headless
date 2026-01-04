import { NextRequest, NextResponse } from "next/server";
import { binshops } from "@/lib/binshops/client";

// ISR - revalidate every 5 minutes
export const revalidate = 300;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const path = await binshops.getCategoryPath(parseInt(id));

    return NextResponse.json(path);
  } catch (error) {
    console.error("Error fetching category path:", error);
    return NextResponse.json(
      { error: "Failed to fetch category path" },
      { status: 500 }
    );
  }
}
