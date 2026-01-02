import { Metadata } from "next";
import Image from "next/image";
import { Building2, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Dostawa | HomeScreen",
  description: "Informacje o dostawie w HomeScreen - metody wysyłki, koszty. Darmowa dostawa od 100 zł.",
};

export default function DostawaPage() {
  return (
    <div className="container py-8 md:py-12">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Dostawa</h1>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <div className="p-6 bg-primary/10 rounded-xl mb-8">
            <p className="text-lg font-semibold text-primary mb-3">Darmowa dostawa od 100 zł!</p>
            <p className="text-muted-foreground mb-2">
              Przy zamówieniach od 100 zł wszystkie metody dostawy są bezpłatne.
            </p>
            <p className="text-sm text-muted-foreground">
              Na karcie produktu znajdziesz wskaźnik pokazujący ile brakuje Ci do darmowej dostawy.
            </p>
          </div>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-6">Punkty odbioru</h2>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 border rounded-xl">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                  <Image src="/images/carriers/inpost-paczkomat.png" alt="InPost Paczkomat" width={48} height={48} className="object-contain" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold">Paczkomat® InPost</h3>
                    <span className="font-semibold">11,99 zł</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Odbiór 24/7 w wybranym paczkomacie</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 border rounded-xl">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                  <Image src="/images/carriers/zabka.png" alt="Żabka" width={48} height={48} className="object-contain" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold">Odbiór w Żabce</h3>
                    <span className="font-semibold">9,99 zł</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Odbierz w najbliższym sklepie Żabka (przewoźnik DHL)</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 border rounded-xl">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                  <Image src="/images/carriers/orlen-paczka.png" alt="Orlen Paczka" width={48} height={48} className="object-contain" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold">Orlen Paczka</h3>
                    <span className="font-semibold">8,99 zł</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Odbierz na stacji Orlen</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-6">Dostawa pod adres</h2>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 border rounded-xl">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                  <Image src="/images/carriers/inpost-kurier.png" alt="InPost Kurier" width={48} height={48} className="object-contain" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold">Kurier InPost</h3>
                    <span className="font-semibold">13,99 zł</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Dostawa pod wskazany adres</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 border rounded-xl">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                  <Image src="/images/carriers/inpost-kurier.png" alt="InPost Kurier" width={48} height={48} className="object-contain" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold">Kurier InPost (za pobraniem)</h3>
                    <span className="font-semibold">18,99 zł</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Dostawa pod wskazany adres, płatność przy odbiorze</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-6">Odbiór osobisty</h2>

            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 border rounded-xl">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center shrink-0">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold">Odbiór osobisty</h3>
                    <span className="font-semibold text-green-600">Bezpłatnie</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Odbierz w naszym punkcie w Koszalinie</p>
                  <p className="text-sm text-muted-foreground">ul. Szeroka 20, 75-814 Koszalin</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Czas realizacji</h2>
            <div className="p-4 bg-muted rounded-xl">
              <p className="text-muted-foreground">
                Czas realizacji zamówienia zależy od dostępności produktu. Sprawdź informację o czasie wysyłki
                przy każdym produkcie na stronie produktowej. Czas wysyłki zamówienia zostanie automatycznie
                dostosowany do produktu z najdłuższym czasem dostawy.
              </p>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Śledzenie przesyłki</h2>
            <p className="text-muted-foreground mb-4">
              Po nadaniu przesyłki otrzymasz e-mail z numerem śledzenia i linkiem do śledzenia paczki
              na stronie przewoźnika.
            </p>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Ważne informacje</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                <span className="text-muted-foreground">Wszystkie przesyłki są starannie zapakowane i zabezpieczone</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                <span className="text-muted-foreground">Przy odbiorze sprawdź stan paczki - uszkodzenia zgłoś kurierowi</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                <span className="text-muted-foreground">Realizujemy wysyłki na terenie całej Unii Europejskiej</span>
              </li>
            </ul>
          </section>

          <div className="mt-12 p-6 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Masz pytania o dostawę?</h3>
            <p className="text-muted-foreground">
              Skontaktuj się z nami: <a href="mailto:info@homescreen.pl" className="text-primary hover:underline">info@homescreen.pl</a> lub <a href="tel:+48793237970" className="text-primary hover:underline">+48 793 237 970</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
