import { Metadata } from "next";
import Link from "next/link";
import { Mail, Phone, MapPin, Clock, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const metadata: Metadata = {
  title: "Kontakt | HomeScreen",
  description: "Skontaktuj się z nami - HomeScreen. Telefon, e-mail, adres i formularz kontaktowy.",
};

export default function KontaktPage() {
  return (
    <article className="min-h-screen">
      {/* Header */}
      <header className="container pt-12 pb-8 md:pt-20 md:pb-12">
        <div className="max-w-4xl">
          <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-4">
            Skontaktuj się
          </p>
          <h1 className="font-lora text-3xl md:text-4xl lg:text-5xl font-medium leading-tight mb-6">
            Kontakt
          </h1>
          <p className="text-muted-foreground">
            Masz pytania? Chętnie pomożemy.
          </p>
        </div>
      </header>

      {/* Quick Contact Cards */}
      <section className="border-b">
        <div className="container py-12 md:py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border">
            {/* Phone */}
            <a
              href="tel:+48793237970"
              className="group bg-background p-6 md:p-8 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 rounded-full border-2 border-primary/20 flex items-center justify-center group-hover:border-primary group-hover:bg-primary/5 transition-colors">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
              </div>
              <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground mb-2">
                Telefon
              </p>
              <p className="font-lora text-xl md:text-2xl font-medium mb-2">
                +48 793 237 970
              </p>
              <p className="text-sm text-muted-foreground">
                Pon–Pt: 8:00 – 16:00
              </p>
            </a>

            {/* Email */}
            <a
              href="mailto:info@homescreen.pl"
              className="group bg-background p-6 md:p-8 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 rounded-full border-2 border-primary/20 flex items-center justify-center group-hover:border-primary group-hover:bg-primary/5 transition-colors">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
              </div>
              <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground mb-2">
                E-mail
              </p>
              <p className="font-lora text-xl md:text-2xl font-medium mb-2">
                info@homescreen.pl
              </p>
              <p className="text-sm text-muted-foreground">
                Odpowiadamy w 24h
              </p>
            </a>

            {/* Address */}
            <a
              href="https://maps.google.com/?q=ul.+Szeroka+20,+75-814+Koszalin"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-background p-6 md:p-8 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 rounded-full border-2 border-primary/20 flex items-center justify-center group-hover:border-primary group-hover:bg-primary/5 transition-colors">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <ArrowUpRight className="w-5 h-5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
              </div>
              <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground mb-2">
                Adres
              </p>
              <p className="font-lora text-xl md:text-2xl font-medium mb-2">
                ul. Szeroka 20
              </p>
              <p className="text-sm text-muted-foreground">
                75-814 Koszalin
              </p>
            </a>

            {/* Hours */}
            <div className="bg-background p-6 md:p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="w-12 h-12 rounded-full border-2 border-primary/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
              </div>
              <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground mb-2">
                Godziny pracy
              </p>
              <p className="font-lora text-xl md:text-2xl font-medium mb-2">
                Pon – Pt
              </p>
              <p className="text-sm text-muted-foreground">
                8:00 – 16:00
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content - Form + Map */}
      <section className="container py-16 md:py-24">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Form Column */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24">
              <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-4">
                Formularz kontaktowy
              </p>
              <h2 className="font-lora text-2xl md:text-3xl font-medium mb-8">
                Napisz do nas
              </h2>

              <form className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      Imię i nazwisko
                    </label>
                    <Input
                      id="name"
                      placeholder="Jan Kowalski"
                      className="h-12 bg-background"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      E-mail
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="jan@example.com"
                      className="h-12 bg-background"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-2">
                    Temat
                  </label>
                  <Input
                    id="subject"
                    placeholder="W czym możemy pomóc?"
                    className="h-12 bg-background"
                  />
                </div>

                <div>
                  <label htmlFor="order" className="block text-sm font-medium mb-2">
                    Numer zamówienia
                    <span className="text-muted-foreground font-normal ml-1">(opcjonalnie)</span>
                  </label>
                  <Input
                    id="order"
                    placeholder="np. HS12345"
                    className="h-12 bg-background"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    Wiadomość
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    placeholder="Opisz swoje pytanie lub problem..."
                    className="w-full px-4 py-3 border rounded-md bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  />
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="consent"
                    className="mt-1 w-4 h-4 rounded border-2 border-muted-foreground/30 text-primary focus:ring-primary/20"
                  />
                  <label htmlFor="consent" className="text-sm text-muted-foreground leading-relaxed">
                    Wyrażam zgodę na przetwarzanie moich danych osobowych w celu obsługi zapytania.
                    Zapoznałem się z{" "}
                    <Link href="/polityka-prywatnosci" className="text-primary hover:underline">
                      polityką prywatności
                    </Link>.
                  </label>
                </div>

                <Button type="submit" size="lg" className="w-full h-12">
                  Wyślij wiadomość
                </Button>
              </form>
            </div>
          </div>

          {/* Map Column */}
          <div className="lg:col-span-7">
            <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-4">
              Nasza lokalizacja
            </p>
            <h2 className="font-lora text-2xl md:text-3xl font-medium mb-8">
              Odwiedź nas
            </h2>

            <div className="aspect-[4/3] lg:aspect-auto lg:h-[600px] rounded-2xl overflow-hidden border">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2356.5!2d16.1825562!3d54.1845479!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4701d7d0d71aea5b%3A0x826796aee1f99845!2sHome%20Screen%20-%20hurtownia%20akcesori%C3%B3w%20GSM!5e0!3m2!1spl!2spl!4v1704200000000!5m2!1spl!2spl"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Lokalizacja HomeScreen"
              />
            </div>

          </div>
        </div>
      </section>

      {/* Company Info Footer */}
      <footer className="border-t">
        <div className="container py-12 md:py-16">
          <div className="max-w-4xl">
            <p className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-6">
              Dane firmy
            </p>

            <div className="grid sm:grid-cols-3 gap-8">
              <div>
                <p className="font-medium mb-1">Home Screen Magdalena Cylke</p>
                <p className="text-muted-foreground text-sm">
                  ul. Szeroka 20<br />
                  75-814 Koszalin
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">NIP</p>
                <p className="font-medium">4990574327</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">REGON</p>
                <p className="font-medium">520836138</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </article>
  );
}
