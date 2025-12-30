import Link from "next/link";

const brands = [
  {
    name: "Apple",
    slug: "apple",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
    bgColor: "bg-neutral-100 dark:bg-neutral-800",
  },
  {
    name: "Samsung",
    slug: "samsung",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg",
    bgColor: "bg-blue-50 dark:bg-blue-950",
  },
  {
    name: "Xiaomi",
    slug: "xiaomi",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/ae/Xiaomi_logo_%282021-%29.svg",
    bgColor: "bg-orange-50 dark:bg-orange-950",
  },
  {
    name: "Huawei",
    slug: "huawei",
    logo: "https://upload.wikimedia.org/wikipedia/commons/e/e8/Huawei_Logo.svg",
    bgColor: "bg-red-50 dark:bg-red-950",
  },
  {
    name: "OnePlus",
    slug: "oneplus",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/f2/OnePlus_logo.svg",
    bgColor: "bg-red-50 dark:bg-red-950",
  },
  {
    name: "Google",
    slug: "google",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg",
    bgColor: "bg-neutral-50 dark:bg-neutral-800",
  },
];

export function PhoneBrands() {
  return (
    <section className="py-8 md:py-12">
      <div className="container">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">Wybierz markę telefonu</h2>
          <p className="text-muted-foreground mt-2">
            Znajdź akcesoria dopasowane do Twojego urządzenia
          </p>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {brands.map((brand) => (
            <Link
              key={brand.slug}
              href={`/products?brand=${brand.slug}`}
              className={`${brand.bgColor} rounded-2xl p-6 flex flex-col items-center justify-center aspect-square hover:scale-105 transition-transform border hover:border-primary/50`}
            >
              <div className="h-8 md:h-10 flex items-center justify-center mb-3">
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="h-full w-auto max-w-[80px] object-contain dark:invert"
                />
              </div>
              <span className="text-sm font-medium">{brand.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
