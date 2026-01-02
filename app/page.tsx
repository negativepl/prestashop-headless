import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Truck, RotateCcw, Percent, Headphones, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/products/product-card";
import { HeroCarouselWrapper } from "@/components/home/hero-carousel-wrapper";
import { FeaturedProducts } from "@/components/home/featured-products";
import { NewArrivals } from "@/components/home/new-arrivals";
import { BestsellersCarousel } from "@/components/home/bestsellers-carousel";
import { BlogCarousel } from "@/components/home/blog-carousel";
import { binshops } from "@/lib/binshops/client";
import type { Product } from "@/lib/prestashop/types";
import { wordpress, type BlogPost } from "@/lib/wordpress/client";
import { getHeroSlides, type HeroSlide } from "@/lib/cms/client";

// Force static generation with ISR fetch revalidation
export const dynamic = "force-static";
export const revalidate = 60; // Revalidate fetches every 60 seconds

export default async function HomePage() {
  let featuredProducts: Product[] = [];
  let bestsellers: Product[] = [];
  let newArrivalsProducts: Product[] = [];
  let blogPosts: BlogPost[] = [];
  let heroSlides: HeroSlide[] = [];

  try {
    // Fetch all data in parallel using Binshops API
    const [featuredRes, bestsellersRes, newArrivalsRes, blogRes, slidesRes] = await Promise.all([
      binshops.getFeaturedProducts(10),
      binshops.getProducts({ limit: 20, sortBy: "sales" }),
      binshops.getProducts({ limit: 30, sortBy: "date" }),
      wordpress.getPosts({ limit: 3 }),
      getHeroSlides(),
    ]);

    featuredProducts = featuredRes;
    bestsellers = bestsellersRes.products;
    newArrivalsProducts = newArrivalsRes.products;
    blogPosts = blogRes;
    heroSlides = slidesRes;
  } catch (e) {
    console.error("Error fetching data:", e);
  }

  // Filter out of stock products
  const availableProducts = bestsellers.filter(
    (product) => product.quantity === null || product.quantity > 0
  );
  const weeklyHitsProducts = featuredProducts.filter(
    (product) => product.quantity === null || product.quantity > 0
  ).slice(0, 10);

  // Filter and take 20 products for new arrivals
  const availableNewArrivals = newArrivalsProducts.filter(
    (product) => product.quantity === null || product.quantity > 0
  ).slice(0, 20);

  return (
    <div className="flex flex-col">
      {/* Hero Carousel */}
      <HeroCarouselWrapper slides={heroSlides} />

      {/* Polecane */}
      {weeklyHitsProducts.length > 0 && (
        <section className="py-8">
          <div className="container">
            <FeaturedProducts products={weeklyHitsProducts} />
          </div>
        </section>
      )}


      {/* Featured Products */}
      <section className="py-8">
        <div className="container">
          <div className="bg-card rounded-2xl p-6 md:p-10 border">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="text-primary font-semibold text-sm uppercase tracking-wider">
                  Bestsellery
                </span>
                <h2 className="text-3xl md:text-4xl font-bold mt-2">
                  Najpopularniejsze produkty
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Najczęściej wybierane przez naszych klientów
                </p>
              </div>
              <Link href="/products" className="hidden sm:block">
                <Button variant="ghost">
                  Zobacz wszystkie
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Carousel with navigation arrows */}
            {availableProducts.length > 0 ? (
              <BestsellersCarousel products={availableProducts.slice(0, 10)} />
            ) : (
              <div className="text-center py-12 bg-card rounded-lg">
                <p className="text-muted-foreground">
                  Brak produktów do wyświetlenia
                </p>
              </div>
            )}

            <div className="mt-10 text-center sm:hidden">
              <Link href="/products">
                <Button>
                  Zobacz wszystkie produkty
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      {availableNewArrivals.length > 0 && (
        <section className="py-8">
          <div className="container">
            <div className="bg-card rounded-2xl border overflow-hidden">
              <div className="p-6 md:p-10 pb-0 md:pb-0">
                <div className="flex items-end justify-between mb-8">
                  <div>
                    <span className="text-primary font-semibold text-sm uppercase tracking-wider">
                      Nowości
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold mt-2">
                      Właśnie dodane
                    </h2>
                    <p className="mt-2 text-muted-foreground">
                      Sprawdź najnowsze produkty w naszej ofercie
                    </p>
                  </div>
                </div>
              </div>
              <div className="pb-6 md:pb-10">
                <NewArrivals initialProducts={availableNewArrivals} />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Blog Section */}
      {blogPosts.length > 0 && (
        <section className="py-8">
          <div className="container">
            <div className="bg-card rounded-2xl p-6 md:p-10 border">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <span className="text-primary font-semibold text-sm uppercase tracking-wider">
                    Blog
                  </span>
                  <h2 className="text-3xl md:text-4xl font-bold mt-2">
                    Najnowsze wpisy
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    Porady, nowości i inspiracje
                  </p>
                </div>
                <Link href="/blog" className="hidden sm:block">
                  <Button variant="ghost">
                    Wszystkie wpisy
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              {/* Mobile carousel */}
              <BlogCarousel posts={blogPosts} />

              {/* Desktop grid */}
              <div className="hidden md:grid md:grid-cols-3 gap-6">
                {blogPosts.map((post) => (
                  <article key={post.id} className="group bg-accent rounded-xl border overflow-hidden hover:border-foreground/20 transition-colors">
                    <Link href={`/blog/${post.slug}`}>
                      <div className="relative aspect-video bg-muted overflow-hidden">
                        {post.image ? (
                          <Image
                            src={post.image}
                            alt={post.imageAlt || post.title}
                            fill
                            sizes="33vw"
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
                        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors line-clamp-2 mb-2">
                          {post.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {post.excerpt}
                        </p>
                      </div>
                    </Link>
                  </article>
                ))}
              </div>

              <div className="mt-8 text-center sm:hidden">
                <Link href="/blog">
                  <Button>
                    Wszystkie wpisy
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Brands Section */}
      <section>
        <div className="container">
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>
        <div className="container py-8">
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3 md:gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
              <div
                key={num}
                className="h-12 md:h-14 bg-card rounded-lg flex items-center justify-center text-foreground font-medium text-xs border border-border/50"
              >
                Marka {num}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-card">
        <div className="container py-8 md:py-10 lg:py-14">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 xl:gap-8">
            <div className="flex items-center gap-2 sm:gap-3 xl:gap-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 xl:w-12 xl:h-12 bg-primary/10 rounded-lg xl:rounded-xl flex items-center justify-center shrink-0">
                <Truck className="h-4 w-4 sm:h-5 sm:w-5 xl:h-6 xl:w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-xs sm:text-sm xl:text-base">Darmowa wysyłka</p>
                <p className="text-[10px] sm:text-xs xl:text-sm text-muted-foreground">Paczkomat® od 100 zł</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 xl:gap-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 xl:w-12 xl:h-12 bg-primary/10 rounded-lg xl:rounded-xl flex items-center justify-center shrink-0">
                <RotateCcw className="h-4 w-4 sm:h-5 sm:w-5 xl:h-6 xl:w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-xs sm:text-sm xl:text-base">Zwrot do 30 dni</p>
                <p className="text-[10px] sm:text-xs xl:text-sm text-muted-foreground">Bez podawania przyczyny</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 xl:gap-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 xl:w-12 xl:h-12 bg-primary/10 rounded-lg xl:rounded-xl flex items-center justify-center shrink-0">
                <Percent className="h-4 w-4 sm:h-5 sm:w-5 xl:h-6 xl:w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-xs sm:text-sm xl:text-base">15% rabatu</p>
                <p className="text-[10px] sm:text-xs xl:text-sm text-muted-foreground">Za zapis do newslettera</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 xl:gap-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 xl:w-12 xl:h-12 bg-primary/10 rounded-lg xl:rounded-xl flex items-center justify-center shrink-0">
                <Headphones className="h-4 w-4 sm:h-5 sm:w-5 xl:h-6 xl:w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-xs sm:text-sm xl:text-base">Wsparcie 24/7</p>
                <p className="text-[10px] sm:text-xs xl:text-sm text-muted-foreground">Zawsze chętnie pomożemy</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
