import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Polityka prywatności | HomeScreen",
  description: "Polityka prywatności sklepu HomeScreen - informacje o przetwarzaniu danych osobowych zgodnie z RODO.",
};

const sections = [
  { id: "administrator", title: "Administrator danych osobowych" },
  { id: "cele", title: "Cele i podstawy przetwarzania" },
  { id: "kategorie", title: "Kategorie przetwarzanych danych" },
  { id: "odbiorcy", title: "Odbiorcy danych" },
  { id: "prawa", title: "Twoje prawa" },
  { id: "cookies", title: "Pliki cookies" },
  { id: "bezpieczenstwo", title: "Bezpieczeństwo danych" },
  { id: "zmiany", title: "Zmiany polityki prywatności" },
];

export default function PolitykaPage() {
  return (
    <article className="min-h-screen">
      {/* Header */}
      <header className="container pt-12 pb-8 md:pt-20 md:pb-12">
        <div className="max-w-4xl">
          <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-4">
            Dokument prawny
          </p>
          <h1 className="font-lora text-3xl md:text-4xl lg:text-5xl font-medium leading-tight mb-6">
            Polityka prywatności
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
          {/* Section 01 */}
          <section id="administrator" className="scroll-mt-24">
            <div className="flex items-baseline gap-4 mb-6">
              <span className="font-lora text-4xl md:text-5xl font-medium text-muted-foreground/30">
                01
              </span>
              <h2 className="font-lora text-2xl md:text-3xl font-medium">
                Administrator danych osobowych
              </h2>
            </div>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Administratorem Twoich danych osobowych jest Home Screen Magdalena Cylke
                z siedzibą przy ul. Szerokiej 20, 75-814 Koszalin (dalej: &quot;Administrator&quot; lub &quot;my&quot;).
              </p>
              <p>
                W sprawach związanych z ochroną danych osobowych możesz skontaktować się z nami:
              </p>
              <ul className="ml-4 space-y-2">
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>e-mailem: info@homescreen.pl,</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>telefonicznie: +48 793 237 970,</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>listownie: ul. Szeroka 20, 75-814 Koszalin.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 02 */}
          <section id="cele" className="scroll-mt-24">
            <div className="flex items-baseline gap-4 mb-6">
              <span className="font-lora text-4xl md:text-5xl font-medium text-muted-foreground/30">
                02
              </span>
              <h2 className="font-lora text-2xl md:text-3xl font-medium">
                Cele i podstawy przetwarzania
              </h2>
            </div>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>Twoje dane osobowe przetwarzamy w następujących celach:</p>

              <div className="space-y-6 mt-6">
                <div className="border-l-2 border-primary/20 pl-5">
                  <h3 className="font-medium text-foreground mb-2">Realizacja zamówień</h3>
                  <p className="text-sm">Cel: wykonanie umowy sprzedaży, wysyłka produktów, obsługa płatności.</p>
                  <p className="text-sm">Podstawa prawna: art. 6 ust. 1 lit. b RODO (wykonanie umowy).</p>
                  <p className="text-sm">Okres przechowywania: przez czas trwania umowy oraz okres przedawnienia roszczeń (do 6 lat).</p>
                </div>

                <div className="border-l-2 border-primary/20 pl-5">
                  <h3 className="font-medium text-foreground mb-2">Obsługa konta użytkownika</h3>
                  <p className="text-sm">Cel: prowadzenie konta, umożliwienie dostępu do historii zamówień.</p>
                  <p className="text-sm">Podstawa prawna: art. 6 ust. 1 lit. b RODO (wykonanie umowy).</p>
                  <p className="text-sm">Okres przechowywania: do czasu usunięcia konta przez użytkownika.</p>
                </div>

                <div className="border-l-2 border-primary/20 pl-5">
                  <h3 className="font-medium text-foreground mb-2">Marketing bezpośredni (newsletter)</h3>
                  <p className="text-sm">Cel: wysyłka informacji o promocjach, nowościach i ofertach.</p>
                  <p className="text-sm">Podstawa prawna: art. 6 ust. 1 lit. a RODO (zgoda).</p>
                  <p className="text-sm">Okres przechowywania: do czasu wycofania zgody.</p>
                </div>

                <div className="border-l-2 border-primary/20 pl-5">
                  <h3 className="font-medium text-foreground mb-2">Rozpatrywanie reklamacji i zwrotów</h3>
                  <p className="text-sm">Cel: obsługa procesu reklamacji i zwrotów.</p>
                  <p className="text-sm">Podstawa prawna: art. 6 ust. 1 lit. c RODO (obowiązek prawny).</p>
                  <p className="text-sm">Okres przechowywania: zgodnie z wymogami prawa (do 6 lat).</p>
                </div>

                <div className="border-l-2 border-primary/20 pl-5">
                  <h3 className="font-medium text-foreground mb-2">Cele podatkowe i księgowe</h3>
                  <p className="text-sm">Cel: prowadzenie dokumentacji księgowej, wystawianie faktur.</p>
                  <p className="text-sm">Podstawa prawna: art. 6 ust. 1 lit. c RODO (obowiązek prawny).</p>
                  <p className="text-sm">Okres przechowywania: 5 lat od końca roku podatkowego.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 03 */}
          <section id="kategorie" className="scroll-mt-24">
            <div className="flex items-baseline gap-4 mb-6">
              <span className="font-lora text-4xl md:text-5xl font-medium text-muted-foreground/30">
                03
              </span>
              <h2 className="font-lora text-2xl md:text-3xl font-medium">
                Kategorie przetwarzanych danych
              </h2>
            </div>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>W zależności od celu przetwarzamy następujące dane:</p>
              <ul className="ml-4 space-y-2">
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>imię i nazwisko,</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>adres e-mail,</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>numer telefonu,</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>adres dostawy i adres do faktury,</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>NIP (w przypadku firm),</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>dane dotyczące zamówień i płatności,</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>dane techniczne (adres IP, pliki cookies).</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 04 */}
          <section id="odbiorcy" className="scroll-mt-24">
            <div className="flex items-baseline gap-4 mb-6">
              <span className="font-lora text-4xl md:text-5xl font-medium text-muted-foreground/30">
                04
              </span>
              <h2 className="font-lora text-2xl md:text-3xl font-medium">
                Odbiorcy danych
              </h2>
            </div>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>Twoje dane mogą być przekazywane następującym kategoriom odbiorców:</p>
              <ul className="ml-4 space-y-2">
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>firmy kurierskie i operatorzy logistyczni (InPost, DHL),</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>operatorzy płatności elektronicznych,</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>dostawcy usług hostingowych i IT,</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>dostawcy narzędzi analitycznych (Google Analytics),</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>biuro rachunkowe,</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>organy państwowe (na żądanie, zgodnie z przepisami prawa).</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 05 */}
          <section id="prawa" className="scroll-mt-24">
            <div className="flex items-baseline gap-4 mb-6">
              <span className="font-lora text-4xl md:text-5xl font-medium text-muted-foreground/30">
                05
              </span>
              <h2 className="font-lora text-2xl md:text-3xl font-medium">
                Twoje prawa
              </h2>
            </div>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>W związku z przetwarzaniem danych osobowych przysługują Ci następujące prawa:</p>

              <ul className="ml-4 space-y-2">
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span><strong className="text-foreground">Prawo dostępu</strong> — możesz uzyskać informację o przetwarzanych danych oraz otrzymać ich kopię.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span><strong className="text-foreground">Prawo do sprostowania</strong> — możesz żądać poprawienia nieprawidłowych lub uzupełnienia niekompletnych danych.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span><strong className="text-foreground">Prawo do usunięcia</strong> — w określonych przypadkach możesz żądać usunięcia swoich danych (&quot;prawo do bycia zapomnianym&quot;).</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span><strong className="text-foreground">Prawo do ograniczenia przetwarzania</strong> — możesz żądać ograniczenia przetwarzania danych w określonych sytuacjach.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span><strong className="text-foreground">Prawo do przenoszenia danych</strong> — możesz otrzymać swoje dane w ustrukturyzowanym formacie.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span><strong className="text-foreground">Prawo do sprzeciwu</strong> — możesz wnieść sprzeciw wobec przetwarzania danych w celach marketingowych.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span><strong className="text-foreground">Prawo do wycofania zgody</strong> — jeśli przetwarzanie opiera się na zgodzie, możesz ją w każdej chwili wycofać.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span><strong className="text-foreground">Prawo do skargi</strong> — możesz złożyć skargę do Prezesa Urzędu Ochrony Danych Osobowych.</span>
                </li>
              </ul>

              <p className="mt-4">
                Aby skorzystać z powyższych praw, skontaktuj się z nami na adres:{" "}
                <a href="mailto:info@homescreen.pl" className="text-primary hover:underline">
                  info@homescreen.pl
                </a>
              </p>
            </div>
          </section>

          {/* Section 06 */}
          <section id="cookies" className="scroll-mt-24">
            <div className="flex items-baseline gap-4 mb-6">
              <span className="font-lora text-4xl md:text-5xl font-medium text-muted-foreground/30">
                06
              </span>
              <h2 className="font-lora text-2xl md:text-3xl font-medium">
                Pliki cookies
              </h2>
            </div>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Nasza strona wykorzystuje pliki cookies (ciasteczka), czyli małe pliki tekstowe
                zapisywane na Twoim urządzeniu.
              </p>

              <p className="font-medium text-foreground mt-6">Rodzaje cookies:</p>

              <div className="space-y-4 mt-4">
                <div className="border-l-2 border-primary/20 pl-5">
                  <h4 className="font-medium text-foreground">Niezbędne</h4>
                  <p className="text-sm">Wymagane do działania strony (np. obsługa koszyka, logowanie).</p>
                </div>

                <div className="border-l-2 border-primary/20 pl-5">
                  <h4 className="font-medium text-foreground">Funkcjonalne</h4>
                  <p className="text-sm">Zapamiętują Twoje preferencje (np. wybór języka, tryb ciemny).</p>
                </div>

                <div className="border-l-2 border-primary/20 pl-5">
                  <h4 className="font-medium text-foreground">Analityczne</h4>
                  <p className="text-sm">Pomagają nam zrozumieć, jak użytkownicy korzystają ze strony (Google Analytics).</p>
                </div>

                <div className="border-l-2 border-primary/20 pl-5">
                  <h4 className="font-medium text-foreground">Marketingowe</h4>
                  <p className="text-sm">Służą do personalizacji reklam (za Twoją zgodą).</p>
                </div>
              </div>

              <p className="mt-4">
                Możesz zarządzać plikami cookies w ustawieniach swojej przeglądarki.
                Wyłączenie niektórych cookies może wpłynąć na funkcjonalność strony.
              </p>
            </div>
          </section>

          {/* Section 07 */}
          <section id="bezpieczenstwo" className="scroll-mt-24">
            <div className="flex items-baseline gap-4 mb-6">
              <span className="font-lora text-4xl md:text-5xl font-medium text-muted-foreground/30">
                07
              </span>
              <h2 className="font-lora text-2xl md:text-3xl font-medium">
                Bezpieczeństwo danych
              </h2>
            </div>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Stosujemy odpowiednie środki techniczne i organizacyjne, aby chronić Twoje dane
                osobowe przed nieuprawnionym dostępem, utratą lub zniszczeniem. W szczególności:
              </p>
              <ul className="ml-4 space-y-2">
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>połączenia szyfrowane protokołem SSL/TLS,</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>bezpieczne przechowywanie danych na serwerach w UE,</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>regularne kopie zapasowe,</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span>ograniczony dostęp do danych tylko dla upoważnionych osób.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 08 */}
          <section id="zmiany" className="scroll-mt-24">
            <div className="flex items-baseline gap-4 mb-6">
              <span className="font-lora text-4xl md:text-5xl font-medium text-muted-foreground/30">
                08
              </span>
              <h2 className="font-lora text-2xl md:text-3xl font-medium">
                Zmiany polityki prywatności
              </h2>
            </div>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Zastrzegamy sobie prawo do wprowadzania zmian w niniejszej Polityce prywatności.
                O istotnych zmianach poinformujemy Cię poprzez komunikat na stronie lub wiadomość e-mail.
                Aktualna wersja Polityki prywatności jest zawsze dostępna na tej stronie.
              </p>
            </div>
          </section>

          </div>
        </div>
      </div>
    </article>
  );
}
