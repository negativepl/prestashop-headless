"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");

  return (
    <div className="container py-16">
      <div className="max-w-md mx-auto text-center">
        <CheckCircle className="h-20 w-20 mx-auto text-green-500" />
        <h1 className="text-xl md:text-2xl font-bold mt-6">Dziękujemy za zamówienie!</h1>
        <p className="text-muted-foreground mt-4">
          Twoje zamówienie zostało przyjęte do realizacji.
        </p>
        {orderId && (
          <p className="text-lg font-medium mt-2">
            Numer zamówienia: <span className="text-primary">#{orderId}</span>
          </p>
        )}
        <p className="text-sm text-muted-foreground mt-4">
          Potwierdzenie zostanie wysłane na podany adres email.
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <Link href="/products">
            <Button>Kontynuuj zakupy</Button>
          </Link>
          <Link href="/">
            <Button variant="outline">Strona główna</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
