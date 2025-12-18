"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Menu, Search, User, ChevronDown, Phone, Star, Minus, Plus, Trash2, ShoppingBag, ArrowRight, Heart, LogIn, Package, LogOut, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCart } from "@/hooks/use-cart";
import { useFavorites } from "@/hooks/use-favorites";
import { useUser } from "@/hooks/use-user";
import { logoutUser } from "@/app/actions/auth";

const searchPhrases = [
  "etui do iPhone 16 Pro Max",
  "szkło ochronne do Galaxy S25 Ultra",
  "uchwyt samochodowy",
  "ładowarka indukcyjna",
  "kabel USB-C",
  "powerbank 20000mAh",
  "słuchawki bezprzewodowe",
  "folia ochronna",
];

interface Category {
  id: number;
  name: string;
}

interface SearchProduct {
  id: number;
  name: string;
  price: number;
  imageUrl: string | null;
}

interface HeaderProps {
  categories?: Category[];
}

export function Header({ categories = [] }: HeaderProps) {
  const { items, itemCount, total, updateQuantity, removeItem, clearCart } = useCart();
  const { itemCount: favoritesCount } = useFavorites();
  const { user, isLoggedIn, refetch: refetchUser } = useUser();
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [categoriesMenuOpen, setCategoriesMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const [favoritesAnimating, setFavoritesAnimating] = useState(false);
  const prevFavoritesCount = useRef(favoritesCount);
  const [cartAnimating, setCartAnimating] = useState(false);
  const prevCartCount = useRef(itemCount);

  const handleLogout = async () => {
    await logoutUser();
    refetchUser();
    window.location.href = "/";
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowResults(false);
      window.location.href = `/products?search=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const fetchSearchResults = useCallback(async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=6`);
      const data = await response.json();
      setSearchResults(data.products || []);
      setShowResults(true);
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
      setShowResults(false);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchQuery, fetchSearchResults]);

  // Click outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Animate favorites icon when count increases
  useEffect(() => {
    if (mounted && favoritesCount > prevFavoritesCount.current) {
      setFavoritesAnimating(true);
      setTimeout(() => setFavoritesAnimating(false), 600);
    }
    prevFavoritesCount.current = favoritesCount;
  }, [favoritesCount, mounted]);

  // Animate cart icon when count increases
  useEffect(() => {
    if (mounted && itemCount > prevCartCount.current) {
      setCartAnimating(true);
      setTimeout(() => setCartAnimating(false), 600);
    }
    prevCartCount.current = itemCount;
  }, [itemCount, mounted]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      // Hysteresis: show hamburger at 120px, hide at 60px
      if (currentScroll > 120 && !scrolled) {
        setScrolled(true);
      } else if (currentScroll < 60 && scrolled) {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % searchPhrases.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(price);
  };

  return (
    <header className={`sticky top-0 z-50 w-full shadow-sm transition-all duration-300 ${
      scrolled ? "bg-white/80 dark:bg-black/80 backdrop-blur-md border-b" : "bg-white dark:bg-black"
    }`}>
      {/* Top bar */}
      <div className={`bg-white text-black dark:bg-black dark:text-white overflow-hidden transition-all duration-300 ${
        scrolled ? "max-h-0 opacity-0" : "max-h-12 opacity-100"
      }`}>
        <div className="container py-1.5 md:py-2 flex justify-center md:justify-between items-center text-xs relative">
          <div className="hidden md:flex items-center gap-4">
            <span className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> +48 793 237 970</span>
            <span className="flex items-center gap-1.5"><Truck className="h-3 w-3" /> Darmowa dostawa od 100 PLN</span>
            <span className="flex items-center gap-1.5"><Star className="h-3 w-3" /> Na rynku od ponad 10 lat</span>
          </div>
          <p className="md:hidden">Darmowa dostawa od 100 PLN</p>
          <div className="hidden md:flex items-center gap-4">
            <a href="#" className="hover:underline">Pomoc</a>
            <a href="#" className="hover:underline">Kontakt</a>
            <a href="https://b2b.homescreen.pl" className="px-3 py-1 bg-secondary text-secondary-foreground rounded font-medium hover:bg-secondary/80 transition-colors">Hurtownia</a>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div>
        <div className="container py-2 md:py-2.5">
          <div className="flex items-center justify-between gap-4 md:gap-8">
            {/* Left - Hamburger (when scrolled) + Logo */}
            <div className="flex items-center gap-2">
              {/* Categories hamburger - appears on scroll */}
              <Sheet open={categoriesMenuOpen} onOpenChange={setCategoriesMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`hidden md:flex h-10 w-10 transition-all duration-300 ${
                      scrolled ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none w-0 -mr-2"
                    }`}
                  >
                    <Menu className="size-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Kategorie</SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col gap-1 mt-4">
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/categories/${cat.id}`}
                        onClick={() => setCategoriesMenuOpen(false)}
                        className="flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg hover:bg-muted transition-colors"
                      >
                        {cat.name}
                        <ChevronDown className="size-4 -rotate-90" />
                      </Link>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>

              <Link href="/" className="shrink-0 flex items-center gap-2">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-foreground rounded-lg flex items-center justify-center">
                  <span className="text-background font-bold text-sm md:text-lg">PS</span>
                </div>
                <span className="text-lg md:text-xl font-bold">Store</span>
              </Link>
            </div>

            {/* Center - Search (hidden on mobile) */}
            <div ref={searchRef} className="hidden md:block relative" style={{ flex: 1, maxWidth: "500px" }}>
              <form onSubmit={handleSearch} className={`relative transition-transform duration-300 ${isFocused ? "scale-105" : "scale-100"}`}>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    setIsFocused(true);
                    if (searchResults.length > 0) setShowResults(true);
                  }}
                  onBlur={() => setIsFocused(false)}
                  className="w-full h-10 pl-4 pr-12 rounded-xl border border-border focus:border-primary focus:outline-none text-sm transition-all duration-300 bg-white dark:bg-zinc-900"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <Search className="size-5 text-muted-foreground" />
                </button>
                {!isFocused && !searchQuery && (
                  <div className="absolute left-4 right-12 top-1/2 -translate-y-1/2 pointer-events-none">
                    <span className="text-muted-foreground">Szukaj </span>
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={phraseIndex}
                        initial={{ y: 20, opacity: 0, filter: "blur(8px)" }}
                        animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                        exit={{ y: -20, opacity: 0, filter: "blur(8px)" }}
                        transition={{ duration: 0.4 }}
                        className="text-muted-foreground inline-block"
                      >
                        {searchPhrases[phraseIndex]}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                )}
              </form>

              {/* Search Results Dropdown */}
              <AnimatePresence>
                {showResults && (searchResults.length > 0 || isSearching) && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 rounded-xl border shadow-lg overflow-hidden z-50"
                  >
                    {isSearching ? (
                      <div className="p-4 text-center text-muted-foreground">
                        <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent mr-2" />
                        Szukam...
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="max-h-[400px] overflow-y-auto">
                        {searchResults.map((product) => (
                          <Link
                            key={product.id}
                            href={`/products/${product.id}`}
                            onClick={() => setShowResults(false)}
                            className="flex items-center gap-3 p-3 hover:bg-muted transition-colors"
                          >
                            <div className="w-12 h-12 bg-muted rounded-lg overflow-hidden flex-shrink-0">
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
                              <p className="text-sm font-medium truncate">{product.name}</p>
                              <p className="text-sm text-primary font-semibold">
                                {new Intl.NumberFormat("pl-PL", {
                                  style: "currency",
                                  currency: "PLN",
                                }).format(product.price)}
                              </p>
                            </div>
                          </Link>
                        ))}
                        <Link
                          href={`/products?search=${encodeURIComponent(searchQuery)}`}
                          onClick={() => setShowResults(false)}
                          className="flex items-center justify-center gap-2 p-3 bg-muted/50 hover:bg-muted transition-colors text-sm font-medium"
                        >
                          Zobacz wszystkie wyniki
                          <ArrowRight className="size-4" />
                        </Link>
                      </div>
                    ) : (
                      <div className="p-4 text-center text-muted-foreground">
                        Brak wyników dla &quot;{searchQuery}&quot;
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Favorites - visible on mobile */}
            <Link href="/favorites" className="md:hidden">
              <Button variant="ghost" size="icon" className="h-10 w-10 relative">
                <motion.div
                  animate={favoritesAnimating ? {
                    scale: [1, 1.3, 1],
                    rotate: [0, -10, 10, 0],
                  } : {}}
                  transition={{ duration: 0.5 }}
                >
                  <Heart className="size-5" />
                </motion.div>
                {mounted && favoritesCount > 0 && (
                  <motion.span
                    className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold"
                    animate={favoritesAnimating ? { scale: [1, 1.4, 1] } : { scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {favoritesCount > 9 ? "9+" : favoritesCount}
                  </motion.span>
                )}
              </Button>
            </Link>

            {/* Right - Actions (hidden on mobile) */}
            <div className="hidden md:flex items-center gap-3 shrink-0">
              <Link href="/favorites">
                <Button variant="ghost" size="default" className="h-10 px-3 gap-2">
                  <motion.span
                    className="relative"
                    animate={favoritesAnimating ? {
                      scale: [1, 1.3, 1],
                      rotate: [0, -10, 10, 0],
                    } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    <Heart className="size-5" />
                    {mounted && favoritesCount > 0 && (
                      <motion.span
                        className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold"
                        initial={false}
                        animate={favoritesAnimating ? { scale: [1, 1.4, 1] } : { scale: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {favoritesCount > 9 ? "9+" : favoritesCount}
                      </motion.span>
                    )}
                  </motion.span>
                  <span className="text-sm">Ulubione</span>
                </Button>
              </Link>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="default" className="h-10 px-3 gap-2">
                    <motion.span
                      className="relative"
                      animate={cartAnimating ? {
                        scale: [1, 1.3, 1],
                        rotate: [0, -10, 10, 0],
                      } : {}}
                      transition={{ duration: 0.5 }}
                    >
                      <ShoppingCart className="size-5" />
                      {itemCount > 0 && (
                        <motion.span
                          className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold"
                          initial={false}
                          animate={cartAnimating ? { scale: [1, 1.4, 1] } : { scale: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          {itemCount > 9 ? "9+" : itemCount}
                        </motion.span>
                      )}
                    </motion.span>
                    <span className="text-sm font-semibold">{formatPrice(total)}</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:w-[450px] flex flex-col">
                  <SheetHeader>
                    <SheetTitle>Koszyk ({itemCount})</SheetTitle>
                  </SheetHeader>

                  {items.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 px-4">
                      <ShoppingBag className="size-16 text-muted-foreground" />
                      <p className="text-muted-foreground">Koszyk jest pusty</p>
                      <Link href="/products">
                        <Button>
                          Przeglądaj produkty
                          <ArrowRight className="ml-2 size-4" />
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1 overflow-y-auto py-4 px-4">
                        <div className="space-y-4">
                          {items.map((item) => (
                            <div key={`${item.product.id}-${item.productAttributeId}`} className="flex gap-3">
                              <div className="w-20 h-20 flex-shrink-0 bg-muted rounded-md overflow-hidden">
                                {item.product.imageUrl ? (
                                  <img
                                    src={item.product.imageUrl}
                                    alt={item.product.name}
                                    className="object-cover w-full h-full"
                                  />
                                ) : (
                                  <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                                    Brak
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <Link href={`/products/${item.product.id}`} className="font-medium text-sm hover:text-primary line-clamp-2">
                                  {item.product.name}
                                </Link>
                                <p className="text-sm text-muted-foreground">
                                  {formatPrice(item.product.price)}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.productAttributeId)}
                                  >
                                    <Minus className="size-3" />
                                  </Button>
                                  <span className="w-6 text-center text-sm">{item.quantity}</span>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.productAttributeId)}
                                  >
                                    <Plus className="size-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-destructive ml-auto"
                                    onClick={() => removeItem(item.product.id, item.productAttributeId)}
                                  >
                                    <Trash2 className="size-4" />
                                  </Button>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-sm">{formatPrice(item.product.price * item.quantity)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border-t pt-4 px-4 pb-4 space-y-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Produkty</span>
                          <span>{formatPrice(total)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Dostawa</span>
                          <span>Do ustalenia</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-semibold text-lg">
                          <span>Razem</span>
                          <span>{formatPrice(total)}</span>
                        </div>
                        <Link href="/checkout" className="block">
                          <Button className="w-full" size="lg">
                            Przejdź do kasy
                            <ArrowRight className="ml-2 size-4" />
                          </Button>
                        </Link>
                        <Button variant="outline" className="w-full" onClick={clearCart}>
                          Wyczyść koszyk
                        </Button>
                      </div>
                    </>
                  )}
                </SheetContent>
              </Sheet>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="default" className="h-10 px-3 gap-2">
                    <User className="size-5" />
                    <span className="text-sm">{isLoggedIn && user?.firstName ? user.firstName : "Cześć, zaloguj się"}</span>
                    <ChevronDown className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {isLoggedIn ? (
                    <>
                      <DropdownMenuLabel>{user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "Moje konto"}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/account" className="flex items-center gap-2 cursor-pointer">
                          <User className="size-4" />
                          Moje konto
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/favorites" className="flex items-center gap-2 cursor-pointer">
                          <Heart className="size-4" />
                          Ulubione
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 cursor-pointer text-destructive">
                        <LogOut className="size-4" />
                        Wyloguj się
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuLabel>Moje konto</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/login" className="flex items-center gap-2 cursor-pointer">
                          <LogIn className="size-4" />
                          Zaloguj się
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/register" className="flex items-center gap-2 cursor-pointer">
                          <User className="size-4" />
                          Zarejestruj się
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

            </div>
          </div>
        </div>
      </div>

      {/* Category navigation bar (hidden on mobile, hides on scroll) */}
      <div
        className={`hidden md:block bg-white dark:bg-black border-b overflow-hidden transition-all duration-300 ${
          scrolled ? "max-h-0 opacity-0" : "max-h-20 opacity-100"
        }`}
      >
        <div className="container">
          <nav className="flex items-center gap-6 py-3">
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.id}`}
                className="px-4 py-2 text-sm font-medium rounded-lg hover:bg-muted transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
