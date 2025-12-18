"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/lib/prestashop/types";

interface FavoritesStore {
  items: Product[];
  itemCount: number;
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  toggleItem: (product: Product) => void;
  isFavorite: (productId: number) => boolean;
  clearFavorites: () => void;
}

export const useFavorites = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      items: [],
      itemCount: 0,

      addItem: (product) => {
        const items = get().items;
        const exists = items.some((item) => item.id === product.id);

        if (!exists) {
          const newItems = [...items, product];
          set({ items: newItems, itemCount: newItems.length });
        }
      },

      removeItem: (productId) => {
        const items = get().items.filter((item) => item.id !== productId);
        set({ items, itemCount: items.length });
      },

      toggleItem: (product) => {
        const items = get().items;
        const exists = items.some((item) => item.id === product.id);

        if (exists) {
          const newItems = items.filter((item) => item.id !== product.id);
          set({ items: newItems, itemCount: newItems.length });
        } else {
          const newItems = [...items, product];
          set({ items: newItems, itemCount: newItems.length });
        }
      },

      isFavorite: (productId) => {
        return get().items.some((item) => item.id === productId);
      },

      clearFavorites: () => {
        set({ items: [], itemCount: 0 });
      },
    }),
    {
      name: "favorites-storage",
    }
  )
);
