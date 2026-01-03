import { NextRequest, NextResponse } from "next/server";
import { meilisearch } from "@/lib/meilisearch/client";
import { binshops } from "@/lib/binshops/client";
import { searchLogger } from "@/lib/logger";

// Allowed filter fields for Meilisearch (whitelist)
const ALLOWED_FILTER_FIELDS = ["price", "manufacturerName", "quantity", "categoryId"];

// Validate and sanitize filter parameter
function sanitizeFilter(filterParam: string | null): string | null {
  if (!filterParam) return null;

  // Parse filter expressions and validate each one
  // Meilisearch filter format: "field = value" or "field >= value" etc.
  const filterParts = filterParam.split(" AND ");
  const sanitizedParts: string[] = [];

  for (const part of filterParts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    // Check if filter starts with allowed field
    const isAllowed = ALLOWED_FILTER_FIELDS.some((field) => {
      const fieldPattern = new RegExp(`^${field}\\s*(=|!=|>=|<=|>|<|TO)`, "i");
      return fieldPattern.test(trimmed);
    });

    if (isAllowed) {
      sanitizedParts.push(trimmed);
    } else {
      searchLogger.warn({ filter: trimmed }, "Rejected invalid filter field");
    }
  }

  return sanitizedParts.length > 0 ? sanitizedParts.join(" AND ") : null;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const limitParam = searchParams.get("limit");
  const offsetParam = searchParams.get("offset");
  const categoryParam = searchParams.get("category");
  const filterParam = searchParams.get("filter");
  const sortParam = searchParams.get("sort");
  const includeCategories = searchParams.get("categories") !== "false";

  // Validate and sanitize limit/offset
  const limit = Math.min(Math.max(1, parseInt(limitParam || "8") || 8), 100);
  const offset = Math.max(0, parseInt(offsetParam || "0") || 0);

  // Validate category as positive integer
  let categoryId: number | null = null;
  if (categoryParam) {
    const parsed = parseInt(categoryParam);
    if (!isNaN(parsed) && parsed > 0) {
      categoryId = parsed;
    } else {
      searchLogger.warn({ category: categoryParam }, "Invalid category parameter");
    }
  }

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ products: [], categories: [], totalHits: 0 });
  }

  try {
    // Try Meilisearch first
    const isMeiliHealthy = await meilisearch.isHealthy();

    if (isMeiliHealthy) {
      // Build filter - combine category and sanitized custom filter
      const filters: string[] = [];
      if (categoryId) {
        filters.push(`categoryId = ${categoryId}`);
      }

      // Sanitize user-provided filter
      const sanitizedFilter = sanitizeFilter(filterParam);
      if (sanitizedFilter) {
        filters.push(sanitizedFilter);
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

    // Fallback to Binshops if Meilisearch is unavailable
    searchLogger.warn("Meilisearch unavailable, falling back to Binshops search");
    const products = await binshops.searchProducts(query, limit);

    return NextResponse.json({
      products,
      categories: [],
      totalHits: products.length,
      source: "prestashop",
    });
  } catch (error) {
    searchLogger.error({ error: error instanceof Error ? error.message : error }, "Search API error");

    // Try Binshops as last resort
    try {
      const products = await binshops.searchProducts(query, limit);
      return NextResponse.json({
        products,
        categories: [],
        totalHits: products.length,
        source: "binshops",
      });
    } catch (fallbackError) {
      searchLogger.error({ error: fallbackError instanceof Error ? fallbackError.message : fallbackError }, "Fallback search also failed");
      return NextResponse.json(
        { products: [], categories: [], totalHits: 0, error: "Search failed" },
        { status: 500 }
      );
    }
  }
}
