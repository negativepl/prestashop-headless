import { ProductCardMini } from "@/components/products/product-card-mini";
import type { Product } from "@/lib/prestashop/types";

interface WeeklyHitsProps {
  products: Product[];
}

export function WeeklyHits({ products }: WeeklyHitsProps) {
  if (products.length === 0) return null;

  return (
    <div className="bg-card rounded-2xl border overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="p-4 md:p-6 pb-0">
        <span className="font-bold text-lg">Polecane produkty</span>
      </div>

      {/* Products - 2 rows x 4 columns grid */}
      <div className="p-4 md:p-6 pt-4 flex-1">
        <div className="grid grid-cols-4 grid-rows-2 gap-3 h-full">
          {products.slice(0, 8).map((product) => (
            <ProductCardMini key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
