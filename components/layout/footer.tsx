import Link from "next/link";
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";

export function Footer() {
  return (
    <footer className="bg-zinc-900 text-white">
      {/* Newsletter */}
      <div className="border-b border-zinc-800">
        <div className="container py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-semibold">Zapisz się do newslettera</h4>
              <p className="text-sm text-zinc-400">Otrzymuj informacje o nowościach i promocjach</p>
            </div>
            <form className="flex gap-2 w-full md:w-auto">
              <Input
                type="email"
                placeholder="Twój email"
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 w-full md:w-64"
              />
              <Button type="submit" className="bg-white text-zinc-900 hover:bg-zinc-200">Zapisz</Button>
            </form>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-zinc-900 font-bold text-lg">PS</span>
              </div>
              <span className="text-xl font-bold">Store</span>
            </Link>
            <p className="text-sm text-zinc-400 mb-6">
              Najwyższa jakość produktów i wyjątkowa obsługa klienta.
              Twój sklep z pasją.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center hover:bg-zinc-700 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center hover:bg-zinc-700 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center hover:bg-zinc-700 transition-colors">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center hover:bg-zinc-700 transition-colors">
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center hover:bg-zinc-700 transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-semibold mb-4">Sklep</h3>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  Wszystkie produkty
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-white transition-colors">
                  Kategorie
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Nowości
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-white transition-colors">
                  Wyprzedaż
                </Link>
              </li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="font-semibold mb-4">Pomoc</h3>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Dostawa
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Zwroty i reklamacje
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Płatności
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Firma</h3>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  O nas
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Regulamin
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Polityka prywatności
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Kontakt
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Kontakt</h3>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+48 793 237 970</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>info@homescreen.pl</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5" />
                <span>ul. Szeroka 20<br />75-814 Koszalin<br />Polska</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-zinc-800">
        <div className="container py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
            <div className="flex items-center gap-4 order-2 md:order-1">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/100px-Visa_Inc._logo.svg.png" alt="Visa" className="h-6 opacity-50" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/100px-Mastercard-logo.svg.png" alt="Mastercard" className="h-6 opacity-50" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/100px-PayPal.svg.png" alt="PayPal" className="h-6 opacity-50" />
            </div>
            <p className="order-1 md:order-2 text-center">© Home Screen Magdalena Cylke. Wszystkie prawa zastrzeżone.</p>
            <div className="order-3">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
