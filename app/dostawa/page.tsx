import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Dostawa | HomeScreen",
  description: "Informacje o dostawie w HomeScreen - metody wysyłki, koszty. Darmowa dostawa od 100 zł.",
};

const sections = [
  { id: "punkty-odbioru", title: "Punkty odbioru" },
  { id: "kurier", title: "Dostawa kurierem" },
  { id: "odbior-osobisty", title: "Odbiór osobisty" },
  { id: "czas-realizacji", title: "Czas realizacji" },
  { id: "sledzenie", title: "Śledzenie przesyłki" },
];

const pickupPoints = [
  {
    name: "Paczkomat® InPost",
    price: "11,99 zł",
    description: "24/7 w wybranym paczkomacie",
    image: "/images/carriers/inpost-paczkomat.png",
    popular: true,
  },
  {
    name: "Żabka",
    price: "9,99 zł",
    description: "Odbierz w Żabce (DHL)",
    image: "/images/carriers/zabka.png",
  },
  {
    name: "Orlen Paczka",
    price: "8,99 zł",
    description: "Na stacji Orlen",
    image: "/images/carriers/orlen-paczka.png",
  },
];

const courierOptions = [
  {
    name: "Kurier InPost",
    price: "13,99 zł",
    description: "Dostawa pod drzwi",
    image: "/images/carriers/inpost-kurier.png",
  },
  {
    name: "Kurier za pobraniem",
    price: "18,99 zł",
    description: "Płatność przy odbiorze",
    image: "/images/carriers/inpost-kurier.png",
  },
];

