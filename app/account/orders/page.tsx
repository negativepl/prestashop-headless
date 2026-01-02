import { redirect } from "next/navigation";
import Link from "next/link";
import { Package, ChevronRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { binshops } from "@/lib/binshops/client";
import { getSession } from "@/lib/auth/session";
import type { Order } from "@/lib/prestashop/types";

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
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
  }).format(price);
}

export default async function OrdersPage() {
  // Verify session with JWT
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  let orders: Order[] = [];
  try {
    orders = await binshops.getCustomerOrders();
  } catch (error) {
    console.error("Error fetching orders:", error);
  }

  return (
    <div className="min-h-[80vh] py-8">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Moje zamówienia</h1>
          <p className="text-muted-foreground mt-2">
            Historia wszystkich Twoich zamówień
          </p>
        </div>

        {/* Orders list */}
        <div>
          {orders.length > 0 ? (
            <div className="space-y-6">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-card rounded-2xl border p-6 md:p-8 hover:border-foreground/20 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                        <Package className="size-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg">Zamówienie #{order.reference}</p>
                        <p className="text-muted-foreground">
                          {formatDate(order.dateAdd)}
                        </p>
                      </div>
                    </div>
                    <Badge variant={getStatusVariant(order.statusId)} className="w-fit text-sm px-4 py-1">
                      {order.status}
                    </Badge>
                  </div>

                  {/* Order items preview */}
                  <div className="border-t pt-6 mb-6">
                    <div className="space-y-3">
                      {order.items.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between"
                        >
                          <span className="text-muted-foreground">
                            {item.quantity}x {item.productName}
                          </span>
                          <span className="font-medium">{formatPrice(item.unitPrice * item.quantity)}</span>
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <p className="text-muted-foreground">
                          +{order.items.length - 3} więcej produktów
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Order total and actions */}
                  <div className="flex items-center justify-between border-t pt-6">
                    <div>
                      <p className="text-muted-foreground">Suma zamówienia</p>
                      <p className="text-2xl font-bold text-primary">{formatPrice(order.totalPaid)}</p>
                    </div>
                    <Link href={`/account/orders/${order.id}`}>
                      <Button variant="outline" size="lg">
                        Szczegóły
                        <ChevronRight className="size-5 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-2xl border p-12 md:p-16 text-center">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="size-10 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-semibold mb-3">Brak zamówień</h2>
              <p className="text-muted-foreground mb-8 text-lg">
                Nie masz jeszcze żadnych zamówień. Zacznij zakupy już teraz!
              </p>
              <Link href="/products">
                <Button size="lg">
                  Przeglądaj produkty
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
