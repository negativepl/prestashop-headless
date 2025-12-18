"use client";

import { useState } from "react";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { AddToCartDialog } from "./add-to-cart-dialog";
import type { Product } from "@/lib/prestashop/types";

interface AddToCartButtonProps {
  product: Product;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem(product, quantity);
    setDialogOpen(true);
  };

  return (
    <>
      <div className="space-y-4">
        {/* Quantity selector */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Ilość:</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-12 text-center font-medium">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity(quantity + 1)}
              disabled={product.quantity > 0 && quantity >= product.quantity}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Add to cart button */}
        <Button
          size="lg"
          className="w-full"
          onClick={handleAddToCart}
          disabled={product.quantity <= 0}
        >
          <ShoppingCart className="h-5 w-5 mr-2" />
          Dodaj do koszyka
        </Button>
      </div>

      <AddToCartDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={product}
        quantity={quantity}
      />
    </>
  );
}
