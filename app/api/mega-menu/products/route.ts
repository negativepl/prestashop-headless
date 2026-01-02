import { NextRequest, NextResponse } from "next/server";
import { binshops } from "@/lib/binshops/client";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const categoryId = searchParams.get("categoryId");
  const limit = parseInt(searchParams.get("limit") || "2");

  if (!categoryId) {
    return NextResponse.json({ error: "categoryId is required" }, { status: 400 });
  }

  try {
    const { products } = await binshops.getProducts({
      categoryId: parseInt(categoryId),
      limit,
    });

    // Return simplified product data for mega menu
    const simplifiedProducts = products.map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      imageUrl: p.imageUrl,
    }));

    return NextResponse.json({ products: simplifiedProducts });
  } catch (error) {
    console.error("Error fetching mega menu products:", error);
    return NextResponse.json({ products: [] });
  }
}
