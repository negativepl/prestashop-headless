import { NextRequest, NextResponse } from "next/server";
import { prestashop } from "@/lib/prestashop/client";

// ISR - revalidate every 5 minutes
export const revalidate = 300;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const parentId = searchParams.get("parentId");

  try {
    const categories = await prestashop.getCategories({
      parentId: parentId ? parseInt(parentId) : undefined,
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
