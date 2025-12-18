"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FavoriteButton } from "@/components/products/favorite-button";
import { AddToCartDialog } from "@/components/cart/add-to-cart-dialog";
import { useCart } from "@/hooks/use-cart";
import type { Product } from "@/lib/prestashop/types";

interface ProductCardRowProps {
  product: Product;
}

export function ProductCardRow({ product }: ProductCardRowProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(price);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, quantity);
    setDialogOpen(true);
  };

  const incrementQuantity = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuantity((q) => Math.min(q + 1, product.quantity || 99));
  };

  const decrementQuantity = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuantity((q) => Math.max(q - 1, 1));
  };

  const isOutOfStock = product.quantity <= 0;

  return (
    <div className="group bg-card rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-foreground/20">
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <Link href={`/products/${product.id}`} className="sm:w-40 md:w-48 shrink-0">
          <div className="relative aspect-square sm:aspect-auto sm:h-full overflow-hidden bg-muted">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex items-center justify-center h-full min-h-[160px] text-muted-foreground text-sm">
                Brak zdjęcia
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {isOutOfStock && (
                <Badge variant="destructive" className="text-xs">
                  Wyprzedane
                </Badge>
              )}
              {!isOutOfStock && product.quantity <= 5 && (
                <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700 hover:bg-orange-100">
                  Ostatnie sztuki
                </Badge>
              )}
            </div>
          </div>
        </Link>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col sm:flex-row gap-4">
          {/* Info */}
          <div className="flex-1 min-w-0">
            {/* Favorite button - top right */}
            <div className="flex items-start justify-between gap-2">
              <Link href={`/products/${product.id}`} className="flex-1">
                <h3 className="font-semibold text-base line-clamp-2 hover:text-primary transition-colors leading-tight">
                  {product.name}
                </h3>
              </Link>
              <FavoriteButton
                product={product}
                className="shrink-0 -mt-1"
              />
            </div>

            {/* Details - vertical list */}
            <div className="mt-3 space-y-1 text-sm">
              <div>
                <span className="text-muted-foreground">Wysyłka:</span>
                <br />
                <span className={isOutOfStock ? "text-destructive" : "text-green-600 font-medium"}>
                  {isOutOfStock ? "Niedostępny" : "Wysyłka jutro"}
                </span>
              </div>
              {product.reference && (
                <div>
                  <span className="text-muted-foreground">SKU:</span>
                  <br />
                  <span>{product.reference}</span>
                </div>
              )}
            </div>
          </div>

          {/* Price & Actions */}
          <div className="sm:w-44 md:w-48 shrink-0 flex flex-col justify-end gap-2 sm:border-l sm:pl-4">
            {/* Manufacturer badge */}
            {product.manufacturerName && (
              <div className="text-right">
                <span className="inline-block text-[10px] font-medium px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
                  {product.manufacturerName}
                </span>
              </div>
            )}

            {/* Stock */}
            <div className="text-right">
              {isOutOfStock ? (
                <span className="text-xs font-medium flex items-center justify-end gap-1 text-destructive">
                  <span className="size-1 rounded-full bg-destructive"></span>
                  Brak
                </span>
              ) : (
                <span className="text-xs font-medium flex items-center justify-end gap-1 text-green-600">
                  <span className="size-1 rounded-full bg-green-500"></span>
                  {product.quantity > 99 ? "99+" : product.quantity} szt.
                </span>
              )}
            </div>

            {/* Price */}
            <div className="text-right">
              <span className="text-xl md:text-2xl font-bold">{formatPrice(product.price)}</span>
            </div>

            {/* Add to cart section */}
            <div className="space-y-2">
              {isOutOfStock ? (
                <Button disabled className="w-full h-9" variant="secondary" size="sm">
                  Niedostępny
                </Button>
              ) : (
                <>
                  {/* Quantity selector */}
                  <div className="flex items-center justify-center border rounded-lg overflow-hidden bg-muted/50">
                    <button
                      onClick={decrementQuantity}
                      className="h-8 w-9 flex items-center justify-center hover:bg-muted transition-colors"
                      disabled={quantity <= 1}
                    >
                      <Minus className="size-3" />
                    </button>
                    <span className="w-10 text-center text-sm font-medium">{quantity}</span>
                    <button
                      onClick={incrementQuantity}
                      className="h-8 w-9 flex items-center justify-center hover:bg-muted transition-colors"
                      disabled={quantity >= (product.quantity || 99)}
                    >
                      <Plus className="size-3" />
                    </button>
                  </div>

                  {/* Add to cart button */}
                  <Button
                    onClick={handleAddToCart}
                    className="w-full h-9 gap-2"
                    size="sm"
                  >
                    <ShoppingCart className="size-4" />
                    Do koszyka
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <AddToCartDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={product}
        quantity={quantity}
      />
    </div>
  );
}
