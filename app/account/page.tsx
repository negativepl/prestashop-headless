import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, ChevronRight, ShoppingBag, User, MapPin, Download, Shield, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { binshops } from "@/lib/binshops/client";
import { getSession } from "@/lib/auth/session";
import { AddAddressDialog } from "@/components/account/add-address-dialog";
import { AddressCard } from "@/components/account/address-card";
import { EditProfileDialog } from "@/components/account/edit-profile-dialog";
import { ChangePasswordDialog } from "@/components/account/change-password-dialog";
import { ExportDataButtons } from "@/components/account/export-data-buttons";
import type { Order, Address } from "@/lib/prestashop/types";

export const dynamic = "force-dynamic";

function getStatusVariant(statusId: number): "default" | "secondary" | "destructive" | "outline" {
  switch (statusId) {
    case 2:
    case 3:
      return "default";
    case 4:
    case 5:
      return "secondary";
    case 6:
    case 7:
    case 8:
      return "destructive";
    default:
      return "outline";
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("pl-PL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(price);
}

export default async function AccountPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  let orders: Order[] = [];
  let addresses: Address[] = [];
  let customer: { id: number; email: string; firstName: string; lastName: string } | null = null;

  try {
    [orders, addresses, customer] = await Promise.all([
      binshops.getCustomerOrders(),
      binshops.getCustomerAddresses(),
      binshops.getAccountInfo(),
    ]);
  } catch (error) {
    console.error("Error fetching account data:", error);
  }

  // Get recent orders (last 3)
  const recentOrders = orders.slice(0, 3);

  return (
    <div className="container py-8 md:py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Moje konto</h1>
          <p className="text-muted-foreground mt-2">
            Zarządzaj swoim kontem i zamówieniami
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="space-y-6">
            {/* User info card */}
            <div className="bg-card rounded-2xl border p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <User className="size-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold">Moje dane osobowe</h2>
                  <p className="text-sm text-muted-foreground">Twoje informacje</p>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                {customer?.firstName && customer?.lastName && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Imię i nazwisko</span>
                    <span>{customer.firstName} {customer.lastName}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="truncate ml-2">{session.email}</span>
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <EditProfileDialog
                  currentEmail={session.email}
                  currentFirstName={customer?.firstName}
                  currentLastName={customer?.lastName}
                />
                <ChangePasswordDialog />
              </div>
            </div>

            {/* Addresses */}
            <div className="bg-card rounded-2xl border p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <MapPin className="size-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold">Adresy</h2>
                  <p className="text-sm text-muted-foreground">Adresy dostawy i rozliczeniowe</p>
                </div>
              </div>

              {addresses.length > 0 ? (
                <div className="space-y-3">
                  {addresses.map((address) => (
                    <AddressCard key={address.id} address={address} />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mb-4">
                  Nie masz jeszcze zapisanych adresów
                </p>
              )}

              <div className="mt-4">
                <AddAddressDialog />
              </div>
            </div>

            {/* Quick links */}
            <div className="bg-card rounded-2xl border p-6">
              <h2 className="font-semibold mb-4">Szybkie linki</h2>
              <div className="space-y-2">
                <Link
                  href="/account/orders"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Package className="size-5 text-muted-foreground" />
                    <span>Wszystkie zamówienia</span>
                  </div>
                  <ChevronRight className="size-5 text-muted-foreground" />
                </Link>
                <Link
                  href="/favorites"
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="size-5 text-muted-foreground" />
                    <span>Ulubione produkty</span>
                  </div>
                  <ChevronRight className="size-5 text-muted-foreground" />
                </Link>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Orders */}
            <div className="bg-card rounded-2xl border p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Package className="size-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold">Ostatnie zamówienia</h2>
                    <p className="text-sm text-muted-foreground">{orders.length} zamówień łącznie</p>
                  </div>
                </div>
                {orders.length > 3 && (
                  <Link href="/account/orders">
                    <Button variant="outline" size="sm">
                      Zobacz wszystkie
                    </Button>
                  </Link>
                )}
              </div>

              {recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/account/orders/${order.id}`}
                      className="block p-4 rounded-xl border hover:border-foreground/20 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="font-medium">#{order.reference}</span>
                          <Badge variant={getStatusVariant(order.statusId)} className="text-xs">
                            {order.status}
                          </Badge>
                        </div>
                        <span className="font-semibold text-primary">{formatPrice(order.totalPaid)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>{formatDate(order.dateAdd)}</span>
                        <span>{order.items.length} {order.items.length === 1 ? "produkt" : order.items.length < 5 ? "produkty" : "produktów"}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="size-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-4">Nie masz jeszcze żadnych zamówień</p>
                  <Link href="/products">
                    <Button>Przeglądaj produkty</Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Data Access */}
            <div className="bg-card rounded-2xl border p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Download className="size-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold">Dostęp do moich danych</h2>
                  <p className="text-sm text-muted-foreground">Pobierz kopię swoich danych osobowych</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Możesz w dowolnym momencie uzyskać dostęp do informacji podanych na naszej stronie.
                Kliknij przycisk poniżej, aby automatycznie pobrać kopię swoich danych osobowych.
              </p>
              <ExportDataButtons />
            </div>

            {/* Data Modification Requests */}
            <div className="bg-card rounded-2xl border p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Shield className="size-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold">Wnioski o poprawianie i usuwanie danych</h2>
                  <p className="text-sm text-muted-foreground">RODO - Twoje prawa</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Masz prawo do modyfikowania wszelkich swoich danych osobowych zawartych na stronie „Moje konto".
                W przypadku wszelkich innych wniosków dotyczących poprawiania oraz/lub usuwania danych osobowych,
                prosimy o kontakt przez naszą stronę kontaktową. Przeanalizujemy Twój wniosek i odpowiemy najszybciej jak to możliwe.
              </p>
              <Link href="/contact">
                <Button variant="outline" size="sm">
                  <Mail className="size-4" />
                  Skontaktuj się z nami
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
  );
}
