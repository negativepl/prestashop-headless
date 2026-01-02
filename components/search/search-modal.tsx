"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight, CornerDownLeft, Loader2, TrendingUp, Layers, Building2, Star } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([]);
  const [searchCategories, setSearchCategories] = useState<SearchCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<SearchCategory | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Handle SSR - portal needs document.body
  useEffect(() => {
    setMounted(true);
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setSearchQuery("");
      setSearchResults([]);
      setSearchCategories([]);
      setSelectedCategory(null);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Close on ESC
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
      // Only show category suggestions if no category is selected
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

  // Debounced search
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

  // Re-fetch when category is selected/deselected
  const handleCategoryClick = (category: SearchCategory) => {
    setSelectedCategory(category);
    setSearchCategories([]);
    fetchSearchResults(searchQuery, category.id);
  };

  const clearCategory = () => {
    setSelectedCategory(null);
    fetchSearchResults(searchQuery);
  };

  // Keyboard navigation
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
        // Go to search results page
        router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
        onClose();
      } else if (selectedIndex > 0 && searchResults[selectedIndex - 1]) {
        // Go to selected product
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
    // Price from API is net, add 23% VAT
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
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 md:inset-auto md:left-1/2 md:top-[15%] md:-translate-x-1/2 w-full md:max-w-2xl z-[100] md:px-4"
          >
            <div className="bg-white dark:bg-neutral-900 md:rounded-2xl shadow-2xl md:border overflow-hidden h-full md:h-auto flex flex-col">
              {/* Search input */}
              <form onSubmit={handleSubmit}>
                <div className="flex items-center gap-3 px-4 border-b">
                  {/* Close button - mobile only */}
                  <button
                    type="button"
                    onClick={onClose}
                    className="md:hidden p-1.5 -ml-1.5 rounded-lg hover:bg-muted transition-colors"
                  >
                    <X className="size-5 text-muted-foreground" />
                  </button>
                  <Search className="size-5 text-muted-foreground shrink-0 hidden md:block" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Szukaj produktów..."
                    className="flex-1 h-14 bg-transparent outline-none text-lg placeholder:text-muted-foreground"
                  />
                  {isSearching && (
                    <Loader2 className="size-4 text-primary animate-spin" />
                  )}
                  {searchQuery && !isSearching && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setSearchResults([]);
                        setSearchCategories([]);
                        setSelectedCategory(null);
                        inputRef.current?.focus();
                      }}
                      className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                    >
                      <X className="size-4 text-muted-foreground" />
                    </button>
                  )}
                </div>
              </form>

              {/* Results */}
              <div className={cn(
                "flex-1 md:flex-none md:max-h-[60vh] overflow-y-auto transition-opacity duration-150",
                isSearching && searchResults.length > 0 && "opacity-70"
              )}>
                {isSearching && searchResults.length === 0 ? (
                  <div className="p-4 space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-start gap-4 animate-pulse">
                        <div className="w-20 h-20 rounded-xl bg-muted shrink-0" />
                        <div className="flex-1 space-y-2 py-1">
                          <div className="h-3 w-24 bg-muted rounded" />
                          <div className="h-4 w-full bg-muted rounded" />
                          <div className="h-4 w-3/4 bg-muted rounded" />
                          <div className="flex gap-2 mt-1">
                            <div className="h-5 w-20 bg-muted rounded" />
                            <div className="h-5 w-16 bg-muted rounded" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : searchQuery.trim().length >= 2 ? (
                  <>
                    {/* "See all results" option */}
                    <button
                      onClick={() => {
                        router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
                        onClose();
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors",
                        selectedIndex === 0 ? "bg-primary/10" : "hover:bg-muted"
                      )}
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Search className="size-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">
                          Szukaj &quot;{searchQuery}&quot;
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Zobacz wszystkie wyniki
                        </p>
                      </div>
                      <ArrowRight className="size-4 text-muted-foreground" />
                    </button>

                    {/* Selected category badge */}
                    {selectedCategory && (
                      <div className="px-4 py-2 flex items-center gap-2 bg-primary/5 border-b">
                        <span className="text-sm text-muted-foreground">Filtr:</span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                          {selectedCategory.name}
                          <button
                            onClick={clearCategory}
                            className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                          >
                            <X className="size-3" />
                          </button>
                        </span>
                      </div>
                    )}

                    {/* Category suggestions */}
                    {searchCategories.length > 0 && !selectedCategory && (
                      <>
                        <div className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider bg-muted/30">
                          Filtruj po kategorii
                        </div>
                        <div className="px-4 py-2 flex flex-wrap gap-2">
                          {searchCategories.map((category) => (
                            <button
                              key={category.id}
                              onClick={() => handleCategoryClick(category)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-primary/10 rounded-full text-sm transition-colors"
                            >
                              <span dangerouslySetInnerHTML={{ __html: category.nameHighlighted }} />
                              <span className="text-xs text-muted-foreground">({category.productCount})</span>
                            </button>
                          ))}
                        </div>
                      </>
                    )}

                    {/* Product results */}
                    {searchResults.length > 0 && (
                      <>
                        <div className="px-4 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider bg-muted/30">
                          Produkty
                        </div>
                        {searchResults.map((product, index) => (
                          <Link
                            key={product.id}
                            href={`/products/${product.id}`}
                            onClick={onClose}
                            className={cn(
                              "flex items-start gap-4 px-4 py-3 transition-colors",
                              selectedIndex === index + 1 ? "bg-primary/10" : "hover:bg-muted"
                            )}
                          >
                            <div className="w-20 h-20 rounded-xl bg-white border overflow-hidden shrink-0 shadow-sm">
                              {product.imageUrl ? (
                                <img
                                  src={product.imageUrl}
                                  alt={product.name}
                                  className="w-full h-full object-contain p-1.5"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground bg-muted">
                                  Brak zdjęcia
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0 py-0.5">
                              {/* Category & Manufacturer */}
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                {product.manufacturerName && (
                                  <span className="font-medium text-foreground/70">{product.manufacturerName}</span>
                                )}
                                {product.manufacturerName && product.categoryName && (
                                  <span>•</span>
                                )}
                                {product.categoryName && (
                                  <span className="truncate">{product.categoryName}</span>
                                )}
                              </div>
                              {/* Name with highlighting */}
                              <p
                                className="font-medium text-sm leading-snug line-clamp-2"
                                dangerouslySetInnerHTML={{ __html: product.nameHighlighted }}
                              />
                              {/* Price & Stock */}
                              <div className="flex items-center gap-3 mt-1.5">
                                <span className="text-base text-primary font-bold">
                                  {formatPrice(product.price)}
                                </span>
                                {product.quantity > 0 ? (
                                  <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded font-medium">
                                    W magazynie
                                  </span>
                                ) : (
                                  <span className="text-xs text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded font-medium">
                                    Na zamówienie
                                  </span>
                                )}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </>
                    )}

                    {searchResults.length === 0 && !isSearching && (
                      <div className="px-4 py-8 text-center text-muted-foreground">
                        <p>Brak wyników dla &quot;{searchQuery}&quot;</p>
                        <p className="text-sm mt-1">Spróbuj innej frazy</p>
                      </div>
                    )}
                  </>
                ) : (
                  /* Empty state - popular content */
                  <div className="flex flex-col md:flex-row">
                    {/* Left column - searches, categories, brands */}
                    <div className="flex-1 p-4 space-y-4 border-b md:border-b-0 md:border-r">
                      {/* Popular searches */}
                      <div>
                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                          <TrendingUp className="size-3" />
                          Popularne wyszukiwania
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {["iPhone 16 Pro", "etui MagSafe", "ładowarka USB-C", "szkło hartowane", "AirPods"].map((query) => (
                            <button
                              key={query}
                              onClick={() => setSearchQuery(query)}
                              className="px-3 py-1.5 bg-muted hover:bg-primary/10 rounded-full text-sm transition-colors"
                            >
                              {query}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Popular categories */}
                      <div>
                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                          <Layers className="size-3" />
                          Popularne kategorie
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {["Etui do iPhone", "Ładowarki", "Kable", "Szkła ochronne", "Powerbanki"].map((cat) => (
                            <button
                              key={cat}
                              className="px-3 py-1.5 bg-muted hover:bg-primary/10 rounded-full text-sm transition-colors"
                            >
                              {cat}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Popular brands */}
                      <div>
                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                          <Building2 className="size-3" />
                          Popularne marki
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {["Spigen", "Ringke", "ESR", "Baseus", "Anker", "UGREEN"].map((brand) => (
                            <button
                              key={brand}
                              className="px-3 py-1.5 bg-muted hover:bg-primary/10 rounded-full text-sm transition-colors"
                            >
                              {brand}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right column - popular products */}
                    <div className="flex-1 p-4">
                      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                        <Star className="size-3" />
                        Popularne produkty
                      </div>

                      {/* Featured product placeholder */}
                      <div className="mb-4 p-3 rounded-xl border bg-gradient-to-br from-primary/5 to-transparent hover:border-primary/30 transition-colors cursor-pointer">
                        <div className="flex gap-3">
                          <div className="w-20 h-20 rounded-lg bg-muted shrink-0" />
                          <div className="flex-1 min-w-0">
                            <span className="text-xs text-primary font-medium">Bestseller</span>
                            <p className="font-medium text-sm line-clamp-2 mt-0.5">Placeholder - Popularny produkt</p>
                            <p className="text-primary font-bold mt-1">99,99 zł</p>
                          </div>
                        </div>
                      </div>

                      {/* Grid of popular products */}
                      <div className="grid grid-cols-2 gap-2">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 p-2 rounded-lg border hover:border-primary/30 transition-colors cursor-pointer"
                          >
                            <div className="w-10 h-10 rounded bg-muted shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs line-clamp-1">Produkt {i}</p>
                              <p className="text-xs text-primary font-medium">49,99 zł</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer with keyboard hints - hidden on mobile */}
              <div className="hidden md:flex items-center justify-between gap-4 px-4 py-3 border-t bg-muted/30 text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded border bg-white dark:bg-neutral-800 font-mono">↑</kbd>
                    <kbd className="px-1.5 py-0.5 rounded border bg-white dark:bg-neutral-800 font-mono">↓</kbd>
                    <span className="ml-1">nawigacja</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 rounded border bg-white dark:bg-neutral-800 font-mono flex items-center">
                      <CornerDownLeft className="size-3" />
                    </kbd>
                    <span className="ml-1">wybierz</span>
                  </span>
                </div>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded border bg-white dark:bg-neutral-800 font-mono">ESC</kbd>
                  <span className="ml-1">zamknij</span>
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

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  };
}
