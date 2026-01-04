"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Search, X, ArrowRight, Loader2, Command, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { SafeHighlight } from "@/components/ui/safe-html";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return isMobile;
}

interface SearchProduct {
  id: number;
  name: string;
  nameHighlighted: string;
  price: number;
  imageUrl: string | null;
  categoryName: string;
  manufacturerName: string;
  quantity: number;
  reference: string;
}

interface SearchCategory {
  id: number;
  name: string;
  nameHighlighted: string;
  productCount: number;
}

interface SuggestionProduct {
  id: number;
  name: string;
  price: number;
  imageUrl: string | null;
  manufacturerName: string | null;
}

interface SuggestionCategory {
  id: number;
  name: string;
}

interface SuggestionManufacturer {
  id: number;
  name: string;
}

interface Suggestions {
  products: SuggestionProduct[];
  categories: SuggestionCategory[];
  manufacturers: SuggestionManufacturer[];
  popularSearches: string[];
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([]);
  const [searchCategories, setSearchCategories] = useState<SearchCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<SearchCategory | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [suggestions, setSuggestions] = useState<Suggestions | null>(null);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setSearchQuery("");
      setSearchResults([]);
      setSearchCategories([]);
      setSelectedCategory(null);
      setSelectedIndex(0);

      // Use cached suggestions or fetch if not available
      const cached = getCachedSuggestions();
      if (cached) {
        setSuggestions(cached);
      } else if (!suggestions && !loadingSuggestions) {
        setLoadingSuggestions(true);
        preloadSearchSuggestions()
          .then((data) => {
            if (data) setSuggestions(data);
          })
          .finally(() => {
            setLoadingSuggestions(false);
          });
      }
    }
  }, [isOpen, suggestions, loadingSuggestions]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const fetchSearchResults = useCallback(async (query: string, categoryId?: number) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      setSearchCategories([]);
      return;
    }

    setIsSearching(true);
    try {
      const categoryFilter = categoryId ? `&category=${categoryId}` : "";
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=8${categoryFilter}`);
      const data = await response.json();
      setSearchResults(data.products || []);
      if (!categoryId) {
        setSearchCategories(data.categories || []);
      }
      setSelectedIndex(0);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
      setSearchCategories([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (searchQuery.trim().length >= 2) {
      debounceRef.current = setTimeout(() => {
        fetchSearchResults(searchQuery, selectedCategory?.id);
      }, 300);
    } else {
      setSearchResults([]);
      setSearchCategories([]);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery, selectedCategory, fetchSearchResults]);

  const handleCategoryClick = (category: SearchCategory) => {
    setSelectedCategory(category);
    setSearchCategories([]);
    fetchSearchResults(searchQuery, category.id);
  };

  const clearCategory = () => {
    setSelectedCategory(null);
    fetchSearchResults(searchQuery);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < searchResults.length ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex === 0 && searchQuery.trim()) {
        router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
        onClose();
      } else if (selectedIndex > 0 && searchResults[selectedIndex - 1]) {
        router.push(`/products/${searchResults[selectedIndex - 1].id}`);
        onClose();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      onClose();
    }
  };

  const formatPrice = (price: number) => {
    // Ceny z Meilisearch są netto - dodaj 23% VAT
    const priceWithVat = price * 1.23;
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(priceWithVat);
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-0 bg-black/50 z-[110]"
            onClick={onClose}
          />

          {/* Modal - mobile: slide up, desktop: scale fade */}
          <motion.div
            initial={isMobile ? { y: "100%" } : { opacity: 0, scale: 0.96 }}
            animate={isMobile ? { y: 0 } : { opacity: 1, scale: 1 }}
            exit={isMobile ? { y: "100%" } : { opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-0 z-[110] md:inset-auto md:left-1/2 md:top-[5%] md:-translate-x-1/2 md:w-full md:max-w-3xl md:px-4 will-change-transform"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="bg-background md:rounded-2xl shadow-2xl overflow-hidden h-full md:h-auto md:max-h-[85vh] flex flex-col border-0 md:border">
              {/* Search Header */}
              <div className="border-b">
                <form onSubmit={handleSubmit}>
                  <div className="flex items-center gap-3 px-5 py-4">
                    {/* Mobile close */}
                    <button
                      type="button"
                      onClick={onClose}
                      className="md:hidden p-2 -ml-2 rounded-xl hover:bg-muted transition-colors"
                    >
                      <X className="size-5" />
                    </button>

                    {/* Search icon */}
                    <div className="hidden md:flex items-center justify-center size-10 rounded-xl bg-foreground text-background">
                      <Search className="size-5" />
                    </div>

                    {/* Input */}
                    <div className="flex-1 relative">
                      <input
                        ref={inputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Czego szukasz?"
                        className="w-full h-12 bg-transparent outline-none text-xl font-medium placeholder:text-muted-foreground/60 placeholder:font-normal"
                      />
                    </div>

                    {/* Loading / Clear */}
                    {isSearching ? (
                      <Loader2 className="size-5 text-muted-foreground animate-spin" />
                    ) : searchQuery ? (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          setSearchResults([]);
                          setSearchCategories([]);
                          setSelectedCategory(null);
                          inputRef.current?.focus();
                        }}
                        className="p-2 rounded-xl hover:bg-muted transition-colors"
                      >
                        <X className="size-4 text-muted-foreground" />
                      </button>
                    ) : null}

                    {/* Desktop close */}
                    <button
                      type="button"
                      onClick={onClose}
                      className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-muted text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <span>ESC</span>
                    </button>
                  </div>
                </form>

                {/* Category filter badge */}
                {selectedCategory && (
                  <div className="px-5 pb-3 flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">w kategorii:</span>
                    <button
                      onClick={clearCategory}
                      className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1 bg-foreground text-background rounded-full text-sm font-medium hover:bg-foreground/80 transition-colors"
                    >
                      {selectedCategory.name}
                      <X className="size-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className={cn(
                "flex-1 overflow-y-auto",
                isSearching && searchResults.length > 0 && "opacity-60"
              )}>
                {/* Loading skeleton */}
                {isSearching && searchResults.length === 0 ? (
                  <div className="p-5 space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="flex gap-4 animate-pulse">
                        <div className="size-20 rounded-xl bg-muted" />
                        <div className="flex-1 py-1 space-y-2">
                          <div className="h-3 w-20 bg-muted rounded" />
                          <div className="h-4 w-full bg-muted rounded" />
                          <div className="h-5 w-24 bg-muted rounded mt-2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : searchQuery.trim().length >= 2 ? (
                  /* Search Results */
                  <div>
                    {/* See all results */}
                    <button
                      onClick={() => {
                        router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
                        onClose();
                      }}
                      className={cn(
                        "w-full flex items-center gap-4 px-5 py-4 transition-colors border-b",
                        selectedIndex === 0 ? "bg-muted" : "hover:bg-muted/50"
                      )}
                    >
                      <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Search className="size-5 text-primary" />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium">Szukaj „{searchQuery}"</p>
                        <p className="text-sm text-muted-foreground">Pokaż wszystkie wyniki</p>
                      </div>
                      <ArrowRight className="size-4 text-muted-foreground" />
                    </button>

                    {/* Category suggestions */}
                    {searchCategories.length > 0 && !selectedCategory && (
                      <div className="px-5 py-4 border-b">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                          Kategorie
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {searchCategories.map((category) => (
                            <button
                              key={category.id}
                              onClick={() => handleCategoryClick(category)}
                              className="inline-flex items-center gap-2 px-3 py-1.5 bg-muted hover:bg-primary rounded-full text-sm transition-colors group [&_mark]:bg-transparent [&_mark]:text-inherit"
                            >
                              <SafeHighlight html={category.nameHighlighted} className="group-hover:text-primary-foreground" />
                              <span className="text-muted-foreground group-hover:text-primary-foreground/70 text-xs">
                                {category.productCount}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Products */}
                    {searchResults.length > 0 && (
                      <div>
                        <div className="px-5 py-3 bg-muted/30">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Produkty
                          </p>
                        </div>
                        {searchResults.map((product, index) => (
                          <Link
                            key={product.id}
                            href={`/products/${product.id}`}
                            onClick={onClose}
                            className={cn(
                              "flex gap-4 px-5 py-4 transition-colors border-b border-border/50",
                              selectedIndex === index + 1
                                ? "bg-muted"
                                : "hover:bg-muted/50"
                            )}
                          >
                            <div className="size-20 rounded-xl bg-white border overflow-hidden flex-shrink-0">
                              {product.imageUrl ? (
                                <img
                                  src={product.imageUrl}
                                  alt={product.name}
                                  className="w-full h-full object-contain p-2"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-muted">
                                  <Package className="size-6 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0 py-0.5">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                {product.manufacturerName && (
                                  <span className="font-medium">{product.manufacturerName}</span>
                                )}
                                {product.manufacturerName && product.categoryName && (
                                  <span className="text-border">•</span>
                                )}
                                {product.categoryName && (
                                  <span className="truncate">{product.categoryName}</span>
                                )}
                              </div>
                              <SafeHighlight
                                html={product.nameHighlighted}
                                as="p"
                                className="font-medium leading-snug line-clamp-2 [&_mark]:bg-primary/20 [&_mark]:text-foreground [&_mark]:rounded [&_mark]:px-0.5"
                              />
                              <p className="text-lg font-semibold text-primary mt-1.5">
                                {formatPrice(product.price)}
                              </p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* No results */}
                    {searchResults.length === 0 && !isSearching && (
                      <div className="px-5 py-16 text-center">
                        <div className="size-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                          <Search className="size-7 text-muted-foreground" />
                        </div>
                        <p className="font-medium mb-1">Brak wyników</p>
                        <p className="text-sm text-muted-foreground">
                          Spróbuj innej frazy wyszukiwania
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Initial state - suggestions */
                  <div className="p-5 md:p-6">
                    {/* Quick actions row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      {/* Popular searches */}
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                          Popularne
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {loadingSuggestions ? (
                            [1, 2, 3].map((i) => (
                              <div key={i} className="h-8 w-20 bg-muted rounded-full animate-pulse" />
                            ))
                          ) : (
                            suggestions?.popularSearches?.slice(0, 4).map((query) => (
                              <button
                                key={query}
                                onClick={() => setSearchQuery(query)}
                                className="px-3 py-1.5 bg-muted hover:bg-primary hover:text-primary-foreground rounded-full text-sm transition-colors"
                              >
                                {query}
                              </button>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Categories */}
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                          Kategorie
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {loadingSuggestions ? (
                            [1, 2, 3].map((i) => (
                              <div key={i} className="h-8 w-24 bg-muted rounded-full animate-pulse" />
                            ))
                          ) : (
                            suggestions?.categories?.slice(0, 4).map((cat) => (
                              <Link
                                key={cat.id}
                                href={`/categories/${cat.id}`}
                                onClick={onClose}
                                className="px-3 py-1.5 bg-muted hover:bg-primary hover:text-primary-foreground rounded-full text-sm transition-colors"
                              >
                                {cat.name}
                              </Link>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Brands */}
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                          Marki
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {["Spigen", "Ringke", "ESR", "UAG"].map((brand) => (
                            <button
                              key={brand}
                              onClick={() => setSearchQuery(brand)}
                              className="px-3 py-1.5 bg-muted hover:bg-primary hover:text-primary-foreground rounded-full text-sm transition-colors"
                            >
                              {brand}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Featured products */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
                        Polecane produkty
                      </p>

                      {loadingSuggestions ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="animate-pulse">
                              <div className="aspect-square bg-muted rounded-xl mb-3" />
                              <div className="h-4 bg-muted rounded w-full mb-2" />
                              <div className="h-4 bg-muted rounded w-2/3" />
                            </div>
                          ))}
                        </div>
                      ) : suggestions?.products && suggestions.products.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {suggestions.products.slice(0, 4).map((product) => (
                            <Link
                              key={product.id}
                              href={`/products/${product.id}`}
                              onClick={onClose}
                              className="group"
                            >
                              <div className="aspect-square bg-white border rounded-xl overflow-hidden mb-3 group-hover:border-foreground/20 transition-colors">
                                {product.imageUrl ? (
                                  <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-muted flex items-center justify-center">
                                    <Package className="size-8 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <p className="text-sm font-medium line-clamp-2 leading-snug mb-1 group-hover:text-primary transition-colors">
                                {product.name}
                              </p>
                              <p className="font-semibold text-primary">
                                {formatPrice(product.price)}
                              </p>
                            </Link>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer - keyboard hints */}
              <div className="hidden md:flex items-center justify-between px-5 py-3 border-t bg-muted/30 text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 rounded bg-background border font-mono text-[10px]">↑↓</kbd>
                    <span>nawiguj</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <kbd className="px-1.5 py-0.5 rounded bg-background border font-mono text-[10px]">↵</kbd>
                    <span>wybierz</span>
                  </span>
                </div>
                <span className="flex items-center gap-1.5">
                  <Command className="size-3" />
                  <span>K aby otworzyć</span>
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

// Global cache for suggestions
let suggestionsCache: Suggestions | null = null;
let suggestionsFetchPromise: Promise<Suggestions> | null = null;

export function preloadSearchSuggestions() {
  if (suggestionsCache) return Promise.resolve(suggestionsCache);
  if (suggestionsFetchPromise) return suggestionsFetchPromise;

  suggestionsFetchPromise = fetch("/api/search/suggestions")
    .then((res) => res.json())
    .then((data) => {
      suggestionsCache = data;
      return data;
    })
    .catch((err) => {
      console.error("Error preloading suggestions:", err);
      suggestionsFetchPromise = null;
      return null;
    });

  return suggestionsFetchPromise;
}

export function getCachedSuggestions() {
  return suggestionsCache;
}

// Hook for global CMD+K shortcut
export function useSearchModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Preload suggestions on mount
  useEffect(() => {
    preloadSearchSuggestions();
  }, []);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
    preload: preloadSearchSuggestions,
  };
}
