"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Check, ShoppingCart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/use-cart";
import type { Product } from "@/lib/prestashop/types";

interface AddToCartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  quantity: number;
}

export function AddToCartDialog({
  open,
  onOpenChange,
  product,
  quantity,
}: AddToCartDialogProps) {
  const { addItem } = useCart();
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(price);
  };

  useEffect(() => {
    if (open && product.categoryId) {
      setLoading(true);
      fetch(`/api/products/related?categoryId=${product.categoryId}&excludeId=${product.id}&limit=3`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setRelatedProducts(data);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [open, product.categoryId, product.id]);

  const handleAddRelated = (relatedProduct: Product) => {
    addItem(relatedProduct, 1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden p-0 bg-accent">
        <div className="flex flex-col md:flex-row">
          {/* Left side - Added product & actions */}
          <div className="flex-1 p-6 flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="size-3.5 text-white" />
                </div>
                Dodano do koszyka
              </DialogTitle>
            </DialogHeader>

            {/* Added product */}
            <div className="flex gap-4 py-6">
              <div className="relative w-24 h-24 flex-shrink-0 bg-white rounded-lg overflow-hidden p-2">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="96px"
                    className="object-contain"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                    Brak
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium line-clamp-2">{product.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Ilość: {quantity}
                </p>
                <p className="font-bold text-lg mt-2">{formatPrice(product.price * quantity)}</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 mt-auto">
              <Button
                variant="ghost"
                className="flex-1 hover:bg-transparent hover:text-primary"
                onClick={() => onOpenChange(false)}
              >
                Kontynuuj zakupy
              </Button>
              <Link href="/checkout" className="flex-1">
                <Button className="w-full gap-2">
                  <ShoppingCart className="size-4" />
                  Przejdź do koszyka
                </Button>
              </Link>
            </div>
          </div>

          {/* Right side - Related products */}
          {(relatedProducts.length > 0 || loading) && (
            <>
              <Separator orientation="vertical" className="hidden md:block" />
              <Separator className="md:hidden" />
              <div className="w-full md:w-[380px] bg-card p-6 overflow-y-auto max-h-[400px] md:max-h-none">
                <h4 className="font-semibold mb-4">Może Ci się spodobać</h4>

                <div className="space-y-3">
                  {loading ? (
                    [1, 2, 3].map((i) => (
                      <div key={i} className="bg-accent rounded-lg p-3 border h-[120px] animate-pulse">
                        <div className="flex gap-3 h-full">
                          <div className="w-20 h-20 flex-shrink-0 bg-muted rounded-md" />
                          <div className="flex-1 flex flex-col">
                            <div className="min-h-[54px]">
                              <div className="h-4 bg-muted rounded w-full mb-2" />
                              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                              <div className="h-4 bg-muted rounded w-1/2" />
                            </div>
                            <div className="flex items-center justify-between mt-auto">
                              <div className="h-5 bg-muted rounded w-16" />
                              <div className="h-8 bg-muted rounded w-24" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    relatedProducts.map((relatedProduct) => (
                      <div
                        key={relatedProduct.id}
                        className="bg-accent rounded-lg p-3 border h-[120px] hover:border-foreground/30 transition-colors"
                      >
                        <div className="flex gap-3 h-full">
                          <Link
                            href={`/products/${relatedProduct.id}`}
                            onClick={() => onOpenChange(false)}
                            className="relative w-20 h-20 flex-shrink-0 bg-white rounded-md overflow-hidden"
                          >
                            {relatedProduct.imageUrl ? (
                              <Image
                                src={relatedProduct.imageUrl}
                                alt={relatedProduct.name}
                                fill
                                sizes="80px"
                                className="object-contain p-1"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                                Brak
                              </div>
                            )}
                          </Link>
                          <div className="flex-1 min-w-0 flex flex-col">
                            <Link
                              href={`/products/${relatedProduct.id}`}
                              onClick={() => onOpenChange(false)}
                              className="text-sm font-medium line-clamp-3 min-h-[54px] hover:text-primary transition-colors"
                            >
                              {relatedProduct.name}
                            </Link>
                            <div className="flex items-center justify-between mt-auto">
                              <p className="font-bold">{formatPrice(relatedProduct.price)}</p>
                              <Button
                                size="sm"
                                className="h-8 gap-1.5"
                                onClick={() => handleAddRelated(relatedProduct)}
                              >
                                <ShoppingCart className="size-3.5" />
                                Do koszyka
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
