import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Regulamin sklepu | HomeScreen",
  description: "Regulamin sklepu internetowego HomeScreen - zasady zakupów, płatności, dostaw i zwrotów.",
};

export default function RegulaminPage() {
  return (
    <div className="container py-8 md:py-12">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Regulamin sklepu internetowego</h1>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="text-muted-foreground mb-8">
            Obowiązuje od: 1 stycznia 2026 r.
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">I. Postanowienia ogólne</h2>
            <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
              <li>Sklep internetowy HomeScreen, dostępny pod adresem homescreen.pl, prowadzony jest przez Home Screen Magdalena Cylke, ul. Szeroka 20, 75-814 Koszalin, NIP: 4990574327, REGON: 520836138.</li>
              <li>Niniejszy regulamin określa zasady korzystania ze sklepu internetowego, składania zamówień, dostawy produktów, płatności, odstąpienia od umowy oraz postępowania reklamacyjnego.</li>
              <li>Korzystanie ze sklepu internetowego oznacza akceptację niniejszego regulaminu.</li>
              <li>Wszystkie ceny podane w sklepie są cenami brutto (zawierają podatek VAT) i wyrażone są w złotych polskich (PLN).</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">II. Definicje</h2>
            <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
              <li><strong>Sprzedawca</strong> - Home Screen Magdalena Cylke.</li>
              <li><strong>Klient</strong> - osoba fizyczna, osoba prawna lub jednostka organizacyjna nieposiadająca osobowości prawnej, która korzysta ze sklepu.</li>
              <li><strong>Konsument</strong> - Klient będący osobą fizyczną dokonującą zakupu niezwiązanego bezpośrednio z jej działalnością gospodarczą lub zawodową.</li>
              <li><strong>Produkt</strong> - towar dostępny w sklepie internetowym.</li>
              <li><strong>Zamówienie</strong> - oświadczenie woli Klienta zmierzające do zawarcia umowy sprzedaży.</li>
              <li><strong>Koszyk</strong> - funkcjonalność sklepu umożliwiająca wybranie produktów do zamówienia.</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">III. Składanie zamówień</h2>
            <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
              <li>Zamówienia można składać 24 godziny na dobę, 7 dni w tygodniu.</li>
              <li>W celu złożenia zamówienia należy:
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>wybrać produkty i dodać je do koszyka,</li>
                  <li>wybrać sposób dostawy i płatności,</li>
                  <li>podać dane niezbędne do realizacji zamówienia,</li>
                  <li>zaakceptować regulamin i politykę prywatności,</li>
                  <li>potwierdzić zamówienie przyciskiem "Zamawiam z obowiązkiem zapłaty".</li>
                </ul>
              </li>
              <li>Po złożeniu zamówienia Klient otrzymuje potwierdzenie na podany adres e-mail.</li>
              <li>Umowa sprzedaży zostaje zawarta w momencie otrzymania przez Klienta potwierdzenia przyjęcia zamówienia do realizacji.</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">IV. Płatności</h2>
            <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
              <li>Dostępne metody płatności:
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>płatność kartą (Visa, Mastercard),</li>
                  <li>szybki przelew online,</li>
                  <li>BLIK,</li>
                  <li>płatność przy odbiorze (pobranie).</li>
                </ul>
              </li>
              <li>Płatności elektroniczne obsługiwane są przez operatora płatności.</li>
              <li>Zamówienia nieopłacone w ciągu 7 dni mogą zostać anulowane.</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">V. Dostawa</h2>
            <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
              <li>Dostępne metody dostawy:
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Paczkomat InPost,</li>
                  <li>Kurier InPost,</li>
                  <li>Kurier DPD,</li>
                  <li>Poczta Polska.</li>
                </ul>
              </li>
              <li>Czas realizacji zamówienia wynosi zazwyczaj 1-3 dni roboczych od momentu zaksięgowania płatności.</li>
              <li>Koszty dostawy są podawane podczas składania zamówienia i zależą od wybranej metody dostawy oraz wartości zamówienia.</li>
              <li>Przy zamówieniach powyżej 199 zł dostawa jest bezpłatna (dla wybranych metod dostawy).</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">VI. Prawo odstąpienia od umowy</h2>
            <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
              <li>Konsument ma prawo odstąpić od umowy w terminie 14 dni bez podania przyczyny.</li>
              <li>Termin do odstąpienia od umowy wygasa po upływie 14 dni od dnia, w którym Konsument wszedł w posiadanie produktu.</li>
              <li>Aby skorzystać z prawa odstąpienia od umowy, Konsument musi poinformować Sprzedawcę o swojej decyzji w drodze jednoznacznego oświadczenia (np. pismo wysłane pocztą lub e-mailem).</li>
              <li>Konsument może skorzystać z wzoru formularza odstąpienia od umowy, jednak nie jest to obowiązkowe.</li>
              <li>W przypadku odstąpienia od umowy Sprzedawca zwraca wszystkie otrzymane płatności, w tym koszty dostawy, nie później niż 14 dni od dnia otrzymania oświadczenia o odstąpieniu.</li>
              <li>Konsument ponosi bezpośrednie koszty zwrotu produktu.</li>
              <li>Konsument odpowiada za zmniejszenie wartości produktu wynikające z korzystania z niego w sposób wykraczający poza konieczny do stwierdzenia jego charakteru, cech i funkcjonowania.</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">VII. Reklamacje</h2>
            <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
              <li>Sprzedawca jest odpowiedzialny za wady produktu zgodnie z przepisami Kodeksu cywilnego o rękojmi.</li>
              <li>Reklamację można złożyć:
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>e-mailem na adres: info@homescreen.pl,</li>
                  <li>pisemnie na adres siedziby Sprzedawcy.</li>
                </ul>
              </li>
              <li>Reklamacja powinna zawierać: opis wady, żądanie Klienta oraz dane kontaktowe.</li>
              <li>Sprzedawca rozpatrzy reklamację w terminie 14 dni od jej otrzymania.</li>
              <li>W przypadku uznania reklamacji Sprzedawca naprawi lub wymieni produkt, obniży cenę lub zwróci pieniądze.</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">VIII. Ochrona danych osobowych</h2>
            <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
              <li>Administratorem danych osobowych jest Sprzedawca.</li>
              <li>Dane osobowe przetwarzane są w celu realizacji zamówień i obsługi Klientów.</li>
              <li>Szczegółowe informacje dotyczące przetwarzania danych osobowych znajdują się w Polityce prywatności.</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">IX. Postanowienia końcowe</h2>
            <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
              <li>Sprzedawca zastrzega sobie prawo do zmiany regulaminu. Zmiany wchodzą w życie z dniem publikacji na stronie sklepu.</li>
              <li>W sprawach nieuregulowanych niniejszym regulaminem mają zastosowanie przepisy prawa polskiego.</li>
              <li>Spory wynikające z umów zawartych na podstawie niniejszego regulaminu rozstrzygane będą przez właściwe sądy powszechne.</li>
              <li>Konsument ma możliwość skorzystania z pozasądowych sposobów rozpatrywania reklamacji i dochodzenia roszczeń, w tym z platformy ODR dostępnej pod adresem: https://ec.europa.eu/consumers/odr/</li>
            </ol>
          </section>

          <div className="mt-12 p-6 bg-muted rounded-lg">
            <h3 className="font-semibold mb-2">Kontakt</h3>
            <p className="text-muted-foreground">
              Home Screen Magdalena Cylke<br />
              ul. Szeroka 20, 75-814 Koszalin<br />
              E-mail: info@homescreen.pl<br />
              Tel: +48 793 237 970
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
