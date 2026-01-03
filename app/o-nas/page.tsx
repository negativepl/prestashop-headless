import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "O nas | HomeScreen",
  description: "Poznaj historię HomeScreen - od stodoły w Grabowie do nowoczesnego magazynu w Koszalinie. Ponad 10 lat doświadczenia w akcesoriach GSM.",
};

const timeline = [
  {
    year: "2012",
    title: "Początki",
    description: "Stodoła we wsi Grabowo. Pierwsze zamówienia, pierwsze wysyłki i nawiązanie kontaktów z największymi światowymi markami akcesoriów GSM.",
  },
  {
    year: "2018",
    title: "Nowa siedziba",
    description: "Przełomowy moment — przeniesienie magazynu i biura do Koszalina. Profesjonalizacja procesów i dynamiczny rozwój.",
  },
  {
    year: "2022",
    title: "Wielki krok",
    description: "Przeprowadzka do nowoczesnego obiektu magazynowo-biurowego. Automatyzacja procesów i dedykowane stanowiska pakowania.",
  },
  {
    year: "2024",
    title: "Era AI",
    description: "Dynamic Commerce Platform — zestaw modułów napędzanych sztuczną inteligencją, które oszczędzają dziesiątki godzin pracy tygodniowo.",
  },
  {
    year: "2025",
    title: "Ploter do folii",
    description: "Profesjonalny ploter pozwala ciąć folie ochronne na tysiące modeli urządzeń. Idealne dopasowanie bez czekania.",
  },
  {
    year: "2026",
    title: "Projekt Kestrel",
    description: "Nowy sklep, na którym właśnie jesteś. Błyskawiczne wyszukiwanie, płynny checkout — nasz wymarzony sklep.",
  },
  {
    year: "2027",
    title: "Przyszłość",
    description: "Dzielenie się wiedzą, wdrożenia dla innych sklepów, dedykowane moduły i integracje z AI.",
    future: true,
  },
];

const values = [
  { title: "Jakość", description: "Selekcjonujemy produkty tylko od sprawdzonych, światowych marek." },
  { title: "Szybkość", description: "Większość produktów mamy na magazynie i wysyłamy od ręki." },
  { title: "Zaufanie", description: "Ponad 10 lat doświadczenia i tysiące pozytywnych opinii." },
  { title: "Rozwój", description: "Stale poszerzamy asortyment o najnowsze akcesoria." },
  { title: "Zespół", description: "Nasi eksperci służą pomocą na każdym etapie zakupów." },
  { title: "Eko", description: "Stosujemy ekologiczne opakowania i minimalizujemy plastik." },
];

