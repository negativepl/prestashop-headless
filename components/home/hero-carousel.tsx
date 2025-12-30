"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { ChevronLeft, ChevronRight } from "lucide-react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const slides = [
  {
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80",
  },
  {
    image: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=1920&q=80",
  },
  {
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1920&q=80",
  },
  {
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1920&q=80",
  },
];

export function HeroCarousel() {
  const [mounted, setMounted] = useState(false);
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="container py-4 md:py-6">
      <div className="relative rounded-2xl md:rounded-3xl overflow-hidden group h-[280px] md:h-[350px] lg:h-[420px]">
        {!mounted ? (
          // Static placeholder for SSR - same structure as first slide
          <div className="relative w-full h-full bg-muted">
            <Image
              src={slides[0].image}
              alt="Slide 1"
              fill
              className="object-cover"
              priority
              loading="eager"
              fetchPriority="high"
              sizes="100vw"
            />
          </div>
        ) : (
          <Swiper
            modules={[Autoplay, Navigation, Pagination]}
            onSwiper={setSwiper}
            onSlideChange={(s) => setActiveIndex(s.realIndex)}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            loop
            className="h-full"
          >
            {slides.map((slide, index) => (
              <SwiperSlide key={index}>
                <div className="relative w-full h-full bg-muted">
                  <Image
                    src={slide.image}
                    alt={`Slide ${index + 1}`}
                    fill
                    className="object-cover"
                    priority={index === 0}
                    loading={index === 0 ? "eager" : "lazy"}
                    fetchPriority={index === 0 ? "high" : "auto"}
                    sizes="100vw"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        )}

        {/* Custom navigation buttons - only show when mounted */}
        {mounted && (
          <>
            <button
              onClick={() => swiper?.slidePrev()}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 h-11 w-11 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 flex items-center justify-center transition-colors"
              aria-label="Poprzedni slajd"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => swiper?.slideNext()}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-10 h-11 w-11 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 flex items-center justify-center transition-colors"
              aria-label="Następny slajd"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Dots indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
              <div className="flex gap-1 px-2 py-2 rounded-full bg-black/20 backdrop-blur-md">
                {slides.map((_, dotIndex) => (
                  <button
                    key={dotIndex}
                    onClick={() => swiper?.slideToLoop(dotIndex)}
                    className="min-w-[44px] min-h-[44px] flex items-center justify-center"
                    aria-label={`Przejdź do slajdu ${dotIndex + 1}`}
                  >
                    <span
                      className={`h-2.5 rounded-full transition-all duration-300 ${
                        activeIndex === dotIndex
                          ? "bg-white w-6"
                          : "bg-white/50 hover:bg-white/70 w-2.5"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
