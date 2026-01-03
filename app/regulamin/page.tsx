import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Regulamin sklepu | HomeScreen",
  description: "Regulamin sklepu internetowego HomeScreen - zasady zakupów, płatności, dostaw i zwrotów.",
};

const sections = [
  { id: "postanowienia", title: "Postanowienia ogólne" },
  { id: "definicje", title: "Definicje" },
  { id: "zamowienia", title: "Składanie zamówień" },
  { id: "platnosci", title: "Płatności" },
  { id: "dostawa", title: "Dostawa" },
  { id: "odstapienie", title: "Prawo odstąpienia" },
  { id: "reklamacje", title: "Reklamacje" },
  { id: "dane", title: "Ochrona danych" },
  { id: "postanowienia-koncowe", title: "Postanowienia końcowe" },
];

export default function RegulaminPage() {
  return (
    <article className="min-h-screen">
      {/* Header */}
      <header className="container pt-12 pb-8 md:pt-20 md:pb-12">
        <div className="max-w-4xl">
          <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-4">
            Dokument prawny
          </p>
          <h1 className="font-lora text-3xl md:text-4xl lg:text-5xl font-medium leading-tight mb-6">
            Regulamin sklepu internetowego
          </h1>
          <p className="text-muted-foreground">
            Obowiązuje od 1 stycznia 2026 r.
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
                Spis treści
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
            </div>
          </aside>

          {/* Content */}
          <div className="max-w-3xl space-y-16">
          {/* Section I */}
          <section id="postanowienia" className="scroll-mt-24">
            <div className="flex items-baseline gap-4 mb-6">
              <span className="font-lora text-4xl md:text-5xl font-medium text-muted-foreground/30">
                01
              </span>
              <h2 className="font-lora text-2xl md:text-3xl font-medium">
                Postanowienia ogólne
              </h2>
            </div>
            <ol className="space-y-4 text-muted-foreground leading-relaxed">
              <li className="flex gap-3">
                <span className="text-foreground font-medium shrink-0">1.</span>
                <span>Sklep internetowy HomeScreen, dostępny pod adresem homescreen.pl, prowadzony jest przez Home Screen Magdalena Cylke, ul. Szeroka 20, 75-814 Koszalin, NIP: 4990574327, REGON: 520836138.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-foreground font-medium shrink-0">2.</span>
                <span>Niniejszy regulamin określa zasady korzystania ze sklepu internetowego, składania zamówień, dostawy produktów, płatności, odstąpienia od umowy oraz postępowania reklamacyjnego.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-foreground font-medium shrink-0">3.</span>
                <span>Korzystanie ze sklepu internetowego oznacza akceptację niniejszego regulaminu.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-foreground font-medium shrink-0">4.</span>
                <span>Wszystkie ceny podane w sklepie są cenami brutto (zawierają podatek VAT) i wyrażone są w złotych polskich (PLN).</span>
              </li>
            </ol>
          </section>

          {/* Section II */}
          <section id="definicje" className="scroll-mt-24">
            <div className="flex items-baseline gap-4 mb-6">
              <span className="font-lora text-4xl md:text-5xl font-medium text-muted-foreground/30">
                02
              </span>
              <h2 className="font-lora text-2xl md:text-3xl font-medium">
                Definicje
              </h2>
            </div>
            <dl className="space-y-4 text-muted-foreground leading-relaxed">
              <div className="flex gap-3">
                <span className="text-foreground font-medium shrink-0">1.</span>
                <div><strong className="text-foreground">Sprzedawca</strong> — Home Screen Magdalena Cylke.</div>
              </div>
              <div className="flex gap-3">
                <span className="text-foreground font-medium shrink-0">2.</span>
                <div><strong className="text-foreground">Klient</strong> — osoba fizyczna, osoba prawna lub jednostka organizacyjna nieposiadająca osobowości prawnej, która korzysta ze sklepu.</div>
              </div>
              <div className="flex gap-3">
                <span className="text-foreground font-medium shrink-0">3.</span>
                <div><strong className="text-foreground">Konsument</strong> — Klient będący osobą fizyczną dokonującą zakupu niezwiązanego bezpośrednio z jej działalnością gospodarczą lub zawodową.</div>
              </div>
              <div className="flex gap-3">
                <span className="text-foreground font-medium shrink-0">4.</span>
                <div><strong className="text-foreground">Produkt</strong> — towar dostępny w sklepie internetowym.</div>
              </div>
              <div className="flex gap-3">
                <span className="text-foreground font-medium shrink-0">5.</span>
                <div><strong className="text-foreground">Zamówienie</strong> — oświadczenie woli Klienta zmierzające do zawarcia umowy sprzedaży.</div>
              </div>
              <div className="flex gap-3">
                <span className="text-foreground font-medium shrink-0">6.</span>
                <div><strong className="text-foreground">Koszyk</strong> — funkcjonalność sklepu umożliwiająca wybranie produktów do zamówienia.</div>
              </div>
            </dl>
          </section>

          {/* Section III */}
          <section id="zamowienia" className="scroll-mt-24">
            <div className="flex items-baseline gap-4 mb-6">
              <span className="font-lora text-4xl md:text-5xl font-medium text-muted-foreground/30">
                03
              </span>
              <h2 className="font-lora text-2xl md:text-3xl font-medium">
                Składanie zamówień
              </h2>
            </div>
            <ol className="space-y-4 text-muted-foreground leading-relaxed">
              <li className="flex gap-3">
                <span className="text-foreground font-medium shrink-0">1.</span>
                <span>Zamówienia można składać 24 godziny na dobę, 7 dni w tygodniu.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-foreground font-medium shrink-0">2.</span>
                <div>
                  <span>W celu złożenia zamówienia należy:</span>
                  <ul className="mt-3 ml-4 space-y-2">
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>wybrać produkty i dodać je do koszyka,</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>wybrać sposób dostawy i płatności,</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>podać dane niezbędne do realizacji zamówienia,</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>zaakceptować regulamin i politykę prywatności,</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>potwierdzić zamówienie przyciskiem „Zamawiam z obowiązkiem zapłaty".</span>
                    </li>
                  </ul>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-foreground font-medium shrink-0">3.</span>
                <span>Po złożeniu zamówienia Klient otrzymuje potwierdzenie na podany adres e-mail.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-foreground font-medium shrink-0">4.</span>
                <span>Umowa sprzedaży zostaje zawarta w momencie otrzymania przez Klienta potwierdzenia przyjęcia zamówienia do realizacji.</span>
              </li>
            </ol>
          </section>

          {/* Section IV */}
          <section id="platnosci" className="scroll-mt-24">
            <div className="flex items-baseline gap-4 mb-6">
              <span className="font-lora text-4xl md:text-5xl font-medium text-muted-foreground/30">
                04
              </span>
              <h2 className="font-lora text-2xl md:text-3xl font-medium">
                Płatności
              </h2>
            </div>
            <ol className="space-y-4 text-muted-foreground leading-relaxed">
              <li className="flex gap-3">
                <span className="text-foreground font-medium shrink-0">1.</span>
                <div>
                  <span>Dostępne metody płatności:</span>
                  <ul className="mt-3 ml-4 space-y-2">
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>płatność kartą (Visa, Mastercard),</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>szybki przelew online,</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>BLIK,</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>InPost Pay,</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>płatność przy odbiorze (pobranie).</span>
                    </li>
                  </ul>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-foreground font-medium shrink-0">2.</span>
                <span>Płatności elektroniczne obsługiwane są przez operatora płatności.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-foreground font-medium shrink-0">3.</span>
                <span>Zamówienia nieopłacone w ciągu 7 dni mogą zostać anulowane.</span>
              </li>
            </ol>
          </section>

          {/* Section V */}
          <section id="dostawa" className="scroll-mt-24">
            <div className="flex items-baseline gap-4 mb-6">
              <span className="font-lora text-4xl md:text-5xl font-medium text-muted-foreground/30">
                05
              </span>
              <h2 className="font-lora text-2xl md:text-3xl font-medium">
                Dostawa
              </h2>
            </div>
            <ol className="space-y-4 text-muted-foreground leading-relaxed">
              <li className="flex gap-3">
                <span className="text-foreground font-medium shrink-0">1.</span>
                <div>
                  <span>Dostępne metody dostawy:</span>
                  <ul className="mt-3 ml-4 space-y-2">
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>Paczkomat InPost,</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>Kurier InPost,</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>Kurier DHL,</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>Punkt odbioru Żabka,</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>Orlen Paczka.</span>
                    </li>
                  </ul>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-foreground font-medium shrink-0">2.</span>
                <span>Czas realizacji zamówienia wynosi zazwyczaj 1-3 dni roboczych od momentu zaksięgowania płatności.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-foreground font-medium shrink-0">3.</span>
                <span>Koszty dostawy są podawane podczas składania zamówienia i zależą od wybranej metody dostawy oraz wartości zamówienia.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-foreground font-medium shrink-0">4.</span>
                <span>Przy zamówieniach powyżej 100 zł dostawa jest bezpłatna (dla wybranych metod dostawy).</span>
              </li>
            </ol>
          </section>

          {/* Section VI */}
          <section id="odstapienie" className="scroll-mt-24">
            <div className="flex items-baseline gap-4 mb-6">
              <span className="font-lora text-4xl md:text-5xl font-medium text-muted-foreground/30">
                06
              </span>
              <h2 className="font-lora text-2xl md:text-3xl font-medium">
                Prawo odstąpienia od umowy
              </h2>
            </div>
            <ol className="space-y-4 text-muted-foreground leading-relaxed">
              <li className="flex gap-3">
                <span className="text-foreground font-medium shrink-0">1.</span>
                <span>Konsument ma prawo odstąpić od umowy w terminie 30 dni bez podania przyczyny.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-foreground font-medium shrink-0">2.</span>
                <span>Termin do odstąpienia od umowy wygasa po upływie 30 dni od dnia, w którym Konsument wszedł w posiadanie produktu.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-foreground font-medium shrink-0">3.</span>
                <span>Aby skorzystać z prawa odstąpienia od umowy, Konsument musi poinformować Sprzedawcę o swojej decyzji w drodze jednoznacznego oświadczenia (np. pismo wysłane pocztą lub e-mailem).</span>
              </li>
              <li className="flex gap-3">
                <span className="text-foreground font-medium shrink-0">4.</span>
                <span>Konsument może skorzystać z wzoru formularza odstąpienia od umowy, jednak nie jest to obowiązkowe.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-foreground font-medium shrink-0">5.</span>
                <span>W przypadku odstąpienia od umowy Sprzedawca zwraca wszystkie otrzymane płatności, w tym koszty dostawy, nie później niż 14 dni od dnia otrzymania oświadczenia o odstąpieniu.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-foreground font-medium shrink-0">6.</span>
                <span>Konsument ponosi bezpośrednie koszty zwrotu produktu.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-foreground font-medium shrink-0">7.</span>
                <span>Konsument odpowiada za zmniejszenie wartości produktu wynikające z korzystania z niego w sposób wykraczający poza konieczny do stwierdzenia jego charakteru, cech i funkcjonowania.</span>
              </li>
            </ol>
          </section>

          {/* Section VII */}
          <section id="reklamacje" className="scroll-mt-24">
            <div className="flex items-baseline gap-4 mb-6">
              <span className="font-lora text-4xl md:text-5xl font-medium text-muted-foreground/30">
                07
              </span>
              <h2 className="font-lora text-2xl md:text-3xl font-medium">
                Reklamacje
              </h2>
            </div>
            <ol className="space-y-4 text-muted-foreground leading-relaxed">
              <li className="flex gap-3">
                <span className="text-foreground font-medium shrink-0">1.</span>
                <span>Sprzedawca jest odpowiedzialny za wady produktu zgodnie z przepisami Kodeksu cywilnego o rękojmi.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-foreground font-medium shrink-0">2.</span>
                <div>
                  <span>Reklamację można złożyć:</span>
                  <ul className="mt-3 ml-4 space-y-2">
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>e-mailem na adres: info@homescreen.pl,</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>pisemnie na adres siedziby Sprzedawcy.</span>
                    </li>
                  </ul>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="text-foreground font-medium shrink-0">3.</span>
                <span>Reklamacja powinna zawierać: opis wady, żądanie Klienta oraz dane kontaktowe.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-foreground font-medium shrink-0">4.</span>
                <span>Sprzedawca rozpatrzy reklamację w terminie 14 dni od jej otrzymania.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-foreground font-medium shrink-0">5.</span>
                <span>W przypadku uznania reklamacji Sprzedawca naprawi lub wymieni produkt, obniży cenę lub zwróci pieniądze.</span>
              </li>
            </ol>
          </section>

          {/* Section VIII */}
          <section id="dane" className="scroll-mt-24">
            <div className="flex items-baseline gap-4 mb-6">
              <span className="font-lora text-4xl md:text-5xl font-medium text-muted-foreground/30">
                08
              </span>
              <h2 className="font-lora text-2xl md:text-3xl font-medium">
                Ochrona danych osobowych
              </h2>
            </div>
            <ol className="space-y-4 text-muted-foreground leading-relaxed">
              <li className="flex gap-3">
                <span className="text-foreground font-medium shrink-0">1.</span>
                <span>Administratorem danych osobowych jest Sprzedawca.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-foreground font-medium shrink-0">2.</span>
                <span>Dane osobowe przetwarzane są w celu realizacji zamówień i obsługi Klientów.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-foreground font-medium shrink-0">3.</span>
                <span>
                  Szczegółowe informacje dotyczące przetwarzania danych osobowych znajdują się w{" "}
                  <Link href="/polityka-prywatnosci" className="text-primary hover:underline">
                    Polityce prywatności
                  </Link>.
                </span>
              </li>
            </ol>
          </section>

          {/* Section IX */}
          <section id="postanowienia-koncowe" className="scroll-mt-24">
            <div className="flex items-baseline gap-4 mb-6">
              <span className="font-lora text-4xl md:text-5xl font-medium text-muted-foreground/30">
                09
              </span>
              <h2 className="font-lora text-2xl md:text-3xl font-medium">
                Postanowienia końcowe
              </h2>
            </div>
            <ol className="space-y-4 text-muted-foreground leading-relaxed">
              <li className="flex gap-3">
                <span className="text-foreground font-medium shrink-0">1.</span>
                <span>Sprzedawca zastrzega sobie prawo do zmiany regulaminu. Zmiany wchodzą w życie z dniem publikacji na stronie sklepu.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-foreground font-medium shrink-0">2.</span>
                <span>W sprawach nieuregulowanych niniejszym regulaminem mają zastosowanie przepisy prawa polskiego.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-foreground font-medium shrink-0">3.</span>
                <span>Spory wynikające z umów zawartych na podstawie niniejszego regulaminu rozstrzygane będą przez właściwe sądy powszechne.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-foreground font-medium shrink-0">4.</span>
                <span>
                  Konsument ma możliwość skorzystania z pozasądowych sposobów rozpatrywania reklamacji i dochodzenia roszczeń, w tym z platformy ODR dostępnej pod adresem:{" "}
                  <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    ec.europa.eu/consumers/odr
                  </a>
                </span>
              </li>
            </ol>
          </section>

          </div>
        </div>
      </div>
    </article>
  );
}
