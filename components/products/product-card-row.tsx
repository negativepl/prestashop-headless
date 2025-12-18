"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingCart, Minus, Plus, Check } from "lucide-react";
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
        <Link href={`/products/${product.id}`} className="sm:w-48 md:w-56 shrink-0">
          <div className="relative aspect-square sm:aspect-auto sm:h-full overflow-hidden bg-muted">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex items-center justify-center h-full min-h-[200px] text-muted-foreground text-sm">
                Brak zdjęcia
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
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

            {/* Wishlist button - mobile */}
            <FavoriteButton
              product={product}
              className="absolute top-3 right-3 sm:hidden"
            />
          </div>
        </Link>

        {/* Content */}
        <div className="flex-1 p-4 sm:p-5 flex flex-col sm:flex-row gap-4">
          {/* Info */}
          <div className="flex-1 min-w-0">
            <Link href={`/products/${product.id}`}>
              <h3 className="font-semibold text-base md:text-lg line-clamp-2 hover:text-primary transition-colors leading-tight">
                {product.name}
              </h3>
            </Link>

            {product.descriptionShort && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2 hidden md:block">
                {product.descriptionShort.replace(/<[^>]*>/g, '')}
              </p>
            )}

            {/* Features */}
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
              {product.reference && (
                <span>SKU: {product.reference}</span>
              )}
              {product.weight > 0 && (
                <span>Waga: {product.weight} kg</span>
              )}
            </div>

            {/* Availability */}
            <div className="mt-3">
              {isOutOfStock ? (
                <span className="text-xs font-medium flex items-center gap-1.5 text-destructive">
                  <span className="w-2 h-2 rounded-full bg-destructive"></span>
                  Niedostępny
                </span>
              ) : (
                <span className="text-xs font-medium flex items-center gap-1.5 text-green-600">
                  <Check className="size-3" />
                  W magazynie ({product.quantity} szt.)
                </span>
              )}
            </div>
          </div>

          {/* Price & Actions */}
          <div className="sm:w-48 md:w-56 shrink-0 flex flex-col justify-between gap-3 sm:border-l sm:pl-5">
            <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2">
              <span className="text-xl md:text-2xl font-bold">{formatPrice(product.price)}</span>

              {/* Wishlist button - desktop */}
              <FavoriteButton
                product={product}
                className="hidden sm:flex"
              />
            </div>

            {/* Add to cart section */}
            <div className="space-y-2">
              {isOutOfStock ? (
                <Button disabled className="w-full h-10" variant="secondary">
                  Niedostępny
                </Button>
              ) : (
                <>
                  {/* Quantity selector */}
                  <div className="flex items-center justify-center border rounded-lg overflow-hidden bg-muted/50">
                    <button
                      onClick={decrementQuantity}
                      className="h-9 w-10 flex items-center justify-center hover:bg-muted transition-colors"
                      disabled={quantity <= 1}
                    >
                      <Minus className="size-4" />
                    </button>
                    <span className="w-12 text-center text-sm font-medium">{quantity}</span>
                    <button
                      onClick={incrementQuantity}
                      className="h-9 w-10 flex items-center justify-center hover:bg-muted transition-colors"
                      disabled={quantity >= (product.quantity || 99)}
                    >
                      <Plus className="size-4" />
                    </button>
                  </div>

                  {/* Add to cart button */}
                  <Button
                    onClick={handleAddToCart}
                    className="w-full h-10 gap-2"
                  >
                    <ShoppingCart className="size-4" />
                    Dodaj do koszyka
                  </Button>
                </>
              )}

              {!isOutOfStock && (
                <p className="text-xs text-muted-foreground text-center">
                  Wysyłka w 24h
                </p>
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
