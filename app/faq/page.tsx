import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Często zadawane pytania | HomeScreen",
  description: "Odpowiedzi na najczęściej zadawane pytania dotyczące zakupów w HomeScreen.",
};

const sections = [
  { id: "zamowienia", title: "Zamówienia" },
  { id: "dostawa", title: "Dostawa" },
  { id: "platnosci", title: "Płatności" },
  { id: "zwroty", title: "Zwroty i reklamacje" },
  { id: "produkty", title: "Produkty" },
  { id: "konto", title: "Konto" },
];

const faqData = [
  {
    id: "zamowienia",
    category: "Zamówienia",
    questions: [
      {
        q: "Jak złożyć zamówienie?",
        a: "Wybierz produkty i dodaj je do koszyka. Następnie przejdź do koszyka, wybierz metodę dostawy i płatności, podaj dane adresowe i potwierdź zamówienie. Otrzymasz e-mail z potwierdzeniem.",
      },
      {
        q: "Czy muszę zakładać konto, żeby złożyć zamówienie?",
        a: "Nie, możesz złożyć zamówienie jako gość. Jednak założenie konta pozwala śledzić zamówienia, zapisywać adresy i korzystać z historii zakupów.",
      },
      {
        q: "Jak mogę sprawdzić status mojego zamówienia?",
        a: "Po zalogowaniu się na konto przejdź do zakładki 'Moje zamówienia'. Znajdziesz tam status zamówienia i numer śledzenia przesyłki. Informacje o statusie wysyłamy również e-mailem.",
      },
      {
        q: "Czy mogę zmienić lub anulować zamówienie?",
        a: "Tak, jeśli zamówienie nie zostało jeszcze wysłane. Skontaktuj się z nami jak najszybciej telefonicznie (+48 793 237 970) lub mailowo (info@homescreen.pl).",
      },
      {
        q: "Czy mogę zamówić produkt, którego nie ma na stanie?",
        a: "Produkty niedostępne nie są obecnie do zamówienia. Jeśli chcesz uzyskać więcej informacji o dostępności, skontaktuj się z nami.",
      },
    ],
  },
  {
    id: "dostawa",
    category: "Dostawa",
    questions: [
      {
        q: "Ile kosztuje dostawa?",
        a: "Paczkomat InPost: 11,99 zł, Żabka: 9,99 zł, Orlen Paczka: 8,99 zł, Kurier InPost: 13,99 zł. Przy zamówieniach od 100 zł wszystkie metody dostawy są bezpłatne.",
      },
      {
        q: "Jak długo trwa dostawa?",
        a: "Czas realizacji zależy od dostępności produktu - sprawdź informację przy produkcie. Po wysłaniu paczki otrzymasz powiadomienie z numerem śledzenia.",
      },
      {
        q: "Czy wysyłacie za granicę?",
        a: "Tak, wysyłamy na terenie całej Unii Europejskiej. Skontaktuj się z nami, aby ustalić szczegóły i koszt wysyłki zagranicznej.",
      },
      {
        q: "Jak śledzić przesyłkę?",
        a: "Po nadaniu paczki otrzymasz e-mail z numerem śledzenia i linkiem do śledzenia na stronie przewoźnika.",
      },
    ],
  },
  {
    id: "platnosci",
    category: "Płatności",
    questions: [
      {
        q: "Jakie metody płatności akceptujecie?",
        a: "Akceptujemy: karty płatnicze (Visa, Mastercard, American Express), BLIK, Google Pay, Apple Pay, Klarna (raty 0%), InPost Pay oraz płatność przy odbiorze (+5 zł).",
      },
      {
        q: "Czy płatności są bezpieczne?",
        a: "Tak, wszystkie płatności są szyfrowane (SSL) i obsługiwane przez Stripe — jeden z największych operatorów płatności na świecie. Nie przechowujemy danych Twojej karty.",
      },
      {
        q: "Czy wystawiacie faktury VAT?",
        a: "Tak, faktura VAT jest wystawiana automatycznie po podaniu danych firmy podczas składania zamówienia.",
      },
      {
        q: "Co jeśli płatność się nie udała?",
        a: "Spróbuj ponownie lub wybierz inną metodę płatności. Jeśli problem się powtarza, skontaktuj się z nami.",
      },
    ],
  },
  {
    id: "zwroty",
    category: "Zwroty i reklamacje",
    questions: [
      {
        q: "Czy mogę zwrócić produkt?",
        a: "Tak, masz 30 dni na zwrot produktu bez podania przyczyny. Produkt musi być nieużywany i w oryginalnym opakowaniu.",
      },
      {
        q: "Jak zwrócić produkt?",
        a: "Skontaktuj się z nami mailowo (info@homescreen.pl), zapakuj produkt i wyślij na nasz adres: ul. Szeroka 20, 75-814 Koszalin. Zwrot pieniędzy nastąpi w ciągu 14 dni od otrzymania przesyłki.",
      },
      {
        q: "Kto pokrywa koszt przesyłki zwrotnej?",
        a: "Koszt przesyłki zwrotnej pokrywa kupujący, chyba że zwrot wynika z naszego błędu lub wady produktu.",
      },
      {
        q: "Jak złożyć reklamację?",
        a: "Wyślij e-mail na info@homescreen.pl z opisem problemu, numerem zamówienia i zdjęciami wady. Odpowiemy w ciągu 14 dni.",
      },
      {
        q: "Ile trwa rozpatrzenie reklamacji?",
        a: "Reklamację rozpatrujemy w ciągu 14 dni kalendarzowych od jej otrzymania.",
      },
    ],
  },
  {
    id: "produkty",
    category: "Produkty",
    questions: [
      {
        q: "Czy produkty są oryginalne?",
        a: "Tak, sprzedajemy wyłącznie oryginalne produkty marek takich jak Spigen, Ringke, Tech-Protect, ESR i innych. Wszystkie produkty objęte są gwarancją.",
      },
      {
        q: "Jak dobrać etui do mojego telefonu?",
        a: "Na stronie produktu znajdziesz listę kompatybilnych modeli. Możesz też skorzystać z wyszukiwarki i wpisać model swojego telefonu. W razie wątpliwości skontaktuj się z nami.",
      },
      {
        q: "Czy oferujecie produkty dla firm (B2B)?",
        a: "Tak, oferujemy zakupy hurtowe dla firm. Skontaktuj się z nami mailowo, aby uzyskać indywidualną ofertę.",
      },
    ],
  },
  {
    id: "konto",
    category: "Konto",
    questions: [
      {
        q: "Jak założyć konto?",
        a: "Kliknij 'Zarejestruj się' w prawym górnym rogu strony i wypełnij formularz. Możesz też założyć konto podczas składania zamówienia.",
      },
      {
        q: "Zapomniałem hasła. Co zrobić?",
        a: "Na stronie logowania kliknij 'Nie pamiętam hasła'. Podaj adres e-mail, a wyślemy link do resetowania hasła.",
      },
      {
        q: "Jak usunąć konto?",
        a: "Skontaktuj się z nami mailowo (info@homescreen.pl) z prośbą o usunięcie konta. Usuniemy Twoje dane zgodnie z RODO.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <article className="min-h-screen">
      {/* Header */}
      <header className="container pt-12 pb-8 md:pt-20 md:pb-12">
        <div className="max-w-4xl">
          <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-4">
            Pomoc
          </p>
          <h1 className="font-lora text-3xl md:text-4xl lg:text-5xl font-medium leading-tight mb-6">
            Często zadawane pytania
          </h1>
          <p className="text-muted-foreground">
            Znajdź odpowiedzi na najczęstsze pytania dotyczące zakupów.
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
                Kategorie
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

              {/* Contact hint */}
              <div className="mt-8 p-4 border-l-2 border-primary">
                <p className="text-sm font-medium">Nie znalazłeś odpowiedzi?</p>
                <Link href="/kontakt" className="text-sm text-primary hover:underline">
                  Skontaktuj się z nami
                </Link>
              </div>
            </div>
          </aside>

          {/* Content */}
          <div className="max-w-3xl space-y-16">
            {faqData.map((section, sectionIndex) => (
              <section key={section.id} id={section.id} className="scroll-mt-24">
                <div className="flex items-baseline gap-4 mb-6">
                  <span className="font-lora text-4xl md:text-5xl font-medium text-muted-foreground/30">
                    {String(sectionIndex + 1).padStart(2, "0")}
                  </span>
                  <h2 className="font-lora text-2xl md:text-3xl font-medium">
                    {section.category}
                  </h2>
                </div>

                <div className="space-y-3">
                  {section.questions.map((item, index) => (
                    <details
                      key={index}
                      className="group border rounded-xl overflow-hidden"
                    >
                      <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                        <span className="font-medium pr-4">{item.q}</span>
                        <span className="text-muted-foreground group-open:rotate-180 transition-transform shrink-0">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="m6 9 6 6 6-6" />
                          </svg>
                        </span>
                      </summary>
                      <div className="px-4 pb-4 text-sm text-muted-foreground">
                        {item.a}
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            ))}

            {/* Contact section */}
            <div className="p-6 border rounded-xl">
              <p className="font-medium mb-2">Nie znalazłeś odpowiedzi?</p>
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

          </div>
        </div>
      </div>
    </article>
  );
}
