import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import { binshops } from "@/lib/binshops/client";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { SafeHtml } from "@/components/ui/safe-html";
import { ProductGallery } from "@/components/products/product-gallery";
import { ProductAccordion } from "@/components/products/product-accordion";
import { ProductCard } from "@/components/products/product-card";

// ISR - revalidate every 5 minutes
export const revalidate = 300;

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await binshops.getProduct(parseInt(id));

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
  const productId = parseInt(id);
  const product = await binshops.getProduct(productId);

  if (!product) {
    notFound();
  }

  // Get related products and category path in parallel
  const [relatedProducts, categoryPath] = await Promise.all([
    product.categoryId ? binshops.getRelatedProducts(productId, 4) : Promise.resolve([]),
    product.categorySlug ? binshops.getCategoryPathBySlug(product.categorySlug) : Promise.resolve([]),
  ]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(price);
  };

  const breadcrumbItems = [
    ...categoryPath.map((cat) => ({ label: cat.name, href: `/categories/${cat.id}` })),
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
        <ProductGallery images={allImages} productName={product.name} product={product} />

        {/* Right - Product Info */}
        <div className="space-y-6">
          {/* Title */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => {
                  const rating = 4.7;
                  const fillPercent = Math.min(100, Math.max(0, (rating - star + 1) * 100));
                  return (
                    <div key={star} className="relative size-4">
                      <Star className="size-4 text-muted-foreground/30 absolute" />
                      <div className="overflow-hidden absolute" style={{ width: `${fillPercent}%` }}>
                        <Star className="size-4 fill-yellow-400 text-yellow-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
              <span className="text-sm text-muted-foreground">4.7 (3 opinie)</span>
            </div>
          </div>

          {/* Price */}
          <span className="text-3xl font-bold">{formatPrice(product.price)}</span>

          {/* Short description */}
          {product.descriptionShort && (
            <SafeHtml
              html={product.descriptionShort}
              className="prose prose-sm max-w-none text-muted-foreground"
            />
          )}

          {/* Add to cart section with benefits */}
          <div className="pt-6">
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-6">Inni klienci przeglądali również</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}

      {/* Accordion sections */}
      <div className="mt-12">
        <ProductAccordion product={product} />
      </div>
    </div>
  );
}
