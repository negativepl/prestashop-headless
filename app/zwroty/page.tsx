import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Zwroty i reklamacje | HomeScreen",
  description: "Informacje o zwrotach i reklamacjach w HomeScreen. 30 dni na zwrot bez podania przyczyny.",
};

const sections = [
  { id: "zwrot", title: "Zwrot towaru" },
  { id: "reklamacje", title: "Reklamacje" },
  { id: "gwarancja", title: "Gwarancja producenta" },
  { id: "formularz", title: "Formularz odstąpienia" },
];

export default function ZwrotyPage() {
  return (
    <article className="min-h-screen">
      {/* Header */}
      <header className="container pt-12 pb-8 md:pt-20 md:pb-12">
        <div className="max-w-4xl">
          <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-4">
            Obsługa klienta
          </p>
          <h1 className="font-lora text-3xl md:text-4xl lg:text-5xl font-medium leading-tight mb-6">
            Zwroty i reklamacje
          </h1>
          <p className="text-muted-foreground">
            30 dni na zwrot bez podania przyczyny.
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

              {/* Quick info */}
              <div className="mt-8 p-4 border-l-2 border-primary">
                <p className="text-sm font-medium">Czas na zwrot</p>
                <p className="text-2xl font-lora font-medium text-primary">30 dni</p>
              </div>
            </div>
          </aside>

          {/* Content */}
          <div className="max-w-3xl space-y-16">
            {/* Section 01 - Zwrot towaru */}
            <section id="zwrot" className="scroll-mt-24">
              <div className="flex items-baseline gap-4 mb-6">
                <span className="font-lora text-4xl md:text-5xl font-medium text-muted-foreground/30">
                  01
                </span>
                <h2 className="font-lora text-2xl md:text-3xl font-medium">
                  Zwrot towaru
                </h2>
              </div>

              <p className="text-muted-foreground mb-8">
                Jako konsument masz prawo odstąpić od umowy w ciągu 30 dni od otrzymania przesyłki
                bez podania przyczyny.
              </p>

              <a
                href="https://wygodnezwroty.pl/homescreen"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-5 mb-8 border-2 border-primary rounded-xl hover:bg-primary/5 transition-colors group"
              >
                <div>
                  <p className="font-medium mb-1">Wygodne Zwroty</p>
                  <p className="text-sm text-muted-foreground">
                    Najszybszy sposób na zwrot — wypełnij formularz online i wybierz wygodną metodę nadania.
                  </p>
                </div>
                <span className="text-primary group-hover:translate-x-1 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </span>
              </a>

              <h3 className="font-medium text-lg mb-4">Jak zwrócić produkt?</h3>

              <div className="space-y-4 mb-8">
                <div className="flex gap-4 p-4 border rounded-xl">
                  <span className="text-primary font-medium shrink-0">1.</span>
                  <div>
                    <p className="font-medium mb-1">Poinformuj nas o zwrocie</p>
                    <p className="text-sm text-muted-foreground">
                      Wyślij e-mail na adres info@homescreen.pl z informacją o chęci zwrotu i numerem zamówienia.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 border rounded-xl">
                  <span className="text-primary font-medium shrink-0">2.</span>
                  <div>
                    <p className="font-medium mb-1">Przygotuj paczkę</p>
                    <p className="text-sm text-muted-foreground">
                      Zapakuj produkt w oryginalne opakowanie (jeśli to możliwe). Produkt powinien być nieużywany i kompletny.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 border rounded-xl">
                  <span className="text-primary font-medium shrink-0">3.</span>
                  <div>
                    <p className="font-medium mb-1">Wyślij przesyłkę</p>
                    <p className="text-sm text-muted-foreground">
                      Home Screen Magdalena Cylke<br />
                      ul. Szeroka 20, 75-814 Koszalin
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 border rounded-xl">
                  <span className="text-primary font-medium shrink-0">4.</span>
                  <div>
                    <p className="font-medium mb-1">Otrzymaj zwrot pieniędzy</p>
                    <p className="text-sm text-muted-foreground">
                      Po otrzymaniu i sprawdzeniu produktu zwrócimy pieniądze w ciągu 14 dni na konto, z którego dokonano płatności.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-muted/50 rounded-xl">
                <p className="font-medium mb-3">Ważne informacje</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>Koszt przesyłki zwrotnej pokrywa kupujący</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>Zwracamy cenę produktu + koszt pierwotnej dostawy (najtańszą metodę)</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>Produkt musi być w stanie nienaruszonym</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Section 02 - Reklamacje */}
            <section id="reklamacje" className="scroll-mt-24">
              <div className="flex items-baseline gap-4 mb-6">
                <span className="font-lora text-4xl md:text-5xl font-medium text-muted-foreground/30">
                  02
                </span>
                <h2 className="font-lora text-2xl md:text-3xl font-medium">
                  Reklamacje
                </h2>
              </div>

              <p className="text-muted-foreground mb-8">
                Jeśli otrzymany produkt jest wadliwy lub niezgodny z opisem, masz prawo złożyć reklamację.
              </p>

              <h3 className="font-medium text-lg mb-4">Jak złożyć reklamację?</h3>

              <div className="space-y-4 mb-8">
                <div className="flex gap-4 p-4 border rounded-xl">
                  <span className="text-primary font-medium shrink-0">1.</span>
                  <div>
                    <p className="font-medium mb-1">Skontaktuj się z nami</p>
                    <p className="text-sm text-muted-foreground">
                      Wyślij e-mail na info@homescreen.pl opisując problem. Załącz zdjęcia wady (jeśli to możliwe).
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 border rounded-xl">
                  <span className="text-primary font-medium shrink-0">2.</span>
                  <div>
                    <p className="font-medium mb-1">Poczekaj na odpowiedź</p>
                    <p className="text-sm text-muted-foreground">
                      Rozpatrzymy reklamację w ciągu 14 dni. Poinformujemy Cię o dalszych krokach.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 border rounded-xl">
                  <span className="text-primary font-medium shrink-0">3.</span>
                  <div>
                    <p className="font-medium mb-1">Wyślij produkt</p>
                    <p className="text-sm text-muted-foreground">
                      Jeśli będzie to wymagane, wyślij produkt na nasz adres. Koszt przesyłki pokrywamy my.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 border rounded-xl">
                  <span className="text-primary font-medium shrink-0">4.</span>
                  <div>
                    <p className="font-medium mb-1">Otrzymaj rozwiązanie</p>
                    <p className="text-sm text-muted-foreground">
                      Naprawa, wymiana, obniżenie ceny lub zwrot pieniędzy.
                    </p>
                  </div>
                </div>
              </div>

              <h3 className="font-medium text-lg mb-4">Co powinna zawierać reklamacja?</h3>

              <ul className="space-y-2 text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Numer zamówienia</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Nazwa reklamowanego produktu</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Opis wady/problemu</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Żądanie (naprawa, wymiana, zwrot pieniędzy)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Dane kontaktowe</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>Zdjęcia wady (opcjonalnie, ale przyspiesza proces)</span>
                </li>
              </ul>
            </section>

            {/* Section 03 - Gwarancja */}
            <section id="gwarancja" className="scroll-mt-24">
              <div className="flex items-baseline gap-4 mb-6">
                <span className="font-lora text-4xl md:text-5xl font-medium text-muted-foreground/30">
                  03
                </span>
                <h2 className="font-lora text-2xl md:text-3xl font-medium">
                  Gwarancja producenta
                </h2>
              </div>

              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  Wiele produktów w naszym sklepie objętych jest gwarancją producenta.
                  Informacja o gwarancji znajduje się na karcie produktu.
                </p>
                <p>
                  Niezależnie od gwarancji producenta, przysługuje Ci prawo do reklamacji
                  z tytułu rękojmi (odpowiedzialność sprzedawcy) przez okres 2 lat od daty zakupu.
                </p>
              </div>

              {/* Summary cards */}
              <div className="grid sm:grid-cols-2 gap-4 mt-8">
                <div className="p-4 border rounded-xl">
                  <p className="text-sm text-muted-foreground mb-1">Zwrot towaru</p>
                  <p className="font-medium">30 dni na odstąpienie</p>
                </div>
                <div className="p-4 border rounded-xl">
                  <p className="text-sm text-muted-foreground mb-1">Reklamacja</p>
                  <p className="font-medium">14 dni na rozpatrzenie</p>
                </div>
                <div className="p-4 border rounded-xl">
                  <p className="text-sm text-muted-foreground mb-1">Rękojmia</p>
                  <p className="font-medium">2 lata od daty zakupu</p>
                </div>
                <div className="p-4 border rounded-xl">
                  <p className="text-sm text-muted-foreground mb-1">Zwrot pieniędzy</p>
                  <p className="font-medium">Do 14 dni od otrzymania zwrotu</p>
                </div>
              </div>
            </section>

            {/* Section 04 - Formularz */}
            <section id="formularz" className="scroll-mt-24">
              <div className="flex items-baseline gap-4 mb-6">
                <span className="font-lora text-4xl md:text-5xl font-medium text-muted-foreground/30">
                  04
                </span>
                <h2 className="font-lora text-2xl md:text-3xl font-medium">
                  Formularz odstąpienia
                </h2>
              </div>

              <p className="text-muted-foreground mb-6">
                Możesz skorzystać z poniższego wzoru oświadczenia lub napisać własne:
              </p>

              <a
                href="/formularz-odstapienia.pdf"
                download="formularz-odstapienia.pdf"
                className="inline-flex items-center gap-2 px-4 py-2 mb-6 border rounded-lg text-sm font-medium hover:bg-muted/50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Pobierz formularz (PDF)
              </a>

              <div className="p-6 bg-muted/50 rounded-xl text-sm text-muted-foreground space-y-3">
                <p>
                  Ja, [imię i nazwisko], niniejszym informuję o moim odstąpieniu od umowy sprzedaży
                  następujących produktów: [nazwa produktu].
                </p>
                <p>Numer zamówienia: [numer]</p>
                <p>Data zamówienia: [data] / Data odbioru: [data]</p>
                <p>Imię i nazwisko: [dane]</p>
                <p>Adres: [adres]</p>
                <p>Data i podpis (jeśli przesyłane w formie papierowej)</p>
              </div>

              <div className="mt-8 p-6 border rounded-xl">
                <p className="font-medium mb-2">Potrzebujesz pomocy?</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Skontaktuj się z nami — chętnie pomożemy.
                </p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <Link href="mailto:info@homescreen.pl" className="text-primary hover:underline">
                    info@homescreen.pl
                  </Link>
                  <Link href="tel:+48793237970" className="text-primary hover:underline">
                    +48 793 237 970
                  </Link>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </article>
  );
}
