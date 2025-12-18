"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/lib/prestashop/types";

export interface CartItem {
  product: Product;
  quantity: number;
  productAttributeId: number;
}

interface CartStore {
  items: CartItem[];
  cartId: number | null;
  itemCount: number;
  total: number;
  addItem: (product: Product, quantity?: number, productAttributeId?: number) => void;
  removeItem: (productId: number, productAttributeId?: number) => void;
  updateQuantity: (productId: number, quantity: number, productAttributeId?: number) => void;
  clearCart: () => void;
  setCartId: (id: number) => void;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      cartId: null,
      itemCount: 0,
      total: 0,

      addItem: (product, quantity = 1, productAttributeId = 0) => {
        const items = get().items;
        const existingItem = items.find(
          (item) =>
            item.product.id === product.id &&
            item.productAttributeId === productAttributeId
        );

        let newItems: CartItem[];
        if (existingItem) {
          newItems = items.map((item) =>
            item.product.id === product.id &&
            item.productAttributeId === productAttributeId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          newItems = [...items, { product, quantity, productAttributeId }];
        }

        const itemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);
        const total = newItems.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );

        set({ items: newItems, itemCount, total });
      },

      removeItem: (productId, productAttributeId = 0) => {
        const items = get().items.filter(
          (item) =>
            !(
              item.product.id === productId &&
              item.productAttributeId === productAttributeId
            )
        );

        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
        const total = items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );

        set({ items, itemCount, total });
      },

      updateQuantity: (productId, quantity, productAttributeId = 0) => {
        if (quantity <= 0) {
          get().removeItem(productId, productAttributeId);
          return;
        }

        const items = get().items.map((item) =>
          item.product.id === productId &&
          item.productAttributeId === productAttributeId
            ? { ...item, quantity }
            : item
        );

        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
        const total = items.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        );

        set({ items, itemCount, total });
      },

      clearCart: () => {
        set({ items: [], itemCount: 0, total: 0, cartId: null });
      },

      setCartId: (id) => {
        set({ cartId: id });
      },
    }),
    {
      name: "cart-storage",
    }
  )
);
