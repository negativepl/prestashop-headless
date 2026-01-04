import Link from "next/link";
import Image from "next/image";
import { Calendar } from "lucide-react";

import type { BlogPost } from "@/lib/wordpress/client";

interface BlogCarouselProps {
  posts: BlogPost[];
}

export function BlogCarousel({ posts }: BlogCarouselProps) {
  if (posts.length === 0) return null;

  return (
    <div className="md:hidden -mx-6">
      <div
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth px-[7.5%] pb-4 -mb-4"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {posts.map((post) => (
          <div
            key={post.id}
            className="snap-center shrink-0 w-[85%]"
          >
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
          </div>
        ))}
      </div>
    </div>
  );
}
