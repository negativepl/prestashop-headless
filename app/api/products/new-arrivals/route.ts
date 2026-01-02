import { NextRequest, NextResponse } from "next/server";
import { binshops } from "@/lib/binshops/client";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "5");

  try {
    // Use Binshops API - get products from root category sorted by date (newest first)
    const { products } = await binshops.getProducts({
      categoryId: 2, // Root category
      page,
      limit,
    });

    // Filter out of stock products
    const availableProducts = products.filter(
      (product) => product.quantity === null || product.quantity > 0
    );

    return NextResponse.json(availableProducts);
  } catch (error) {
    console.error("Error fetching new arrivals:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
