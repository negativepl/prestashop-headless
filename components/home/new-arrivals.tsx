"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/products/product-card";
import type { Product } from "@/lib/prestashop/types";

interface NewArrivalsProps {
  initialProducts: Product[];
}

export function NewArrivals({ initialProducts }: NewArrivalsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.offsetWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (initialProducts.length === 0) return null;

  return (
    <div className="relative group/carousel">
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth px-6 md:px-10 pb-4 -mb-4 scroll-pl-6 md:scroll-pl-10"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {initialProducts.map((product) => (
          <div
            key={product.id}
            className="snap-start shrink-0 w-[75%] md:w-[32%] lg:w-[24%] xl:w-[19%]"
          >
            <ProductCard product={product} />
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
  );
}