export default function DostawaPage() {
  return (
    <article className="min-h-screen">
      {/* Header */}
      <header className="container pt-12 pb-8 md:pt-20 md:pb-12">
        <div className="max-w-4xl">
          <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-4">
            Informacje
          </p>
          <h1 className="font-lora text-3xl md:text-4xl lg:text-5xl font-medium leading-tight mb-6">
            Dostawa i wysyłka
          </h1>
          <p className="text-muted-foreground">
            Darmowa dostawa od 100 zł dla wszystkich metod wysyłki.
          </p>
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <div className="container py-12 md:py-16">
        <div className="grid lg:grid-cols-[280px_1fr] gap-12 lg:gap-16">
          {/* Table of Contents - Sticky Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-4">
                Na tej stronie
              </p>
              <nav className="space-y-1">
                {sections.map((section, index) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="flex items-center gap-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
                  >
                    <span className="text-xs font-medium text-muted-foreground/60 group-hover:text-primary transition-colors">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>{section.title}</span>
                  </a>
                ))}
              </nav>

              {/* Free shipping highlight */}
              <div className="mt-8 p-4 border-l-2 border-primary">
                <p className="text-sm font-medium">Darmowa dostawa</p>
                <p className="text-2xl font-lora font-medium text-primary">od 100 zł</p>
              </div>
            </div>
          </aside>

          {/* Content */}
          <div className="max-w-3xl space-y-16">
            {/* Section 01 - Punkty odbioru */}
            <section id="punkty-odbioru" className="scroll-mt-24">
              <div className="flex items-baseline gap-4 mb-6">
                <span className="font-lora text-4xl md:text-5xl font-medium text-muted-foreground/30">
                  01
                </span>
                <h2 className="font-lora text-2xl md:text-3xl font-medium">
                  Punkty odbioru
                </h2>
              </div>
              <p className="text-muted-foreground mb-8">
                Odbierz przesyłkę w dogodnym dla siebie miejscu i czasie.
              </p>

              <div className="space-y-4">
                {pickupPoints.map((option) => (
                  <div
                    key={option.name}
                    className="flex items-center gap-4 p-4 border rounded-xl hover:border-primary/30 transition-colors"
                  >
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-white p-2 border shrink-0">
                      <Image
                        src={option.image}
                        alt={option.name}
                        width={56}
                        height={56}
                        className="object-contain w-full h-full"
                      />
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{option.name}</h3>
                        {option.popular && (
                          <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded">
                            Popularne
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-medium text-lg">{option.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 02 - Dostawa kurierem */}
            <section id="kurier" className="scroll-mt-24">
              <div className="flex items-baseline gap-4 mb-6">
                <span className="font-lora text-4xl md:text-5xl font-medium text-muted-foreground/30">
                  02
                </span>
                <h2 className="font-lora text-2xl md:text-3xl font-medium">
                  Dostawa kurierem
                </h2>
              </div>
              <p className="text-muted-foreground mb-8">
                Kurier dostarczy przesyłkę bezpośrednio pod wskazany adres.
              </p>

              <div className="space-y-4">
                {courierOptions.map((option) => (
                  <div
                    key={option.name}
                    className="flex items-center gap-4 p-4 border rounded-xl hover:border-primary/30 transition-colors"
                  >
                    <div className="w-14 h-14 rounded-lg overflow-hidden bg-white p-2 border shrink-0">
                      <Image
                        src={option.image}
                        alt={option.name}
                        width={56}
                        height={56}
                        className="object-contain w-full h-full"
                      />
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{option.name}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{option.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-medium text-lg">{option.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 03 - Odbiór osobisty */}
            <section id="odbior-osobisty" className="scroll-mt-24">
              <div className="flex items-baseline gap-4 mb-6">
                <span className="font-lora text-4xl md:text-5xl font-medium text-muted-foreground/30">
                  03
                </span>
                <h2 className="font-lora text-2xl md:text-3xl font-medium">
                  Odbiór osobisty
                </h2>
              </div>

              <div className="p-6 border rounded-xl">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="font-medium text-lg mb-1">Punkt odbioru w Koszalinie</p>
                    <p className="text-muted-foreground">ul. Szeroka 20, 75-814 Koszalin</p>
                  </div>
                  <span className="px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 text-sm font-medium rounded-full shrink-0">
                    Bezpłatnie
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Odbierz zamówienie osobiście w naszym punkcie. Masz do dyspozycji duży parking przed firmą oraz stojak na rowery przy wejściu.
                </p>
                <Link
                  href="https://www.google.com/maps/place/Home+Screen+-+hurtownia+akcesori%C3%B3w+GSM/@54.1845466,16.1800364,17z/data=!4m15!1m8!3m7!1s0x4701cd1be28d1377:0xf41593fb266c6431!2sSzeroka+20,+75-005+Koszalin!3b1!8m2!3d54.1845466!4d16.1826113!16s%2Fg%2F11ggz2rg5b!3m5!1s0x4701d7d0d71aea5b:0x826796aee1f99845!8m2!3d54.1845479!4d16.1825562!16s%2Fg%2F11ghzvphjv?entry=ttu&g_ep=EgoyMDI1MTIwOS4wIKXMDSoASAFQAw%3D%3D"
                  target="_blank"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <MapPin className="w-4 h-4" />
                  Zobacz na mapie
                </Link>
              </div>
            </section>

            {/* Section 04 - Czas realizacji */}
            <section id="czas-realizacji" className="scroll-mt-24">
              <div className="flex items-baseline gap-4 mb-6">
                <span className="font-lora text-4xl md:text-5xl font-medium text-muted-foreground/30">
                  04
                </span>
                <h2 className="font-lora text-2xl md:text-3xl font-medium">
                  Czas realizacji
                </h2>
              </div>

              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Czas realizacji zamówienia zależy od dostępności produktu. Przy każdym produkcie
                  znajduje się informacja o przewidywanym czasie wysyłki.
                </p>
                <p>
                  Jeśli zamawiasz kilka produktów, zamówienie zostanie wysłane zgodnie z najdłuższym
                  czasem dostawy spośród wszystkich produktów w koszyku.
                </p>
                <p>
                  Zamówienia złożone do godziny 12:00 w dni robocze są zazwyczaj wysyłane tego samego dnia
                  (dotyczy produktów z oznaczeniem &quot;Wysyłka w 24h&quot;).
                </p>
              </div>
            </section>

            {/* Section 05 - Śledzenie przesyłki */}
            <section id="sledzenie" className="scroll-mt-24">
              <div className="flex items-baseline gap-4 mb-6">
                <span className="font-lora text-4xl md:text-5xl font-medium text-muted-foreground/30">
                  05
                </span>
                <h2 className="font-lora text-2xl md:text-3xl font-medium">
                  Śledzenie przesyłki
                </h2>
              </div>

              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Po nadaniu przesyłki otrzymasz wiadomość e-mail z numerem śledzenia oraz linkiem
                  do śledzenia paczki na stronie przewoźnika.
                </p>
                <p>
                  Status przesyłki możesz również sprawdzić w panelu klienta po zalogowaniu się
                  na swoje konto.
                </p>
              </div>
            </section>

          </div>
        </div>
      </div>
    </article>
  );
}
