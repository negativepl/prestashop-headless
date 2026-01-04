"use client";

import { useEffect } from "react";
import "vanilla-cookieconsent/dist/cookieconsent.css";
import * as CookieConsent from "vanilla-cookieconsent";

export function CookieBanner() {
  useEffect(() => {
    CookieConsent.run({
      guiOptions: {
        consentModal: {
          layout: "box inline",
          position: "bottom left",
        },
        preferencesModal: {
          layout: "box",
        },
      },
      categories: {
        necessary: {
          enabled: true,
          readOnly: true,
        },
        analytics: {
          autoClear: {
            cookies: [
              { name: /^_ga/ },
              { name: "_gid" },
            ],
          },
        },
        marketing: {
          autoClear: {
            cookies: [
              { name: /^_fb/ },
            ],
          },
        },
      },
      language: {
        default: "pl",
        translations: {
          pl: {
            consentModal: {
              title: "Używamy plików cookies",
              description:
                "Używamy plików cookies, aby zapewnić najlepsze doświadczenia na naszej stronie. Niektóre z nich są niezbędne do działania strony, inne pomagają nam ją ulepszać.",
              acceptAllBtn: "Akceptuję wszystkie",
              acceptNecessaryBtn: "Tylko niezbędne",
              showPreferencesBtn: "Ustawienia",
            },
            preferencesModal: {
              title: "Ustawienia cookies",
              acceptAllBtn: "Akceptuję wszystkie",
              acceptNecessaryBtn: "Tylko niezbędne",
              savePreferencesBtn: "Zapisz ustawienia",
              sections: [
                {
                  title: "Wykorzystanie plików cookies",
                  description:
                    "Używamy plików cookies, aby zapewnić podstawowe funkcje strony oraz poprawić Twoje doświadczenia online.",
                },
                {
                  title: "Niezbędne cookies",
                  description:
                    "Te pliki cookies są niezbędne do prawidłowego działania strony. Bez nich strona nie będzie działać poprawnie.",
                  linkedCategory: "necessary",
                },
                {
                  title: "Analityczne cookies",
                  description:
                    "Te pliki cookies pomagają nam zrozumieć, jak odwiedzający korzystają z naszej strony. Wszystkie dane są anonimowe.",
                  linkedCategory: "analytics",
                },
                {
                  title: "Marketingowe cookies",
                  description:
                    "Te pliki cookies są używane do wyświetlania spersonalizowanych reklam i śledzenia ich skuteczności.",
                  linkedCategory: "marketing",
                },
                {
                  title: "Więcej informacji",
                  description:
                    'Jeśli masz pytania dotyczące naszej polityki cookies, <a href="/privacy-policy" class="cc-link">skontaktuj się z nami</a>.',
                },
              ],
            },
          },
        },
      },
    });
  }, []);

  return null;
}

// Helper do sprawdzania zgody w innych komponentach
export function hasConsent(category: "analytics" | "marketing"): boolean {
  if (typeof window === "undefined") return false;
  return CookieConsent.acceptedCategory(category);
}
