import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Płatności | HomeScreen",
  description: "Metody płatności w HomeScreen - karty, BLIK, Klarna, Google Pay, Apple Pay, InPost Pay. Bezpieczne zakupy online przez Stripe.",
};

const sections = [
  { id: "metody", title: "Metody płatności" },
  { id: "bezpieczenstwo", title: "Bezpieczeństwo" },
  { id: "klarna", title: "Klarna" },
  { id: "faq", title: "FAQ" },
];

const paymentMethods = [
  {
    name: "Karty płatnicze",
    description: "Visa, Mastercard, American Express",
    details: "Płatność kartą debetową lub kredytową. Obsługujemy wszystkie główne sieci kart płatniczych.",
  },
  {
    name: "BLIK",
    description: "Kod z aplikacji bankowej",
    details: "Wygodna płatność 6-cyfrowym kodem generowanym w aplikacji Twojego banku.",
  },
  {
    name: "Google Pay",
    description: "Płatność przez Google",
    details: "Szybka płatność zapisaną kartą w portfelu Google.",
  },
  {
    name: "Apple Pay",
    description: "Płatność przez Apple",
    details: "Błyskawiczna płatność na urządzeniach Apple z Face ID lub Touch ID.",
  },
  {
    name: "Link",
    description: "Płatność jednym kliknięciem",
    details: "Zapisz dane płatności raz i płać jednym kliknięciem w sklepach obsługujących Link by Stripe.",
  },
  {
    name: "Klarna",
    description: "Kup teraz, zapłać później",
    details: "Rozłóż płatność na 3 lub 4 raty bez dodatkowych kosztów.",
  },
  {
    name: "InPost Pay",
    description: "Płatność przez aplikację InPost",
    details: "Płać wygodnie przez aplikację InPost z zapisanymi danymi.",
  },
  {
    name: "Płatność przy odbiorze",
    description: "Zapłać kurierowi (+5 zł)",
    details: "Płacisz gotówką lub kartą kurierowi w momencie dostarczenia przesyłki.",
  },
];

const faqItems = [
  {
    question: "Kiedy zostanę obciążony?",
    answer: "Płatność jest pobierana natychmiast po zatwierdzeniu transakcji. Zamówienie zostanie przekazane do realizacji po zaksięgowaniu płatności.",
  },
  {
    question: "Co jeśli płatność nie przejdzie?",
    answer: "Jeśli płatność nie zostanie zrealizowana, zamówienie nie będzie aktywne. Możesz ponowić płatność lub wybrać inną metodę.",
  },
  {
    question: "Czy mogę zapłacić przelewem tradycyjnym?",
    answer: "Tak, możemy wystawić dane do przelewu tradycyjnego. Skontaktuj się z nami. Realizacja zamówienia rozpocznie się po zaksięgowaniu środków (1-2 dni robocze).",
  },
  {
    question: "Czy wystawiacie faktury VAT?",
    answer: "Tak, faktura VAT jest wystawiana automatycznie po podaniu danych firmy podczas składania zamówienia. Faktura zostanie wysłana na podany adres e-mail.",
  },
];

