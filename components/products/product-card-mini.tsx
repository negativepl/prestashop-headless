"use client";

import Link from "next/link";
import { useState } from "react";
import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FavoriteButton } from "@/components/products/favorite-button";
import { AddToCartDialog } from "@/components/cart/add-to-cart-dialog";
import { useCart } from "@/hooks/use-cart";
import type { Product } from "@/lib/prestashop/types";

interface ProductCardMiniProps {
  product: Product;
}

export function ProductCardMini({ product }: ProductCardMiniProps) {
  const { addItem } = useCart();
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
    addItem(product, 1);
    setDialogOpen(true);
  };

  const isOutOfStock = product.quantity <= 0;

  return (
    <div className="group relative bg-card rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-foreground/20 flex flex-col">
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
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {isOutOfStock && (
              <Badge variant="destructive" className="text-[10px] px-1.5 py-0.5">
                Wyprzedane
              </Badge>
            )}
            {!isOutOfStock && product.quantity <= 5 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 bg-orange-100 text-orange-700 hover:bg-orange-100">
                Ostatnie sztuki
              </Badge>
            )}
          </div>

          {/* Wishlist button */}
          <FavoriteButton
            product={product}
            className="absolute top-2 right-2 h-7 w-7"
          />
        </div>
      </Link>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-medium text-xs line-clamp-2 hover:text-primary transition-colors leading-tight">
            {product.name}
          </h3>
        </Link>

        <div className="mt-auto pt-2 flex items-center justify-between">
          <span className="text-sm font-bold">{formatPrice(product.price)}</span>
          {!isOutOfStock && (
            <span className="text-[10px] font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              W magazynie
            </span>
          )}
        </div>
      </div>

      {/* Add to cart button - on hover */}
      {!isOutOfStock && (
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
          <Button
            onClick={handleAddToCart}
            className="w-full h-8 text-xs gap-1.5 bg-white text-zinc-900 hover:bg-zinc-100"
          >
            <ShoppingCart className="size-3" />
            Dodaj do koszyka
          </Button>
        </div>
      )}

      <AddToCartDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={product}
        quantity={1}
      />
    </div>
  );
}
