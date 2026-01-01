import { ProductCard } from "./product-card";
import type { Product } from "@/lib/prestashop/types";

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  // Filter out products that are out of stock
  const availableProducts = products.filter(
    (product) => product.quantity === null || product.quantity > 0
  );

  if (availableProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Brak produktów do wyświetlenia</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-5">
      {availableProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