export default function PlatnosciPage() {
  return (
    <article className="min-h-screen">
      {/* Header */}
      <header className="container pt-12 pb-8 md:pt-20 md:pb-12">
        <div className="max-w-4xl">
          <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-4">
            Informacje
          </p>
          <h1 className="font-lora text-3xl md:text-4xl lg:text-5xl font-medium leading-tight mb-6">
            Płatności
          </h1>
          <p className="text-muted-foreground">
            Bezpieczne płatności obsługiwane przez Stripe.
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

              {/* Stripe badge */}
              <div className="mt-8 p-4 border-l-2 border-primary">
                <p className="text-sm font-medium">Operator płatności</p>
                <p className="text-2xl font-lora font-medium text-primary">Stripe</p>
              </div>
            </div>
          </aside>

          {/* Content */}
          <div className="max-w-3xl space-y-16">
            {/* Section 01 - Metody płatności */}
            <section id="metody" className="scroll-mt-24">
              <div className="flex items-baseline gap-4 mb-6">
                <span className="font-lora text-4xl md:text-5xl font-medium text-muted-foreground/30">
                  01
                </span>
                <h2 className="font-lora text-2xl md:text-3xl font-medium">
                  Metody płatności
                </h2>
              </div>

              <p className="text-muted-foreground mb-8">
                Oferujemy wiele bezpiecznych metod płatności, abyś mógł wybrać najwygodniejszą dla siebie.
              </p>

              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.name}
                    className="p-4 border rounded-xl hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="font-medium">{method.name}</h3>
                      <span className="text-sm text-muted-foreground shrink-0">
                        {method.description}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {method.details}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 02 - Bezpieczeństwo */}
            <section id="bezpieczenstwo" className="scroll-mt-24">
              <div className="flex items-baseline gap-4 mb-6">
                <span className="font-lora text-4xl md:text-5xl font-medium text-muted-foreground/30">
                  02
                </span>
                <h2 className="font-lora text-2xl md:text-3xl font-medium">
                  Bezpieczeństwo
                </h2>
              </div>

              <p className="text-muted-foreground mb-8">
                Twoje dane są chronione na każdym etapie transakcji.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex gap-4 p-4 border rounded-xl">
                  <span className="text-primary font-medium shrink-0">•</span>
                  <div>
                    <p className="font-medium mb-1">Szyfrowanie SSL</p>
                    <p className="text-sm text-muted-foreground">
                      Wszystkie dane są przesyłane przez bezpieczne, szyfrowane połączenie.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 border rounded-xl">
                  <span className="text-primary font-medium shrink-0">•</span>
                  <div>
                    <p className="font-medium mb-1">3D Secure</p>
                    <p className="text-sm text-muted-foreground">
                      Dodatkowa weryfikacja przy płatnościach kartą dla Twojego bezpieczeństwa.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 border rounded-xl">
                  <span className="text-primary font-medium shrink-0">•</span>
                  <div>
                    <p className="font-medium mb-1">Stripe jako operator</p>
                    <p className="text-sm text-muted-foreground">
                      Płatności obsługuje Stripe — jeden z największych i najbezpieczniejszych operatorów płatności na świecie.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 p-4 border rounded-xl">
                  <span className="text-primary font-medium shrink-0">•</span>
                  <div>
                    <p className="font-medium mb-1">Nie przechowujemy danych kart</p>
                    <p className="text-sm text-muted-foreground">
                      Dane karty są przetwarzane wyłącznie przez Stripe. Nie mamy do nich dostępu.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 03 - Klarna */}
            <section id="klarna" className="scroll-mt-24">
              <div className="flex items-baseline gap-4 mb-6">
                <span className="font-lora text-4xl md:text-5xl font-medium text-muted-foreground/30">
                  03
                </span>
                <h2 className="font-lora text-2xl md:text-3xl font-medium">
                  Klarna
                </h2>
              </div>

              <p className="text-muted-foreground mb-8">
                Rozłóż płatność na raty bez dodatkowych kosztów.
              </p>

              <div className="p-6 bg-muted/50 rounded-xl mb-8">
                <h3 className="font-medium mb-4">Jak działa Klarna?</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    <strong className="text-foreground">1.</strong> Wybierz Klarna jako metodę płatności przy zamówieniu.
                  </p>
                  <p>
                    <strong className="text-foreground">2.</strong> Zaloguj się do Klarna lub podaj swoje dane.
                  </p>
                  <p>
                    <strong className="text-foreground">3.</strong> Wybierz liczbę rat (3 lub 4 raty).
                  </p>
                  <p>
                    <strong className="text-foreground">4.</strong> Raty są pobierane automatycznie co 2 tygodnie.
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="p-4 border rounded-xl">
                  <p className="text-sm text-muted-foreground mb-1">Liczba rat</p>
                  <p className="font-medium">3 lub 4 raty</p>
                </div>
                <div className="p-4 border rounded-xl">
                  <p className="text-sm text-muted-foreground mb-1">Dodatkowe koszty</p>
                  <p className="font-medium">0 zł (0% RRSO)</p>
                </div>
                <div className="p-4 border rounded-xl">
                  <p className="text-sm text-muted-foreground mb-1">Pierwsza rata</p>
                  <p className="font-medium">Przy zamówieniu</p>
                </div>
                <div className="p-4 border rounded-xl">
                  <p className="text-sm text-muted-foreground mb-1">Kolejne raty</p>
                  <p className="font-medium">Co 2 tygodnie</p>
                </div>
              </div>
            </section>

            {/* Section 04 - FAQ */}
            <section id="faq" className="scroll-mt-24">
              <div className="flex items-baseline gap-4 mb-6">
                <span className="font-lora text-4xl md:text-5xl font-medium text-muted-foreground/30">
                  04
                </span>
                <h2 className="font-lora text-2xl md:text-3xl font-medium">
                  Często zadawane pytania
                </h2>
              </div>

              <div className="space-y-4 mb-8">
                {faqItems.map((item, index) => (
                  <div key={index} className="p-4 border rounded-xl">
                    <h3 className="font-medium mb-2">{item.question}</h3>
                    <p className="text-sm text-muted-foreground">{item.answer}</p>
                  </div>
                ))}
              </div>

              <div className="p-6 border rounded-xl">
                <p className="font-medium mb-2">Problemy z płatnością?</p>
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
