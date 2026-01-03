"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SafeHtml } from "@/components/ui/safe-html";
import { ProductDetailsContent } from "./product-details";
import { ProductReviewsContent } from "./product-reviews";
import type { Product } from "@/lib/prestashop/types";

interface ProductAccordionProps {
  product: Product;
}

export function ProductAccordion({ product }: ProductAccordionProps) {
  return (
    <Accordion type="multiple" defaultValue={["description"]} className="space-y-4">
      {/* Description */}
      {product.description && (
        <AccordionItem value="description" className="bg-card rounded-lg border px-6 border-b">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline">
            Opis produktu
          </AccordionTrigger>
          <AccordionContent>
            <SafeHtml
              html={product.description}
              className="prose prose-sm max-w-none"
            />
          </AccordionContent>
        </AccordionItem>
      )}

      {/* Product features */}
      {product.features && product.features.length > 0 && (
        <AccordionItem value="features" className="bg-card rounded-lg border px-6 border-b">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline">
            Cechy produktu
          </AccordionTrigger>
          <AccordionContent>
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-sm">
                <tbody className="divide-y">
                  {product.features.map((feature, index) => (
                    <tr key={`${feature.id}-${index}`} className={index % 2 === 0 ? "bg-muted/30" : ""}>
                      <td className="px-4 py-3 text-muted-foreground font-medium w-1/3">{feature.name}</td>
                      <td className="px-4 py-3">{feature.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AccordionContent>
        </AccordionItem>
      )}

      {/* Product details */}
      <AccordionItem value="details" className="bg-card rounded-lg border px-6 border-b">
        <AccordionTrigger className="text-lg font-semibold hover:no-underline">
          Szczegóły produktu
        </AccordionTrigger>
        <AccordionContent>
          <ProductDetailsContent product={product} />
        </AccordionContent>
      </AccordionItem>

      {/* GPSR - General Product Safety Regulation */}
      <AccordionItem value="gpsr" className="bg-card rounded-lg border px-6 border-b">
        <AccordionTrigger className="text-lg font-semibold hover:no-underline">
          Bezpieczeństwo produktu (GPSR)
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-6">
            {/* Manufacturer info */}
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                Producent
              </h4>
              <div className="bg-muted/30 rounded-lg p-4 space-y-1">
                <p className="font-medium">Home Screen Distribution sp. z o.o.</p>
                <p className="text-sm text-muted-foreground">ul. Przykładowa 123</p>
                <p className="text-sm text-muted-foreground">00-001 Warszawa, Polska</p>
                <p className="text-sm text-muted-foreground">kontakt@homescreen.pl</p>
              </div>
            </div>

            {/* EU Responsible Person */}
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                Osoba odpowiedzialna w UE
              </h4>
              <div className="bg-muted/30 rounded-lg p-4 space-y-1">
                <p className="font-medium">Home Screen Distribution sp. z o.o.</p>
                <p className="text-sm text-muted-foreground">ul. Przykładowa 123</p>
                <p className="text-sm text-muted-foreground">00-001 Warszawa, Polska</p>
                <p className="text-sm text-muted-foreground">gpsr@homescreen.pl</p>
              </div>
            </div>

            {/* Safety warnings */}
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                Ostrzeżenia dotyczące bezpieczeństwa
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-0.5">⚠️</span>
                  <span>Produkt przeznaczony dla osób powyżej 18 roku życia.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-0.5">⚠️</span>
                  <span>Przechowywać w suchym miejscu, z dala od źródeł ciepła.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-500 mt-0.5">⚠️</span>
                  <span>Nie wystawiać na bezpośrednie działanie promieni słonecznych.</span>
                </li>
              </ul>
            </div>

            {/* Compliance */}
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                Zgodność z przepisami
              </h4>
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-green-100 text-green-800 text-xs font-medium dark:bg-green-900/30 dark:text-green-400">
                  ✓ CE
                </span>
                <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-green-100 text-green-800 text-xs font-medium dark:bg-green-900/30 dark:text-green-400">
                  ✓ RoHS
                </span>
                <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-green-100 text-green-800 text-xs font-medium dark:bg-green-900/30 dark:text-green-400">
                  ✓ REACH
                </span>
                <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-green-100 text-green-800 text-xs font-medium dark:bg-green-900/30 dark:text-green-400">
                  ✓ WEEE
                </span>
              </div>
            </div>

            {/* Documentation */}
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                Dokumentacja
              </h4>
              <div className="space-y-2">
                <a href="#" className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <span>📄</span>
                  Deklaracja zgodności UE (PDF)
                </a>
                <a href="#" className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <span>📄</span>
                  Instrukcja obsługi (PDF)
                </a>
                <a href="#" className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <span>📄</span>
                  Karta charakterystyki produktu (PDF)
                </a>
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>

      {/* Reviews */}
      <AccordionItem value="reviews" className="bg-card rounded-lg border px-6 border-b">
        <AccordionTrigger className="text-lg font-semibold hover:no-underline">
          Opinie klientów
        </AccordionTrigger>
        <AccordionContent>
          <ProductReviewsContent productId={product.id} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
