"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";

import "swiper/css";
import "swiper/css/free-mode";

import type { BlogPost } from "@/lib/wordpress/client";

interface BlogCarouselProps {
  posts: BlogPost[];
}

export function BlogCarousel({ posts }: BlogCarouselProps) {
  const [swiper, setSwiper] = useState<SwiperType | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  if (posts.length === 0) return null;

  return (
    <div className="relative group/carousel md:hidden">
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
        }}
        slidesPerView={1.2}
        spaceBetween={12}
        slidesOffsetBefore={0}
        slidesOffsetAfter={0}
        breakpoints={{
          480: {
            slidesPerView: 1.5,
            spaceBetween: 16,
          },
          640: {
            slidesPerView: 2,
            spaceBetween: 16,
          },
        }}
        className="select-none"
      >
        {posts.map((post) => (
          <SwiperSlide key={post.id} className="!h-auto">
            <article className="group bg-accent rounded-xl border overflow-hidden hover:border-foreground/20 transition-colors h-full">
              <Link href={`/blog/${post.slug}`}>
                <div className="relative aspect-video bg-muted overflow-hidden">
                  {post.image ? (
                    <Image
                      src={post.image}
                      alt={post.imageAlt || post.title}
                      fill
                      sizes="(max-width: 480px) 85vw, (max-width: 640px) 60vw, 50vw"
                      loading="lazy"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      Brak zdjęcia
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Calendar className="h-3 w-3" />
                    <span>{post.date}</span>
                  </div>
                  <h3 className="font-semibold text-base group-hover:text-primary transition-colors line-clamp-2 mb-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {post.excerpt}
                  </p>
                </div>
              </Link>
            </article>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Navigation buttons */}
      <button
        onClick={() => swiper?.slidePrev()}
        className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 text-white hover:bg-black/70 flex items-center justify-center transition-all duration-300 ${
          isBeginning ? "opacity-0 pointer-events-none" : "opacity-0 group-hover/carousel:opacity-100"
        }`}
        aria-label="Poprzedni wpis"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        onClick={() => swiper?.slideNext()}
        className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 text-white hover:bg-black/70 flex items-center justify-center transition-all duration-300 ${
          isEnd ? "opacity-0 pointer-events-none" : "opacity-0 group-hover/carousel:opacity-100"
        }`}
        aria-label="Następny wpis"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
