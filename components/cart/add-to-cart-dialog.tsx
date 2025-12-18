"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, ShoppingBag, ArrowRight, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
  const { total, itemCount } = useCart();
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const { addItem } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(price);
  };

  useEffect(() => {
    if (open && product.categoryId) {
      setLoading(true);
      fetch(`/api/products/related?categoryId=${product.categoryId}&excludeId=${product.id}&limit=4`)
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
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden p-0">
        <div className="flex flex-col md:flex-row">
          {/* Left side - Added product & actions */}
          <div className="flex-1 p-6 flex flex-col">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center">
                  <Check className="size-5 text-background" />
                </div>
                Dodano do koszyka
              </DialogTitle>
            </DialogHeader>

            {/* Added product */}
            <div className="flex gap-4 py-6">
              <div className="w-24 h-24 flex-shrink-0 bg-muted rounded-lg overflow-hidden">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="object-cover w-full h-full"
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

            {/* Cart summary */}
            <div className="bg-muted/50 rounded-lg p-4 mt-auto">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ShoppingBag className="size-4" />
                  <span>W koszyku: {itemCount} {itemCount === 1 ? "produkt" : itemCount < 5 ? "produkty" : "produktów"}</span>
                </div>
                <span className="font-bold text-lg">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              <Button
                variant="outline"
                size="lg"
                className="flex-1 h-12"
                onClick={() => onOpenChange(false)}
              >
                Kontynuuj zakupy
              </Button>
              <Link href="/checkout" className="flex-1">
                <Button size="lg" className="w-full h-12 gap-2">
                  <ShoppingCart className="size-5" />
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
              <div className="w-full md:w-[340px] bg-muted/30 p-6 overflow-y-auto max-h-[400px] md:max-h-none">
                <h4 className="font-semibold mb-4">Może Ci się spodobać</h4>

                {loading ? (
                  <div className="text-center text-sm text-muted-foreground py-8">
                    Ładowanie propozycji...
                  </div>
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence>
                      {relatedProducts.map((relatedProduct, index) => (
                        <motion.div
                          key={relatedProduct.id}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex gap-3 bg-background rounded-lg p-3 border hover:border-foreground/30 transition-colors"
                        >
                          <Link
                            href={`/products/${relatedProduct.id}`}
                            onClick={() => onOpenChange(false)}
                            className="w-16 h-16 flex-shrink-0 bg-muted rounded-md overflow-hidden"
                          >
                            {relatedProduct.imageUrl ? (
                              <img
                                src={relatedProduct.imageUrl}
                                alt={relatedProduct.name}
                                className="object-cover w-full h-full"
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
                              className="text-sm font-medium line-clamp-2 hover:text-primary transition-colors"
                            >
                              {relatedProduct.name}
                            </Link>
                            <div className="flex items-center justify-between mt-auto pt-1">
                              <p className="font-bold text-sm">{formatPrice(relatedProduct.price)}</p>
                              <Button
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleAddRelated(relatedProduct)}
                              >
                                <ShoppingCart className="size-4" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
