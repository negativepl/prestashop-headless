import { NextRequest, NextResponse } from "next/server";
import { binshops } from "@/lib/binshops/client";

// ISR - revalidate every 5 minutes
export const revalidate = 300;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const categoryId = searchParams.get("categoryId");
  const limit = searchParams.get("limit");
  const page = searchParams.get("page");
  const sort = searchParams.get("sort");
  const filters = searchParams.get("q"); // Faceted search filter

  // Map sort options
  const sortMap: Record<string, string> = {
    "price-asc": "price_asc",
    "price-desc": "price_desc",
    "name-asc": "name",
    "date": "date",
    "sales": "sales",
  };

  try {
    const sortBy = sort ? (sortMap[sort] as "date" | "price_asc" | "price_desc" | "name" | "sales") : "date";

    const { products, total, facets } = await binshops.getProducts({
      categoryId: categoryId ? parseInt(categoryId) : 2,
      limit: limit ? parseInt(limit) : 24,
      page: page ? parseInt(page) : 1,
      sortBy,
      filters: filters || undefined,
    });

    return NextResponse.json(
      { products, total, facets },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products", products: [], total: 0, facets: [] },
      { status: 500 }
    );
  }
}
