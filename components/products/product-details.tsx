import type { Product } from "@/lib/prestashop/types";

interface ProductDetailsProps {
  product: Product;
}

export function ProductDetailsContent({ product }: ProductDetailsProps) {
  const details = [
    { label: "Marka", value: product.manufacturerName },
    { label: "SKU", value: product.reference },
    { label: "EAN", value: product.ean13 || "-" },
    { label: "Stan magazynowy", value: product.quantity !== null ? (product.quantity > 0 ? `${product.quantity} szt.` : "Brak") : null },
  ].filter((detail) => detail.value);

  if (details.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-lg border">
      <table className="w-full text-sm">
        <tbody className="divide-y">
          {details.map((detail, index) => (
            <tr key={detail.label} className={index % 2 === 0 ? "bg-muted/30" : ""}>
              <td className="px-4 py-3 text-muted-foreground font-medium w-1/3">{detail.label}</td>
              <td className="px-4 py-3">{detail.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
