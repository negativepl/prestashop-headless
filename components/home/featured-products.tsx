"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/products/product-card";
import type { Product } from "@/lib/prestashop/types";

interface FeaturedProductsProps {
  products: Product[];
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.offsetWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (products.length === 0) return null;

  return (
    <div className="bg-card rounded-2xl p-6 md:p-10 border">
      {/* Header */}
      <div className="mb-8">
        <span className="text-primary font-semibold text-sm uppercase tracking-wider">
          Polecane
        </span>
        <h2 className="text-3xl md:text-4xl font-bold mt-2">
          Polecane produkty
        </h2>
        <p className="mt-2 text-muted-foreground">
          Sprawdź nasze rekomendacje dla Ciebie
        </p>
      </div>

      {/* Responsive carousel */}
      <div className="-mx-6 md:-mx-10 relative group/carousel">
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth px-6 md:px-10 pb-4 -mb-4 scroll-pl-6 md:scroll-pl-10"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {products.slice(0, 10).map((product, index) => (
            <div
              key={product.id}
              className="snap-start shrink-0 w-[75%] md:w-[48%] lg:w-[32%] xl:w-[24%] 2xl:w-[19%]"
            >
              <ProductCard product={product} priority={index === 0} />
            </div>
          ))}
        </div>

        {/* Navigation arrows - visible on hover (desktop) */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm border shadow-lg text-foreground hover:bg-background hidden md:flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity"
          aria-label="Poprzednie produkty"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => scroll("right")}
          className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm border shadow-lg text-foreground hover:bg-background hidden md:flex items-center justify-center opacity-0 group-hover/carousel:opacity-100 transition-opacity"
          aria-label="Następne produkty"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
