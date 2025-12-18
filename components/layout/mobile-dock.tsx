"use client";

import { useState } from "react";
import Link from "next/link";
import { Home, Menu, Search, ShoppingCart, User, X, ChevronRight } from "lucide-react";
import { Drawer } from "vaul";
import { useCart } from "@/hooks/use-cart";

interface Category {
  id: number;
  name: string;
}

interface MobileDockProps {
  categories?: Category[];
}

export function MobileDock({ categories = [] }: MobileDockProps) {
  const { itemCount } = useCart();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Search overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-background md:hidden">
          <div className="flex items-center gap-3 p-4 border-b">
            <button onClick={() => setSearchOpen(false)}>
              <X className="size-6" />
            </button>
            <input
              type="search"
              placeholder="Czego szukasz?"
              autoFocus
              className="flex-1 h-10 px-4 rounded-lg bg-muted border-0 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      )}

      {/* Vaul Drawer for Menu */}
      <Drawer.Root open={menuOpen} onOpenChange={setMenuOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-30 bg-black/50 md:hidden" />
          <Drawer.Content className="fixed left-0 right-0 bottom-[60px] z-30 bg-background rounded-t-3xl md:hidden outline-none">
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
            </div>
            <div className="px-4 pb-6 max-h-[70vh] overflow-y-auto">
              <Drawer.Title className="text-xl font-bold mb-4">
                Kategorie
              </Drawer.Title>
              <nav className="flex flex-col gap-2">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/categories/${cat.id}`}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between px-4 py-4 text-base font-medium bg-muted hover:bg-muted/80 rounded-xl transition-colors"
                  >
                    <span>{cat.name}</span>
                    <ChevronRight className="size-5 text-muted-foreground" />
                  </Link>
                ))}
              </nav>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      {/* Dock */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t md:hidden safe-area-bottom">
        <nav className="flex items-center justify-around py-2 px-2">
          {/* Home */}
          <Link
            href="/"
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-muted-foreground hover:text-primary transition-colors"
          >
            <Home className="size-5" />
            <span className="text-[10px] font-medium">Home</span>
          </Link>

          {/* Menu */}
          <button
            onClick={() => setMenuOpen(true)}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-muted-foreground hover:text-primary transition-colors"
          >
            <Menu className="size-5" />
            <span className="text-[10px] font-medium">Menu</span>
          </button>

          {/* Search */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-muted-foreground hover:text-primary transition-colors"
          >
            <Search className="size-5" />
            <span className="text-[10px] font-medium">Szukaj</span>
          </button>

          {/* Cart */}
          <Link
            href="/checkout"
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-muted-foreground hover:text-primary transition-colors relative"
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
          </Link>

          {/* Account */}
          <Link
            href="/account"
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-muted-foreground hover:text-primary transition-colors"
          >
            <User className="size-5" />
            <span className="text-[10px] font-medium">Konto</span>
          </Link>
        </nav>
      </div>

      {/* Spacer to prevent content being hidden behind dock */}
      <div className="h-16 md:hidden" />
    </>
  );
}
