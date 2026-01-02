import { NextRequest, NextResponse } from "next/server";
import { binshops } from "@/lib/binshops/client";

// ISR - revalidate every 5 minutes
export const revalidate = 300;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const categoryId = searchParams.get("categoryId");
  const limit = searchParams.get("limit");
  const offset = searchParams.get("offset");
  const page = searchParams.get("page");
  const sortByStock = searchParams.get("sortByStock") === "true";

  try {
    const { products } = await binshops.getProducts({
      categoryId: categoryId ? parseInt(categoryId) : 2,
      limit: limit ? parseInt(limit) : 24,
      offset: offset ? parseInt(offset) : 0,
      page: page ? parseInt(page) : undefined,
      sortBy: sortByStock ? "sales" : "date",
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