export default function ONasPage() {
  return (
    <article className="min-h-screen">
      {/* Hero - Editorial Style */}
      <header className="container pt-12 pb-16 md:pt-20 md:pb-24 lg:pt-28 lg:pb-32">
        <div className="max-w-4xl">
          {/* Overline */}
          <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-6 md:mb-8">
            Nasza historia
          </p>

          {/* Main Headline - Lora serif */}
          <h1 className="font-lora text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-medium leading-[1.1] tracking-tight mb-8 md:mb-12">
            Od stodoły w&nbsp;Grabowie do&nbsp;nowoczesnego magazynu
          </h1>

          {/* Lead paragraph with drop cap effect */}
          <div className="max-w-2xl">
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed first-letter:text-5xl first-letter:font-lora first-letter:font-medium first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:text-foreground">
              Zaczynaliśmy skromnie — w stodole, z kilkoma produktami i wielką ambicją. Dziś prowadzimy nowoczesny magazyn w Koszalinie, oferujemy ponad 40 tysięcy produktów i współpracujemy z klientami w całej Europie.
            </p>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <section className="border-y border-border/60">
        <div className="container">
          <div className="grid grid-cols-3 divide-x divide-border/60">
            {[
              { value: "10+", label: "lat doświadczenia" },
              { value: "40k+", label: "produktów w ofercie" },
              { value: "80+", label: "światowych marek" },
            ].map((stat, i) => (
              <div key={i} className="py-8 md:py-12 text-center">
                <div className="font-lora text-3xl md:text-4xl lg:text-5xl font-medium text-foreground mb-1 md:mb-2">
                  {stat.value}
                </div>
                <div className="text-xs md:text-sm text-muted-foreground tracking-wide">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pull Quote */}
      <section className="container py-16 md:py-24 lg:py-32">
        <blockquote className="max-w-3xl mx-auto text-center">
          <p className="font-lora text-2xl md:text-3xl lg:text-4xl font-medium leading-snug text-foreground mb-6">
            „Każdy telefon zasługuje na&nbsp;ochronę. Każdy klient zasługuje na&nbsp;najlepszą obsługę."
          </p>
          <footer className="text-sm text-muted-foreground tracking-wide">
            — Zespół HomeScreen
          </footer>
        </blockquote>
      </section>

      {/* Timeline - Editorial Vertical */}
      <section className="bg-muted/30">
        <div className="container py-16 md:py-24 lg:py-32">
          <div className="max-w-4xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-12 md:mb-16">
              <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-4">
                Oś czasu
              </p>
              <h2 className="font-lora text-3xl md:text-4xl font-medium">
                Każdy rok to nowy rozdział
              </h2>
            </div>

            {/* Timeline Items */}
            <div className="space-y-0">
              {timeline.map((item, index) => (
                <div
                  key={item.year}
                  className={`
                    relative grid grid-cols-[auto_1fr] md:grid-cols-[1fr_auto_1fr] gap-4 md:gap-8
                    ${index !== timeline.length - 1 ? "pb-12 md:pb-16" : ""}
                    ${item.future ? "opacity-60" : ""}
                  `}
                >
                  {/* Year - Left on desktop */}
                  <div className="hidden md:block text-right">
                    <span className={`
                      font-lora text-2xl lg:text-3xl font-medium
                      ${item.future ? "text-muted-foreground" : "text-primary"}
                    `}>
                      {item.year}
                    </span>
                  </div>

                  {/* Timeline Line & Dot */}
                  <div className="relative flex flex-col items-center">
                    <div className={`
                      w-3 h-3 rounded-full shrink-0 z-10
                      ${item.future ? "border-2 border-dashed border-primary bg-transparent" : "bg-primary"}
                    `} />
                    {index !== timeline.length - 1 && (
                      <div className="w-px flex-1 bg-border mt-2" />
                    )}
                  </div>

                  {/* Content - Right on desktop */}
                  <div className="pb-2">
                    {/* Year - Mobile only */}
                    <span className={`
                      md:hidden font-lora text-lg font-medium mb-1 block
                      ${item.future ? "text-muted-foreground" : "text-primary"}
                    `}>
                      {item.year}
                    </span>
                    <h3 className="text-lg md:text-xl font-semibold mb-2 flex items-center gap-2">
                      {item.title}
                      {item.future && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                          przed nami
                        </span>
                      )}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values - Asymmetric Grid */}
      <section className="container py-16 md:py-24 lg:py-32">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <div className="mb-12 md:mb-16 lg:mb-20">
            <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-4">
              Nasze wartości
            </p>
            <h2 className="font-lora text-3xl md:text-4xl font-medium max-w-lg">
              Proste zasady, które budują zaufanie
            </h2>
          </div>

          {/* Values Grid - Asymmetric */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border/50">
            {values.map((value, index) => (
              <div
                key={index}
                className="bg-background p-6 md:p-8 lg:p-10 group hover:bg-muted/30 transition-colors duration-300"
              >
                <div className="flex items-baseline gap-3 mb-3">
                  <span className="font-lora text-4xl md:text-5xl font-medium text-primary/20 group-hover:text-primary/40 transition-colors">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{value.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - Clean Editorial */}
      <section className="border-t border-border/60">
        <div className="container py-16 md:py-24 lg:py-32">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-6">
              Dołącz do nas
            </p>
            <h2 className="font-lora text-3xl md:text-4xl lg:text-5xl font-medium leading-tight mb-6">
              Sprawdź, dlaczego zaufało nam tysiące klientów
            </h2>
            <p className="text-muted-foreground mb-10 max-w-lg mx-auto">
              Przeglądaj naszą ofertę lub skontaktuj się z nami — chętnie pomożemy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="h-12 px-8" asChild>
                <Link href="/products">
                  Zobacz produkty
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8" asChild>
                <Link href="/kontakt">
                  Kontakt
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </article>
  );
}
