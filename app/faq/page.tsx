import { Metadata } from "next";
import { HelpCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "FAQ - Najczęściej zadawane pytania | HomeScreen",
  description: "Odpowiedzi na najczęściej zadawane pytania dotyczące zakupów w HomeScreen.",
};

const faqData = [
  {
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
        a: "Produkty oznaczone jako 'Na zamówienie' można zamawiać - czas oczekiwania wynosi zazwyczaj 3-7 dni roboczych. Skontaktuj się z nami, aby potwierdzić dostępność.",
      },
    ],
  },
  {
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
    category: "Płatności",
    questions: [
      {
        q: "Jakie metody płatności akceptujecie?",
        a: "Akceptujemy: karty płatnicze (Visa, Mastercard), BLIK, szybkie przelewy online, płatność przy odbiorze (pobranie +5 zł).",
      },
      {
        q: "Czy płatności są bezpieczne?",
        a: "Tak, wszystkie płatności są szyfrowane (SSL) i obsługiwane przez certyfikowanego operatora płatności. Nie przechowujemy danych Twojej karty.",
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
    category: "Zwroty i reklamacje",
    questions: [
      {
        q: "Czy mogę zwrócić produkt?",
        a: "Tak, masz 14 dni na zwrot produktu bez podania przyczyny. Produkt musi być nieużywany i w oryginalnym opakowaniu.",
      },
      {
        q: "Jak zwrócić produkt?",
        a: "Skontaktuj się z nami mailowo (info@homescreen.pl), zapakuj produkt i wyślij na nasz adres. Zwrot pieniędzy nastąpi w ciągu 14 dni od otrzymania przesyłki.",
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
    category: "Konto i bezpieczeństwo",
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
    <div className="container py-8 md:py-12">
      <div>
        <div className="flex items-center gap-3 mb-8">
          <HelpCircle className="h-8 w-8 text-primary" />
          <h1 className="text-3xl md:text-4xl font-bold">FAQ</h1>
        </div>

        <p className="text-lg text-muted-foreground mb-8">
          Najczęściej zadawane pytania i odpowiedzi. Nie znalazłeś odpowiedzi?{" "}
          <a href="/kontakt" className="text-primary hover:underline">
            Skontaktuj się z nami
          </a>
          .
        </p>

        <div className="space-y-10">
          {faqData.map((section) => (
            <section key={section.category}>
              <h2 className="text-xl font-semibold mb-4 pb-2 border-b">
                {section.category}
              </h2>
              <div className="space-y-4">
                {section.questions.map((item, index) => (
                  <details
                    key={index}
                    className="group border rounded-xl overflow-hidden"
                  >
                    <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                      <span className="font-medium pr-4">{item.q}</span>
                      <span className="text-muted-foreground group-open:rotate-180 transition-transform">
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
                    <div className="px-4 pb-4 text-muted-foreground">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 p-6 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">Nie znalazłeś odpowiedzi?</h3>
          <p className="text-muted-foreground mb-4">
            Skontaktuj się z nami, chętnie pomożemy!
          </p>
          <div className="flex flex-wrap gap-4">
            <a
              href="mailto:info@homescreen.pl"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              info@homescreen.pl
            </a>
            <a
              href="tel:+48793237970"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              +48 793 237 970
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
