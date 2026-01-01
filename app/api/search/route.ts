import { NextRequest, NextResponse } from "next/server";
import { meilisearch } from "@/lib/meilisearch/client";
import { prestashop } from "@/lib/prestashop/client";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const limit = parseInt(searchParams.get("limit") || "8");
  const offset = parseInt(searchParams.get("offset") || "0");
  const category = searchParams.get("category");

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ products: [], totalHits: 0 });
  }

  try {
    // Try Meilisearch first
    const isMeiliHealthy = await meilisearch.isHealthy();

    if (isMeiliHealthy) {
      // Build filter
      let filter: string | undefined;
      if (category) {
        filter = `categoryId = ${category}`;
      }

      const { products, totalHits } = await meilisearch.searchProducts(query, {
        limit,
        offset,
        filter,
      });

      return NextResponse.json({
        products,
        totalHits,
        source: "meilisearch",
      });
    }

    // Fallback to PrestaShop if Meilisearch is unavailable
    console.warn("Meilisearch unavailable, falling back to PrestaShop search");
    const products = await prestashop.searchProducts(query, limit);

    return NextResponse.json({
      products,
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
        totalHits: products.length,
        source: "prestashop",
      });
    } catch (fallbackError) {
      console.error("Fallback search also failed:", fallbackError);
      return NextResponse.json(
        { products: [], totalHits: 0, error: "Search failed" },
        { status: 500 }
      );
    }
  }
}
