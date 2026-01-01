"use client";

import Link from "next/link";
import Image from "next/image";
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
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [inputValue, setInputValue] = useState("1");
  const [dialogOpen, setDialogOpen] = useState(false);

  const maxQuantity = product.quantity !== null && product.quantity > 0 ? product.quantity : 99;

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
    const newVal = Math.min(quantity + 1, maxQuantity);
    setQuantity(newVal);
    setInputValue(newVal.toString());
  };

  const decrementQuantity = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newVal = Math.max(quantity - 1, 1);
    setQuantity(newVal);
    setInputValue(newVal.toString());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const value = e.target.value;

    if (value === "") {
      setInputValue("");
      return;
    }

    if (/^\d+$/.test(value)) {
      let val = parseInt(value);
      val = Math.max(1, Math.min(val, maxQuantity));
      setQuantity(val);
      setInputValue(val.toString());
    }
  };

  const handleInputBlur = () => {
    if (inputValue === "") {
      setQuantity(1);
      setInputValue("1");
    }
  };

  const handleInputClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Only show as out of stock if quantity is explicitly 0 (not unknown/null)
  const isOutOfStock = product.quantity !== null && product.quantity <= 0;

  return (
    <div className="group bg-accent rounded-xl border overflow-hidden transition-all duration-300 hover:border-foreground/20 flex flex-col h-full">
      {/* Image */}
      <Link href={`/products/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-white p-4">
          {product.imageUrl ? (
            <div className="relative w-full h-full">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                priority={priority}
                fetchPriority={priority ? "high" : "auto"}
                loading={priority ? "eager" : "lazy"}
                className={`object-contain transition-transform duration-500 group-hover:scale-105 ${isOutOfStock ? "grayscale opacity-60" : ""}`}
              />
            </div>
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
            {!isOutOfStock && product.quantity !== null && product.quantity <= 5 && (
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
          <h3 className="font-medium text-base md:text-lg line-clamp-3 hover:text-primary transition-colors leading-tight">
            {product.name}
          </h3>
        </Link>

        {/* Price and cart section - pushed to bottom */}
        <div className="mt-auto pt-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xl md:text-2xl font-bold">{formatPrice(product.price)}</span>
            {!isOutOfStock && (
              <span className="text-sm font-medium flex items-center gap-1.5 text-muted-foreground">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                {product.quantity !== null ? `${product.quantity} szt.` : "Dostępny"}
              </span>
            )}
          </div>

          {/* Add to cart section */}
          <div className="pt-3 border-t min-h-[72px] flex flex-col justify-center">
          {isOutOfStock ? (
            <div className="flex items-center justify-center">
              <Button disabled className="h-10 px-8" variant="secondary">
                Niedostępny
              </Button>
            </div>
          ) : (
            <div className="flex gap-1.5 sm:gap-2 items-stretch">
              {/* Quantity selector */}
              <div className="flex items-center border rounded-md bg-muted/50 h-9 sm:h-10">
                <button
                  onClick={decrementQuantity}
                  className="h-full w-8 sm:w-9 flex items-center justify-center hover:bg-muted transition-colors rounded-l-md"
                  disabled={quantity <= 1}
                  aria-label="Zmniejsz ilość"
                >
                  <Minus className="size-3.5 sm:size-4" />
                </button>
                <input
                  type="text"
                  inputMode="numeric"
                  value={inputValue}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  onClick={handleInputClick}
                  className="w-7 sm:w-8 text-center text-sm font-medium bg-transparent focus:outline-none"
                  aria-label="Ilość produktu"
                />
                <button
                  onClick={incrementQuantity}
                  className="h-full w-8 sm:w-9 flex items-center justify-center hover:bg-muted transition-colors rounded-r-md"
                  disabled={quantity >= maxQuantity}
                  aria-label="Zwiększ ilość"
                >
                  <Plus className="size-3.5 sm:size-4" />
                </button>
              </div>

              {/* Add to cart button */}
              <Button
                onClick={handleAddToCart}
                size="sm"
                className="flex-1 h-9 sm:h-10 gap-1 min-w-0 px-2 text-xs sm:text-sm"
              >
                <ShoppingCart className="size-3.5 sm:size-4 shrink-0" />
                <span className="truncate">Do koszyka</span>
              </Button>
            </div>
          )}
          {/* TODO: W przyszłości podłączymy prawdziwe czasy wysyłki z API */}
          {!isOutOfStock && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              <span className="hidden sm:inline">Zamów do 16:00 - wysyłka dziś</span>
              <span className="sm:hidden">Wysyłka dziś do 16:00</span>
            </p>
          )}
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
