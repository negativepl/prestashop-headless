import { redirect, notFound } from "next/navigation";
import { Package, CreditCard, Truck } from "lucide-react";
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

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;

  // Verify session with JWT
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const order = await binshops.getOrder(parseInt(id));

  if (!order) {
    notFound();
  }

  // SECURITY: Verify order belongs to logged-in user
  const customerOrders = await binshops.getCustomerOrders();
  const orderBelongsToUser = customerOrders.some((o: Order) => o.id === order.id);
  if (!orderBelongsToUser) {
    notFound();
  }

  return (
    <div className="min-h-[80vh] py-8">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold">Zamówienie #{order.reference}</h1>
          <p className="text-muted-foreground mt-2">
            Złożone {formatDate(order.dateAdd)}
          </p>
          <Badge variant={getStatusVariant(order.statusId)} className="mt-4 text-sm px-4 py-1">
            {order.status}
          </Badge>
        </div>

        <div className="space-y-6">
          {/* Order items */}
          <div className="bg-card rounded-2xl border p-6 md:p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Package className="size-6 text-primary" />
              </div>
              <h2 className="text-lg font-semibold">Produkty w zamówieniu</h2>
            </div>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-4 border-b last:border-0 last:pb-0"
                >
                  <div className="flex-1">
                    <p className="font-medium text-lg">{item.productName}</p>
                    {item.productReference && (
                      <p className="text-muted-foreground">
                        SKU: {item.productReference}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">{formatPrice(item.unitPrice * item.quantity)}</p>
                    <p className="text-muted-foreground">
                      {item.quantity} x {formatPrice(item.unitPrice)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payment info */}
          <div className="bg-card rounded-2xl border p-6 md:p-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <CreditCard className="size-6 text-primary" />
              </div>
              <h2 className="text-lg font-semibold">Metoda płatności</h2>
            </div>
            <p className="text-lg">{order.payment}</p>
          </div>

          {/* Order summary */}
          <div className="bg-card rounded-2xl border p-6 md:p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Truck className="size-6 text-primary" />
              </div>
              <h2 className="text-lg font-semibold">Podsumowanie</h2>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-lg">
                <span className="text-muted-foreground">Produkty</span>
                <span>{formatPrice(order.totalProducts)}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="text-muted-foreground">Dostawa</span>
                <span>{formatPrice(order.totalShipping)}</span>
              </div>
              <div className="flex justify-between pt-4 border-t font-semibold text-2xl">
                <span>Razem</span>
                <span className="text-primary">{formatPrice(order.totalPaid)}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
