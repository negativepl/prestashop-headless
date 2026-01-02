import { NextResponse } from "next/server";
import { binshops } from "@/lib/binshops/client";

// ISR - revalidate every 5 minutes
export const revalidate = 300;

export async function GET() {
  try {
    // Fetch data in parallel - get regular products as featured may not have images
    const [{ products }, categories] = await Promise.all([
      binshops.getProducts({ limit: 8 }),
      binshops.getCategoryTree(),
    ]);

    // Get unique manufacturers from products
    const manufacturersMap = new Map<number, { id: number; name: string }>();
    products.forEach((product) => {
      if (product.manufacturerId && product.manufacturerName) {
        manufacturersMap.set(product.manufacturerId, {
          id: product.manufacturerId,
          name: product.manufacturerName,
        });
      }
    });
    const manufacturers = Array.from(manufacturersMap.values()).slice(0, 8);

    // Flatten categories to get top-level ones with most products
    const flatCategories = categories.slice(0, 8).map((cat) => ({
      id: cat.id,
      name: cat.name,
    }));

    // Popular search terms (could be stored in DB or generated from analytics)
    const popularSearches = [
      "iPhone 16",
      "etui MagSafe",
      "ładowarka USB-C",
      "szkło hartowane",
      "AirPods",
      "kabel Lightning",
      "powerbank",
      "uchwyt samochodowy",
    ];

    return NextResponse.json({
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        imageUrl: p.imageUrl,
        manufacturerName: p.manufacturerName,
      })),
      categories: flatCategories,
      manufacturers,
      popularSearches,
    });
  } catch (error) {
    console.error("Error fetching search suggestions:", error);
    return NextResponse.json(
      { error: "Failed to fetch suggestions" },
      { status: 500 }
    );
  }
}
