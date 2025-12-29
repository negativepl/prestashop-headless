import type { Product } from "@/lib/prestashop/types";

interface ProductDetailsProps {
  product: Product;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const details = [
    { label: "SKU", value: product.reference },
    { label: "Producent", value: product.manufacturerName },
    { label: "Stan magazynowy", value: product.quantity !== null ? (product.quantity > 0 ? `${product.quantity} szt.` : "Brak") : null },
    { label: "EAN", value: product.ean13 || "-" },
  ].filter((detail) => detail.value);

  if (details.length === 0) return null;

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="bg-muted px-4 py-3">
        <h3 className="font-semibold">Szczegóły produktu</h3>
      </div>
      <div className="divide-y">
        {details.map((detail) => (
          <div key={detail.label} className="flex px-4 py-3">
            <span className="text-muted-foreground w-40 shrink-0">{detail.label}</span>
            <span className="font-medium">{detail.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
