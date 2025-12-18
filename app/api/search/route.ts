import { NextRequest, NextResponse } from "next/server";
import { prestashop } from "@/lib/prestashop/client";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const limit = parseInt(searchParams.get("limit") || "6");

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ products: [] });
  }

  try {
    const products = await prestashop.searchProducts(query, limit);
    return NextResponse.json({ products });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ products: [], error: "Search failed" }, { status: 500 });
  }
}
