import { NextResponse } from "next/server";
import { prestashop } from "@/lib/prestashop/client";
import type { Category } from "@/lib/prestashop/types";

// Skip static generation during build - fetch on-demand
export const dynamic = "force-dynamic";
// ISR - cache for 10 minutes
export const revalidate = 600;

export async function GET() {
  try {
    // Fetch ALL categories in one request
    const allCategories = await prestashop.getCategories({ active: true });

    // Build tree structure (root parentId = 2 in PrestaShop)
    const buildTree = (parentId: number): Category[] => {
      return allCategories
        .filter(cat => cat.parentId === parentId)
        .map(cat => {
          const children = buildTree(cat.id);
          return {
            ...cat,
            children: children.length > 0 ? children : undefined,
          };
        });
    };

    const tree = buildTree(2);

    return NextResponse.json(tree);
  } catch (error) {
    console.error("Error fetching category tree:", error);
    return NextResponse.json(
      { error: "Failed to fetch category tree" },
      { status: 500 }
    );
  }
}
