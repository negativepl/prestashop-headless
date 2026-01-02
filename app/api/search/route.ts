import { NextRequest, NextResponse } from "next/server";
import { meilisearch } from "@/lib/meilisearch/client";
import { prestashop } from "@/lib/prestashop/client";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const limit = parseInt(searchParams.get("limit") || "8");
  const offset = parseInt(searchParams.get("offset") || "0");
  const category = searchParams.get("category");
  const filterParam = searchParams.get("filter");
  const sortParam = searchParams.get("sort");
  const includeCategories = searchParams.get("categories") !== "false";

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ products: [], categories: [], totalHits: 0 });
  }

  try {
    // Try Meilisearch first
    const isMeiliHealthy = await meilisearch.isHealthy();

    if (isMeiliHealthy) {
      // Build filter - combine category and custom filter
      const filters: string[] = [];
      if (category) {
        filters.push(`categoryId = ${category}`);
      }
      if (filterParam) {
        filters.push(filterParam);
      }
      const filter = filters.length > 0 ? filters.join(" AND ") : undefined;

      // Parse sort parameter
      let sort: string[] | undefined;
      if (sortParam) {
        try {
          sort = JSON.parse(sortParam);
        } catch {
          // Invalid sort param, ignore
        }
      }

      // Search products and categories in parallel
      const [productsResult, categoriesResult] = await Promise.all([
        meilisearch.searchProducts(query, { limit, offset, filter, sort }),
        includeCategories && offset === 0
          ? meilisearch.searchCategories(query, { limit: 5 })
          : Promise.resolve({ categories: [], totalHits: 0 }),
      ]);

      return NextResponse.json({
        products: productsResult.products,
        categories: categoriesResult.categories,
        totalHits: productsResult.totalHits,
        source: "meilisearch",
      });
    }

    // Fallback to PrestaShop if Meilisearch is unavailable
    console.warn("Meilisearch unavailable, falling back to PrestaShop search");
    const products = await prestashop.searchProducts(query, limit);

    return NextResponse.json({
      products,
      categories: [],
      totalHits: products.length,
      source: "prestashop",
    });
  } catch (error) {
    console.error("Search API error:", error);

    // Try PrestaShop as last resort
    try {
      const products = await prestashop.searchProducts(query, limit);
      return NextResponse.json({
        products,
        categories: [],
        totalHits: products.length,
        source: "prestashop",
      });
    } catch (fallbackError) {
      console.error("Fallback search also failed:", fallbackError);
      return NextResponse.json(
        { products: [], categories: [], totalHits: 0, error: "Search failed" },
        { status: 500 }
      );
    }
  }
}
