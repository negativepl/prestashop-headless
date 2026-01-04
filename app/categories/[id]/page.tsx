"use client";

import { useState, use, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import useSWR from "swr";
import { ChevronRight, ChevronLeft, SlidersHorizontal, X, Grid3X3, LayoutList, Loader2, Folder } from "lucide-react";
import { SafeHtml } from "@/components/ui/safe-html";
import { ProductCard } from "@/components/products/product-card";
import { ProductCardRow } from "@/components/products/product-card-row";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumbs, BreadcrumbItem } from "@/components/ui/breadcrumbs";
import type { Product, Category } from "@/lib/prestashop/types";

interface CategoryPageProps {
  params: Promise<{ id: string }>;
}

// Skeleton for product card
function ProductCardSkeleton() {
  return (
    <div className="bg-accent rounded-xl border overflow-hidden flex flex-col h-full animate-pulse">
      <div className="aspect-square bg-muted" />
      <div className="p-4 flex flex-col flex-1">
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-4" />
        <div className="mt-auto pt-3">
          <Skeleton className="h-6 w-24 mb-3" />
          <Skeleton className="h-8 w-full" />
        </div>
      </div>
    </div>
  );
}

// Skeleton for subcategory strip
function SubcategoriesStripSkeleton() {
  return (
    <div className="mb-6">
      <div className="flex gap-3 pb-2 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex-shrink-0 w-20 sm:w-24 flex flex-col items-center gap-2">
            <Skeleton className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl" />
            <Skeleton className="h-3 w-14" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Subcategories strip component with scroll arrows
function SubcategoriesStrip({ subcategories }: { subcategories: Category[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 1);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
    }
    return () => {
      el?.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll, subcategories]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = 300;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <div className="mb-6 relative group/strip">
      {/* Left arrow - hidden on mobile */}
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-background/90 border rounded-full shadow-md items-center justify-center hover:bg-muted transition-colors"
          aria-label="Przewiń w lewo"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      {/* Right arrow - hidden on mobile */}
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-background/90 border rounded-full shadow-md items-center justify-center hover:bg-muted transition-colors"
          aria-label="Przewiń w prawo"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      )}

      {/* Scrollable container */}
      <div
        ref={scrollRef}
        className="overflow-x-auto scrollbar-hide px-1"
      >
        <div className="flex gap-3 pb-2">
          {subcategories.map((subcat) => (
            <Link
              key={subcat.id}
              href={`/categories/${subcat.id}`}
              className="flex-shrink-0 group"
            >
              <div className="w-20 sm:w-24 flex flex-col items-center gap-2">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-muted border overflow-hidden transition-all group-hover:border-primary group-hover:shadow-md">
                  {subcat.imageUrl ? (
                    <Image
                      src={subcat.imageUrl}
                      alt={subcat.name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Folder className="w-8 h-8 text-muted-foreground/50" />
                    </div>
                  )}
                </div>
                <span className="text-xs text-center line-clamp-2 group-hover:text-primary transition-colors">
                  {subcat.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

const PRODUCTS_PER_PAGE = 24;

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface CategoryFullData {
  category: Category;
  subcategories: Category[];
  categoryPath: Category[];
  products: Product[];
  total: number;
  facets: any[];
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const { id } = use(params);
  const router = useRouter();

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  // Pagination state - additionalProducts stores pages 2+ from "Load more"
  const [currentPage, setCurrentPage] = useState(1);
  const [additionalProducts, setAdditionalProducts] = useState<Product[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Filters state
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [inStock, setInStock] = useState(false);
  const [sortBy, setSortBy] = useState("default");
  const [activeFilters, setActiveFilters] = useState<string[]>([]); // Faceted filters

  // Build full URL with all parameters
  const getFullUrl = useCallback((page: number) => {
    const params = new URLSearchParams({
      limit: PRODUCTS_PER_PAGE.toString(),
      page: page.toString(),
    });
    if (sortBy !== "default") {
      params.set("sort", sortBy);
    }
    if (activeFilters.length > 0) {
      params.set("q", activeFilters.join("-"));
    }
    return `/api/categories/${id}/full?${params.toString()}`;
  }, [id, sortBy, activeFilters]);

  // Single consolidated fetch
  const { data: fullData, isLoading, isValidating } = useSWR<CategoryFullData>(
    getFullUrl(1),
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  // Compute total from fullData
  const total = fullData?.total ?? 0;
  const facets = fullData?.facets ?? [];

  // Prefetch next page for "Load more"
  const nextPageUrl = currentPage * PRODUCTS_PER_PAGE < total ? `/api/products?categoryId=${id}&page=${currentPage + 1}&limit=${PRODUCTS_PER_PAGE}${sortBy !== "default" ? `&sort=${sortBy}` : ""}${activeFilters.length > 0 ? `&q=${activeFilters.join("-")}` : ""}` : null;
  const { data: prefetchedData } = useSWR<{ products: Product[]; total: number }>(
    nextPageUrl,
    fetcher,
    { revalidateOnFocus: false }
  );

  // Reset filters and page when category changes
  useEffect(() => {
    setActiveFilters([]);
    setCurrentPage(1);
    setAdditionalProducts([]);
  }, [id]);

  // Reset page when sort or filters change
  useEffect(() => {
    setCurrentPage(1);
    setAdditionalProducts([]);
  }, [sortBy, activeFilters]);

  // Combine first page products from SWR with additional pages from state
  const isDataForCurrentCategory = fullData?.category && String(fullData.category.id) === id;
  const allProducts = isDataForCurrentCategory
    ? [...(fullData?.products || []), ...additionalProducts]
    : [];

  // Load more handler
  const loadMore = async () => {
    if (prefetchedData) {
      // Use prefetched data - instant!
      setAdditionalProducts(prev => [...prev, ...prefetchedData.products]);
      setCurrentPage(prev => prev + 1);
    } else {
      // Fallback: fetch if prefetch not ready
      setIsLoadingMore(true);
      try {
        const params = new URLSearchParams({
          categoryId: id,
          page: (currentPage + 1).toString(),
          limit: PRODUCTS_PER_PAGE.toString(),
        });
        if (sortBy !== "default") {
          params.set("sort", sortBy);
        }
        if (activeFilters.length > 0) {
          params.set("q", activeFilters.join("-"));
        }
        const res = await fetch(`/api/products?${params.toString()}`);
        const data = await res.json();
        setAdditionalProducts(prev => [...prev, ...data.products]);
        setCurrentPage(prev => prev + 1);
      } catch (error) {
        console.error("Error loading more products:", error);
      } finally {
        setIsLoadingMore(false);
      }
    }
  };

  // Filter products (client-side)
  const filteredProducts = allProducts.filter((product) => {
    if (priceMin && product.price < parseFloat(priceMin)) return false;
    if (priceMax && product.price > parseFloat(priceMax)) return false;
    if (inStock && product.quantity !== null && product.quantity <= 0) return false;
    return true;
  });

  const hasMore = allProducts.length < total;
  const remaining = total - allProducts.length;

  const clearFilters = () => {
    setPriceMin("");
    setPriceMax("");
    setInStock(false);
    setActiveFilters([]);
  };

  const toggleFacetFilter = (facetLabel: string, filterValue: string) => {
    const filterKey = `${facetLabel}-${filterValue}`;
    setActiveFilters((prev) =>
      prev.includes(filterKey)
        ? prev.filter((f) => f !== filterKey)
        : [...prev, filterKey]
    );
  };

  const hasActiveFilters = priceMin || priceMax || inStock || activeFilters.length > 0;

  // Extract data from consolidated response
  const category = fullData?.category;
  const subcategories = fullData?.subcategories || [];
  const categoryPath = fullData?.categoryPath || [];

  // Show skeleton while loading or when data doesn't match current category
  const showSkeleton = isLoading || !isDataForCurrentCategory;

  const FiltersContent = () => (
    <div className="space-y-5">
      {/* Faceted filters from API */}
      {facets.map((facet, index) => (
        <div key={facet.label} className="pb-5 border-b last:border-b-0">
          <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-4">{facet.label}</h3>
          <div className="space-y-3 max-h-52 overflow-y-auto pr-2">
            {facet.filters?.slice(0, 20).map((filter: any) => {
              const filterKey = `${facet.label}-${filter.label}`;
              const isActive = activeFilters.includes(filterKey);
              return (
                <label
                  key={filter.label}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                    isActive ? "bg-primary/10" : "hover:bg-muted"
                  }`}
                >
                  <Checkbox
                    id={filterKey}
                    checked={isActive}
                    onCheckedChange={() => toggleFacetFilter(facet.label, filter.label)}
                  />
                  <span className="text-sm flex-1">
                    {filter.label}
                  </span>
                  {filter.magnitude > 0 && (
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {filter.magnitude}
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </div>
      ))}

      {/* Price filter */}
      <div className="pb-5 border-b">
        <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-4">Cena</h3>
        <div className="flex gap-3 items-center">
          <Input
            type="number"
            placeholder="Od"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            className="h-10"
          />
          <span className="text-muted-foreground font-medium">-</span>
          <Input
            type="number"
            placeholder="Do"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            className="h-10"
          />
        </div>
      </div>

      {/* Availability */}
      <div className="pb-5">
        <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-4">Dostępność</h3>
        <label className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-muted transition-colors">
          <Checkbox
            id="inStock"
            checked={inStock}
            onCheckedChange={(checked) => setInStock(checked === true)}
          />
          <span className="text-sm">Tylko dostępne</span>
        </label>
      </div>

      {hasActiveFilters && (
        <div className="pt-2">
          <Button variant="outline" onClick={clearFilters} className="w-full h-11">
            <X className="size-4 mr-2" />
            Wyczyść filtry
          </Button>
        </div>
      )}
    </div>
  );

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Produkty", href: "/products" },
    ...categoryPath.slice(0, -1).map((cat) => ({
      label: cat.name,
      href: `/categories/${cat.id}`,
    })),
    ...(category ? [{ label: category.name }] : []),
  ];

  return (
    <div className="container py-8">
      {/* Breadcrumbs */}
      {showSkeleton ? (
        <div className="mb-4">
          <Skeleton className="h-4 w-64" />
        </div>
      ) : (
        <Breadcrumbs items={breadcrumbItems} />
      )}

      {/* Header */}
      <div className="mb-6">
        {showSkeleton ? (
          <>
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-4 w-full max-w-xl" />
          </>
        ) : (
          <>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
              {category?.name}
            </h1>
            {category?.description && (
              <div className="mt-2">
                <div className="relative">
                  <SafeHtml
                    html={category.description}
                    className={`text-muted-foreground category-description overflow-hidden transition-all duration-300 ${
                      descriptionExpanded ? "" : "max-h-[4.5em]"
                    }`}
                  />
                  {!descriptionExpanded && (
                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent pointer-events-none" />
                  )}
                </div>
                <button
                  onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                  className="text-primary text-sm font-medium mt-1 hover:underline"
                >
                  {descriptionExpanded ? "Zwiń" : "Czytaj więcej"}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Subcategories thumbnails strip */}
      {showSkeleton ? (
        <SubcategoriesStripSkeleton />
      ) : subcategories.length > 0 ? (
        <SubcategoriesStrip subcategories={subcategories} />
      ) : null}

      <div className="flex gap-8">
        {/* Desktop Filters Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-24 border rounded-xl p-4 bg-card">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <SlidersHorizontal className="size-4" />
              Filtry
            </h2>
            <FiltersContent />
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b">
            <div className="flex items-center gap-2">
              {showSkeleton ? (
                <Skeleton className="h-4 w-32" />
              ) : (
                <span className="text-sm text-muted-foreground">
                  {filteredProducts.length} z {total} produktów
                </span>
              )}
              {isValidating && !isLoading && (
                <Loader2 className="size-3 animate-spin text-muted-foreground" />
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* View mode toggle */}
              <div className="hidden sm:flex border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 ${viewMode === "grid" ? "bg-muted" : "hover:bg-muted/50"}`}
                >
                  <Grid3X3 className="size-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 ${viewMode === "list" ? "bg-muted" : "hover:bg-muted/50"}`}
                >
                  <LayoutList className="size-4" />
                </button>
              </div>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[130px] sm:w-[160px] h-9">
                  <SelectValue placeholder="Sortuj" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Domyślnie</SelectItem>
                  <SelectItem value="price-asc">Cena: rosnąco</SelectItem>
                  <SelectItem value="price-desc">Cena: malejąco</SelectItem>
                  <SelectItem value="name-asc">Nazwa: A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Products Grid */}
          {showSkeleton ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4">
              {[...Array(8)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-muted/50 rounded-xl">
              <p className="text-muted-foreground">Brak produktów w tej kategorii</p>
              {hasActiveFilters && (
                <Button variant="link" onClick={clearFilters} className="mt-2">
                  Wyczyść filtry
                </Button>
              )}
            </div>
          ) : (
            <>
              {viewMode === "grid" ? (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4">
                  {filteredProducts.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      priority={index < 4}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredProducts.map((product) => (
                    <ProductCardRow key={product.id} product={product} />
                  ))}
                </div>
              )}

              {/* Load more button */}
              {hasMore && (
                <div className="mt-8 text-center">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={loadMore}
                    disabled={isLoadingMore}
                    className="min-w-[200px]"
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="size-4 mr-2 animate-spin" />
                        Ładowanie...
                      </>
                    ) : (
                      "Załaduj więcej"
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Floating mobile filters button - pinned to right edge */}
      <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <SheetTrigger asChild>
          <Button
            variant="default"
            className="lg:hidden fixed right-4 bottom-20 z-40 shadow-lg rounded-xl h-auto py-2.5 px-4 flex items-center gap-2"
          >
            <SlidersHorizontal className="size-5" />
            <span className="text-[10px] font-medium">Filtry</span>
            {hasActiveFilters && (
              <span className="absolute -top-2 -left-2 w-5 h-5 bg-destructive text-destructive-foreground rounded-full text-xs flex items-center justify-center">
                {activeFilters.length}
              </span>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[320px] sm:w-[380px] p-0">
          <div className="p-6 border-b">
            <SheetTitle className="flex items-center gap-2">
              <SlidersHorizontal className="size-5" />
              Filtry
            </SheetTitle>
          </div>
          <div className="p-6 overflow-y-auto max-h-[calc(100vh-140px)]">
            <FiltersContent />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
