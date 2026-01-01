"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { Search, SlidersHorizontal, X, Grid3X3, LayoutList, Loader2 } from "lucide-react";
import Link from "next/link";
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
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import type { Product } from "@/lib/prestashop/types";

interface SearchResultsProps {
  query: string;
}

interface SearchResponse {
  products: {
    id: number;
    name: string;
    nameHighlighted: string;
    price: number;
    imageUrl: string | null;
    categoryName: string;
    manufacturerName: string;
    quantity: number;
    reference: string;
  }[];
  totalHits: number;
}

const PRODUCTS_PER_PAGE = 24;

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function SearchResults({ query }: SearchResultsProps) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [visibleCount, setVisibleCount] = useState(PRODUCTS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Filters state
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [inStock, setInStock] = useState(false);
  const [selectedManufacturers, setSelectedManufacturers] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("default");

  // Build filter string for Meilisearch
  const buildFilter = () => {
    const filters: string[] = [];
    if (priceMin) filters.push(`price >= ${parseFloat(priceMin) / 1.23}`); // Convert to net price
    if (priceMax) filters.push(`price <= ${parseFloat(priceMax) / 1.23}`);
    if (inStock) filters.push("quantity > 0");
    if (selectedManufacturers.length > 0) {
      const manuFilter = selectedManufacturers.map(m => `manufacturerName = "${m}"`).join(" OR ");
      filters.push(`(${manuFilter})`);
    }
    return filters.join(" AND ");
  };

  // Build sort array for Meilisearch
  const buildSort = () => {
    switch (sortBy) {
      case "price-asc":
        return ["price:asc"];
      case "price-desc":
        return ["price:desc"];
      case "name-asc":
        return ["name:asc"];
      case "name-desc":
        return ["name:desc"];
      default:
        return undefined;
    }
  };

  // Fetch search results
  const filter = buildFilter();
  const sort = buildSort();
  const searchUrl = `/api/search?q=${encodeURIComponent(query)}&limit=${visibleCount}${filter ? `&filter=${encodeURIComponent(filter)}` : ""}${sort ? `&sort=${encodeURIComponent(JSON.stringify(sort))}` : ""}`;

  const { data, isLoading, mutate } = useSWR<SearchResponse>(
    query ? searchUrl : null,
    fetcher,
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
    }
  );

  const searchResults = data?.products || [];
  const totalHits = data?.totalHits || 0;

  // Convert to Product format
  const products: Product[] = useMemo(() => {
    return searchResults.map((r) => ({
      id: r.id,
      name: r.name,
      price: r.price * 1.23, // Add VAT
      imageUrl: r.imageUrl,
      images: r.imageUrl ? [r.imageUrl] : [],
      quantity: r.quantity,
      description: "",
      descriptionShort: "",
      reference: r.reference,
      ean13: null,
      categoryId: 0,
      active: true,
      weight: 0,
      manufacturerId: 0,
      manufacturerName: r.manufacturerName,
      features: [],
    }));
  }, [searchResults]);

  // Extract unique manufacturers for filter
  const manufacturers = useMemo(() => {
    const manuSet = new Set<string>();
    searchResults.forEach((r) => {
      if (r.manufacturerName) manuSet.add(r.manufacturerName);
    });
    return Array.from(manuSet).sort();
  }, [searchResults]);

  // Load more handler
  const loadMore = async () => {
    setIsLoadingMore(true);
    setVisibleCount((prev) => prev + PRODUCTS_PER_PAGE);
    // SWR will automatically refetch with new limit
    setTimeout(() => setIsLoadingMore(false), 500);
  };

  const hasMore = visibleCount < totalHits;

  const clearFilters = () => {
    setPriceMin("");
    setPriceMax("");
    setInStock(false);
    setSelectedManufacturers([]);
    setSortBy("default");
  };

  const hasActiveFilters = priceMin || priceMax || inStock || selectedManufacturers.length > 0;

  const toggleManufacturer = (manu: string) => {
    setSelectedManufacturers((prev) =>
      prev.includes(manu) ? prev.filter((m) => m !== manu) : [...prev, manu]
    );
  };

  const FiltersContent = () => (
    <div className="space-y-6">
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

      {/* Manufacturers */}
      {manufacturers.length > 0 && (
        <>
          <Separator />
          <div>
            <h3 className="font-semibold mb-3">Producent</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {manufacturers.slice(0, 15).map((manu) => (
                <div key={manu} className="flex items-center space-x-2">
                  <Checkbox
                    id={`manu-${manu}`}
                    checked={selectedManufacturers.includes(manu)}
                    onCheckedChange={() => toggleManufacturer(manu)}
                  />
                  <Label htmlFor={`manu-${manu}`} className="text-sm cursor-pointer">
                    {manu}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

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

  if (isLoading && products.length === 0) {
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

  return (
    <div className="container py-8">
      <Breadcrumbs
        items={[
          { label: "Produkty", href: "/products" },
          { label: `Wyniki: "${query}"` },
        ]}
      />

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Search className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Wyniki wyszukiwania
            </h1>
            <p className="text-muted-foreground">
              {totalHits > 0 ? (
                <>
                  Znaleziono <span className="font-semibold text-foreground">{totalHits}</span> produktów dla &quot;{query}&quot;
                </>
              ) : (
                <>Brak wyników dla &quot;{query}&quot;</>
              )}
            </p>
          </div>
        </div>

        <Link
          href="/products"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors"
        >
          <X className="size-4" />
          Wyczyść wyszukiwanie
        </Link>
      </div>

      {totalHits === 0 ? (
        <div className="text-center py-16 bg-muted/30 rounded-2xl">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Search className="size-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Nie znaleziono produktów</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Spróbuj użyć innych słów kluczowych lub sprawdź pisownię
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Przeglądaj wszystkie produkty
          </Link>
        </div>
      ) : (
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
                  {products.length} z {totalHits} produktów
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
                    <SelectItem value="default">Trafność</SelectItem>
                    <SelectItem value="price-asc">Cena: rosnąco</SelectItem>
                    <SelectItem value="price-desc">Cena: malejąco</SelectItem>
                    <SelectItem value="name-asc">Nazwa: A-Z</SelectItem>
                    <SelectItem value="name-desc">Nazwa: Z-A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Products Grid */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
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
                  className="min-w-[180px]"
                >
                  {isLoadingMore ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Ładowanie...
                    </>
                  ) : (
                    `Załaduj więcej (${totalHits - products.length} pozostało)`
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
