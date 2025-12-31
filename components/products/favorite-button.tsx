"use client";

import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useFavorites } from "@/hooks/use-favorites";
import type { Product } from "@/lib/prestashop/types";

interface FavoriteButtonProps {
  product: Product;
  className?: string;
}

export function FavoriteButton({ product, className = "" }: FavoriteButtonProps) {
  const { toggleItem, isFavorite } = useFavorites();
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const favorite = mounted && isFavorite(product.id);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!favorite) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);
    }

    toggleItem(product);
  };

  return (
    <button
      onClick={handleClick}
      className={`w-10 h-10 bg-white dark:bg-neutral-800 backdrop-blur-md border border-neutral-200 dark:border-neutral-700 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:scale-110 shadow-sm ${className}`}
      aria-label={favorite ? "Usuń z ulubionych" : "Dodaj do ulubionych"}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={favorite ? "filled" : "empty"}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{
            scale: isAnimating ? [1, 1.3, 1] : 1,
            opacity: 1,
          }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{
            duration: isAnimating ? 0.5 : 0.2,
            ease: "easeOut"
          }}
        >
          <Heart
            className={`h-5 w-5 transition-colors ${
              favorite ? "fill-red-500 text-red-500" : "text-neutral-600 dark:text-neutral-300"
            }`}
          />
        </motion.div>
      </AnimatePresence>

      {/* Burst particles effect */}
      <AnimatePresence>
        {isAnimating && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.span
                key={i}
                className="absolute w-1 h-1 bg-red-500 rounded-full"
                initial={{ scale: 0, x: 0, y: 0 }}
                animate={{
                  scale: [0, 1, 0],
                  x: Math.cos((i * 60 * Math.PI) / 180) * 20,
                  y: Math.sin((i * 60 * Math.PI) / 180) * 20,
                }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </button>
  );
}
