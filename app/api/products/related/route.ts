import { NextRequest, NextResponse } from "next/server";
import { prestashop } from "@/lib/prestashop/client";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const categoryId = searchParams.get("categoryId");
  const excludeId = searchParams.get("excludeId");
  const limit = searchParams.get("limit") || "4";

  if (!categoryId) {
    return NextResponse.json({ error: "categoryId is required" }, { status: 400 });
  }

  try {
    const products = await prestashop.getProducts({
      categoryId: parseInt(categoryId),
      limit: parseInt(limit) + 1, // Get one extra in case we exclude
      withStock: true,
    });

    // Filter out the current product
    const relatedProducts = products
      .filter((p) => p.id !== parseInt(excludeId || "0"))
      .slice(0, parseInt(limit));

    return NextResponse.json(relatedProducts);
  } catch (error) {
    console.error("Error fetching related products:", error);
    return NextResponse.json({ error: "Failed to fetch related products" }, { status: 500 });
  }
}
