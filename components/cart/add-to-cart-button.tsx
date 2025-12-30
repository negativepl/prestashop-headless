"use client";

import { useState } from "react";
import { ShoppingCart, Minus, Plus, Truck, Package, RotateCcw, Star, ShieldCheck, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { AddToCartDialog } from "./add-to-cart-dialog";
import type { Product } from "@/lib/prestashop/types";

interface AddToCartButtonProps {
  product: Product;
}

const FREE_SHIPPING_THRESHOLD = 100;

const benefits = [
  { icon: Truck, title: "Wysyłka jutro", desc: "Zamów do 14:00" },
  { icon: RotateCcw, title: "30 dni na zwrot", desc: "Bez podania przyczyny" },
  { icon: Star, title: "Wysokie oceny", desc: "4.8/5 na platformach" },
  { icon: ShieldCheck, title: "Bezpieczne płatności", desc: "Szybkie transakcje" },
];

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { addItem, total } = useCart();

  const handleAddToCart = () => {
    addItem(product, quantity);
    setDialogOpen(true);
  };

  const isOutOfStock = product.quantity !== null && product.quantity <= 0;

  // Calculate free shipping progress (based on cart only)
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - total);
  const hasFreeShipping = total >= FREE_SHIPPING_THRESHOLD;
  const progressPercent = Math.min(100, (total / FREE_SHIPPING_THRESHOLD) * 100);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(price);
  };

  return (
    <>
      <div className="space-y-4">
        {/* Quantity selector + Add to cart - single line */}
        <div className="flex items-center gap-3">
          <div className="flex items-center border rounded-lg overflow-hidden shrink-0 bg-card">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="p-2.5 hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Minus className="size-4" />
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 1;
                setQuantity(Math.max(1, Math.min(val, product.quantity ?? 999)));
              }}
              className="w-14 text-center font-medium border-x py-2 bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              onClick={() => setQuantity(quantity + 1)}
              disabled={product.quantity !== null && product.quantity > 0 && quantity >= product.quantity}
              className="p-2.5 hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="size-4" />
            </button>
          </div>
          <Button
            size="lg"
            className="flex-1 h-11"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
          >
            <ShoppingCart className="size-5 mr-2" />
            Dodaj do koszyka
          </Button>
        </div>

        {/* Quick buy section */}
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground text-center">Szybkie zakupy 1-Click, bez rejestracji</p>
          <Button
            variant="outline"
            className="w-full h-11 !bg-[#FFCD00] hover:!bg-[#FFD633] !text-black !border-[#FFCD00] hover:!border-[#FFD633] font-semibold"
            disabled={isOutOfStock}
          >
            InPost Pay
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="h-11 !bg-[#00D66F] hover:!bg-[#00C062] !text-black !border-[#00D66F] hover:!border-[#00C062] font-semibold"
              disabled={isOutOfStock}
            >
              Zapłać z Link
            </Button>
            <Button
              variant="outline"
              className="h-11 !bg-black hover:!bg-neutral-800 !text-white !border-black hover:!border-neutral-800 font-semibold dark:!bg-white dark:hover:!bg-neutral-200 dark:!text-black dark:!border-white dark:hover:!border-neutral-200"
              disabled={isOutOfStock}
            >
              Klarna
            </Button>
          </div>
        </div>

        {/* Free shipping progress */}
        <div className="rounded-lg border bg-muted/30 p-3">
          {hasFreeShipping ? (
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                <Gift className="size-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-green-600">Darmowa dostawa!</p>
                <p className="text-xs text-muted-foreground">Twoje zamówienie kwalifikuje się do darmowej dostawy</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Package className="size-4 text-primary" />
                  <span className="font-medium">Darmowa dostawa od {formatPrice(FREE_SHIPPING_THRESHOLD)}</span>
                </div>
                <span className="text-xs text-muted-foreground">Brakuje Ci {formatPrice(amountToFreeShipping)}</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-4 gap-2">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border bg-muted/30 text-center"
            >
              <benefit.icon className="size-8 text-primary" />
              <span className="text-xs font-medium leading-tight">{benefit.title}</span>
            </div>
          ))}
        </div>
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
