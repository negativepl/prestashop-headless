"use client";

import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { AddToCartDialog } from "./add-to-cart-dialog";
import type { Product } from "@/lib/prestashop/types";

interface AddToCartButtonSmallProps {
  product: Product;
  variant?: "default" | "white";
}

export function AddToCartButtonSmall({ product, variant = "default" }: AddToCartButtonSmallProps) {
  const { addItem } = useCart();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
    setDialogOpen(true);
  };

  if (variant === "white") {
    return (
      <>
        <button
          onClick={handleClick}
          disabled={product.quantity !== null && product.quantity <= 0}
          className="w-full py-2.5 px-4 bg-white text-zinc-900 rounded-lg font-medium text-sm flex items-center justify-center gap-2 hover:bg-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingCart className="h-4 w-4" />
          Dodaj do koszyka
        </button>
        <AddToCartDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          product={product}
          quantity={1}
        />
      </>
    );
  }

  return (
    <>
      <Button
        size="sm"
        onClick={handleClick}
        disabled={product.quantity <= 0}
        className="h-9"
      >
        <ShoppingCart className="h-4 w-4 mr-1.5" />
        Dodaj
      </Button>
      <AddToCartDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={product}
        quantity={1}
      />
    </>
  );
}
