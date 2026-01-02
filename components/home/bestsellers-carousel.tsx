"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/products/product-card";
import type { Product } from "@/lib/prestashop/types";

interface BestsellersCarouselProps {
  products: Product[];
}

export function BestsellersCarousel({ products }: BestsellersCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 5);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);

    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll]);

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
    <div className="relative group/carousel -mx-6 md:-mx-10">
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth px-6 md:px-10 pb-4 -mb-4 scroll-pl-6 md:scroll-pl-10"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {products.map((product, index) => (
          <div
            key={product.id}
            className="snap-start shrink-0 w-[75%] md:w-[32%] lg:w-[24%] xl:w-[19%]"
          >
            <ProductCard product={product} priority={index < 5} />
          </div>
        ))}
      </div>

      {/* Navigation arrows - visible on hover (desktop), hidden when can't scroll */}
      <button
        onClick={() => scroll("left")}
        className={`absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm border shadow-lg text-foreground hover:bg-background hidden md:flex items-center justify-center transition-opacity duration-200 ${
          canScrollLeft ? "group-hover/carousel:opacity-100 opacity-0" : "opacity-0 pointer-events-none"
        }`}
        aria-label="Poprzednie produkty"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => scroll("right")}
        className={`absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm border shadow-lg text-foreground hover:bg-background hidden md:flex items-center justify-center transition-opacity duration-200 ${
          canScrollRight ? "group-hover/carousel:opacity-100 opacity-0" : "opacity-0 pointer-events-none"
        }`}
        aria-label="Następne produkty"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
