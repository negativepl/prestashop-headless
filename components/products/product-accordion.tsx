"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: product.description }}
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
                    <tr key={feature.id} className={index % 2 === 0 ? "bg-muted/30" : ""}>
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
