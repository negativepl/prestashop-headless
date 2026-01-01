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

interface BestsellersCarouselProps {
  products: Product[];
}

export function BestsellersCarousel({ products }: BestsellersCarouselProps) {
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  if (products.length === 0) return null;

  return (
    <div className="md:hidden relative group/carousel -mx-6 md:-mx-10">
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
        {products.map((product) => (
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
  );
}
