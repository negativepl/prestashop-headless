"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, Search, User, ChevronDown, Phone, Star, Minus, Plus, Trash2, ShoppingBag, ArrowRight, Heart, LogIn, LogOut, Truck, X, Globe, Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { MegaMenu } from "@/components/layout/mega-menu";
import { SearchModal, useSearchModal } from "@/components/search/search-modal";
import type { Category } from "@/lib/prestashop/types";


interface HeaderProps {
  categories?: Category[];
}

export function Header({ categories = [] }: HeaderProps) {
  const { items, itemCount, total, updateQuantity, removeItem, clearCart } = useCart();
  const { itemCount: favoritesCount } = useFavorites();
  const { user, isLoggedIn, refetch: refetchUser } = useUser();
  const searchModal = useSearchModal();
  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [favoritesAnimating, setFavoritesAnimating] = useState(false);
  const prevFavoritesCount = useRef(favoritesCount);
  const [cartAnimating, setCartAnimating] = useState(false);
  const prevCartCount = useRef(itemCount);
  const [cartOpen, setCartOpen] = useState(false);

  const handleLogout = async () => {
    await logoutUser();
    refetchUser();
    window.location.href = "/";
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Detect scroll for shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
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


  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(price);
  };

  return (
    <>
      {/* Top bar - scrolls away */}
      <div className="bg-muted text-foreground">
        <div className="container py-2.5 md:py-3 flex justify-center md:justify-between items-center text-sm relative">
          <div className="hidden md:flex items-center gap-6">
            <span className="flex items-center gap-2"><Phone className="h-4 w-4" /> +48 793 237 970</span>
          </div>
          <div className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
            <span className="flex items-center gap-2"><Truck className="h-4 w-4" /> Darmowa dostawa od 100 PLN</span>
            <span className="flex items-center gap-2"><Star className="h-4 w-4" /> Na rynku od ponad 10 lat</span>
          </div>
          <p className="md:hidden text-sm">Darmowa dostawa od 100 PLN</p>
          <div className="hidden md:flex items-center gap-4">
            {/* Currency selector */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer outline-none">
                <Coins className="size-3.5" />
                <span>PLN</span>
                <ChevronDown className="size-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[100px] bg-white dark:bg-black">
                <DropdownMenuItem className="cursor-pointer">
                  <span className="font-medium">PLN</span>
                  <span className="text-muted-foreground ml-2">zł</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <span className="font-medium">EUR</span>
                  <span className="text-muted-foreground ml-2">€</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Language selector */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer outline-none">
                <Globe className="size-3.5" />
                <span>PL</span>
                <ChevronDown className="size-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[120px] bg-white dark:bg-black">
                <DropdownMenuItem className="cursor-pointer">Polski</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">English</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">Deutsch</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">Română</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">Čeština</DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">Magyar</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <a href="https://b2b.homescreen.pl" className="hover:underline transition-colors">Hurtownia</a>
          </div>
        </div>
      </div>

      {/* Main header - sticky */}
      <header className={`sticky top-0 z-50 bg-card transition-shadow duration-300 ease-in-out ${isScrolled ? "shadow-sm" : "shadow-none"}`}>
        <div className="container py-2 md:py-2.5">
          <div className="flex items-center justify-between gap-4 md:gap-8">
            {/* Left - Logo */}
            <div className="flex items-center gap-2">
              <Link href="/" className="shrink-0 flex items-center gap-2">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm md:text-lg">HS</span>
                </div>
                <span className="text-lg md:text-xl font-bold font-lora">HomeScreen</span>
              </Link>
            </div>

            {/* Center - spacer */}
            <div className="flex-1" />

            {/* Search - visible on mobile */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-10 w-10 cursor-pointer hover:bg-transparent! hover:text-primary"
              onClick={searchModal.open}
            >
              <Search className="size-5" />
            </Button>

            {/* Favorites - visible on mobile */}
            <Link href="/favorites" className="md:hidden">
              <Button variant="ghost" size="icon" className="h-10 w-10 relative cursor-pointer hover:bg-transparent! hover:text-primary">
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
              {/* Search button */}
              <Button
                variant="ghost"
                size="default"
                className="h-10 px-3 gap-2 cursor-pointer hover:bg-transparent! hover:text-primary"
                onClick={searchModal.open}
              >
                <Search className="size-5" />
                <span className="text-sm">Szukaj</span>
              </Button>

              <Link href="/favorites">
                <Button variant="ghost" size="default" className="h-10 px-3 gap-2 cursor-pointer hover:bg-transparent! hover:text-primary">
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

              <DropdownMenu open={cartOpen} onOpenChange={setCartOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="default" className="h-10 px-3 gap-2 cursor-pointer hover:bg-transparent! hover:text-primary focus-visible:ring-0 focus-visible:ring-offset-0 group">
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
                    <ChevronDown className="size-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-96 bg-white dark:bg-black p-0">
                  <div className="p-3 border-b">
                    <p className="font-semibold">Koszyk ({itemCount})</p>
                  </div>

                  {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-3 p-6">
                      <ShoppingBag className="size-12 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Koszyk jest pusty</p>
                      <Link href="/products">
                        <Button size="sm">
                          Przeglądaj produkty
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <>
                      <div className="max-h-72 overflow-y-auto p-3 space-y-3">
                        {items.slice(0, 3).map((item) => (
                          <div key={`${item.product.id}-${item.productAttributeId}`} className="flex items-center gap-3">
                            <div className="w-16 h-16 flex-shrink-0 bg-muted rounded-md overflow-hidden">
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
                              <p className="text-sm font-medium line-clamp-2">{item.product.name}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{item.quantity} x {formatPrice(item.product.price)}</p>
                            </div>
                            <button
                              onClick={() => removeItem(item.product.id, item.productAttributeId)}
                              className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            >
                              <X className="size-4" />
                            </button>
                          </div>
                        ))}
                        {items.length > 3 && (
                          <p className="text-xs text-muted-foreground text-center">
                            + {items.length - 3} więcej produktów
                          </p>
                        )}
                      </div>

                      <div className="border-t p-3 space-y-3">
                        <div className="flex justify-between font-semibold">
                          <span>Razem</span>
                          <span>{formatPrice(total)}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Link href="/cart" onClick={() => setCartOpen(false)}>
                            <Button variant="ghost" className="w-full border hover:bg-transparent! hover:text-primary" size="sm">
                              Zobacz koszyk
                            </Button>
                          </Link>
                          <Link href="/checkout" onClick={() => setCartOpen(false)}>
                            <Button className="w-full" size="sm">
                              Do kasy
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="default" className="h-10 px-3 gap-2 cursor-pointer hover:bg-transparent! hover:text-primary focus-visible:ring-0 focus-visible:ring-offset-0 group">
                    <User className="size-5" />
                    <span className="text-sm">{isLoggedIn && user?.firstName ? user.firstName : "Cześć, zaloguj się"}</span>
                    <ChevronDown className="size-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-black">
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
                    <div className="p-3">
                      <Link href="/login">
                        <Button className="w-full mb-3">
                          Zaloguj się
                        </Button>
                      </Link>

                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-xs text-muted-foreground">lub kontynuuj przez</span>
                        <div className="flex-1 h-px bg-border" />
                      </div>

                      <div className="grid grid-cols-4 gap-2 mb-4">
                        <Button variant="outline" size="icon" className="h-10 w-full" disabled>
                          <svg className="size-4" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                        </Button>
                        <Button variant="outline" size="icon" className="h-10 w-full" disabled>
                          <svg className="size-4" viewBox="0 0 24 24"><path fill="currentColor" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                        </Button>
                        <Button variant="outline" size="icon" className="h-10 w-full" disabled>
                          <svg className="size-4" viewBox="0 0 24 24"><path fill="currentColor" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                        </Button>
                        <Button variant="outline" size="icon" className="h-10 w-full" disabled>
                          <svg className="size-4" viewBox="0 0 24 24"><path fill="currentColor" d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
                        </Button>
                      </div>

                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-xs text-muted-foreground">Nie masz konta?</span>
                        <div className="flex-1 h-px bg-border" />
                      </div>

                      <Link href="/register">
                        <Button variant="outline" className="w-full">
                          Załóż konto
                        </Button>
                      </Link>
                    </div>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

            </div>
          </div>
        </div>

      </header>

      {/* Mega Menu navigation bar - scrolls away (hidden on mobile) */}
      <div className="hidden md:block bg-card relative z-40">
        {/* Fading divider line */}
        <div className="container">
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>
        <div className="container py-2">
          <MegaMenu categories={categories} />
        </div>
        {/* Bottom fading divider */}
        <div className="container">
          <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>
      </div>

      {/* Search Modal (Command Palette) */}
      <SearchModal isOpen={searchModal.isOpen} onClose={searchModal.close} />
    </>
  );
}
