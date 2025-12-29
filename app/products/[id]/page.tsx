import { notFound } from "next/navigation";
import { prestashop } from "@/lib/prestashop/client";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ProductGallery } from "@/components/products/product-gallery";
import { ProductDetails } from "@/components/products/product-details";
import { ProductReviews } from "@/components/products/product-reviews";
import { Separator } from "@/components/ui/separator";

// ISR - revalidate every 5 minutes
export const revalidate = 300;

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

  // Get category for breadcrumbs
  const category = product.categoryId
    ? await prestashop.getCategory(product.categoryId)
    : null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(price);
  };

  const breadcrumbItems = [
    { label: "Produkty", href: "/products" },
    ...(category ? [{ label: category.name, href: `/categories/${category.id}` }] : []),
    { label: product.name },
  ];

  // Prepare images array
  const allImages = product.imageUrl
    ? [product.imageUrl, ...product.images.filter((img) => img !== product.imageUrl)]
    : product.images;

  return (
    <div className="container py-8">
      <Breadcrumbs items={breadcrumbItems} />

      {/* Product main section */}
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left - Images */}
        <ProductGallery images={allImages} productName={product.name} />

        {/* Right - Product Info */}
        <div className="space-y-6">
          {/* Title & SKU */}
          <div>
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl lg:text-3xl font-bold">{product.name}</h1>
              {product.manufacturerName && (
                <Badge variant="secondary" className="shrink-0">
                  {product.manufacturerName}
                </Badge>
              )}
            </div>
            {product.reference && (
              <p className="text-sm text-muted-foreground mt-1">
                SKU: {product.reference}
              </p>
            )}
          </div>

          {/* Price & Stock */}
          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold">{formatPrice(product.price)}</span>
            {product.quantity !== null && (
              product.quantity > 0 ? (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  W magazynie: {product.quantity} szt.
                </Badge>
              ) : (
                <Badge variant="destructive">Brak w magazynie</Badge>
              )
            )}
          </div>

          {/* Short description */}
          {product.descriptionShort && (
            <div
              className="prose prose-sm max-w-none text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: product.descriptionShort }}
            />
          )}

          <Separator />

          {/* Add to cart section with benefits */}
          <AddToCartButton product={product} />
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4">Opis produktu</h2>
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </div>
      )}

      {/* Product details */}
      <div className="mt-12">
        <ProductDetails product={product} />
      </div>

      {/* Reviews */}
      <div className="mt-12">
        <ProductReviews productId={product.id} />
      </div>
    </div>
  );
}
