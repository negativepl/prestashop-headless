"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export interface HeroSlide {
  id: string;
  title: string;
  subtitle?: string;
  image: {
    url: string;
    alt: string;
  };
  cta?: {
    text?: string;
    link?: string;
  };
  textPosition?: "left" | "center" | "right";
}

interface HeroCarouselProps {
  slides: HeroSlide[];
}

// Fallback slides when CMS is not available
const fallbackSlides: HeroSlide[] = [
  {
    id: "1",
    title: "",
    image: {
      url: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80",
      alt: "Hero slide 1",
    },
  },
  {
    id: "2",
    title: "",
    image: {
      url: "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=1920&q=80",
      alt: "Hero slide 2",
    },
  },
  {
    id: "3",
    title: "",
    image: {
      url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1920&q=80",
      alt: "Hero slide 3",
    },
  },
];

export function HeroCarousel({ slides: propSlides }: HeroCarouselProps) {
  const [mounted, setMounted] = useState(false);
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Use prop slides or fallback
  const slides = propSlides.length > 0 ? propSlides : fallbackSlides;

  useEffect(() => {
    setMounted(true);
  }, []);

  const getTextPositionClasses = (position?: string) => {
    switch (position) {
      case "center":
        return "items-center text-center px-16 md:px-24";
      case "right":
        return "items-end text-right pl-8 pr-16 md:pl-12 md:pr-24 lg:pl-16 lg:pr-28";
      default:
        return "items-start text-left pr-8 pl-16 md:pr-12 md:pl-24 lg:pr-16 lg:pl-28";
    }
  };

  return (
    <div className="container py-4 md:py-6" suppressHydrationWarning>
      <div
        className="relative rounded-2xl md:rounded-3xl overflow-hidden group h-[280px] md:h-[350px] lg:h-[420px]"
        suppressHydrationWarning
      >
        {mounted ? (
          <Swiper
            modules={[Autoplay, Navigation, Pagination]}
            onSwiper={setSwiper}
            onSlideChange={(s) => setActiveIndex(s.realIndex)}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            loop={slides.length > 1}
            className="h-full"
          >
            {slides.map((slide, index) => (
              <SwiperSlide key={slide.id}>
                <div className="relative w-full h-full bg-muted">
                  <Image
                    src={slide.image.url}
                    alt={slide.image.alt || slide.title || `Slide ${index + 1}`}
                    fill
                    className="object-cover"
                    priority={index === 0}
                    loading={index === 0 ? "eager" : "lazy"}
                    fetchPriority={index === 0 ? "high" : "auto"}
                    sizes="100vw"
                  />
                  {/* Overlay for text */}
                  {(slide.title || slide.subtitle || slide.cta?.text) && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
                      <div
                        className={`absolute inset-0 flex flex-col justify-center p-8 md:p-12 lg:p-16 ${getTextPositionClasses(slide.textPosition)}`}
                      >
                        <div className="max-w-xl">
                          {slide.title && (
                            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-2 md:mb-4">
                              {slide.title}
                            </h2>
                          )}
                          {slide.subtitle && (
                            <p className="text-sm md:text-lg text-white/90 mb-4 md:mb-6">
                              {slide.subtitle}
                            </p>
                          )}
                          {slide.cta?.text && slide.cta?.link && (
                            <Link href={slide.cta.link}>
                              <Button size="lg" className="font-semibold">
                                {slide.cta.text}
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="relative w-full h-full bg-muted">
            <Image
              src={slides[0]?.image.url || fallbackSlides[0].image.url}
              alt={slides[0]?.image.alt || "Hero"}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
          </div>
        )}

        {/* Custom navigation buttons */}
        {mounted && slides.length > 1 && (
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
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10">
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/20 backdrop-blur-md">
                {slides.map((_, dotIndex) => (
                  <button
                    key={dotIndex}
                    onClick={() => swiper?.slideToLoop(dotIndex)}
                    className="p-0.5"
                    aria-label={`Przejdź do slajdu ${dotIndex + 1}`}
                  >
                    <span
                      className={`block h-2 rounded-full transition-all duration-300 ${
                        activeIndex === dotIndex
                          ? "bg-white w-5"
                          : "bg-white/50 hover:bg-white/70 w-2"
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
