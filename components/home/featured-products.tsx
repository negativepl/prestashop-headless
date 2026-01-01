import { ProductCard } from "@/components/products/product-card";
import type { Product } from "@/lib/prestashop/types";

interface FeaturedProductsProps {
  products: Product[];
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  if (products.length === 0) return null;

  return (
    <div className="bg-card rounded-2xl p-6 md:p-10 border">
      {/* Header */}
      <div className="mb-8">
        <span className="text-primary font-semibold text-sm uppercase tracking-wider">
          Polecane
        </span>
        <h2 className="text-3xl md:text-4xl font-bold mt-2">
          Polecane produkty
        </h2>
        <p className="mt-2 text-muted-foreground">
          Sprawdź nasze rekomendacje dla Ciebie
        </p>
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-5">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} priority={index === 0} />
        ))}
      </div>
    </div>
  );
}
