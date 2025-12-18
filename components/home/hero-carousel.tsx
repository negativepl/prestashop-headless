"use client";

import { useState, useEffect, useCallback } from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

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
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const onSelect = useCallback(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
  }, [api]);

  useEffect(() => {
    if (!api) return;
    onSelect();
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api, onSelect]);

  const scrollTo = useCallback(
    (index: number) => {
      api?.scrollTo(index);
    },
    [api]
  );

  return (
    <div className="container py-4 md:py-6">
      <div className="relative rounded-2xl md:rounded-3xl overflow-hidden">
        <Carousel
          opts={{
            loop: true,
          }}
          plugins={[
            Autoplay({
              delay: 5000,
              stopOnInteraction: false,
              stopOnMouseEnter: true,
            }),
          ]}
          setApi={setApi}
          className="w-full"
        >
          <CarouselContent className="-ml-0">
            {slides.map((slide, index) => (
              <CarouselItem key={index} className="pl-0">
                <div className="relative h-[280px] md:h-[350px] lg:h-[420px]">
                  <img
                    src={slide.image}
                    alt={`Slide ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2 md:left-4 h-10 w-10 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 hover:text-white" />
          <CarouselNext className="right-2 md:right-4 h-10 w-10 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 hover:text-white" />
        </Carousel>

        {/* Dots indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
          <div className="flex gap-2 px-3 py-2 rounded-full bg-black/20 backdrop-blur-md">
            {slides.map((_, dotIndex) => (
              <button
                key={dotIndex}
                onClick={() => scrollTo(dotIndex)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  current === dotIndex
                    ? "bg-white w-6"
                    : "bg-white/50 hover:bg-white/70 w-2"
                }`}
                aria-label={`Go to slide ${dotIndex + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
