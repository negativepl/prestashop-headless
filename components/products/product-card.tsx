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

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
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
    <div className="group bg-card rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-foreground/20 flex flex-col">
      {/* Image */}
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
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

          {/* Wishlist button */}
          <FavoriteButton
            product={product}
            className="absolute top-3 right-3"
          />
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-medium text-sm md:text-base line-clamp-2 hover:text-primary transition-colors leading-tight">
            {product.name}
          </h3>
        </Link>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold">{formatPrice(product.price)}</span>
          {!isOutOfStock && (
            <span className="text-xs font-medium flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              W magazynie
            </span>
          )}
        </div>

        {/* Add to cart section - always visible */}
        <div className="mt-3 pt-3 border-t">
          {isOutOfStock ? (
            <Button disabled className="w-full h-10" variant="secondary">
              Niedostępny
            </Button>
          ) : (
            <div className="flex gap-2">
              {/* Quantity selector */}
              <div className="flex items-center border rounded-lg overflow-hidden bg-muted/50">
                <button
                  onClick={decrementQuantity}
                  className="h-10 w-9 flex items-center justify-center hover:bg-muted transition-colors"
                  disabled={quantity <= 1}
                >
                  <Minus className="size-4" />
                </button>
                <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                <button
                  onClick={incrementQuantity}
                  className="h-10 w-9 flex items-center justify-center hover:bg-muted transition-colors"
                  disabled={quantity >= (product.quantity || 99)}
                >
                  <Plus className="size-4" />
                </button>
              </div>

              {/* Add to cart button */}
              <Button
                onClick={handleAddToCart}
                className="flex-1 h-10 gap-2"
              >
                <ShoppingCart className="size-4" />
                <span className="hidden sm:inline">Dodaj do koszyka</span>
              </Button>
            </div>
          )}
          {/* TODO: W przyszłości podłączymy prawdziwe czasy wysyłki z API */}
          {!isOutOfStock && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              Zamów do 16:00 - wysyłka dziś
            </p>
          )}
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
