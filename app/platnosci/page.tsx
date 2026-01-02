import { Metadata } from "next";
import { CreditCard, Smartphone, Building, Truck, Shield, CheckCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Płatności | HomeScreen",
  description: "Metody płatności w HomeScreen - karty, BLIK, przelewy, płatność przy odbiorze. Bezpieczne zakupy online.",
};

export default function PlatnosciPage() {
  return (
    <div className="container py-8 md:py-12">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Metody płatności</h1>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="text-lg text-muted-foreground mb-8">
            Oferujemy wiele bezpiecznych metod płatności, abyś mógł wybrać najwygodniejszą dla siebie.
          </p>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-6">Dostępne metody płatności</h2>

            <div className="space-y-4">
              {/* Karty */}
              <div className="flex items-start gap-4 p-4 border rounded-xl">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center shrink-0">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Karta płatnicza</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Visa, Mastercard, Maestro
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Szybka i bezpieczna płatność kartą debetową lub kredytową.
                    Obsługujemy również karty wirtualne i Apple Pay/Google Pay.
                  </p>
                </div>
              </div>

              {/* BLIK */}
              <div className="flex items-start gap-4 p-4 border rounded-xl">
                <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center shrink-0">
                  <Smartphone className="h-6 w-6 text-pink-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">BLIK</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Płatność kodem z aplikacji bankowej
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Wygodna płatność 6-cyfrowym kodem generowanym w aplikacji Twojego banku.
                    Transakcja realizowana natychmiast.
                  </p>
                </div>
              </div>

              {/* Przelew */}
              <div className="flex items-start gap-4 p-4 border rounded-xl">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center shrink-0">
                  <Building className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Szybki przelew online</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Przelew z większości polskich banków
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Wybierz swój bank i zostaniesz przekierowany do logowania.
                    Przelew zostanie automatycznie wypełniony.
                  </p>
                </div>
              </div>

              {/* Pobranie */}
              <div className="flex items-start gap-4 p-4 border rounded-xl">
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center shrink-0">
                  <Truck className="h-6 w-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold mb-1">Płatność przy odbiorze (pobranie)</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Zapłać kurierowi przy odbiorze paczki (+5 zł)
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Płacisz gotówką lub kartą kurierowi w momencie dostarczenia przesyłki.
                    Dostępne dla przesyłek kurierskich InPost i DPD.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Obsługiwane banki (szybkie przelewy)</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                "mBank", "PKO BP", "ING", "Santander",
                "Pekao", "Alior Bank", "BNP Paribas", "Millennium",
                "Credit Agricole", "Citi Handlowy", "BOŚ", "Nest Bank"
              ].map((bank) => (
                <div key={bank} className="p-3 bg-muted rounded-lg text-center text-sm">
                  {bank}
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              ...oraz wiele innych banków obsługiwanych przez operatora płatności.
            </p>
          </section>

          <section className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold">Bezpieczeństwo płatności</h2>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                <span className="text-muted-foreground">
                  <strong>Szyfrowanie SSL</strong> - wszystkie dane są przesyłane przez bezpieczne połączenie
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                <span className="text-muted-foreground">
                  <strong>3D Secure</strong> - dodatkowa weryfikacja przy płatnościach kartą
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                <span className="text-muted-foreground">
                  <strong>Certyfikowany operator</strong> - płatności obsługiwane przez licencjonowanego operatora
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                <span className="text-muted-foreground">
                  <strong>Nie przechowujemy danych kart</strong> - dane karty są przetwarzane tylko przez operatora płatności
                </span>
              </li>
            </ul>
          </section>

          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Często zadawane pytania</h2>
            <div className="space-y-4">
              <div className="p-4 border rounded-xl">
                <h3 className="font-semibold mb-2">Kiedy zostanę obciążony?</h3>
                <p className="text-sm text-muted-foreground">
                  Płatność jest pobierana natychmiast po zatwierdzeniu transakcji.
                  Zamówienie zostanie przekazane do realizacji po zaksięgowaniu płatności.
                </p>
              </div>
              <div className="p-4 border rounded-xl">
                <h3 className="font-semibold mb-2">Co jeśli płatność nie przejdzie?</h3>
                <p className="text-sm text-muted-foreground">
                  Jeśli płatność nie zostanie zrealizowana, zamówienie nie będzie aktywne.
                  Możesz ponowić płatność lub wybrać inną metodę.
                </p>
              </div>
              <div className="p-4 border rounded-xl">
                <h3 className="font-semibold mb-2">Czy mogę zapłacić przelewem tradycyjnym?</h3>
                <p className="text-sm text-muted-foreground">
                  Tak, możemy wystawić dane do przelewu tradycyjnego. Skontaktuj się z nami.
                  Pamiętaj, że realizacja zamówienia rozpocznie się po zaksięgowaniu środków (1-2 dni robocze).
                </p>
              </div>
              <div className="p-4 border rounded-xl">
                <h3 className="font-semibold mb-2">Czy wystawiacie faktury VAT?</h3>
                <p className="text-sm text-muted-foreground">
                  Tak, faktura VAT jest wystawiana automatycznie po podaniu danych firmy podczas składania zamówienia.
                  Faktura zostanie wysłana na podany adres e-mail.
                </p>
              </div>
            </div>
          </section>

          <div className="mt-12 p-6 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Problemy z płatnością?</h3>
            <p className="text-muted-foreground">
              Skontaktuj się z nami: info@homescreen.pl lub +48 793 237 970
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
