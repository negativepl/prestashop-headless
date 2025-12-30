"use client";

import Link from "next/link";
import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronRight, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/prestashop/types";

interface MegaMenuProps {
  categories: Category[];
}

// Full-width mega menu panel content
function MegaMenuPanelContent({ category, onClose }: { category: Category; onClose: () => void }) {
  const [hoveredSubcategory, setHoveredSubcategory] = useState<Category | null>(
    category.children?.[0] || null
  );
  const [hoveredSubSubcategory, setHoveredSubSubcategory] = useState<number | null>(null);

  // Reset states when category changes
  useEffect(() => {
    setHoveredSubcategory(category.children?.[0] || null);
    setHoveredSubSubcategory(null);
  }, [category.id, category.children]);

  // Reset sub-subcategory when subcategory changes
  useEffect(() => {
    setHoveredSubSubcategory(null);
  }, [hoveredSubcategory?.id]);

  const handleSubcategoryEnter = (subcategory: Category) => {
    setHoveredSubcategory(subcategory);
  };

  const handleSubSubcategoryEnter = (subsubcategoryId: number) => {
    setHoveredSubSubcategory(subsubcategoryId);
  };

  return (
    <div className="container py-6">
      <div className="grid grid-cols-12 gap-6" style={{ height: "600px" }}>
        {/* Left column - Subcategories list */}
        <div className="col-span-3 border-r pr-6">
          <Link
            href={`/categories/${category.id}`}
            onClick={onClose}
            className="flex items-center gap-2 text-lg font-bold mb-4 hover:text-primary transition-colors"
          >
            {category.name}
            <ChevronRight className="size-5" />
          </Link>
          <nav className="space-y-0.5">
            {category.children?.map((subcategory) => (
              <Link
                key={subcategory.id}
                href={`/categories/${subcategory.id}`}
                onClick={onClose}
                onMouseEnter={() => handleSubcategoryEnter(subcategory)}
                className={cn(
                  "flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all duration-150",
                  hoveredSubcategory?.id === subcategory.id
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                )}
              >
                {subcategory.name}
                {subcategory.children && subcategory.children.length > 0 && (
                  <ChevronRight className="size-4" />
                )}
              </Link>
            ))}
          </nav>
        </div>

        {/* Middle column - Sub-subcategories grid */}
        <div className="col-span-9 px-4">
          <AnimatePresence mode="wait">
            {hoveredSubcategory && (
              <motion.div
                key={hoveredSubcategory.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
              >
                <Link
                  href={`/categories/${hoveredSubcategory.id}`}
                  onClick={onClose}
                  className="flex items-center gap-2 text-base font-semibold mb-4 hover:text-primary transition-colors"
                >
                  {hoveredSubcategory.name}
                  <ChevronRight className="size-4" />
                </Link>
                {hoveredSubcategory.children && hoveredSubcategory.children.length > 0 ? (
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                    {hoveredSubcategory.children.map((subsubcategory) => (
                      <Link
                        key={subsubcategory.id}
                        href={`/categories/${subsubcategory.id}`}
                        onClick={onClose}
                        onMouseEnter={() => handleSubSubcategoryEnter(subsubcategory.id)}
                        className={cn(
                          "text-sm py-1.5 transition-all duration-150 truncate rounded px-2 -mx-2",
                          hoveredSubSubcategory === subsubcategory.id
                            ? "text-primary font-medium bg-primary/5"
                            : "hover:text-primary hover:bg-muted/50"
                        )}
                      >
                        {subsubcategory.name}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Brak podkategorii
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// Portal-based mega menu panel with sliding content
function MegaMenuPanel({
  category,
  onClose,
  onMouseEnter,
  onMouseLeave,
  top,
  direction,
  isOpen,
}: {
  category: Category;
  onClose: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  top: number;
  direction: "left" | "right" | "none";
  isOpen: boolean;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Slide distance
  const slideDistance = 50;

  // Animation variants for the content
  const contentVariants = {
    enter: (dir: "left" | "right" | "none") => ({
      x: dir === "left" ? slideDistance : dir === "right" ? -slideDistance : 0,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: "left" | "right" | "none") => ({
      x: dir === "left" ? -slideDistance : dir === "right" ? slideDistance : 0,
      opacity: 0,
    }),
  };

  return createPortal(
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="fixed left-0 right-0 bg-card border-b shadow-xl z-30"
      style={{ top }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={category.id}
          custom={direction}
          variants={contentVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <MegaMenuPanelContent category={category} onClose={onClose} />
        </motion.div>
      </AnimatePresence>
    </motion.div>,
    document.body
  );
}

export function MegaMenu({ categories }: MegaMenuProps) {
  const [openCategory, setOpenCategory] = useState<number | null>(null);
  const [panelTop, setPanelTop] = useState(0);
  const [direction, setDirection] = useState<"left" | "right" | "none">("none");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const previousCategoryRef = useRef<number | null>(null);

  // Desired category order (case-insensitive matching)
  const categoryOrder = [
    "apple",
    "samsung",
    "xiaomi",
    "oneplus",
    "realme",
    "moto",
    "motorola",
    "google",
    "honor",
    "inne",
    "akcesoria",
    "smart home",
  ];

  // Only show categories that match the predefined order
  const visibleCategories = categories
    .filter((c) => {
      if (!c.children || c.children.length === 0) return false;
      const name = c.name.toLowerCase();
      return categoryOrder.some(orderName => name.includes(orderName));
    })
    .sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      const aIndex = categoryOrder.findIndex(name => aName.includes(name));
      const bIndex = categoryOrder.findIndex(name => bName.includes(name));
      return aIndex - bIndex;
    });

  const enterTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleEnter = useCallback((categoryId: number) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // If menu is already open, switch immediately
    if (openCategory !== null) {
      if (enterTimeoutRef.current) clearTimeout(enterTimeoutRef.current);

      // Determine slide direction based on category position
      if (openCategory !== categoryId) {
        const currentIndex = visibleCategories.findIndex(c => c.id === openCategory);
        const newIndex = visibleCategories.findIndex(c => c.id === categoryId);
        setDirection(newIndex > currentIndex ? "right" : "left");
      }

      previousCategoryRef.current = openCategory;
      setOpenCategory(categoryId);
      return;
    }

    // If menu is closed, add delay before opening
    if (enterTimeoutRef.current) clearTimeout(enterTimeoutRef.current);
    enterTimeoutRef.current = setTimeout(() => {
      setDirection("none");
      setOpenCategory(categoryId);
      setIsMenuOpen(true);

      // Calculate position for the panel
      if (navRef.current) {
        const rect = navRef.current.getBoundingClientRect();
        setPanelTop(rect.bottom);
      }
    }, 150); // 150ms delay before opening
  }, [openCategory, visibleCategories]);

  const handleLeave = useCallback(() => {
    if (enterTimeoutRef.current) clearTimeout(enterTimeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setOpenCategory(null);
      setIsMenuOpen(false);
      setDirection("none");
    }, 100);
  }, []);

  const handleClose = useCallback(() => {
    setOpenCategory(null);
    setIsMenuOpen(false);
    setDirection("none");
  }, []);

  // Close menu on scroll
  useEffect(() => {
    if (!openCategory) return;

    const handleScroll = () => {
      handleClose();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [openCategory, handleClose]);

  const activeCategory = categories.find((c) => c.id === openCategory);

  return (
    <nav ref={navRef} className="relative">
      <ul
        className="flex items-center justify-center"
        onMouseLeave={handleLeave}
      >
        {visibleCategories.map((category) => (
          <li
            key={category.id}
            onMouseEnter={() => handleEnter(category.id)}
            className="relative"
          >
            <button
              className={cn(
                "flex items-center gap-1 px-4 py-2.5 text-sm font-medium transition-colors duration-150 hover:text-primary cursor-pointer",
                openCategory === category.id && "text-primary"
              )}
            >
              {category.name}
              <ChevronDown
                className={cn(
                  "size-4 transition-transform duration-150",
                  openCategory === category.id && "rotate-180"
                )}
              />
            </button>
          </li>
        ))}
      </ul>

      {/* Mega menu panel - rendered via portal */}
      <AnimatePresence>
        {openCategory && activeCategory && (
          <MegaMenuPanel
            key="mega-menu-panel"
            category={activeCategory}
            onClose={handleClose}
            onMouseEnter={() => handleEnter(openCategory)}
            onMouseLeave={handleLeave}
            top={panelTop}
            direction={direction}
            isOpen={isMenuOpen}
          />
        )}
      </AnimatePresence>
    </nav>
  );
}
