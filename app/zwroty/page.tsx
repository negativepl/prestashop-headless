import { Metadata } from "next";
import { RotateCcw, Package, Clock, FileText, CheckCircle, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Zwroty i reklamacje | HomeScreen",
  description: "Informacje o zwrotach i reklamacjach w HomeScreen. 14 dni na zwrot bez podania przyczyny.",
};

export default function ZwrotyPage() {
  return (
    <div className="container py-8 md:py-12">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Zwroty i reklamacje</h1>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <div className="p-6 bg-primary/10 rounded-xl mb-8">
            <p className="text-lg font-semibold text-primary mb-2">14 dni na zwrot bez podania przyczyny</p>
            <p className="text-muted-foreground">
              Jako konsument masz prawo odstąpić od umowy w ciągu 14 dni od otrzymania przesyłki.
            </p>
          </div>

          {/* Zwroty */}
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <RotateCcw className="h-8 w-8 text-primary" />
              <h2 className="text-xl font-semibold">Zwrot towaru</h2>
            </div>

            <h3 className="font-semibold mb-3">Jak zwrócić produkt?</h3>
            <ol className="list-decimal pl-6 space-y-3 text-muted-foreground mb-6">
              <li>
                <strong>Poinformuj nas o zwrocie</strong> - wyślij e-mail na adres info@homescreen.pl
                z informacją o chęci zwrotu i numerem zamówienia.
              </li>
              <li>
                <strong>Przygotuj paczkę</strong> - zapakuj produkt w oryginalne opakowanie (jeśli to możliwe).
                Produkt powinien być nieużywany i kompletny.
              </li>
              <li>
                <strong>Wyślij przesyłkę</strong> na adres:<br />
                Home Screen Magdalena Cylke<br />
                ul. Szeroka 20<br />
                75-814 Koszalin
              </li>
              <li>
                <strong>Otrzymaj zwrot pieniędzy</strong> - po otrzymaniu i sprawdzeniu produktu
                zwrócimy pieniądze w ciągu 14 dni na konto, z którego dokonano płatności.
              </li>
            </ol>

            <div className="bg-muted p-4 rounded-lg mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium mb-1">Ważne informacje o zwrotach</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>Koszt przesyłki zwrotnej pokrywa kupujący</li>
                    <li>Zwracamy cenę produktu + koszt pierwotnej dostawy (najtańszą metodę)</li>
                    <li>Produkt musi być w stanie nienaruszonym</li>
                  </ul>
                </div>
              </div>
            </div>

            <h3 className="font-semibold mb-3">Formularz odstąpienia od umowy</h3>
            <p className="text-muted-foreground mb-4">
              Możesz skorzystać z poniższego wzoru oświadczenia lub napisać własne:
            </p>
            <div className="bg-muted p-4 rounded-lg text-sm text-muted-foreground">
              <p className="mb-2">
                Ja, [imię i nazwisko], niniejszym informuję o moim odstąpieniu od umowy sprzedaży
                następujących produktów: [nazwa produktu].
              </p>
              <p className="mb-2">Numer zamówienia: [numer]</p>
              <p className="mb-2">Data zamówienia: [data] / Data odbioru: [data]</p>
              <p className="mb-2">Imię i nazwisko: [dane]</p>
              <p className="mb-2">Adres: [adres]</p>
              <p>Data i podpis (jeśli przesyłane w formie papierowej)</p>
            </div>
          </section>

          {/* Reklamacje */}
          <section className="mb-10">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="h-8 w-8 text-primary" />
              <h2 className="text-xl font-semibold">Reklamacje</h2>
            </div>

            <p className="text-muted-foreground mb-4">
              Jeśli otrzymany produkt jest wadliwy lub niezgodny z opisem, masz prawo złożyć reklamację.
            </p>

            <h3 className="font-semibold mb-3">Jak złożyć reklamację?</h3>
            <ol className="list-decimal pl-6 space-y-3 text-muted-foreground mb-6">
              <li>
                <strong>Skontaktuj się z nami</strong> - wyślij e-mail na info@homescreen.pl opisując problem.
                Załącz zdjęcia wady (jeśli to możliwe).
              </li>
              <li>
                <strong>Poczekaj na odpowiedź</strong> - rozpatrzymy reklamację w ciągu 14 dni.
                Poinformujemy Cię o dalszych krokach.
              </li>
              <li>
                <strong>Wyślij produkt</strong> (jeśli będzie to wymagane) na nasz adres.
                Koszt przesyłki pokrywamy my.
              </li>
              <li>
                <strong>Otrzymaj rozwiązanie</strong> - naprawa, wymiana, obniżenie ceny lub zwrot pieniędzy.
              </li>
            </ol>

            <h3 className="font-semibold mb-3">Co powinna zawierać reklamacja?</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Numer zamówienia</li>
              <li>Nazwa reklamowanego produktu</li>
              <li>Opis wady/problemu</li>
              <li>Żądanie (naprawa, wymiana, zwrot pieniędzy)</li>
              <li>Dane kontaktowe</li>
              <li>Zdjęcia wady (opcjonalnie, ale przyspiesza proces)</li>
            </ul>
          </section>

          {/* Gwarancja */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Gwarancja producenta</h2>
            <p className="text-muted-foreground mb-4">
              Wiele produktów w naszym sklepie objętych jest gwarancją producenta.
              Informacja o gwarancji znajduje się na karcie produktu.
            </p>
            <p className="text-muted-foreground">
              Niezależnie od gwarancji producenta, przysługuje Ci prawo do reklamacji
              z tytułu rękojmi (odpowiedzialność sprzedawcy) przez okres 2 lat od daty zakupu.
            </p>
          </section>

          {/* Podsumowanie */}
          <section className="mb-10">
            <h2 className="text-xl font-semibold mb-4">Podsumowanie</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Zwrot</span>
                </div>
                <p className="text-sm text-muted-foreground">14 dni na odstąpienie od umowy</p>
              </div>
              <div className="p-4 border rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Reklamacja</span>
                </div>
                <p className="text-sm text-muted-foreground">14 dni na rozpatrzenie</p>
              </div>
              <div className="p-4 border rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Rękojmia</span>
                </div>
                <p className="text-sm text-muted-foreground">2 lata od daty zakupu</p>
              </div>
              <div className="p-4 border rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-5 w-5 text-primary" />
                  <span className="font-semibold">Zwrot pieniędzy</span>
                </div>
                <p className="text-sm text-muted-foreground">Do 14 dni od otrzymania zwrotu</p>
              </div>
            </div>
          </section>

          <div className="mt-12 p-6 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Potrzebujesz pomocy?</h3>
            <p className="text-muted-foreground">
              Skontaktuj się z nami: info@homescreen.pl lub +48 793 237 970
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
