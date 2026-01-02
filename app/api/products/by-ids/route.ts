import { NextRequest, NextResponse } from "next/server";
import { binshops } from "@/lib/binshops/client";

// ISR - revalidate every 5 minutes
export const revalidate = 300;

// Fetch products by IDs (maintains order)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const idsParam = searchParams.get("ids");

  if (!idsParam) {
    return NextResponse.json({ error: "ids parameter is required" }, { status: 400 });
  }

  const ids = idsParam.split(",").map(id => parseInt(id)).filter(id => !isNaN(id));

  if (ids.length === 0) {
    return NextResponse.json([]);
  }

  try {
    const products = await binshops.getProductsByIds(ids);
    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products by IDs:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
