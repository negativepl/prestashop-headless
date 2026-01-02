import { ProductGrid } from "@/components/products/product-grid";
import { SearchResults } from "@/components/search/search-results";
import { binshops } from "@/lib/binshops/client";
import type { Product } from "@/lib/prestashop/types";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

// Dynamic page for search
export const dynamic = "force-dynamic";

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  const { search } = await searchParams;
  if (search) {
    return {
      title: `"${search}" - Wyniki wyszukiwania | Kestrel`,
      description: `Wyniki wyszukiwania dla "${search}"`,
    };
  }
  return {
    title: "Produkty | Kestrel",
    description: "Lista wszystkich produktów",
  };
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ search?: string }> }) {
  const { search } = await searchParams;
  const isSearchMode = !!search?.trim();

  // For search mode, render client component with filters
  if (isSearchMode && search) {
    return <SearchResults query={search.trim()} />;
  }

  // Regular product listing (server-rendered)
  let products: Product[] = [];
  let error: string | null = null;

  try {
    const result = await binshops.getProducts({ limit: 100 });
    products = result.products;
  } catch (e) {
    error = e instanceof Error ? e.message : "Błąd połączenia z API";
  }

  return (
    <div className="container py-8">
      <Breadcrumbs items={[{ label: "Produkty" }]} />

      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Produkty</h1>
        <p className="text-muted-foreground mt-2">
          Przeglądaj wszystkie dostępne produkty
        </p>
      </div>

      {error ? (
        <div className="text-center py-12 bg-muted rounded-lg">
          <p className="text-destructive font-medium">Błąd połączenia z PrestaShop</p>
          <p className="text-sm text-muted-foreground mt-2">{error}</p>
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}
