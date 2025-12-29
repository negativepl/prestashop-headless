"use client";

import { useEffect, useState, use } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ChevronDown, ChevronRight, SlidersHorizontal, X, Grid3X3, LayoutList } from "lucide-react";
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

export default function CategoryPage({ params }: CategoryPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [category, setCategory] = useState<Category | null>(null);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Filters state
  const [priceMin, setPriceMin] = useState(searchParams.get("priceMin") || "");
  const [priceMax, setPriceMax] = useState(searchParams.get("priceMax") || "");
  const [inStock, setInStock] = useState(searchParams.get("inStock") === "true");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "default");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [catRes, subCatRes, productsRes] = await Promise.all([
          fetch(`/api/categories/${id}`),
          fetch(`/api/categories?parentId=${id}`),
          fetch(`/api/products?categoryId=${id}`),
        ]);

        if (catRes.ok) {
          const catData = await catRes.json();
          setCategory(catData);
        }

        if (subCatRes.ok) {
          const subData = await subCatRes.json();
          setSubcategories(subData);
        }

        if (productsRes.ok) {
          const prodData = await productsRes.json();
          setProducts(prodData);
        }
      } catch (error) {
        console.error("Error fetching category data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Filter and sort products
  const filteredProducts = products
    .filter((product) => {
      if (priceMin && product.price < parseFloat(priceMin)) return false;
      if (priceMax && product.price > parseFloat(priceMax)) return false;
      if (inStock && product.quantity !== null && product.quantity <= 0) return false;
      return true;
    })
    .sort((a, b) => {
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

  if (loading) {
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
        <h1 className="text-3xl md:text-4xl font-bold">{category?.name || "Kategoria"}</h1>
        {category?.description && (
          <p className="text-muted-foreground mt-2">{category.description}</p>
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
                {filteredProducts.length} {filteredProducts.length === 1 ? "produkt" : "produktów"}
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
          ) : viewMode === "grid" ? (
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
        </div>
      </div>
    </div>
  );
}
