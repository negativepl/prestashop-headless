import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Polityka prywatności | HomeScreen",
  description: "Polityka prywatności sklepu HomeScreen - informacje o przetwarzaniu danych osobowych zgodnie z RODO.",
};

export default function PolitykaPage() {
  return (
    <div className="container py-8 md:py-12">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Polityka prywatności</h1>

        <div className="prose prose-neutral dark:prose-invert max-w-none">
          <p className="text-muted-foreground mb-8">
            Obowiązuje od: 1 stycznia 2026 r.
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">I. Administrator danych osobowych</h2>
            <p className="text-muted-foreground mb-4">
              Administratorem Twoich danych osobowych jest Home Screen Magdalena Cylke z siedzibą przy ul. Szerokiej 20, 75-814 Koszalin (dalej: "Administrator" lub "my").
            </p>
            <p className="text-muted-foreground">
              W sprawach związanych z ochroną danych osobowych możesz skontaktować się z nami:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
              <li>e-mailem: info@homescreen.pl</li>
              <li>telefonicznie: +48 793 237 970</li>
              <li>listownie: ul. Szeroka 20, 75-814 Koszalin</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">II. Cele i podstawy przetwarzania danych</h2>
            <p className="text-muted-foreground mb-4">Twoje dane osobowe przetwarzamy w następujących celach:</p>

            <div className="space-y-4 text-muted-foreground">
              <div>
                <h3 className="font-medium text-foreground">1. Realizacja zamówień</h3>
                <p>Cel: wykonanie umowy sprzedaży, wysyłka produktów, obsługa płatności.</p>
                <p>Podstawa prawna: art. 6 ust. 1 lit. b RODO (wykonanie umowy).</p>
                <p>Okres przechowywania: przez czas trwania umowy oraz okres przedawnienia roszczeń (do 6 lat).</p>
              </div>

              <div>
                <h3 className="font-medium text-foreground">2. Obsługa konta użytkownika</h3>
                <p>Cel: prowadzenie konta, umożliwienie dostępu do historii zamówień.</p>
                <p>Podstawa prawna: art. 6 ust. 1 lit. b RODO (wykonanie umowy).</p>
                <p>Okres przechowywania: do czasu usunięcia konta przez użytkownika.</p>
              </div>

              <div>
                <h3 className="font-medium text-foreground">3. Marketing bezpośredni (newsletter)</h3>
                <p>Cel: wysyłka informacji o promocjach, nowościach i ofertach.</p>
                <p>Podstawa prawna: art. 6 ust. 1 lit. a RODO (zgoda).</p>
                <p>Okres przechowywania: do czasu wycofania zgody.</p>
              </div>

              <div>
                <h3 className="font-medium text-foreground">4. Rozpatrywanie reklamacji i zwrotów</h3>
                <p>Cel: obsługa procesu reklamacji i zwrotów.</p>
                <p>Podstawa prawna: art. 6 ust. 1 lit. c RODO (obowiązek prawny).</p>
                <p>Okres przechowywania: zgodnie z wymogami prawa (do 6 lat).</p>
              </div>

              <div>
                <h3 className="font-medium text-foreground">5. Cele podatkowe i księgowe</h3>
                <p>Cel: prowadzenie dokumentacji księgowej, wystawianie faktur.</p>
                <p>Podstawa prawna: art. 6 ust. 1 lit. c RODO (obowiązek prawny).</p>
                <p>Okres przechowywania: 5 lat od końca roku podatkowego.</p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">III. Kategorie przetwarzanych danych</h2>
            <p className="text-muted-foreground mb-4">W zależności od celu przetwarzamy następujące dane:</p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>imię i nazwisko,</li>
              <li>adres e-mail,</li>
              <li>numer telefonu,</li>
              <li>adres dostawy i adres do faktury,</li>
              <li>NIP (w przypadku firm),</li>
              <li>dane dotyczące zamówień i płatności,</li>
              <li>dane techniczne (adres IP, pliki cookies).</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">IV. Odbiorcy danych</h2>
            <p className="text-muted-foreground mb-4">Twoje dane mogą być przekazywane następującym kategoriom odbiorców:</p>
            <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
              <li>firmy kurierskie i operatorzy logistyczni (InPost, DPD, Poczta Polska),</li>
              <li>operatorzy płatności elektronicznych,</li>
              <li>dostawcy usług hostingowych i IT,</li>
              <li>dostawcy narzędzi analitycznych (Google Analytics),</li>
              <li>biuro rachunkowe,</li>
              <li>organy państwowe (na żądanie, zgodnie z przepisami prawa).</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">V. Twoje prawa</h2>
            <p className="text-muted-foreground mb-4">W związku z przetwarzaniem danych osobowych przysługują Ci następujące prawa:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Prawo dostępu</strong> - możesz uzyskać informację o przetwarzanych danych oraz otrzymać ich kopię.</li>
              <li><strong>Prawo do sprostowania</strong> - możesz żądać poprawienia nieprawidłowych lub uzupełnienia niekompletnych danych.</li>
              <li><strong>Prawo do usunięcia</strong> ("prawo do bycia zapomnianym") - w określonych przypadkach możesz żądać usunięcia swoich danych.</li>
              <li><strong>Prawo do ograniczenia przetwarzania</strong> - możesz żądać ograniczenia przetwarzania danych w określonych sytuacjach.</li>
              <li><strong>Prawo do przenoszenia danych</strong> - możesz otrzymać swoje dane w ustrukturyzowanym formacie.</li>
              <li><strong>Prawo do sprzeciwu</strong> - możesz wnieść sprzeciw wobec przetwarzania danych w celach marketingowych.</li>
              <li><strong>Prawo do wycofania zgody</strong> - jeśli przetwarzanie opiera się na zgodzie, możesz ją w każdej chwili wycofać.</li>
              <li><strong>Prawo do skargi</strong> - możesz złożyć skargę do Prezesa Urzędu Ochrony Danych Osobowych.</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Aby skorzystać z powyższych praw, skontaktuj się z nami na adres: info@homescreen.pl
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">VI. Pliki cookies</h2>
            <p className="text-muted-foreground mb-4">
              Nasza strona wykorzystuje pliki cookies (ciasteczka), czyli małe pliki tekstowe zapisywane na Twoim urządzeniu.
            </p>

            <h3 className="font-medium mb-2">Rodzaje cookies:</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li><strong>Niezbędne</strong> - wymagane do działania strony (np. obsługa koszyka, logowanie).</li>
              <li><strong>Funkcjonalne</strong> - zapamiętują Twoje preferencje (np. wybór języka, tryb ciemny).</li>
              <li><strong>Analityczne</strong> - pomagają nam zrozumieć, jak użytkownicy korzystają ze strony (Google Analytics).</li>
              <li><strong>Marketingowe</strong> - służą do personalizacji reklam (za Twoją zgodą).</li>
            </ul>

            <p className="text-muted-foreground">
              Możesz zarządzać plikami cookies w ustawieniach swojej przeglądarki. Wyłączenie niektórych cookies może wpłynąć na funkcjonalność strony.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">VII. Bezpieczeństwo danych</h2>
            <p className="text-muted-foreground">
              Stosujemy odpowiednie środki techniczne i organizacyjne, aby chronić Twoje dane osobowe przed nieuprawnionym dostępem, utratą lub zniszczeniem. W szczególności:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
              <li>połączenia szyfrowane protokołem SSL/TLS,</li>
              <li>bezpieczne przechowywanie danych na serwerach w UE,</li>
              <li>regularne kopie zapasowe,</li>
              <li>ograniczony dostęp do danych tylko dla upoważnionych osób.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">VIII. Zmiany polityki prywatności</h2>
            <p className="text-muted-foreground">
              Zastrzegamy sobie prawo do wprowadzania zmian w niniejszej Polityce prywatności. O istotnych zmianach poinformujemy Cię poprzez komunikat na stronie lub wiadomość e-mail. Aktualna wersja Polityki prywatności jest zawsze dostępna na tej stronie.
            </p>
          </section>

          <div className="mt-12 p-6 bg-muted rounded-lg">
            <h3 className="font-semibold mb-4">Kontakt w sprawach danych osobowych</h3>
            <div className="grid sm:grid-cols-2 gap-4 text-muted-foreground">
              <div>
                <p className="font-medium text-foreground">Home Screen Magdalena Cylke</p>
                <p>ul. Szeroka 20, 75-814 Koszalin</p>
              </div>
              <div>
                <p>E-mail: <a href="mailto:info@homescreen.pl" className="text-primary hover:underline">info@homescreen.pl</a></p>
                <p>Tel: <a href="tel:+48793237970" className="text-primary hover:underline">+48 793 237 970</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
