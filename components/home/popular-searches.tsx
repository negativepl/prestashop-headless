"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const popularSearches = [
  "Etui na telefon iPhone",
  "Etui na telefon Apple",
  "Etui na telefon iPhone 17 Pro Max",
  "Etui na telefon iPhone 17 Pro",
  "Etui na telefon iPhone Air",
  "Etui na telefon iPhone 17",
  "Etui na telefon iPhone 16 Pro Max",
  "Etui na telefon iPhone 16 Pro",
  "Etui na telefon iPhone 16 Plus",
  "Etui na telefon iPhone 16",
  "Etui na telefon iPhone 15 Pro Max",
  "Etui na telefon iPhone 15 Pro",
  "Etui na telefon iPhone 15 Plus",
  "Etui na telefon iPhone 15",
  "Etui na telefon Samsung",
  "Etui na telefon Galaxy S25 Ultra",
  "Etui na telefon Galaxy S25+ Plus",
  "Etui na telefon Galaxy S25",
  "Etui na telefon Galaxy S25 Edge",
  "Etui na telefon Galaxy S25 FE",
  "Etui na telefon Galaxy S24 Ultra",
  "Etui na telefon Galaxy S24+ Plus",
  "Etui na telefon Galaxy S24",
  "Etui na telefon Galaxy S24 FE",
  "Etui na telefon Galaxy S23 Ultra",
  "Etui na telefon Galaxy Fold7",
  "Etui na telefon Galaxy Flip7",
  "Etui na telefon Xiaomi",
  "Etui na telefon Xiaomi 15 Ultra",
  "Etui na telefon Xiaomi 15 Pro",
  "Etui na telefon Xiaomi 15",
  "Etui na telefon Xiaomi 14 Ultra",
  "Etui na telefon Xiaomi 14 Pro",
  "Etui na telefon Xiaomi 14",
  "Etui na telefon Redmi Note 14 Pro+ Plus",
  "Etui na telefon Redmi Note 14 Pro",
  "Etui na telefon Redmi Note 14S",
  "Etui na telefon Redmi Note 14",
  "Etui na telefon POCO X6 Pro 5G",
  "Etui na telefon POCO C65",
  "Etui na telefon Motorola",
  "Etui na telefon Moto G85 5G",
  "Etui na telefon Moto G84 5G",
  "Etui na telefon Moto G73 5G",
  "Etui na telefon Moto G54",
  "Etui na telefon Moto G04s",
  "Etui na telefon Moto Edge 50 Ultra",
  "Etui na telefon Moto Edge 50 Pro",
  "Etui na telefon Moto Edge 50 Fusion",
  "Etui na telefon Moto Edge 50",
  "Etui na telefon Moto Edge 40 Neo",
  "Etui na telefon Moto Edge 30 Neo",
  "Etui na telefon Moto Edge 30 Pro",
  "Etui na telefon Google",
  "Etui na telefon Pixel 10 Pro XL",
  "Etui na telefon Pixel 10 Pro",
  "Etui na telefon Pixel 10",
  "Etui na telefon Pixel 9 Pro XL",
  "Etui na telefon Pixel 9 Pro",
  "Etui na telefon Pixel 9",
  "Etui na telefon Pixel 8 Pro",
  "Etui na telefon Pixel 8",
  "Etui na telefon Pixel 8a",
  "Etui na telefon Pixel 7 Pro",
  "Etui na telefon Pixel 7",
  "Etui na telefon Pixel 7a",
  "Etui na telefon OnePlus",
  "Etui na telefon OnePlus 13",
  "Etui na telefon OnePlus 12",
  "Etui na telefon OnePlus 12R",
  "Etui na telefon OnePlus 11 5G",
  "Etui na telefon OnePlus 10 Pro",
  "Etui na telefon OnePlus 10T",
  "Etui na telefon OnePlus 9 Pro",
  "Etui na telefon OnePlus 9",
  "Etui na telefon OnePlus 8 Pro",
  "Etui na telefon OnePlus 8T",
  "Etui na telefon OnePlus 8",
  "Etui na telefon OnePlus Nord 4",
];

export function PopularSearches() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <section className="container py-8">
      <h2 className="text-lg font-semibold mb-4">Popularne wyszukiwania</h2>

      <div className="relative">
        <motion.div
          initial={false}
          animate={{ height: isExpanded ? "auto" : "120px" }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="overflow-hidden"
        >
          <div className="flex flex-wrap gap-2">
            {popularSearches.map((search, index) => (
              <Link
                key={index}
                href={`/products?search=${encodeURIComponent(search)}`}
                className="text-sm text-muted-foreground hover:text-primary hover:underline transition-colors"
              >
                {search}
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Gradient overlay when collapsed */}
        <AnimatePresence>
          {!isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none"
            />
          )}
        </AnimatePresence>
      </div>

      {/* Show more/less button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="mt-3 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        {isExpanded ? "Pokaż mniej" : "Pokaż więcej"}
        <ChevronDown
          className={cn(
            "size-4 transition-transform duration-300",
            isExpanded && "rotate-180"
          )}
        />
      </button>
    </section>
  );
}
