"use client";

import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Navigation } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/products/product-card";
import type { Product } from "@/lib/prestashop/types";

import "swiper/css";
import "swiper/css/free-mode";

interface NewArrivalsProps {
  initialProducts: Product[];
}

export function NewArrivals({ initialProducts }: NewArrivalsProps) {
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  if (initialProducts.length === 0) return null;

  return (
    <div className="relative group/carousel">
      <Swiper
        modules={[FreeMode, Navigation]}
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
        }}
        slidesPerView={2}
        spaceBetween={16}
        slidesOffsetBefore={24}
        slidesOffsetAfter={24}
        breakpoints={{
          640: {
            slidesPerView: 3,
            spaceBetween: 16,
            slidesOffsetBefore: 24,
            slidesOffsetAfter: 24,
          },
          1024: {
            slidesPerView: 5,
            spaceBetween: 16,
            slidesOffsetBefore: 40,
            slidesOffsetAfter: 40,
          },
        }}
        className="!overflow-visible select-none"
      >
        {initialProducts.map((product) => (
          <SwiperSlide key={product.id} className="!h-auto">
            <ProductCard product={product} />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Navigation buttons */}
      <button
        onClick={() => swiper?.slidePrev()}
        className={`absolute left-8 lg:left-12 top-1/2 -translate-y-1/2 z-10 h-11 w-11 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 text-white hover:bg-black/70 flex items-center justify-center transition-all duration-300 ${
          isBeginning ? "opacity-0 pointer-events-none" : "opacity-0 group-hover/carousel:opacity-100"
        }`}
        aria-label="Poprzednie produkty"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => swiper?.slideNext()}
        className={`absolute right-8 lg:right-12 top-1/2 -translate-y-1/2 z-10 h-11 w-11 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 text-white hover:bg-black/70 flex items-center justify-center transition-all duration-300 ${
          isEnd ? "opacity-0 pointer-events-none" : "opacity-0 group-hover/carousel:opacity-100"
        }`}
        aria-label="Następne produkty"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Edge gradients */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-r from-card to-transparent pointer-events-none z-10 transition-opacity duration-300 ${
          isBeginning ? "opacity-0" : "opacity-100"
        }`}
      />
      <div
        className={`absolute right-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-l from-card to-transparent pointer-events-none z-10 transition-opacity duration-300 ${
          isEnd ? "opacity-0" : "opacity-100"
        }`}
      />
    </div>
  );
}
