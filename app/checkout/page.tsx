"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, Loader2, Lock, Truck, CreditCard, User, MapPin, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/hooks/use-cart";

interface CheckoutForm {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postcode: string;
  phone: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CheckoutForm>({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postcode: "",
    phone: "",
  });

  // Fetch logged-in user data and pre-fill form
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me");
        const data = await res.json();
        if (data.user) {
          setForm((prev) => ({
            ...prev,
            email: data.user.email || "",
            firstName: data.user.firstName || "",
            lastName: data.user.lastName || "",
          }));
        }
      } catch {
        // User not logged in, ignore
      }
    }
    fetchUser();
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("pl-PL", {
      style: "currency",
      currency: "PLN",
    }).format(price);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: form,
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            productAttributeId: item.productAttributeId,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Błąd podczas składania zamówienia");
      }

      clearCart();
      router.push(`/checkout/success?order=${data.orderId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="size-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Koszyk jest pusty</h1>
          <p className="text-muted-foreground mt-2 mb-6">
            Dodaj produkty do koszyka przed złożeniem zamówienia
          </p>
          <Link href="/products">
            <Button size="lg">Przeglądaj produkty</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] py-8 md:py-12">
      <div className="container">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Finalizacja zamówienia</h1>
          <p className="text-muted-foreground mt-1">
            Wypełnij dane dostawy i złóż zamówienie
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form - 2 columns */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact info */}
              <div className="bg-card rounded-2xl border p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <User className="size-5 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold">Dane kontaktowe</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Imię</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      required
                      value={form.firstName}
                      onChange={handleChange}
                      placeholder="Jan"
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nazwisko</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      required
                      value={form.lastName}
                      onChange={handleChange}
                      placeholder="Kowalski"
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={form.email}
                        onChange={handleChange}
                        placeholder="jan@example.com"
                        className="h-12 pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+48 123 456 789"
                        className="h-12 pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping address */}
              <div className="bg-card rounded-2xl border p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <MapPin className="size-5 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold">Adres dostawy</h2>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Ulica i numer</Label>
                    <Input
                      id="address"
                      name="address"
                      required
                      value={form.address}
                      onChange={handleChange}
                      placeholder="ul. Przykładowa 123/4"
                      className="h-12"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="postcode">Kod pocztowy</Label>
                      <Input
                        id="postcode"
                        name="postcode"
                        required
                        value={form.postcode}
                        onChange={handleChange}
                        placeholder="00-000"
                        className="h-12"
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="city">Miasto</Label>
                      <Input
                        id="city"
                        name="city"
                        required
                        value={form.city}
                        onChange={handleChange}
                        placeholder="Warszawa"
                        className="h-12"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="bg-card rounded-2xl border p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <CreditCard className="size-5 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold">Metoda płatności</h2>
                </div>

                <div className="border-2 border-primary rounded-xl p-4 bg-primary/5">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    </div>
                    <span className="font-medium">Płatność przy odbiorze</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2 ml-8">
                    Zapłać gotówką lub kartą kurierowi przy odbiorze przesyłki
                  </p>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="bg-destructive/10 text-destructive p-4 rounded-xl border border-destructive/20">
                  {error}
                </div>
              )}

              {/* Submit button - mobile */}
              <div className="lg:hidden">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-14 text-base"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-5 mr-2 animate-spin" />
                      Przetwarzanie...
                    </>
                  ) : (
                    <>
                      <Lock className="size-5 mr-2" />
                      Zamawiam i płacę {formatPrice(total)}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Order summary - 1 column */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-2xl border p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-6">Twoje zamówienie</h2>

              {/* Items */}
              <div className="space-y-4 max-h-[300px] overflow-y-auto">
                {items.map((item) => (
                  <div
                    key={`${item.product.id}-${item.productAttributeId}`}
                    className="flex gap-4"
                  >
                    <div className="w-16 h-16 bg-muted rounded-xl overflow-hidden flex-shrink-0">
                      {item.product.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                          Brak
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm line-clamp-2">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.quantity} x {formatPrice(item.product.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="border-t mt-6 pt-6 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Produkty ({items.length})</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Dostawa</span>
                  <span className="text-green-600 font-medium">Gratis</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-3 border-t">
                  <span>Do zapłaty</span>
                  <span className="text-primary">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Submit button - desktop */}
              <div className="hidden lg:block mt-6">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-14 text-base"
                  disabled={isSubmitting}
                  onClick={handleSubmit}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-5 mr-2 animate-spin" />
                      Przetwarzanie...
                    </>
                  ) : (
                    <>
                      <Lock className="size-5 mr-2" />
                      Zamawiam i płacę
                    </>
                  )}
                </Button>
              </div>

              {/* Trust badges */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Lock className="size-4" />
                  <span>Bezpieczna płatność</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                  <Truck className="size-4" />
                  <span>Darmowa dostawa od 100 zł</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
