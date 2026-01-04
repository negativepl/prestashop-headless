import { NextRequest, NextResponse } from "next/server";
import { binshops } from "@/lib/binshops/client";

// ISR - revalidate every 5 minutes
export const revalidate = 300;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const categoryId = parseInt(id);

  const searchParams = request.nextUrl.searchParams;
  const limit = parseInt(searchParams.get("limit") || "24");
  const page = parseInt(searchParams.get("page") || "1");
  const sort = searchParams.get("sort");
  const filters = searchParams.get("q");

  // Map sort options
  const sortMap: Record<string, string> = {
    "price-asc": "price_asc",
    "price-desc": "price_desc",
    "name-asc": "name",
    "date": "date",
    "sales": "sales",
  };

  try {
    // Fetch all data in parallel - uses shared bootstrap cache
    const [category, subcategories, categoryPath, productsData] = await Promise.all([
      binshops.getCategory(categoryId),
      binshops.getCategories({ parentId: categoryId }),
      binshops.getCategoryPath(categoryId),
      binshops.getProducts({
        categoryId,
        limit,
        page,
        sortBy: sort ? (sortMap[sort] as "date" | "price_asc" | "price_desc" | "name" | "sales") : "date",
        filters: filters || undefined,
      }),
    ]);

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        category,
        subcategories,
        categoryPath,
        products: productsData.products,
        total: productsData.total,
        facets: productsData.facets || [],
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching category full data:", error);
    return NextResponse.json(
      { error: "Failed to fetch category data" },
      { status: 500 }
    );
  }
}
