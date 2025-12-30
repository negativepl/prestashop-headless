import { NextRequest, NextResponse } from "next/server";
import { prestashop } from "@/lib/prestashop/client";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "5");
  const offset = (page - 1) * limit;

  try {
    const products = await prestashop.getProducts({
      offset,
      limit,
      withImages: true,
      withStock: true,
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
