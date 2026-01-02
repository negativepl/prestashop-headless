import { NextRequest, NextResponse } from "next/server";
import { binshops } from "@/lib/binshops/client";

// ISR - revalidate every 5 minutes
export const revalidate = 300;

// Returns lightweight list of product IDs with stock status, sorted by availability
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const categoryId = searchParams.get("categoryId");

  if (!categoryId) {
    return NextResponse.json({ error: "categoryId is required" }, { status: 400 });
  }

  try {
    const productIds = await binshops.getProductIdsWithStock(parseInt(categoryId));

    // Sort: in-stock first, out-of-stock last
    productIds.sort((a, b) => {
      const aInStock = a.quantity > 0 ? 0 : 1;
      const bInStock = b.quantity > 0 ? 0 : 1;
      return aInStock - bInStock;
    });

    return NextResponse.json(productIds);
  } catch (error) {
    console.error("Error fetching product IDs:", error);
    return NextResponse.json(
      { error: "Failed to fetch product IDs" },
      { status: 500 }
    );
  }
}
