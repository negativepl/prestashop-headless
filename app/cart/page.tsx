"use client";

import Link from "next/link";
import { ShoppingBag, ArrowRight, Trash2, Minus, Plus, ArrowLeft, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";

export default function CartPage() {
  const { items, itemCount, total, updateQuantity, removeItem, clearCart } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(price);
  };

  const freeShippingThreshold = 100;
  const remainingForFreeShipping = freeShippingThreshold - total;

  return (
    <div className="min-h-[80vh] py-8">
      <div className="container">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Koszyk</h1>
            <p className="text-muted-foreground mt-2">
              {itemCount} {itemCount === 1 ? "produkt" : itemCount > 1 && itemCount < 5 ? "produkty" : "produktów"}
            </p>
          </div>
          {items.length > 0 && (
            <Button variant="outline" onClick={clearCart}>
              Wyczyść koszyk
            </Button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="size-10 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Twój koszyk jest pusty</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Wygląda na to, że nie dodałeś jeszcze żadnych produktów do koszyka.
              Zacznij zakupy i znajdź coś dla siebie!
            </p>
            <Link href="/products">
              <Button size="lg">
                Przeglądaj produkty
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart items - 2 columns */}
            <div className="lg:col-span-2 space-y-4">
              {/* Free shipping banner */}
              {remainingForFreeShipping > 0 ? (
                <div className="bg-primary/10 rounded-xl p-4 flex items-center gap-3">
                  <Truck className="size-5 text-primary flex-shrink-0" />
                  <p className="text-sm">
                    Dodaj produkty za <span className="font-semibold">{formatPrice(remainingForFreeShipping)}</span> aby uzyskać darmową dostawę!
                  </p>
                </div>
              ) : (
                <div className="bg-green-500/10 rounded-xl p-4 flex items-center gap-3">
                  <Truck className="size-5 text-green-600 flex-shrink-0" />
                  <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                    Gratulacje! Twoje zamówienie kwalifikuje się do darmowej dostawy!
                  </p>
                </div>
              )}

              {/* Items list */}
              <div className="bg-card rounded-2xl border divide-y">
                {items.map((item) => (
                  <div
                    key={`${item.product.id}-${item.productAttributeId}`}
                    className="p-4 md:p-6"
                  >
                    <div className="flex gap-4">
                      {/* Product image */}
                      <Link href={`/products/${item.product.id}`} className="flex-shrink-0">
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-muted rounded-xl overflow-hidden">
                          {item.product.imageUrl ? (
                            <img
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              className="w-full h-full object-cover hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                              Brak zdjęcia
                            </div>
                          )}
                        </div>
                      </Link>

                      {/* Product details */}
                      <div className="flex-1 min-w-0">
                        <Link href={`/products/${item.product.id}`}>
                          <h3 className="font-medium text-sm md:text-base line-clamp-2 hover:text-primary transition-colors">
                            {item.product.name}
                          </h3>
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatPrice(item.product.price)} / szt.
                        </p>

                        {/* Mobile: quantity and remove */}
                        <div className="mt-4 flex items-center justify-between md:hidden">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.productAttributeId)}
                            >
                              <Minus className="size-3" />
                            </Button>
                            <span className="w-10 text-center font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.productAttributeId)}
                            >
                              <Plus className="size-3" />
                            </Button>
                          </div>
                          <span className="font-semibold">
                            {formatPrice(item.product.price * item.quantity)}
                          </span>
                        </div>
                      </div>

                      {/* Desktop: quantity, price, remove */}
                      <div className="hidden md:flex items-center gap-6">
                        {/* Quantity controls */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.productAttributeId)}
                          >
                            <Minus className="size-4" />
                          </Button>
                          <span className="w-12 text-center font-medium">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9"
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.productAttributeId)}
                          >
                            <Plus className="size-4" />
                          </Button>
                        </div>

                        {/* Price */}
                        <div className="w-28 text-right">
                          <span className="font-semibold text-lg">
                            {formatPrice(item.product.price * item.quantity)}
                          </span>
                        </div>

                        {/* Remove button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeItem(item.product.id, item.productAttributeId)}
                        >
                          <Trash2 className="size-5" />
                        </Button>
                      </div>
                    </div>

                    {/* Mobile remove button */}
                    <div className="mt-3 md:hidden">
                      <button
                        className="text-sm text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
                        onClick={() => removeItem(item.product.id, item.productAttributeId)}
                      >
                        <Trash2 className="size-4" />
                        Usuń
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Continue shopping */}
              <Link href="/products" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <ArrowLeft className="size-4" />
                Kontynuuj zakupy
              </Link>
            </div>

            {/* Order summary - 1 column */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-2xl border p-6 sticky top-24">
                <h2 className="text-lg font-semibold mb-6">Podsumowanie</h2>

                {/* Summary */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Produkty ({itemCount})</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Dostawa</span>
                    {total >= freeShippingThreshold ? (
                      <span className="text-green-600 font-medium">Gratis</span>
                    ) : (
                      <span>od 7,00 zł</span>
                    )}
                  </div>
                  <div className="flex justify-between font-semibold text-lg pt-3 border-t">
                    <span>Do zapłaty</span>
                    <span className="text-primary">{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Checkout button */}
                <div className="mt-6 space-y-3">
                  <Link href="/checkout" className="block">
                    <Button size="lg" className="w-full h-14 text-base">
                      Przejdź do kasy
                      <ArrowRight className="ml-2 size-4" />
                    </Button>
                  </Link>
                </div>

                {/* Trust badges */}
                <div className="mt-6 pt-6 border-t space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Truck className="size-4" />
                    <span>Darmowa dostawa od {formatPrice(freeShippingThreshold)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Zwrot do 30 dni bez podania przyczyny
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
