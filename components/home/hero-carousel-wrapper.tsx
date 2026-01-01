"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import type { HeroSlide } from "./hero-carousel";

// Dynamic import to prevent Swiper CSS from blocking initial render
const HeroCarousel = dynamic(
  () => import("./hero-carousel").then((mod) => mod.HeroCarousel),
  {
    ssr: false,
    loading: () => (
      <div className="container py-4 md:py-6">
        <div className="relative rounded-2xl md:rounded-3xl overflow-hidden h-[280px] md:h-[350px] lg:h-[420px] bg-muted">
          <Image
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80"
            alt="Hero"
            fill
            className="object-cover"
            priority
            fetchPriority="high"
            sizes="100vw"
          />
        </div>
      </div>
    ),
  }
);

interface HeroCarouselWrapperProps {
  slides?: HeroSlide[];
}

export function HeroCarouselWrapper({ slides = [] }: HeroCarouselWrapperProps) {
  return <HeroCarousel slides={slides} />;
}
