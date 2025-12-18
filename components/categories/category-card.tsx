import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Category } from "@/lib/prestashop/types";

interface CategoryCardProps {
  category: Category;
}

const categoryImages: Record<string, string> = {
  "clothes": "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&q=80",
  "accessories": "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=400&q=80",
  "art": "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=400&q=80",
  "default": "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=400&q=80",
};

function getCategoryImage(name: string): string {
  const lowerName = name.toLowerCase();
  for (const [key, url] of Object.entries(categoryImages)) {
    if (lowerName.includes(key)) return url;
  }
  return categoryImages.default;
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={`/categories/${category.id}`}>
      <div className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
        <img
          src={getCategoryImage(category.name)}
          alt={category.name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end p-5">
          <h3 className="text-white font-semibold text-lg md:text-xl">
            {category.name}
          </h3>
          <div className="flex items-center gap-2 mt-2 text-white/80 text-sm opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
            <span>Zobacz produkty</span>
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}
