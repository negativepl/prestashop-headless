import { NextResponse } from "next/server";
import { binshops } from "@/lib/binshops/client";
import type { Category } from "@/lib/prestashop/types";

// Skip static generation during build - fetch on-demand
export const dynamic = "force-dynamic";
// ISR - cache for 10 minutes
export const revalidate = 600;

// Map Binshops menu item to Category
function mapMenuItem(item: any, depth: number = 0): Category {
  return {
    id: item.id,
    name: item.label,
    description: "",
    parentId: 2, // We don't have parent info, assume root
    level: depth,
    active: true,
    children: item.children?.length > 0
      ? item.children.map((child: any) => mapMenuItem(child, depth + 1))
      : undefined,
  };
}

export async function GET() {
  try {
    // Use Binshops bootstrap which returns menu with categories tree
    const bootstrap = await binshops.getBootstrap();

    if (!bootstrap?.psdata?.menuItems) {
      return NextResponse.json([]);
    }

    const tree = bootstrap.psdata.menuItems
      .filter((item: any) => item.type === "category")
      .map((item: any) => mapMenuItem(item));

    return NextResponse.json(tree);
  } catch (error) {
    console.error("Error fetching category tree:", error);
    return NextResponse.json(
      { error: "Failed to fetch category tree" },
      { status: 500 }
    );
  }
}
