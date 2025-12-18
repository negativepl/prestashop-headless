import { NextRequest, NextResponse } from "next/server";
import { prestashop } from "@/lib/prestashop/client";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const categoryId = searchParams.get("categoryId");
  const limit = searchParams.get("limit");

  try {
    const products = await prestashop.getProducts({
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      limit: limit ? parseInt(limit) : 100,
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
