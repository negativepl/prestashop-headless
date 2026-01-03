"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { PointPickerModal } from "@/components/checkout/point-picker-modal";
import {
  ShoppingBag, Loader2, Lock, Truck, CreditCard, User, MapPin, Phone, Mail,
  Check, Package, Banknote, Wallet, Building2, Tag, Shield,
  X, ChevronRight, Gift, ArrowLeft, Store, Fuel, Map, MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/hooks/use-cart";
import { motion, AnimatePresence } from "framer-motion";

interface CheckoutForm {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postcode: string;
  phone: string;
}

interface PickupPoint {
  id: string;
  name: string;
  address: string;
  city: string;
  postcode: string;
  openingHours?: string;
}

interface ShippingMethod {
  id: string;
  name: string;
  price: number;
  time: string;
  icon: React.ComponentType<{ className?: string }>;
  logo?: string;
  description: string;
  popular?: boolean;
  requiresPointSelection?: boolean;
  pointType?: "inpost" | "zabka" | "orlen";
}

interface ShippingGroup {
  label: string;
  methods: ShippingMethod[];
}

const SHIPPING_GROUPS: ShippingGroup[] = [
  {
    label: "Punkty odbioru",
    methods: [
      {
        id: "inpost_locker",
        name: "Paczkomat® InPost",
        price: 11.99,
        time: "Jutro",
        icon: Package,
        logo: "/images/carriers/inpost-paczkomat.png",
        description: "Odbiór 24/7 w wybranym paczkomacie",
        popular: true,
        requiresPointSelection: true,
        pointType: "inpost"
      },
      {
        id: "zabka",
        name: "Odbiór w Żabce",
        price: 9.99,
        time: "Jutro",
        icon: Store,
        logo: "/images/carriers/zabka.png",
        description: "Odbierz w najbliższym sklepie Żabka",
        requiresPointSelection: true,
        pointType: "zabka"
      },
      {
        id: "orlen_paczka",
        name: "Orlen Paczka",
        price: 8.99,
        time: "Jutro",
        icon: Fuel,
        logo: "/images/carriers/orlen-paczka.png",
        description: "Odbierz na stacji Orlen",
        requiresPointSelection: true,
        pointType: "orlen"
      },
    ]
  },
  {
    label: "Pod adres",
    methods: [
      {
        id: "inpost_courier",
        name: "Kurier InPost",
        price: 13.99,
        time: "Jutro",
        icon: Truck,
        logo: "/images/carriers/inpost-kurier.png",
        description: "Dostawa pod wskazany adres"
      },
    ]
  },
  {
    label: "Odbiór osobisty",
    methods: [
      {
        id: "pickup",
        name: "Odbiór osobisty",
        price: 0,
        time: "Od ręki",
        icon: Building2,
        description: "Odbierz w naszym punkcie"
      },
    ]
  },
];

// Flatten for easy lookup
const ALL_SHIPPING_METHODS = SHIPPING_GROUPS.flatMap(g => g.methods);

/**
 * Helper function to get estimated delivery day
 *
 * TODO: Rozszerzyć o:
 * - Czas wysyłki produktu (np. "wysyłka w 24h", "wysyłka w 2-3 dni")
 * - Dostępność magazynowa produktu
 * - Godziny cut-off dla różnych przewoźników
 * - Święta i dni wolne od pracy
 * - Wyświetlanie na stronach produktów
 */
function getEstimatedDeliveryDay(): string {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const hour = now.getHours();

  // Cutoff time - orders after 14:00 are processed next business day
  const cutoffPassed = hour >= 14;

  // Calculate days until delivery
  // Logic: Order must be PACKED on a business day, then DELIVERED next business day
  let daysToAdd = 1;

  if (dayOfWeek === 6) {
    // Saturday -> packed Monday -> delivered Tuesday (3 days)
    daysToAdd = 3;
  } else if (dayOfWeek === 0) {
    // Sunday -> packed Monday -> delivered Tuesday (2 days)
    daysToAdd = 2;
  } else if (dayOfWeek === 5) {
    // Friday before cutoff -> packed Friday -> delivered Monday (3 days)
    // Friday after cutoff -> packed Monday -> delivered Tuesday (4 days)
    daysToAdd = cutoffPassed ? 4 : 3;
  } else if (dayOfWeek === 4 && cutoffPassed) {
    // Thursday after cutoff -> packed Friday -> delivered Monday (4 days)
    daysToAdd = 4;
  } else if (cutoffPassed) {
    // Mon-Wed after cutoff -> packed next day -> delivered day after (2 days)
    daysToAdd = 2;
  }
  // Mon-Thu before cutoff -> packed today -> delivered tomorrow (1 day) - default

  const deliveryDate = new Date(now);
  deliveryDate.setDate(deliveryDate.getDate() + daysToAdd);

  const deliveryDayOfWeek = deliveryDate.getDay();

  // If delivery is tomorrow, return "jutro"
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (deliveryDate.toDateString() === tomorrow.toDateString()) {
    return "jutro";
  }

  // Otherwise return day name
  const dayNames = ["niedziela", "poniedziałek", "wtorek", "środa", "czwartek", "piątek", "sobota"];
  return dayNames[deliveryDayOfWeek];
}

const PAYMENT_METHODS = [
  {
    id: "blik_p24",
    name: "BLIK / Przelewy24",
    description: "BLIK lub przelew online",
    icon: Building2,
    popular: true
  },
  {
    id: "card",
    name: "Zapłać kartą",
    description: "Visa, Mastercard, Maestro",
    icon: CreditCard
  },
  {
    id: "apple_google_pay",
    name: "Apple Pay / Google Pay",
    description: "Szybka płatność mobilna",
    icon: Wallet
  },
  {
    id: "klarna",
    name: "Zapłać Klarna",
    description: "Kup teraz, zapłać później",
    icon: Gift
  },
  {
    id: "cod",
    name: "Płatność przy odbiorze",
    description: "Zapłać kurierowi (+5 zł)",
    icon: Banknote,
    surcharge: 5
  },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, total, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedShipping, setSelectedShipping] = useState("inpost_locker");
  const [selectedPayment, setSelectedPayment] = useState("blik_p24");
  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [appliedVoucherId, setAppliedVoucherId] = useState<number | null>(null);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [notes, setNotes] = useState("");

  // Pickup point selection
  const [selectedPickupPoint, setSelectedPickupPoint] = useState<PickupPoint | null>(null);
  const [showInPostWidget, setShowInPostWidget] = useState(false);
  const [showZabkaWidget, setShowZabkaWidget] = useState(false);
  const [showOrlenWidget, setShowOrlenWidget] = useState(false);

  // Delivery address option
  const [useDifferentDeliveryAddress, setUseDifferentDeliveryAddress] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState({
    address: "",
    city: "",
    postcode: "",
  });

  // Estimated delivery day (calculated on client to avoid hydration mismatch)
  const [estimatedDeliveryDay, setEstimatedDeliveryDay] = useState<string>("jutro");
  useEffect(() => {
    setEstimatedDeliveryDay(getEstimatedDeliveryDay());
  }, []);

  // Handle point selection (for all services)
  const handlePointSelect = (point: {
    id: string;
    name: string;
    address: string;
    city: string;
    postcode: string;
  }) => {
    setSelectedPickupPoint(point);
    setShowInPostWidget(false);
    setShowZabkaWidget(false);
    setShowOrlenWidget(false);
  };

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
        // User not logged in
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
    setError(null);
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters except +
    const cleaned = value.replace(/[^\d+]/g, '');

    // If starts with +48, format as: +48 XXX XXX XXX
    if (cleaned.startsWith('+48')) {
      const digits = cleaned.slice(3);
      const parts = digits.match(/.{1,3}/g) || [];
      return '+48 ' + parts.join(' ').trim();
    }

    // If starts with +, keep it and format rest
    if (cleaned.startsWith('+')) {
      const countryCode = cleaned.slice(0, 3); // e.g., +48
      const digits = cleaned.slice(3);
      const parts = digits.match(/.{1,3}/g) || [];
      return countryCode + ' ' + parts.join(' ').trim();
    }

    // Otherwise just format as XXX XXX XXX
    const parts = cleaned.match(/.{1,3}/g) || [];
    return parts.join(' ');
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setForm({ ...form, phone: formatted });
    setError(null);
  };

  const selectedShippingMethod = ALL_SHIPPING_METHODS.find(m => m.id === selectedShipping);
  const selectedPaymentMethod = PAYMENT_METHODS.find(m => m.id === selectedPayment);
  const FREE_SHIPPING_THRESHOLD = 100;
  const isFreeShipping = total >= FREE_SHIPPING_THRESHOLD;
  const shippingCost = isFreeShipping ? 0 : (selectedShippingMethod?.price || 0);
  const paymentSurcharge = selectedPaymentMethod?.surcharge || 0;
  const finalTotal = Math.max(0, total + shippingCost + paymentSurcharge - discountAmount);

  const isFormValid = form.email && form.firstName && form.lastName &&
    form.address && form.city && form.postcode && form.phone;

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;
    if (items.length === 0) {
      setDiscountError("Dodaj produkty do koszyka przed użyciem kodu");
      return;
    }

    setIsApplyingDiscount(true);
    setDiscountError(null);

    try {
      // Prepare cart items for API
      const cartItems = items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        productAttributeId: item.productAttributeId || 0,
      }));

      const response = await fetch("/api/discount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: discountCode.trim(),
          items: cartItems,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setDiscountError(data.error || "Nieprawidłowy kod rabatowy");
        setDiscountApplied(false);
        setDiscountAmount(0);
        setAppliedVoucherId(null);
      } else {
        setDiscountApplied(true);
        setDiscountAmount(data.totalDiscount || 0);
        setAppliedVoucherId(data.voucher?.id_cart_rule || null);
        setDiscountError(null);
      }
    } catch {
      setDiscountError("Wystąpił błąd podczas aplikowania kodu");
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  const handleRemoveDiscount = () => {
    // Reset local state - no API call needed as we create fresh sessions
    setDiscountApplied(false);
    setDiscountCode("");
    setDiscountAmount(0);
    setDiscountError(null);
    setAppliedVoucherId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      setError("Wypełnij wszystkie wymagane pola");
      return;
    }

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
          notes: notes.trim() || undefined,
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

  // Empty cart view
  if (items.length === 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md mx-auto px-4"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="size-12 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Twój koszyk jest pusty</h1>
          <p className="text-muted-foreground mt-2 mb-8">
            Dodaj produkty do koszyka, aby przejść do finalizacji zamówienia
          </p>
          <Link href="/products">
            <Button size="lg" className="gap-2">
              <ArrowLeft className="size-4" />
              Wróć do sklepu
            </Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="container py-6 md:py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Finalizacja zamówienia</h1>
          <p className="text-muted-foreground mt-2">
            Bezpieczne zakupy z gwarancją satysfakcji
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-5 gap-8">
            {/* Main form - 3 columns */}
            <div className="lg:col-span-3 space-y-6">

              {/* Contact & Address Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card rounded-2xl border shadow-sm overflow-hidden"
              >
                <div className="p-6 border-b bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl border-2 border-primary/30 flex items-center justify-center">
                      <User className="size-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-lg">Dane klienta</h2>
                      <p className="text-sm text-muted-foreground">Dane do kontaktu i faktury</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  {/* Name row */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium">
                        Imię <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        required
                        value={form.firstName}
                        onChange={handleChange}
                        placeholder="Jan"
                        className="h-12 text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium">
                        Nazwisko <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        required
                        value={form.lastName}
                        onChange={handleChange}
                        placeholder="Kowalski"
                        className="h-12 text-base"
                      />
                    </div>
                  </div>

                  {/* Contact row */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={form.email}
                          onChange={handleChange}
                          placeholder="jan@example.com"
                          className="h-12 text-base pl-11"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium">
                        Telefon <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          required
                          value={form.phone}
                          onChange={handlePhoneChange}
                          placeholder="+48 123 456 789"
                          className="h-12 text-base pl-11"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-border" />

                  {/* Address */}
                  <div className="space-y-2 pt-1">
                    <Label htmlFor="address" className="text-sm font-medium">
                      Adres zamieszkania <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="address"
                      name="address"
                      required
                      value={form.address}
                      onChange={handleChange}
                      placeholder="ul. Przykładowa 123/4"
                      className="h-12 text-base"
                    />
                  </div>

                  {/* City row */}
                  <div className="grid grid-cols-5 gap-4">
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="postcode" className="text-sm font-medium">
                        Kod pocztowy <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="postcode"
                        name="postcode"
                        required
                        value={form.postcode}
                        onChange={handleChange}
                        placeholder="00-000"
                        className="h-12 text-base"
                      />
                    </div>
                    <div className="col-span-3 space-y-2">
                      <Label htmlFor="city" className="text-sm font-medium">
                        Miasto <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="city"
                        name="city"
                        required
                        value={form.city}
                        onChange={handleChange}
                        placeholder="Warszawa"
                        className="h-12 text-base"
                      />
                    </div>
                  </div>

                  <div className="h-px bg-border" />

                  {/* Customer notes */}
                  <div className="space-y-2 pt-1">
                    <Label htmlFor="notes" className="text-sm font-medium flex items-center gap-2">
                      <MessageSquare className="size-4" />
                      Uwagi do zamówienia
                    </Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Dodatkowe informacje, prośby dotyczące dostawy, itp."
                      className="min-h-[80px] text-base resize-none"
                      maxLength={500}
                    />
                    <p className="text-xs text-muted-foreground text-right">
                      {notes.length}/500 znaków
                    </p>
                  </div>

                </div>
              </motion.div>

              {/* Shipping Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card rounded-2xl border shadow-sm overflow-hidden"
              >
                <div className="p-6 border-b bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl border-2 border-primary/30 flex items-center justify-center">
                      <Truck className="size-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-lg">Sposób dostawy</h2>
                      <p className="text-sm text-muted-foreground">
                        {isFreeShipping ? (
                          <span className="text-green-600 font-medium">Darmowa dostawa!</span>
                        ) : (
                          <>Darmowa dostawa od {formatPrice(FREE_SHIPPING_THRESHOLD)}</>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 md:p-6 space-y-6">
                  {SHIPPING_GROUPS.map((group, groupIndex) => {
                    const isPickupGroup = group.label === "Punkty odbioru";

                    return (
                      <div key={group.label}>
                        {groupIndex > 0 && <div className="h-px bg-border -mx-4 md:-mx-6 mb-6" />}
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">{group.label}</h3>
                        <div className="space-y-3">
                          {group.methods.map((method) => {
                            const Icon = method.icon;
                            const isSelected = selectedShipping === method.id;
                            const price = isFreeShipping ? 0 : method.price;
                            const needsPointSelection = method.requiresPointSelection;
                            const hasSelectedPoint = isSelected && selectedPickupPoint;

                            return (
                              <div key={method.id}>
                                <label
                                  className={`relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${
                                    isSelected
                                      ? "border-primary bg-primary/5 shadow-sm"
                                      : "border-border hover:border-primary/40 hover:bg-muted/50"
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name="shipping"
                                    value={method.id}
                                    checked={isSelected}
                                    onChange={(e) => {
                                      setSelectedShipping(e.target.value);
                                      if (needsPointSelection) {
                                        setSelectedPickupPoint(null);
                                      }
                                    }}
                                    className="sr-only"
                                  />

                                  {method.popular && (
                                    <span className="absolute -top-2.5 left-3 px-2 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                                      Popularne
                                    </span>
                                  )}

                                  <div className="flex items-start gap-3">
                                    <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden bg-muted">
                                      {method.logo ? (
                                        <Image
                                          src={method.logo}
                                          alt={method.name}
                                          width={40}
                                          height={40}
                                          className="object-contain"
                                        />
                                      ) : (
                                        <Icon className="size-5" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="font-semibold">{method.name}</span>
                                        <span className={`text-base font-bold ${
                                          price === 0 ? "text-green-600" : "text-primary"
                                        }`}>
                                          {price === 0 ? "Gratis" : formatPrice(price)}
                                        </span>
                                      </div>
                                      <p className="text-xs text-muted-foreground mt-0.5">{method.description}</p>
                                      <p className="text-xs text-muted-foreground mt-2">
                                        Przewidywany czas dostawy: <span className="font-medium text-foreground">{method.time === "Jutro" ? estimatedDeliveryDay : method.time.toLowerCase()}</span>
                                      </p>

                                      {/* Selected pickup point display */}
                                      {hasSelectedPoint && (
                                        <div className="mt-3 pt-3 border-t">
                                          <div className="flex items-start gap-2">
                                            <MapPin className="size-4 text-primary flex-shrink-0 mt-0.5" />
                                            <div className="flex-1 min-w-0">
                                              <p className="text-sm font-medium">{selectedPickupPoint.name}</p>
                                              <p className="text-xs text-muted-foreground">{selectedPickupPoint.address}, {selectedPickupPoint.city}</p>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </label>

                                {/* Pickup Point Selection - directly under tile */}
                                <AnimatePresence>
                                  {isSelected && needsPointSelection && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="mt-3 p-4 bg-muted/50 rounded-xl border">
                                        {/* InPost Picker */}
                                        {method.pointType === "inpost" && (
                                          <div className="space-y-3">
                                            <Button
                                              type="button"
                                              variant="outline"
                                              className="w-full h-12 gap-2 bg-background hover:border-[#FFCD00] hover:bg-[#FFCD00]/5"
                                              onClick={() => setShowInPostWidget(true)}
                                            >
                                              <Map className="size-5" />
                                              Wybierz Paczkomat® na mapie
                                            </Button>
                                            <p className="text-xs text-center text-muted-foreground">
                                              Kliknij aby otworzyć mapę paczkomatów
                                            </p>
                                          </div>
                                        )}

                                        {/* Żabka Picker */}
                                        {method.pointType === "zabka" && (
                                          <div className="space-y-3">
                                            <Button
                                              type="button"
                                              variant="outline"
                                              className="w-full h-12 gap-2 bg-background hover:border-green-500 hover:bg-green-500/5"
                                              onClick={() => setShowZabkaWidget(true)}
                                            >
                                              <Map className="size-5 text-green-600" />
                                              Wybierz punkt Żabka na mapie
                                            </Button>
                                            <p className="text-xs text-center text-muted-foreground">
                                              Kliknij aby otworzyć mapę punktów Żabka
                                            </p>
                                          </div>
                                        )}

                                        {/* Orlen Picker */}
                                        {method.pointType === "orlen" && (
                                          <div className="space-y-3">
                                            <Button
                                              type="button"
                                              variant="outline"
                                              className="w-full h-12 gap-2 bg-background hover:border-red-500 hover:bg-red-500/5"
                                              onClick={() => setShowOrlenWidget(true)}
                                            >
                                              <Map className="size-5 text-red-600" />
                                              Wybierz punkt Orlen na mapie
                                            </Button>
                                            <p className="text-xs text-center text-muted-foreground">
                                              Kliknij aby otworzyć mapę stacji Orlen
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>

                                {/* Courier Address Form - directly under tile */}
                                <AnimatePresence>
                                  {isSelected && method.id === "inpost_courier" && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      exit={{ opacity: 0, height: 0 }}
                                      className="overflow-hidden"
                                    >
                                      <div className="mt-3 p-4 bg-muted/50 rounded-xl border space-y-4">
                                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                          <MapPin className="size-4" />
                                          Adres dostawy
                                        </div>

                                        {/* Address toggle */}
                                        <div className="flex gap-2">
                                          <button
                                            type="button"
                                            onClick={() => setUseDifferentDeliveryAddress(false)}
                                            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                                              !useDifferentDeliveryAddress
                                                ? "bg-primary text-primary-foreground border-primary"
                                                : "bg-background border-border hover:bg-muted"
                                            }`}
                                          >
                                            Wyślij pod mój adres
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setUseDifferentDeliveryAddress(true)}
                                            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                                              useDifferentDeliveryAddress
                                                ? "bg-primary text-primary-foreground border-primary"
                                                : "bg-background border-border hover:bg-muted"
                                            }`}
                                          >
                                            Wyślij pod inny adres
                                          </button>
                                        </div>

                                        {/* Customer address display */}
                                        {!useDifferentDeliveryAddress && (
                                          <div className="p-3 bg-background rounded-lg border">
                                            {form.address && form.city ? (
                                              <div className="flex items-start gap-2">
                                                <MapPin className="size-4 text-primary flex-shrink-0 mt-0.5" />
                                                <div>
                                                  <p className="text-sm font-medium">{form.address}</p>
                                                  <p className="text-xs text-muted-foreground">{form.postcode} {form.city}</p>
                                                </div>
                                              </div>
                                            ) : (
                                              <p className="text-sm text-muted-foreground">
                                                Uzupełnij adres w sekcji &quot;Dane klienta&quot; powyżej
                                              </p>
                                            )}
                                          </div>
                                        )}

                                        {/* Different delivery address form */}
                                        {useDifferentDeliveryAddress && (
                                          <div className="space-y-3">
                                            <Input
                                              placeholder="ul. Przykładowa 123/4"
                                              value={deliveryAddress.address}
                                              onChange={(e) => setDeliveryAddress(prev => ({ ...prev, address: e.target.value }))}
                                              className="h-11 bg-background"
                                            />

                                            <div className="grid grid-cols-5 gap-3">
                                              <Input
                                                placeholder="00-000"
                                                value={deliveryAddress.postcode}
                                                onChange={(e) => setDeliveryAddress(prev => ({ ...prev, postcode: e.target.value }))}
                                                className="col-span-2 h-11 bg-background"
                                              />
                                              <Input
                                                placeholder="Miasto"
                                                value={deliveryAddress.city}
                                                onChange={(e) => setDeliveryAddress(prev => ({ ...prev, city: e.target.value }))}
                                                className="col-span-3 h-11 bg-background"
                                              />
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Payment Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-card rounded-2xl border shadow-sm overflow-hidden"
              >
                <div className="p-6 border-b bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl border-2 border-primary/30 flex items-center justify-center">
                      <CreditCard className="size-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-lg">Metoda płatności</h2>
                      <p className="text-sm text-muted-foreground">Wybierz preferowany sposób płatności</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 md:p-6">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {PAYMENT_METHODS.map((method) => {
                      const Icon = method.icon;
                      const isSelected = selectedPayment === method.id;

                      return (
                        <label
                          key={method.id}
                          className={`relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all ${
                            isSelected
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-border hover:border-primary/40 hover:bg-muted/50"
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

                          {method.popular && (
                            <span className="absolute -top-2.5 left-3 px-2 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                              Popularne
                            </span>
                          )}

                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              isSelected ? "bg-primary text-white" : "bg-muted"
                            }`}>
                              <Icon className="size-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="font-semibold block">{method.name}</span>
                              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                                {method.description}
                              </p>
                            </div>
                          </div>

                        </label>
                      );
                    })}
                  </div>
                </div>
              </motion.div>

            </div>

            {/* Order Summary - 2 columns */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card rounded-2xl border shadow-sm sticky top-24"
              >
                {/* Summary header */}
                <div className="p-6 border-b bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl border-2 border-primary/30 flex items-center justify-center">
                      <ShoppingBag className="size-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-lg">Podsumowanie</h2>
                      <p className="text-sm text-muted-foreground">{items.length} {items.length === 1 ? 'produkt' : items.length < 5 ? 'produkty' : 'produktów'} w koszyku</p>
                    </div>
                  </div>
                </div>

                {/* Items list */}
                <div className="p-4 max-h-[280px] overflow-y-auto">
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div
                        key={`${item.product.id}-${item.productAttributeId}`}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="relative flex-shrink-0">
                          <div className="w-16 h-16 bg-white rounded-xl border border-border/50 p-1.5">
                            {item.product.imageUrl ? (
                              <div className="relative w-full h-full">
                                <Image
                                  src={item.product.imageUrl}
                                  alt={item.product.name}
                                  fill
                                  className="object-contain rounded-lg"
                                />
                              </div>
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="size-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary text-primary-foreground text-xs font-medium rounded-full flex items-center justify-center shadow-sm">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-base line-clamp-2">{item.product.name}</p>
                        </div>
                        <p className="text-base text-primary font-semibold flex-shrink-0">
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Discount code */}
                <div className="px-4 pb-4">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        id="discount"
                        value={discountCode}
                        onChange={(e) => {
                          setDiscountCode(e.target.value);
                          if (discountError) setDiscountError(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !discountApplied && discountCode.trim()) {
                            e.preventDefault();
                            handleApplyDiscount();
                          }
                        }}
                        placeholder="Kod rabatowy"
                        className={`h-10 pl-9 ${discountError ? "border-red-500" : ""}`}
                        disabled={discountApplied || isApplyingDiscount}
                      />
                    </div>
                    <Button
                      type="button"
                      variant={discountApplied ? "default" : "outline"}
                      onClick={() => {
                        if (discountApplied) {
                          handleRemoveDiscount();
                        } else {
                          handleApplyDiscount();
                        }
                      }}
                      disabled={!discountApplied && (!discountCode.trim() || isApplyingDiscount)}
                      className={`h-10 px-4 min-w-[90px] ${discountApplied ? "bg-green-600 hover:bg-green-700 text-white" : ""}`}
                    >
                      {isApplyingDiscount ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : discountApplied ? (
                        <X className="size-4" />
                      ) : (
                        "Zastosuj"
                      )}
                    </Button>
                  </div>
                  <div className="h-5 mt-2">
                    <AnimatePresence mode="wait">
                      {discountApplied && (
                        <motion.p
                          key="success"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-xs text-green-600 flex items-center gap-1"
                        >
                          <Check className="size-3" />
                          Kod rabatowy został dodany
                        </motion.p>
                      )}
                      {discountError && !discountApplied && (
                        <motion.p
                          key="error"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-xs text-red-500"
                        >
                          {discountError}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Price breakdown */}
                <div className="px-4 pb-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-base">
                      <span className="text-muted-foreground">Produkty</span>
                      <span className="font-medium">{formatPrice(total)}</span>
                    </div>
                    <div className="flex justify-between text-base">
                      <span className="text-muted-foreground">Dostawa</span>
                      <span className={`font-medium ${shippingCost === 0 ? "text-green-600" : ""}`}>
                        {shippingCost === 0 ? "Gratis" : formatPrice(shippingCost)}
                      </span>
                    </div>
                    {paymentSurcharge > 0 && (
                      <div className="flex justify-between text-base">
                        <span className="text-muted-foreground">Opłata za pobranie</span>
                        <span className="font-medium">{formatPrice(paymentSurcharge)}</span>
                      </div>
                    )}
                    {discountApplied && discountAmount > 0 && (
                      <div className="flex justify-between text-base text-green-600">
                        <span>Kod rabatowy</span>
                        <span className="font-medium">-{formatPrice(discountAmount)}</span>
                      </div>
                    )}

                    {/* Free shipping progress */}
                    {!isFreeShipping && (
                      <div className="pt-2">
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-muted-foreground">
                            Do darmowej dostawy brakuje Ci {formatPrice(FREE_SHIPPING_THRESHOLD - total)}
                          </span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((total / FREE_SHIPPING_THRESHOLD) * 100, 100)}%` }}
                            className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Total */}
                <div className="p-5 bg-muted/50 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-xl">Do zapłaty</span>
                    <span className="text-3xl font-bold text-primary">{formatPrice(finalTotal)}</span>
                  </div>
                </div>

                {/* Submit button */}
                <div className="p-4 space-y-3">
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm flex items-start gap-2"
                      >
                        <X className="size-4 flex-shrink-0 mt-0.5" />
                        {error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-14 text-base font-semibold gap-2 shadow-lg shadow-primary/25"
                    disabled={isSubmitting || !isFormValid}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="size-5 animate-spin" />
                        Przetwarzanie zamówienia...
                      </>
                    ) : (
                      <>
                        <Lock className="size-5" />
                        Zamawiam i płacę
                        <ChevronRight className="size-5" />
                      </>
                    )}
                  </Button>

                  {!isFormValid && (
                    <p className="text-xs text-muted-foreground text-center">
                      Wypełnij wszystkie wymagane pola, aby złożyć zamówienie
                    </p>
                  )}
                </div>

              </motion.div>
            </div>
          </div>
        </form>

        {/* Point Picker Modals - only render when open to reset state each time */}
        {showInPostWidget && (
          <PointPickerModal
            isOpen={showInPostWidget}
            onClose={() => setShowInPostWidget(false)}
            onSelect={handlePointSelect}
            service="inpost"
          />
        )}
        {showZabkaWidget && (
          <PointPickerModal
            isOpen={showZabkaWidget}
            onClose={() => setShowZabkaWidget(false)}
            onSelect={handlePointSelect}
            service="zabka"
          />
        )}
        {showOrlenWidget && (
          <PointPickerModal
            isOpen={showOrlenWidget}
            onClose={() => setShowOrlenWidget(false)}
            onSelect={handlePointSelect}
            service="orlen"
          />
        )}
      </div>
    </div>
  );
}
