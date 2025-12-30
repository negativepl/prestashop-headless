import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import { prestashop } from "@/lib/prestashop/client";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ProductGallery } from "@/components/products/product-gallery";
import { ProductAccordion } from "@/components/products/product-accordion";

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

  // Get category path for breadcrumbs
  const categoryPath = product.categoryId
    ? await prestashop.getCategoryPath(product.categoryId)
    : [];

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
        <ProductGallery images={allImages} productName={product.name} />

        {/* Right - Product Info */}
        <div className="space-y-6">
          {/* Title */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="size-4 text-muted-foreground/60"
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">Recenzje (0)</span>
            </div>
          </div>

          {/* Price */}
          <span className="text-3xl font-bold">{formatPrice(product.price)}</span>

          {/* Short description */}
          {product.descriptionShort && (
            <div
              className="prose prose-sm max-w-none text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: product.descriptionShort }}
            />
          )}

          {/* Add to cart section with benefits */}
          <div className="pt-6">
            <AddToCartButton product={product} />
          </div>
        </div>
      </div>

      {/* Accordion sections */}
      <div className="mt-12">
        <ProductAccordion product={product} />
      </div>
    </div>
  );
}
