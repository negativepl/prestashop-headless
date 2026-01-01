"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");

  return (
    <div className="container py-16">
      <div className="max-w-md mx-auto text-center">
        <CheckCircle className="h-20 w-20 mx-auto text-green-500" />
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-6">Dziękujemy za zamówienie!</h1>
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
          <Link href="/">
            <Button>Strona główna</Button>
          </Link>
          <Link href="/products">
            <Button variant="outline">Kontynuuj zakupy</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="container py-16">
        <div className="max-w-md mx-auto text-center">
          <Loader2 className="h-12 w-12 mx-auto text-primary animate-spin" />
        </div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
