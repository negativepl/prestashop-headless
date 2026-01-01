"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { InPostPickerModal } from "@/components/checkout/inpost-picker-modal";
import {
  ShoppingBag, Loader2, Lock, Truck, CreditCard, User, MapPin, Phone, Mail,
  Check, Package, Banknote, Wallet, Building2, Tag, Shield, Clock,
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
        time: "1-2 dni",
        icon: Package,
        description: "Odbiór 24/7 w wybranym paczkomacie",
        popular: true,
        requiresPointSelection: true,
        pointType: "inpost"
      },
      {
        id: "zabka",
        name: "Odbiór w Żabce",
        price: 9.99,
        time: "1-2 dni",
        icon: Store,
        description: "Odbierz w najbliższym sklepie Żabka",
        requiresPointSelection: true,
        pointType: "zabka"
      },
      {
        id: "orlen_paczka",
        name: "Orlen Paczka",
        price: 8.99,
        time: "1-3 dni",
        icon: Fuel,
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
        time: "1-2 dni",
        icon: Truck,
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
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [notes, setNotes] = useState("");

  // Pickup point selection
  const [pickupPointType, setPickupPointType] = useState<"inpost" | "zabka" | "orlen" | null>(null);
  const [selectedPickupPoint, setSelectedPickupPoint] = useState<PickupPoint | null>(null);
  const [pickupPointSearch, setPickupPointSearch] = useState("");
  const [showInPostWidget, setShowInPostWidget] = useState(false);

  // Delivery address option
  const [useDifferentDeliveryAddress, setUseDifferentDeliveryAddress] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState({
    address: "",
    city: "",
    postcode: "",
  });

  // Handle InPost point selection
  const handleInPostPointSelect = (point: {
    id: string;
    name: string;
    address: string;
    city: string;
    postcode: string;
  }) => {
    setSelectedPickupPoint(point);
    setShowInPostWidget(false);
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

  const selectedShippingMethod = ALL_SHIPPING_METHODS.find(m => m.id === selectedShipping);
  const selectedPaymentMethod = PAYMENT_METHODS.find(m => m.id === selectedPayment);
  const FREE_SHIPPING_THRESHOLD = 100;
  const isFreeShipping = total >= FREE_SHIPPING_THRESHOLD;
  const shippingCost = isFreeShipping ? 0 : (selectedShippingMethod?.price || 0);
  const paymentSurcharge = selectedPaymentMethod?.surcharge || 0;
  const finalTotal = total + shippingCost + paymentSurcharge;

  const isFormValid = form.email && form.firstName && form.lastName &&
    form.address && form.city && form.postcode && form.phone;

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) return;
    setIsApplyingDiscount(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    setDiscountApplied(true);
    setIsApplyingDiscount(false);
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
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
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
                          onChange={handleChange}
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
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
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
                                        setPickupPointType(method.pointType || null);
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
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                      isSelected ? "bg-primary text-white" : "bg-muted"
                                    }`}>
                                      <Icon className="size-5" />
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
                                      <div className="flex items-center gap-1.5 mt-2">
                                        <Clock className="size-3 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">{method.time}</span>
                                      </div>

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
                                              className="w-full h-12 gap-2 bg-background"
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

                                        {/* Other providers - Search + list */}
                                        {method.pointType !== "inpost" && (
                                          <>
                                            <div className="relative mb-3">
                                              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                              <Input
                                                placeholder="Wpisz miasto lub kod pocztowy..."
                                                value={pickupPointSearch}
                                                onChange={(e) => setPickupPointSearch(e.target.value)}
                                                className="pl-10 h-10 bg-background"
                                              />
                                            </div>

                                            {/* Points list */}
                                            <div className="grid sm:grid-cols-2 gap-2 max-h-[240px] overflow-y-auto">

                                          {method.pointType === "zabka" && [
                                            { id: "ZAB001", name: "Żabka - Centrum", address: "ul. Nowy Świat 15", city: "Warszawa", postcode: "00-029" },
                                            { id: "ZAB002", name: "Żabka - Mokotów", address: "ul. Puławska 150", city: "Warszawa", postcode: "02-624" },
                                            { id: "ZAB003", name: "Żabka - Wola", address: "ul. Wolska 80", city: "Warszawa", postcode: "01-141" },
                                            { id: "ZAB004", name: "Żabka - Praga", address: "ul. Targowa 20", city: "Warszawa", postcode: "03-731" },
                                          ].map((point) => (
                                            <button
                                              key={point.id}
                                              type="button"
                                              onClick={() => setSelectedPickupPoint(point)}
                                              className={`p-3 rounded-lg border text-left transition-all ${
                                                selectedPickupPoint?.id === point.id
                                                  ? "border-green-500 bg-green-50"
                                                  : "bg-background hover:border-green-300"
                                              }`}
                                            >
                                              <div className="flex items-start gap-2">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                                  selectedPickupPoint?.id === point.id ? "bg-green-500 text-white" : "bg-green-100"
                                                }`}>
                                                  <Store className={`size-4 ${selectedPickupPoint?.id === point.id ? "" : "text-green-600"}`} />
                                                </div>
                                                <div className="min-w-0">
                                                  <p className="font-medium text-sm">{point.name}</p>
                                                  <p className="text-xs text-muted-foreground truncate">{point.address}</p>
                                                  <p className="text-xs text-muted-foreground">{point.postcode} {point.city}</p>
                                                </div>
                                              </div>
                                            </button>
                                          ))}

                                          {method.pointType === "orlen" && [
                                            { id: "ORL001", name: "Orlen - Centrum", address: "ul. Jana Pawła II 20", city: "Warszawa", postcode: "00-133" },
                                            { id: "ORL002", name: "Orlen - Ursynów", address: "ul. Rosoła 50", city: "Warszawa", postcode: "02-786" },
                                            { id: "ORL003", name: "Orlen - Bemowo", address: "ul. Górczewska 200", city: "Warszawa", postcode: "01-460" },
                                            { id: "ORL004", name: "Orlen - Bielany", address: "ul. Marymoncka 100", city: "Warszawa", postcode: "01-813" },
                                          ].map((point) => (
                                            <button
                                              key={point.id}
                                              type="button"
                                              onClick={() => setSelectedPickupPoint(point)}
                                              className={`p-3 rounded-lg border text-left transition-all ${
                                                selectedPickupPoint?.id === point.id
                                                  ? "border-red-500 bg-red-50"
                                                  : "bg-background hover:border-red-300"
                                              }`}
                                            >
                                              <div className="flex items-start gap-2">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                                  selectedPickupPoint?.id === point.id ? "bg-red-500 text-white" : "bg-red-100"
                                                }`}>
                                                  <Fuel className={`size-4 ${selectedPickupPoint?.id === point.id ? "" : "text-red-600"}`} />
                                                </div>
                                                <div className="min-w-0">
                                                  <p className="font-medium text-sm">{point.name}</p>
                                                  <p className="text-xs text-muted-foreground truncate">{point.address}</p>
                                                  <p className="text-xs text-muted-foreground">{point.postcode} {point.city}</p>
                                                </div>
                                              </div>
                                            </button>
                                          ))}
                                            </div>
                                          </>
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
                                            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                              !useDifferentDeliveryAddress
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-background border hover:bg-muted"
                                            }`}
                                          >
                                            Wyślij pod mój adres
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => setUseDifferentDeliveryAddress(true)}
                                            className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                              useDifferentDeliveryAddress
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-background border hover:bg-muted"
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
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
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
                  <h2 className="font-semibold text-lg flex items-center gap-2">
                    <ShoppingBag className="size-5" />
                    Podsumowanie ({items.length})
                  </h2>
                </div>

                {/* Items list */}
                <div className="p-4 max-h-[280px] overflow-y-auto">
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div
                        key={`${item.product.id}-${item.productAttributeId}`}
                        className="flex gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="relative flex-shrink-0">
                          <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden">
                            {item.product.imageUrl ? (
                              <Image
                                src={item.product.imageUrl}
                                alt={item.product.name}
                                fill
                                className="object-cover"
                              />
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
                          <p className="font-medium text-sm line-clamp-2">{item.product.name}</p>
                          <p className="text-sm text-primary font-semibold mt-1">
                            {formatPrice(item.product.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Discount code */}
                <div className="px-4 pb-4">
                  <div className="p-3 bg-muted/50 rounded-xl">
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
                        variant={discountApplied ? "default" : "outline"}
                        onClick={() => {
                          if (discountApplied) {
                            setDiscountApplied(false);
                            setDiscountCode("");
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
                      <AnimatePresence>
                        {discountApplied && (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="text-xs text-green-600 flex items-center gap-1"
                          >
                            <Check className="size-3" />
                            Kod rabatowy został zastosowany
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* Price breakdown */}
                <div className="px-4 pb-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Produkty</span>
                      <span className="font-medium">{formatPrice(total)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dostawa</span>
                      <span className={`font-medium ${shippingCost === 0 ? "text-green-600" : ""}`}>
                        {shippingCost === 0 ? "Gratis" : formatPrice(shippingCost)}
                      </span>
                    </div>
                    {paymentSurcharge > 0 && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Opłata za pobranie</span>
                        <span className="font-medium">{formatPrice(paymentSurcharge)}</span>
                      </div>
                    )}
                    {discountApplied && (
                      <div className="flex justify-between text-green-600">
                        <span>Rabat</span>
                        <span className="font-medium">-{formatPrice(0)}</span>
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
                <div className="p-4 bg-muted/50 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-lg">Do zapłaty</span>
                    <span className="text-2xl font-bold text-primary">{formatPrice(finalTotal)}</span>
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

                {/* Trust badges */}
                <div className="p-4 border-t">
                  <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Shield className="size-4" />
                      <span>Bezpieczne płatności</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Lock className="size-4" />
                      <span>SSL 256-bit</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </form>

        {/* InPost Picker Modal */}
        <InPostPickerModal
          isOpen={showInPostWidget}
          onClose={() => setShowInPostWidget(false)}
          onSelect={handleInPostPointSelect}
        />
      </div>
    </div>
  );
}
