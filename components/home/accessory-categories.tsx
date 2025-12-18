import Link from "next/link";
import { Smartphone, Shield, Battery, Cable, Headphones, Watch, Car, Gamepad2 } from "lucide-react";

const categories = [
  {
    name: "Etui i obudowy",
    slug: "etui",
    icon: Smartphone,
    description: "Ochrona z stylem",
    image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&h=300&fit=crop",
    color: "from-purple-500/20 to-purple-600/20",
  },
  {
    name: "Szkła ochronne",
    slug: "szkla-ochronne",
    icon: Shield,
    description: "Idealna ochrona ekranu",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop",
    color: "from-blue-500/20 to-blue-600/20",
  },
  {
    name: "Ładowarki",
    slug: "ladowarki",
    icon: Battery,
    description: "Szybkie i bezpieczne",
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400&h=300&fit=crop",
    color: "from-green-500/20 to-green-600/20",
  },
  {
    name: "Kable",
    slug: "kable",
    icon: Cable,
    description: "USB-C, Lightning, MicroUSB",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop",
    color: "from-orange-500/20 to-orange-600/20",
  },
  {
    name: "Słuchawki",
    slug: "sluchawki",
    icon: Headphones,
    description: "Bezprzewodowe i przewodowe",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
    color: "from-pink-500/20 to-pink-600/20",
  },
  {
    name: "Smartwatche",
    slug: "smartwatche",
    icon: Watch,
    description: "Paski i akcesoria",
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=400&h=300&fit=crop",
    color: "from-cyan-500/20 to-cyan-600/20",
  },
  {
    name: "Do samochodu",
    slug: "akcesoria-samochodowe",
    icon: Car,
    description: "Uchwyty i ładowarki",
    image: "https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=400&h=300&fit=crop",
    color: "from-red-500/20 to-red-600/20",
  },
  {
    name: "Gaming",
    slug: "gaming",
    icon: Gamepad2,
    description: "Kontrolery i akcesoria",
    image: "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=400&h=300&fit=crop",
    color: "from-violet-500/20 to-violet-600/20",
  },
];

export function AccessoryCategories() {
  return (
    <section className="py-8 md:py-12">
      <div className="container">
        <div className="text-center mb-8">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            Kategorie
          </span>
          <h2 className="text-2xl md:text-3xl font-bold mt-2">Czego szukasz?</h2>
          <p className="text-muted-foreground mt-2">
            Przeglądaj akcesoria według kategorii
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/products?category=${category.slug}`}
              className="group relative overflow-hidden rounded-2xl border bg-card hover:border-primary/50 transition-all"
            >
              <div className="absolute inset-0">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover opacity-20 group-hover:opacity-30 group-hover:scale-110 transition-all duration-500"
                />
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color}`} />
              </div>
              <div className="relative p-6 flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-background/80 backdrop-blur rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <category.icon className="size-7 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">{category.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
