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
    <div>
      {/* Header - Editorial */}
      <div className="mb-8 md:mb-10">
        <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-3">
          Polecane
        </p>
        <h2 className="font-lora text-3xl md:text-4xl font-medium">
          Wybrane dla Ciebie
        </h2>
      </div>

      {/* Responsive carousel */}
      <div className="-mx-6 md:-mx-10 relative group/carousel">
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth px-[7.5%] md:px-10 pb-4 -mb-4 md:scroll-pl-10"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {products.slice(0, 10).map((product, index) => (
            <div
              key={product.id}
              className="snap-center md:snap-start shrink-0 w-[85%] md:w-[48%] lg:w-[32%] xl:w-[24%] 2xl:w-[19%]"
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
