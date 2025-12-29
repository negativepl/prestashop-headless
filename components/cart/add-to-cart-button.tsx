"use client";

import { useState } from "react";
import { ShoppingCart, Minus, Plus, Truck, Package, RotateCcw, Star, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/use-cart";
import { AddToCartDialog } from "./add-to-cart-dialog";
import type { Product } from "@/lib/prestashop/types";

interface AddToCartButtonProps {
  product: Product;
}

const benefits = [
  { icon: Truck, title: "Wysyłka jutro", desc: "Zamów do 14:00" },
  { icon: Package, title: "Darmowa dostawa", desc: "Od 200 zł" },
  { icon: RotateCcw, title: "30 dni na zwrot", desc: "Bez podania przyczyny" },
  { icon: Star, title: "Wysokie oceny", desc: "4.8/5 na platformach" },
  { icon: ShieldCheck, title: "Bezpieczne płatności", desc: "Szybkie transakcje" },
];

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [quickBuyData, setQuickBuyData] = useState({
    name: "",
    phone: "",
  });
  const { addItem } = useCart();

  const handleAddToCart = () => {
    addItem(product, quantity);
    setDialogOpen(true);
  };

  const handleQuickBuy = () => {
    if (!quickBuyData.name || !quickBuyData.phone) return;
    // TODO: Implement quick buy logic
    console.log("Quick buy:", { product, quantity, ...quickBuyData });
    alert("Zamówienie zostało złożone! Skontaktujemy się z Tobą.");
    setQuickBuyData({ name: "", phone: "" });
  };

  // Only show as out of stock if quantity is explicitly 0 (not unknown/null)
  const isOutOfStock = product.quantity !== null && product.quantity <= 0;

  return (
    <>
      <div className="space-y-4">
        {/* Quantity selector */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium shrink-0">Ilość:</span>
          <div className="flex items-center border rounded-lg overflow-hidden">
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
        </div>

        {/* Add to cart button */}
        <Button
          size="lg"
          className="w-full h-12 text-base"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
        >
          <ShoppingCart className="size-5 mr-2" />
          Dodaj do koszyka
        </Button>

        <Separator />

        {/* Quick buy section */}
        <div className="space-y-3">
          <p className="text-sm font-medium">Szybkie zakupy bez rejestracji</p>
          <Input
            placeholder="Imię i nazwisko"
            value={quickBuyData.name}
            onChange={(e) => setQuickBuyData({ ...quickBuyData, name: e.target.value })}
          />
          <Input
            placeholder="Numer telefonu"
            type="tel"
            value={quickBuyData.phone}
            onChange={(e) => setQuickBuyData({ ...quickBuyData, phone: e.target.value })}
          />
          <Button
            variant="outline"
            className="w-full"
            onClick={handleQuickBuy}
            disabled={isOutOfStock || !quickBuyData.name || !quickBuyData.phone}
          >
            Zamów telefonicznie
          </Button>
        </div>

        <Separator />

        {/* Benefits */}
        <div className="flex flex-wrap gap-2">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg border bg-muted/30 text-xs"
            >
              <benefit.icon className="size-3.5 text-primary shrink-0" />
              <span className="font-medium whitespace-nowrap">{benefit.title}</span>
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
