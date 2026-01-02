"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Trash2, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartModal({ isOpen, onClose }: CartModalProps) {
  const [mounted, setMounted] = useState(false);
  const { items, itemCount, total, updateQuantity, removeItem, clearCart } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(price);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

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
            className="fixed inset-0 bg-black/50 z-[110]"
            onClick={onClose}
          />

          {/* Modal - full screen on mobile */}
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-[110] bg-background flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="p-1.5 -ml-1.5 rounded-lg hover:bg-muted transition-colors"
                >
                  <X className="size-5" />
                </button>
                <h2 className="text-lg font-semibold">Koszyk ({itemCount})</h2>
              </div>
              {items.length > 0 && (
                <button
                  onClick={() => clearCart()}
                  className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
                >
                  <Trash2 className="size-3" />
                  Wyczyść
                </button>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-4 p-8 h-full">
                  <ShoppingBag className="size-16 text-muted-foreground" />
                  <p className="text-muted-foreground">Koszyk jest pusty</p>
                  <Button onClick={onClose} asChild>
                    <Link href="/products">Przeglądaj produkty</Link>
                  </Button>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  {items.map((item) => (
                    <div
                      key={`${item.product.id}-${item.productAttributeId}`}
                      className="flex gap-4 p-3 bg-muted/30 rounded-xl"
                    >
                      <div className="w-20 h-20 flex-shrink-0 bg-white rounded-lg overflow-hidden border">
                        {item.product.imageUrl ? (
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="w-full h-full object-contain p-1"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                            Brak
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/products/${item.product.id}`}
                          onClick={onClose}
                          className="text-sm font-medium line-clamp-2 hover:text-primary transition-colors"
                        >
                          {item.product.name}
                        </Link>
                        <p className="text-primary font-bold mt-1">
                          {formatPrice(item.product.price * item.quantity)}
                        </p>

                        {/* Quantity controls */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1 bg-background rounded-lg border">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.productAttributeId)}
                              className="p-1.5 hover:bg-muted rounded-l-lg transition-colors"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="size-4" />
                            </button>
                            <span className="w-8 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.productAttributeId)}
                              className="p-1.5 hover:bg-muted rounded-r-lg transition-colors"
                            >
                              <Plus className="size-4" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.product.id, item.productAttributeId)}
                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t p-4 space-y-4 bg-background">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Razem</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" onClick={onClose} asChild>
                    <Link href="/cart">Zobacz koszyk</Link>
                  </Button>
                  <Button onClick={onClose} asChild>
                    <Link href="/checkout">Do kasy</Link>
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}

export function useCartModal() {
  const [isOpen, setIsOpen] = useState(false);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  };
}
