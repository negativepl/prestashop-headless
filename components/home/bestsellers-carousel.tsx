import { ProductCard } from "@/components/products/product-card";
import type { Product } from "@/lib/prestashop/types";

interface BestsellersCarouselProps {
  products: Product[];
}

export function BestsellersCarousel({ products }: BestsellersCarouselProps) {
  if (products.length === 0) return null;

  return (
    <div className="md:hidden -mx-6">
      <div
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth px-6 pb-4 -mb-4 scroll-pl-6"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="snap-start shrink-0"
            style={{ width: "75%" }}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}
