"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Menu, Search, ShoppingCart, User, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Drawer } from "vaul";
import { useCart } from "@/hooks/use-cart";
import { SearchModal, useSearchModal } from "@/components/search/search-modal";
import { CartModal, useCartModal } from "@/components/cart/cart-modal";
import type { Category } from "@/lib/prestashop/types";

interface MobileDockProps {
  categories?: Category[];
}

export function MobileDock({ categories = [] }: MobileDockProps) {
  const pathname = usePathname();
  const { itemCount } = useCart();
  const searchModal = useSearchModal();
  const cartModal = useCartModal();
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoryStack, setCategoryStack] = useState<Category[]>([]);

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  // Calculate active index for indicator animation
  const activeIndex = useMemo(() => {
    // Modal states have priority
    if (menuOpen) return 1; // Menu
    if (searchModal.isOpen) return 2; // Search
    if (cartModal.isOpen) return 3; // Cart

    // Check pathname
    if (pathname === "/") return 0; // Home
    if (pathname.startsWith("/categories")) return 1; // Menu/Categories
    if (pathname.startsWith("/cart") || pathname.startsWith("/checkout")) return 3; // Cart
    if (pathname.startsWith("/account")) return 4; // Account

    return -1; // No active
  }, [pathname, menuOpen, searchModal.isOpen, cartModal.isOpen]);

  const currentCategories = categoryStack.length > 0
    ? categoryStack[categoryStack.length - 1].children || []
    : categories;

  const handleBack = () => {
    setCategoryStack((prev) => prev.slice(0, -1));
  };

  const handleCategoryClick = (cat: Category) => {
    if (cat.children && cat.children.length > 0) {
      setCategoryStack((prev) => [...prev, cat]);
    } else {
      setMenuOpen(false);
      setCategoryStack([]);
    }
  };

  const handleMenuClose = (open: boolean) => {
    setMenuOpen(open);
    if (!open) {
      setCategoryStack([]);
    }
  };

  return (
    <>
      {/* Vaul Drawer for Menu */}
      <Drawer.Root open={menuOpen} onOpenChange={handleMenuClose}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-[100] bg-black/50 md:hidden" />
          <Drawer.Content className="fixed left-0 right-0 bottom-[60px] z-[100] bg-background rounded-t-3xl md:hidden outline-none">
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
            </div>
            <div className="px-4 pb-6 h-[70vh] overflow-y-auto">
              {/* Header with back button */}
              <div className="flex items-center gap-3 mb-4">
                {categoryStack.length > 0 && (
                  <button
                    onClick={handleBack}
                    className="p-2 -ml-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                )}
                <Drawer.Title className="text-xl font-bold">
                  {categoryStack.length > 0
                    ? categoryStack[categoryStack.length - 1].name
                    : "Kategorie"}
                </Drawer.Title>
              </div>

              {/* Show parent category link when in subcategory */}
              {categoryStack.length > 0 && (
                <Link
                  href={`/categories/${categoryStack[categoryStack.length - 1].id}`}
                  onClick={() => {
                    setMenuOpen(false);
                    setCategoryStack([]);
                  }}
                  className="flex items-center justify-between px-4 py-3 mb-3 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/15 rounded-xl transition-colors"
                >
                  <span>Zobacz wszystkie w {categoryStack[categoryStack.length - 1].name}</span>
                  <ChevronRight className="size-4" />
                </Link>
              )}

              <nav className="flex flex-col gap-2">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={categoryStack.length}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-col gap-2"
                  >
                    {currentCategories.map((cat) => (
                      <div
                        key={cat.id}
                        className="flex items-center bg-muted hover:bg-muted/80 rounded-xl transition-colors overflow-hidden"
                      >
                        <Link
                          href={`/categories/${cat.id}`}
                          onClick={() => {
                            setMenuOpen(false);
                            setCategoryStack([]);
                          }}
                          className="flex-1 px-4 py-4 text-base font-medium"
                        >
                          {cat.name}
                        </Link>
                        {cat.children && cat.children.length > 0 && (
                          <button
                            onClick={() => handleCategoryClick(cat)}
                            className="px-4 py-4 text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10 transition-colors"
                          >
                            <ChevronRight className="size-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </nav>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* Dock */}
      <div className="fixed bottom-0 left-0 right-0 z-[101] bg-background border-t md:hidden safe-area-bottom">
        <nav className="flex items-center justify-around py-2 px-2">
          {/* Home */}
          <Link
            href="/"
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1.5 transition-colors",
              isActive("/") ? "text-primary" : "text-muted-foreground hover:text-primary"
            )}
          >
            <Home className="size-5" />
            <span className="text-[10px] font-medium">Home</span>
          </Link>

          {/* Menu */}
          <button
            onClick={() => setMenuOpen(true)}
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1.5 transition-colors",
              menuOpen ? "text-primary" : "text-muted-foreground hover:text-primary"
            )}
          >
            <Menu className="size-5" />
            <span className="text-[10px] font-medium">Menu</span>
          </button>

          {/* Search */}
          <button
            onClick={searchModal.open}
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1.5 transition-colors",
              searchModal.isOpen ? "text-primary" : "text-muted-foreground hover:text-primary"
            )}
          >
            <Search className="size-5" />
            <span className="text-[10px] font-medium">Szukaj</span>
          </button>

          {/* Cart */}
          <button
            onClick={cartModal.open}
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1.5 transition-colors relative",
              cartModal.isOpen || isActive("/cart") || isActive("/checkout") ? "text-primary" : "text-muted-foreground hover:text-primary"
            )}
          >
            <div className="relative">
              <ShoppingCart className="size-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[9px] flex items-center justify-center font-bold">
                  {itemCount > 9 ? "9+" : itemCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-medium">Koszyk</span>
          </button>

          {/* Account */}
          <Link
            href="/account"
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1.5 transition-colors",
              isActive("/account") ? "text-primary" : "text-muted-foreground hover:text-primary"
            )}
          >
            <User className="size-5" />
            <span className="text-[10px] font-medium">Konto</span>
          </Link>
        </nav>
      </div>

      {/* Search Modal (Command Palette) */}
      <SearchModal isOpen={searchModal.isOpen} onClose={searchModal.close} />

      {/* Cart Modal */}
      <CartModal isOpen={cartModal.isOpen} onClose={cartModal.close} />

      {/* Spacer to prevent content being hidden behind dock */}
      <div className="h-16 md:hidden" />
    </>
  );
}
