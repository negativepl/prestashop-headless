"use client";

import { useState, use, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { ChevronRight, SlidersHorizontal, X, Grid3X3, LayoutList, Loader2 } from "lucide-react";
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

const PRODUCTS_PER_PAGE = 24;

// Fetcher for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CategoryPage({ params }: CategoryPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE);

  // Filters state
  const [priceMin, setPriceMin] = useState(searchParams.get("priceMin") || "");
  const [priceMax, setPriceMax] = useState(searchParams.get("priceMax") || "");
  const [inStock, setInStock] = useState(searchParams.get("inStock") === "true");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "default");

  // Fetch category and subcategories
  const { data: category } = useSWR<Category>(`/api/categories/${id}`, fetcher);
  const { data: subcategories = [] } = useSWR<Category[]>(
    `/api/categories?parentId=${id}`,
    fetcher
  );

  // Step 1: Fetch sorted product IDs (lightweight, fast)
  const { data: productIds, isLoading: loadingIds } = useSWR<{ id: number; quantity: number }[]>(
    `/api/products/ids?categoryId=${id}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
    }
  );

  // Get IDs for current visible products
  const visibleIds = useMemo(() => {
    if (!productIds) return [];
    return productIds.slice(0, visibleCount).map(p => p.id);
  }, [productIds, visibleCount]);

  // Step 2: Fetch full product details for visible IDs
  const { data: products = [], isLoading: loadingProducts, isValidating } = useSWR<Product[]>(
    visibleIds.length > 0 ? `/api/products/by-ids?ids=${visibleIds.join(",")}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      keepPreviousData: true, // Keep showing old products while loading new ones
    }
  );

  // Sort products to match the order of visibleIds
  const sortedProducts = useMemo(() => {
    if (!products.length) return [];
    const productMap = new Map(products.map(p => [p.id, p]));
    return visibleIds.map(id => productMap.get(id)).filter((p): p is Product => p !== undefined);
  }, [products, visibleIds]);

  // Check if there are more products to load
  const hasMore = productIds ? visibleCount < productIds.length : false;
  const totalProducts = productIds?.length || 0;

  // Load more handler
  const loadMore = () => {
    setVisibleCount(prev => prev + PRODUCTS_PER_PAGE);
  };

  // Reset visible count when category changes
  useMemo(() => {
    setVisibleCount(PRODUCTS_PER_PAGE);
  }, [id]);

  // Filter and sort products (client-side)
  const filteredProducts = sortedProducts
    .filter((product) => {
      if (priceMin && product.price < parseFloat(priceMin)) return false;
      if (priceMax && product.price > parseFloat(priceMax)) return false;
      if (inStock && product.quantity !== null && product.quantity <= 0) return false;
      return true;
    })
    .sort((a, b) => {
      // Apply selected sorting (stock order is already handled by API)
      switch (sortBy) {
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

  const clearFilters = () => {
    setPriceMin("");
    setPriceMax("");
    setInStock(false);
    setSortBy("default");
  };

  const hasActiveFilters = priceMin || priceMax || inStock;

  const FiltersContent = () => (
    <div className="space-y-6">
      {/* Subcategories */}
      {subcategories.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Podkategorie</h3>
          <div className="space-y-2">
            {subcategories.map((subcat) => (
              <button
                key={subcat.id}
                onClick={() => router.push(`/categories/${subcat.id}`)}
                className="flex items-center gap-2 w-full text-left text-sm hover:text-primary transition-colors py-1"
              >
                <ChevronRight className="size-4" />
                {subcat.name}
              </button>
            ))}
          </div>
          <Separator className="mt-4" />
        </div>
      )}

      {/* Price filter */}
      <div>
        <h3 className="font-semibold mb-3">Cena</h3>
        <div className="flex gap-2 items-center">
          <Input
            type="number"
            placeholder="Od"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            className="h-9"
          />
          <span className="text-muted-foreground">-</span>
          <Input
            type="number"
            placeholder="Do"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            className="h-9"
          />
        </div>
      </div>

      <Separator />

      {/* Availability */}
      <div>
        <h3 className="font-semibold mb-3">Dostępność</h3>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="inStock"
            checked={inStock}
            onCheckedChange={(checked) => setInStock(checked === true)}
          />
          <Label htmlFor="inStock" className="text-sm cursor-pointer">
            Tylko dostępne
          </Label>
        </div>
      </div>

      {hasActiveFilters && (
        <>
          <Separator />
          <Button variant="outline" onClick={clearFilters} className="w-full">
            <X className="size-4 mr-2" />
            Wyczyść filtry
          </Button>
        </>
      )}
    </div>
  );

  const isLoading = loadingIds || (loadingProducts && products.length === 0);

  if (isLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96 mb-8" />
        <div className="flex gap-8">
          <div className="hidden lg:block w-64 shrink-0">
            <Skeleton className="h-[400px] w-full" />
          </div>
          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Produkty", href: "/products" },
    ...(category ? [{ label: category.name }] : []),
  ];

  return (
    <div className="container py-8">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{category?.name || "Kategoria"}</h1>
        {category?.description && (
          <div className="mt-2">
            <div className="relative">
              <div
                className={`text-muted-foreground category-description overflow-hidden transition-all duration-300 ${
                  descriptionExpanded ? "" : "max-h-[4.5em]"
                }`}
                dangerouslySetInnerHTML={{ __html: category.description }}
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
      </div>

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
              {/* Mobile filters button */}
              <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden">
                    <SlidersHorizontal className="size-4 mr-2" />
                    Filtry
                    {hasActiveFilters && (
                      <span className="ml-2 w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center">
                        !
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>Filtry</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6">
                    <FiltersContent />
                  </div>
                </SheetContent>
              </Sheet>

              <span className="text-sm text-muted-foreground">
                {filteredProducts.length} z {totalProducts} produktów
              </span>
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
                <SelectTrigger className="w-[180px] h-9">
                  <SelectValue placeholder="Sortuj" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Domyślnie</SelectItem>
                  <SelectItem value="price-asc">Cena: rosnąco</SelectItem>
                  <SelectItem value="price-desc">Cena: malejąco</SelectItem>
                  <SelectItem value="name-asc">Nazwa: A-Z</SelectItem>
                  <SelectItem value="name-desc">Nazwa: Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
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
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
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
                    disabled={isValidating}
                    className="min-w-[180px]"
                  >
                    {isValidating ? (
                      <>
                        <Loader2 className="size-4 mr-2 animate-spin" />
                        Ładowanie...
                      </>
                    ) : (
                      `Załaduj więcej (${totalProducts - visibleCount} pozostało)`
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
