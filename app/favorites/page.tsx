"use client";

import Link from "next/link";
import { Heart, ArrowRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFavorites } from "@/hooks/use-favorites";

export default function FavoritesPage() {
  const { items, removeItem, clearFavorites } = useFavorites();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(price);
  };

  return (
    <div className="min-h-[80vh] py-8">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">Ulubione</h1>
          <p className="text-muted-foreground mt-1">
            {items.length} {items.length === 1 ? "produkt" : items.length > 1 && items.length < 5 ? "produkty" : "produktów"}
          </p>
        </div>
        {items.length > 0 && (
          <Button variant="outline" onClick={clearFavorites}>
            Wyczyść wszystkie
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Heart className="size-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Brak ulubionych produktów</h2>
          <p className="text-muted-foreground mb-6">
            Dodaj produkty do ulubionych, klikając serduszko na karcie produktu
          </p>
          <Link href="/products">
            <Button>
              Przeglądaj produkty
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((product) => (
            <div
              key={product.id}
              className="bg-card rounded-xl border overflow-hidden"
            >
              <Link href={`/products/${product.id}`}>
                <div className="relative aspect-square overflow-hidden bg-muted">
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
              </Link>
              <div className="p-4">
                <Link href={`/products/${product.id}`}>
                  <h3 className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                </Link>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-lg font-bold">{formatPrice(product.price)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => removeItem(product.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
