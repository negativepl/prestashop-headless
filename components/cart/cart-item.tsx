"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart, type CartItem as CartItemType } from "@/hooks/use-cart";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();
  const { product, quantity, productAttributeId } = item;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(price);
  };

  return (
    <div className="flex gap-4 py-4 border-b">
      {/* Image */}
      <div className="relative w-24 h-24 flex-shrink-0 bg-muted rounded-md overflow-hidden">
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

      {/* Details */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/products/${product.id}`}
          className="font-medium hover:text-primary line-clamp-2"
        >
          {product.name}
        </Link>
        <p className="text-sm text-muted-foreground mt-1">
          {formatPrice(product.price)} / szt.
        </p>

        {/* Quantity controls */}
        <div className="flex items-center gap-2 mt-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() =>
              updateQuantity(product.id, quantity - 1, productAttributeId)
            }
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="w-8 text-center">{quantity}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() =>
              updateQuantity(product.id, quantity + 1, productAttributeId)
            }
          >
            <Plus className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={() => removeItem(product.id, productAttributeId)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Total */}
      <div className="text-right">
        <p className="font-semibold">{formatPrice(product.price * quantity)}</p>
      </div>
    </div>
  );
}
