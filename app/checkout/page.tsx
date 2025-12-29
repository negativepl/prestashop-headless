"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShoppingBag, Loader2, Lock, Truck, CreditCard, User, MapPin, Phone, Mail,
  ChevronDown, Check, Package, Banknote, Wallet, Building2, Tag
} from "lucide-react";
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

type AccordionSection = "contact" | "shipping" | "delivery" | "payment";

const SHIPPING_METHODS = [
  { id: "courier", name: "Kurier DPD", price: 14.99, time: "1-2 dni robocze", icon: Truck },
  { id: "inpost", name: "Paczkomat InPost", price: 12.99, time: "1-2 dni robocze", icon: Package },
  { id: "courier-express", name: "Kurier Express", price: 24.99, time: "Następny dzień roboczy", icon: Truck },
  { id: "pickup", name: "Odbiór osobisty", price: 0, time: "Dostępny od ręki", icon: Building2 },
];

const PAYMENT_METHODS = [
  { id: "cod", name: "Płatność przy odbiorze", description: "Zapłać gotówką lub kartą kurierowi", icon: Banknote },
  { id: "blik", name: "BLIK", description: "Szybka płatność kodem BLIK", icon: Wallet },
  { id: "card", name: "Karta płatnicza", description: "Visa, Mastercard, Maestro", icon: CreditCard },
  { id: "transfer", name: "Przelew online", description: "Płatność przez Twój bank", icon: Building2 },
  { id: "installments", name: "Raty PayU", description: "Kup teraz, zapłać później", icon: Wallet },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState<AccordionSection>("contact");
  const [completedSections, setCompletedSections] = useState<Set<AccordionSection>>(new Set());
  const [selectedShipping, setSelectedShipping] = useState("courier");
  const [selectedPayment, setSelectedPayment] = useState("cod");
  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);

  const [form, setForm] = useState<CheckoutForm>({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postcode: "",
    phone: "",
  });

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

  const toggleSection = (section: AccordionSection) => {
    setOpenSection(openSection === section ? section : section);
  };

  const markSectionComplete = (section: AccordionSection, nextSection?: AccordionSection) => {
    setCompletedSections((prev) => new Set([...prev, section]));
    if (nextSection) {
      setOpenSection(nextSection);
    }
  };

  const selectedShippingMethod = SHIPPING_METHODS.find(m => m.id === selectedShipping);
  const FREE_SHIPPING_THRESHOLD = 100;
  const isFreeShipping = total >= FREE_SHIPPING_THRESHOLD;
  const shippingCost = isFreeShipping ? 0 : (selectedShippingMethod?.price || 0);
  const finalTotal = total + shippingCost;

  const handleApplyDiscount = () => {
    if (discountCode.trim()) {
      // TODO: Validate discount code with API
      setDiscountApplied(true);
    }
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
          shippingMethod: selectedShipping,
          paymentMethod: selectedPayment,
          discountCode: discountApplied ? discountCode : null,
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
          <h1 className="text-xl md:text-2xl font-bold">Koszyk jest pusty</h1>
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

  const AccordionHeader = ({
    section,
    icon: Icon,
    title,
    subtitle
  }: {
    section: AccordionSection;
    icon: React.ElementType;
    title: string;
    subtitle?: string;
  }) => {
    const isOpen = openSection === section;
    const isCompleted = completedSections.has(section);

    return (
      <button
        type="button"
        onClick={() => toggleSection(section)}
        className={`w-full flex items-center gap-4 p-4 md:p-6 text-left transition-colors ${
          isOpen ? "bg-card" : "bg-card/50 hover:bg-card"
        }`}
      >
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
          isCompleted ? "bg-green-500 text-white" : "bg-primary/10"
        }`}>
          {isCompleted ? <Check className="size-5" /> : <Icon className="size-5 text-primary" />}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold">{title}</h2>
          {subtitle && <p className="text-sm text-muted-foreground truncate">{subtitle}</p>}
        </div>
        <ChevronDown className={`size-5 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
    );
  };

  return (
    <div className="min-h-[80vh] py-4 md:py-8">
      <div className="container">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">Finalizacja zamówienia</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Wypełnij dane i złóż zamówienie
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Accordion Form - 2 columns */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* 1. Contact info */}
              <div className="bg-card rounded-xl border overflow-hidden">
                <AccordionHeader
                  section="contact"
                  icon={User}
                  title="1. Dane kontaktowe"
                  subtitle={completedSections.has("contact") ? `${form.firstName} ${form.lastName}, ${form.email}` : undefined}
                />
                {openSection === "contact" && (
                  <div className="p-4 md:p-6 pt-0 md:pt-0 border-t">
                    <div className="grid md:grid-cols-2 gap-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">Imię</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          required
                          value={form.firstName}
                          onChange={handleChange}
                          placeholder="Jan"
                          className="h-11"
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
                          className="h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            required
                            value={form.email}
                            onChange={handleChange}
                            placeholder="jan@example.com"
                            className="h-11 pl-10"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefon</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            required
                            value={form.phone}
                            onChange={handleChange}
                            placeholder="+48 123 456 789"
                            className="h-11 pl-10"
                          />
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      className="mt-6"
                      onClick={() => markSectionComplete("contact", "shipping")}
                      disabled={!form.firstName || !form.lastName || !form.email || !form.phone}
                    >
                      Dalej
                    </Button>
                  </div>
                )}
              </div>

              {/* 2. Shipping address */}
              <div className="bg-card rounded-xl border overflow-hidden">
                <AccordionHeader
                  section="shipping"
                  icon={MapPin}
                  title="2. Adres dostawy"
                  subtitle={completedSections.has("shipping") ? `${form.address}, ${form.postcode} ${form.city}` : undefined}
                />
                {openSection === "shipping" && (
                  <div className="p-4 md:p-6 pt-0 md:pt-0 border-t">
                    <div className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="address">Ulica i numer</Label>
                        <Input
                          id="address"
                          name="address"
                          required
                          value={form.address}
                          onChange={handleChange}
                          placeholder="ul. Przykładowa 123/4"
                          className="h-11"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="postcode">Kod pocztowy</Label>
                          <Input
                            id="postcode"
                            name="postcode"
                            required
                            value={form.postcode}
                            onChange={handleChange}
                            placeholder="00-000"
                            className="h-11"
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
                            className="h-11"
                          />
                        </div>
                      </div>
                    </div>
                    <Button
                      type="button"
                      className="mt-6"
                      onClick={() => markSectionComplete("shipping", "delivery")}
                      disabled={!form.address || !form.postcode || !form.city}
                    >
                      Dalej
                    </Button>
                  </div>
                )}
              </div>

              {/* 3. Delivery method */}
              <div className="bg-card rounded-xl border overflow-hidden">
                <AccordionHeader
                  section="delivery"
                  icon={Truck}
                  title="3. Sposób dostawy"
                  subtitle={completedSections.has("delivery") ? selectedShippingMethod?.name : undefined}
                />
                {openSection === "delivery" && (
                  <div className="p-4 md:p-6 pt-0 md:pt-0 border-t">
                    <div className="space-y-3 mt-4">
                      {SHIPPING_METHODS.map((method) => {
                        const Icon = method.icon;
                        const isSelected = selectedShipping === method.id;
                        return (
                          <label
                            key={method.id}
                            className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                              isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                            }`}
                          >
                            <input
                              type="radio"
                              name="shipping"
                              value={method.id}
                              checked={isSelected}
                              onChange={(e) => setSelectedShipping(e.target.value)}
                              className="sr-only"
                            />
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              isSelected ? "bg-primary text-white" : "bg-muted"
                            }`}>
                              <Icon className="size-5" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">{method.name}</span>
                                <span className={`font-semibold ${method.price === 0 || isFreeShipping ? "text-green-600" : ""}`}>
                                  {method.price === 0 || isFreeShipping ? "Darmowa" : formatPrice(method.price)}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">{method.time}</p>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              isSelected ? "border-primary" : "border-muted-foreground/30"
                            }`}>
                              {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                    <Button
                      type="button"
                      className="mt-6"
                      onClick={() => markSectionComplete("delivery", "payment")}
                    >
                      Dalej
                    </Button>
                  </div>
                )}
              </div>

              {/* 4. Payment method */}
              <div className="bg-card rounded-xl border overflow-hidden">
                <AccordionHeader
                  section="payment"
                  icon={CreditCard}
                  title="4. Metoda płatności"
                  subtitle={completedSections.has("payment") ? PAYMENT_METHODS.find(m => m.id === selectedPayment)?.name : undefined}
                />
                {openSection === "payment" && (
                  <div className="p-4 md:p-6 pt-0 md:pt-0 border-t">
                    <div className="space-y-3 mt-4">
                      {PAYMENT_METHODS.map((method) => {
                        const Icon = method.icon;
                        const isSelected = selectedPayment === method.id;
                        return (
                          <label
                            key={method.id}
                            className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                              isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                            }`}
                          >
                            <input
                              type="radio"
                              name="payment"
                              value={method.id}
                              checked={isSelected}
                              onChange={(e) => setSelectedPayment(e.target.value)}
                              className="sr-only"
                            />
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              isSelected ? "bg-primary text-white" : "bg-muted"
                            }`}>
                              <Icon className="size-5" />
                            </div>
                            <div className="flex-1">
                              <span className="font-medium">{method.name}</span>
                              <p className="text-sm text-muted-foreground">{method.description}</p>
                            </div>
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              isSelected ? "border-primary" : "border-muted-foreground/30"
                            }`}>
                              {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                    <Button
                      type="button"
                      className="mt-6"
                      onClick={() => markSectionComplete("payment")}
                    >
                      Gotowe
                    </Button>
                  </div>
                )}
              </div>

              {/* Error message */}
              {error && (
                <div className="bg-destructive/10 text-destructive p-4 rounded-xl border border-destructive/20">
                  {error}
                </div>
              )}

              {/* Submit button - mobile */}
              <div className="lg:hidden pt-4">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-14 text-base"
                  disabled={isSubmitting || completedSections.size < 4}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-5 mr-2 animate-spin" />
                      Przetwarzanie...
                    </>
                  ) : (
                    <>
                      <Lock className="size-5 mr-2" />
                      Zamawiam i płacę {formatPrice(finalTotal)}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>

          {/* Order summary - 1 column */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border p-4 md:p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Twoje zamówienie</h2>

              {/* Items */}
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={`${item.product.id}-${item.productAttributeId}`}
                    className="flex gap-3"
                  >
                    <div className="w-14 h-14 bg-muted rounded-lg overflow-hidden flex-shrink-0">
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
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {item.quantity} x {formatPrice(item.product.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Discount code */}
              <div className="border-t mt-4 pt-4">
                <Label htmlFor="discount" className="text-sm font-medium flex items-center gap-2 mb-2">
                  <Tag className="size-4" />
                  Kod rabatowy
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="discount"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder="Wpisz kod"
                    className="h-10"
                    disabled={discountApplied}
                  />
                  <Button
                    type="button"
                    variant={discountApplied ? "secondary" : "outline"}
                    onClick={handleApplyDiscount}
                    disabled={discountApplied || !discountCode.trim()}
                    className="h-10 px-4"
                  >
                    {discountApplied ? <Check className="size-4" /> : "Zastosuj"}
                  </Button>
                </div>
                {discountApplied && (
                  <p className="text-xs text-green-600 mt-1">Kod rabatowy został zastosowany</p>
                )}
              </div>

              {/* Summary */}
              <div className="border-t mt-4 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Produkty ({items.length})</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Dostawa</span>
                  <span className={shippingCost === 0 ? "text-green-600 font-medium" : ""}>
                    {shippingCost === 0 ? "Gratis" : formatPrice(shippingCost)}
                  </span>
                </div>
                {!isFreeShipping && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Do darmowej dostawy brakuje {formatPrice(FREE_SHIPPING_THRESHOLD - total)}</span>
                      <span className="text-muted-foreground">{formatPrice(FREE_SHIPPING_THRESHOLD)}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((total / FREE_SHIPPING_THRESHOLD) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
                {discountApplied && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Rabat</span>
                    <span>-{formatPrice(0)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                  <span>Do zapłaty</span>
                  <span className="text-primary">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Submit button - desktop */}
              <div className="hidden lg:block mt-6">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-12 text-base"
                  disabled={isSubmitting || completedSections.size < 4}
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
                {completedSections.size < 4 && (
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Wypełnij wszystkie sekcje aby złożyć zamówienie
                  </p>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
