"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, ArrowRight, CornerDownLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchProduct {
  id: number;
  name: string;
  price: number;
  imageUrl: string | null;
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

  const fetchSearchResults = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=8`);
      const data = await response.json();
      setSearchResults(data.products || []);
      setSelectedIndex(0);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
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
        fetchSearchResults(searchQuery);
      }, 300);
    } else {
      setSearchResults([]);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery, fetchSearchResults]);

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
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(price);
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
            className="fixed left-1/2 top-[15%] -translate-x-1/2 w-full max-w-2xl z-[100] px-4"
          >
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border overflow-hidden">
              {/* Search input */}
              <form onSubmit={handleSubmit}>
                <div className="flex items-center gap-3 px-4 border-b">
                  <Search className="size-5 text-muted-foreground shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Szukaj produktów..."
                    className="flex-1 h-14 bg-transparent outline-none text-lg placeholder:text-muted-foreground"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setSearchResults([]);
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
              <div className="max-h-[60vh] overflow-y-auto">
                {isSearching ? (
                  <div className="flex items-center justify-center gap-3 py-12 text-muted-foreground">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
                    <span>Szukam...</span>
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
                              "flex items-center gap-3 px-4 py-3 transition-colors",
                              selectedIndex === index + 1 ? "bg-primary/10" : "hover:bg-muted"
                            )}
                          >
                            <div className="w-10 h-10 rounded-lg bg-muted overflow-hidden shrink-0">
                              {product.imageUrl ? (
                                <img
                                  src={product.imageUrl}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                                  Brak
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{product.name}</p>
                              <p className="text-sm text-primary font-semibold">
                                {formatPrice(product.price)}
                              </p>
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
                  <div className="px-4 py-8 text-center text-muted-foreground">
                    <p>Wpisz co najmniej 2 znaki, aby wyszukać</p>
                  </div>
                )}
              </div>

              {/* Footer with keyboard hints */}
              <div className="flex items-center justify-between gap-4 px-4 py-3 border-t bg-muted/30 text-xs text-muted-foreground">
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
