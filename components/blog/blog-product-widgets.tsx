"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { AddToCartDialog } from "@/components/cart/add-to-cart-dialog";
import type { Product } from "@/lib/prestashop/types";

interface ProductWidgetProps {
  categoryId: number;
  limit: number;
}

function ProductWidget({ categoryId, limit }: ProductWidgetProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const [dialogProduct, setDialogProduct] = useState<Product | null>(null);
  const [dialogQuantity, setDialogQuantity] = useState(1);
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch(`/api/products?categoryId=${categoryId}&limit=${limit}`);
        if (res.ok) {
          const data = await res.json();
          const productList = Array.isArray(data) ? data : data.products || [];
          setProducts(productList);
          // Initialize quantities
          const initialQuantities: Record<number, number> = {};
          productList.forEach((p: Product) => {
            initialQuantities[p.id] = 1;
          });
          setQuantities(initialQuantities);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [categoryId, limit]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(price);
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    const qty = quantities[product.id] || 1;
    addItem(product, qty);
    setDialogProduct(product);
    setDialogQuantity(qty);
  };

  const incrementQuantity = (e: React.MouseEvent, productId: number, maxQty: number | null) => {
    e.preventDefault();
    e.stopPropagation();
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.min((prev[productId] || 1) + 1, maxQty ?? 99),
    }));
  };

  const decrementQuantity = (e: React.MouseEvent, productId: number) => {
    e.preventDefault();
    e.stopPropagation();
    setQuantities((prev) => ({
      ...prev,
      [productId]: Math.max((prev[productId] || 1) - 1, 1),
    }));
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
        {Array.from({ length: Math.min(limit, 4) }).map((_, i) => (
          <div key={i} className="bg-accent rounded-lg border animate-pulse">
            <div className="aspect-square bg-muted" />
            <div className="p-2.5 space-y-2">
              <div className="h-3 bg-muted rounded" />
              <div className="h-3 w-2/3 bg-muted rounded" />
              <div className="flex justify-between pt-1">
                <div className="h-4 w-16 bg-muted rounded" />
                <div className="h-3 w-12 bg-muted rounded" />
              </div>
              <div className="h-8 bg-muted rounded mt-2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
        {products.map((product) => {
          const isOutOfStock = product.quantity !== null && product.quantity <= 0;
          const qty = quantities[product.id] || 1;

          return (
            <div
              key={product.id}
              className="group bg-accent rounded-lg border overflow-hidden transition-all duration-300 hover:border-foreground/20 flex flex-col"
            >
              <Link href={`/products/${product.id}`}>
                <div className="relative aspect-square overflow-hidden bg-white p-4">
                  {product.imageUrl ? (
                    <div className="w-full h-full flex items-center justify-center">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className={`max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105 ${isOutOfStock ? "grayscale opacity-60" : ""}`}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
                      Brak zdjęcia
                    </div>
                  )}
                </div>
              </Link>

              <div className="p-2.5 flex flex-col flex-1">
                <Link href={`/products/${product.id}`} className="no-underline">
                  <span className="block font-medium text-sm line-clamp-2 hover:text-primary transition-colors leading-tight">
                    {product.name}
                  </span>
                </Link>

                {/* Price, quantity and cart - always at bottom */}
                <div className="mt-auto pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold">{formatPrice(product.price)}</span>
                    {!isOutOfStock && (
                      <span className="text-[10px] font-medium flex items-center gap-1 text-muted-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        {product.quantity !== null ? `${product.quantity} szt.` : "Dostępny"}
                      </span>
                    )}
                  </div>

                  <div className="pt-2 border-t">
                  {isOutOfStock ? (
                    <Button disabled className="w-full h-8 text-xs" variant="secondary">
                      Niedostępny
                    </Button>
                  ) : (
                    <div className="flex gap-1.5 items-stretch">
                      {/* Quantity selector */}
                      <div className="flex items-center border rounded-md overflow-hidden bg-muted/50 h-8">
                        <button
                          onClick={(e) => decrementQuantity(e, product.id)}
                          className="h-full w-7 flex items-center justify-center hover:bg-muted transition-colors"
                          disabled={qty <= 1}
                        >
                          <Minus className="size-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-medium">{qty}</span>
                        <button
                          onClick={(e) => incrementQuantity(e, product.id, product.quantity)}
                          className="h-full w-7 flex items-center justify-center hover:bg-muted transition-colors"
                          disabled={qty >= (product.quantity ?? 99)}
                        >
                          <Plus className="size-3" />
                        </button>
                      </div>

                      {/* Add to cart button */}
                      <Button
                        onClick={(e) => handleAddToCart(e, product)}
                        className="flex-1 h-8 text-xs gap-1"
                      >
                        <ShoppingCart className="size-3" />
                        <span className="hidden sm:inline">Dodaj</span>
                      </Button>
                    </div>
                  )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {dialogProduct && (
        <AddToCartDialog
          open={!!dialogProduct}
          onOpenChange={(open) => !open && setDialogProduct(null)}
          product={dialogProduct}
          quantity={dialogQuantity}
        />
      )}
    </>
  );
}

export function BlogProductWidgets() {
  const [widgets, setWidgets] = useState<{ categoryId: number; limit: number; element: Element }[]>([]);

  useEffect(() => {
    const elements = document.querySelectorAll(".wp-product-widget");
    const widgetData: { categoryId: number; limit: number; element: Element }[] = [];

    elements.forEach((el) => {
      const categoryId = parseInt(el.getAttribute("data-category-id") || "0", 10);
      const limit = parseInt(el.getAttribute("data-limit") || "4", 10);
      if (categoryId > 0) {
        widgetData.push({ categoryId, limit, element: el });
      }
    });

    setWidgets(widgetData);
  }, []);

  return (
    <>
      {widgets.map((widget, index) => {
        // Create a portal to render in place of the placeholder
        const container = widget.element;
        if (!container) return null;

        return (
          <ProductWidgetPortal key={index} container={container}>
            <ProductWidget categoryId={widget.categoryId} limit={widget.limit} />
          </ProductWidgetPortal>
        );
      })}
    </>
  );
}

// Simple portal component
import { createPortal } from "react-dom";

function ProductWidgetPortal({
  children,
  container,
}: {
  children: React.ReactNode;
  container: Element;
}) {
  return createPortal(children, container);
}
