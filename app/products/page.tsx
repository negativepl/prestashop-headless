import { ProductGrid } from "@/components/products/product-grid";
import { prestashop } from "@/lib/prestashop/client";
import type { Product } from "@/lib/prestashop/types";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

// ISR - revalidate every 5 minutes
export const revalidate = 300;

export const metadata = {
  title: "Produkty | PrestaShop Headless",
  description: "Lista wszystkich produktów",
};

export default async function ProductsPage() {
  let products: Product[] = [];
  let error: string | null = null;

  try {
    products = await prestashop.getProducts({ limit: 100, withStock: true });
  } catch (e) {
    error = e instanceof Error ? e.message : "Błąd połączenia z API";
  }

  return (
    <div className="container py-8">
      <Breadcrumbs items={[{ label: "Produkty" }]} />
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold">Produkty</h1>
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
