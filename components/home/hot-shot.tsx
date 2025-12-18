"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";
import { AddToCartDialog } from "@/components/cart/add-to-cart-dialog";
import type { Product } from "@/lib/prestashop/types";

interface HotShotProps {
  product: Product;
  // TODO: W przyszłości dodamy prawdziwy czas końca promocji z API
  endTime?: Date;
}

export function HotShot({ product, endTime }: HotShotProps) {
  const { addItem } = useCart();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  // TODO: W przyszłości endTime będzie pochodzić z API promocji
  const defaultEndTime = useMemo(() => {
    return endTime || new Date(new Date().setHours(23, 59, 59, 999));
  }, [endTime]);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = defaultEndTime.getTime() - now.getTime();

      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / (1000 * 60)) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [defaultEndTime]);

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

  // TODO: W przyszłości stara cena będzie pochodzić z API
  const oldPrice = product.price * 1.3;

  return (
    <div className="bg-card rounded-2xl border-2 border-primary overflow-hidden h-full">
      <div className="p-4 md:p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="font-bold text-lg">Okazja dnia</span>
          <Badge variant="destructive" className="text-sm px-3 py-1">
            Taniej o {formatPrice(oldPrice - product.price)}
          </Badge>
        </div>

        {/* Countdown */}
        <div className="flex gap-2 mb-4">
          <div className="bg-muted rounded-lg px-4 py-2 flex-1 flex flex-col justify-center">
            <span className="font-bold text-sm">Do końca promocji</span>
          </div>
          {[
            { value: timeLeft.hours, label: "godz" },
            { value: timeLeft.minutes, label: "min" },
            { value: timeLeft.seconds, label: "sek" },
          ].map((item, i) => (
            <div key={i} className="bg-muted rounded-lg px-3 py-2 text-center min-w-[56px]">
              <span className="font-bold text-xl block">
                {String(item.value).padStart(2, "0")}
              </span>
              <span className="text-muted-foreground text-xs">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Product */}
        <Link href={`/products/${product.id}`} className="flex-1 flex flex-col">
          <div className="relative aspect-square bg-muted rounded-xl overflow-hidden mb-4">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                Brak zdjęcia
              </div>
            )}
          </div>

          <h3 className="font-semibold line-clamp-2 mb-2 hover:text-primary transition-colors">
            {product.name}
          </h3>

          <div className="flex items-center gap-3 mb-2">
            <span className="text-muted-foreground line-through text-sm">
              {formatPrice(oldPrice)}
            </span>
            <span className="text-primary font-bold text-2xl">
              {formatPrice(product.price)}
            </span>
          </div>
          {/* TODO: Integracja z modułem Omnibus - pobieranie najniższej ceny z ostatnich 30 dni */}
          <p className="text-xs text-muted-foreground mb-4">
            Najniższa cena z 30 dni przed obniżką: {formatPrice(oldPrice)}
          </p>
        </Link>

        {/* Add to cart */}
        <Button
          onClick={handleAddToCart}
          className="w-full h-10"
        >
          Kup teraz
        </Button>
      </div>

      <AddToCartDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={product}
        quantity={1}
      />
    </div>
  );
}
