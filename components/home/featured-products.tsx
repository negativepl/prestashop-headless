"use client";

import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/products/product-card";
import type { Product } from "@/lib/prestashop/types";

import "swiper/css";
import "swiper/css/free-mode";

interface FeaturedProductsProps {
  products: Product[];
}

export function FeaturedProducts({ products }: FeaturedProductsProps) {
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

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

      {/* Mobile carousel */}
      <div className="md:hidden relative group/carousel -mx-6">
        <Swiper
          modules={[FreeMode]}
          onSwiper={setSwiper}
          onSlideChange={(s) => {
            setIsBeginning(s.isBeginning);
            setIsEnd(s.isEnd);
          }}
          onReachBeginning={() => setIsBeginning(true)}
          onReachEnd={() => setIsEnd(true)}
          onFromEdge={() => {
            setIsBeginning(swiper?.isBeginning ?? false);
            setIsEnd(swiper?.isEnd ?? false);
          }}
          freeMode={{
            enabled: true,
            momentum: true,
            momentumRatio: 0.5,
            sticky: true,
          }}
          centeredSlides={true}
          slidesPerView={1.25}
          spaceBetween={12}
          slidesOffsetBefore={0}
          slidesOffsetAfter={0}
          breakpoints={{
            480: {
              slidesPerView: 1.6,
              spaceBetween: 12,
            },
            640: {
              slidesPerView: 2,
              spaceBetween: 16,
            },
          }}
          className="select-none"
        >
          {products.slice(0, 10).map((product) => (
            <SwiperSlide key={product.id} className="!h-auto">
              <ProductCard product={product} />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Navigation buttons */}
        <button
          onClick={() => swiper?.slidePrev()}
          className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 text-white hover:bg-black/70 flex items-center justify-center transition-all duration-300 ${
            isBeginning ? "opacity-0 pointer-events-none" : "opacity-0 group-hover/carousel:opacity-100"
          }`}
          aria-label="Poprzednie produkty"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => swiper?.slideNext()}
          className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 text-white hover:bg-black/70 flex items-center justify-center transition-all duration-300 ${
            isEnd ? "opacity-0 pointer-events-none" : "opacity-0 group-hover/carousel:opacity-100"
          }`}
          aria-label="Następne produkty"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Desktop grid */}
      {/* md: 9 products (3x3), lg: 8 products (4x2), 2xl: 10 products (5x2) */}
      <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-5">
        {products.slice(0, 10).map((product, index) => (
          <div
            key={product.id}
            className={
              index === 8
                ? "hidden md:block lg:hidden 2xl:block"
                : index === 9
                  ? "hidden 2xl:block"
                  : undefined
            }
          >
            <ProductCard product={product} priority={index === 0} />
          </div>
        ))}
      </div>
    </div>
  );
}
