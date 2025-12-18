import { notFound } from "next/navigation";
import Image from "next/image";
import { prestashop } from "@/lib/prestashop/client";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await prestashop.getProduct(parseInt(id));

  if (!product) {
    return { title: "Produkt nie znaleziony" };
  }

  return {
    title: `${product.name} | PrestaShop Headless`,
    description: product.descriptionShort,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await prestashop.getProduct(parseInt(id));

  if (!product) {
    notFound();
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(price);
  };

  return (
    <div className="container py-8">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Brak zdjęcia
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(0, 4).map((img, index) => (
                <div
                  key={index}
                  className="relative aspect-square bg-muted rounded-md overflow-hidden"
                >
                  <Image
                    src={img}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            {product.reference && (
              <p className="text-sm text-muted-foreground mt-1">
                SKU: {product.reference}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
            {product.quantity > 0 ? (
              <Badge variant="secondary">W magazynie: {product.quantity}</Badge>
            ) : (
              <Badge variant="destructive">Brak w magazynie</Badge>
            )}
          </div>

          {product.descriptionShort && (
            <div
              className="prose prose-sm max-w-none text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: product.descriptionShort }}
            />
          )}

          <AddToCartButton product={product} />

          {product.description && (
            <div className="pt-6 border-t">
              <h2 className="text-lg font-semibold mb-4">Opis</h2>
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
