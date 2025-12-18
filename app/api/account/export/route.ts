import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prestashop } from "@/lib/prestashop/client";

export async function GET(request: NextRequest) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const format = searchParams.get("format") || "csv";

  try {
    // Fetch all user data
    const [customer, orders, addresses] = await Promise.all([
      prestashop.getCustomer(session.customerId),
      prestashop.getCustomerOrders(session.customerId),
      prestashop.getCustomerAddresses(session.customerId),
    ]);

    if (format === "csv") {
      // Generate CSV
      const csvContent = generateCSV(customer, orders, addresses);

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="moje-dane-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    } else {
      // Generate simple text/HTML that can be printed as PDF
      const htmlContent = generateHTML(customer, orders, addresses);

      return new NextResponse(htmlContent, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Content-Disposition": `attachment; filename="moje-dane-${new Date().toISOString().split('T')[0]}.html"`,
        },
      });
    }
  } catch (error) {
    console.error("Error exporting data:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}

function generateCSV(
  customer: { id: number; email: string; firstName: string; lastName: string } | null,
  orders: any[],
  addresses: any[]
): string {
  const lines: string[] = [];

  // BOM for Excel UTF-8 compatibility
  lines.push("\uFEFF");

  // Customer data
  lines.push("=== DANE OSOBOWE ===");
  lines.push("Pole;Wartość");
  if (customer) {
    lines.push(`Imię;${customer.firstName}`);
    lines.push(`Nazwisko;${customer.lastName}`);
    lines.push(`Email;${customer.email}`);
    lines.push(`ID klienta;${customer.id}`);
  }
  lines.push("");

  // Addresses
  lines.push("=== ADRESY ===");
  lines.push("Alias;Imię;Nazwisko;Adres;Kod pocztowy;Miasto;Kraj;Telefon");
  for (const addr of addresses) {
    lines.push(`${addr.alias};${addr.firstName};${addr.lastName};${addr.address1};${addr.postcode};${addr.city};${addr.country};${addr.phone || addr.phoneMobile || ""}`);
  }
  lines.push("");

  // Orders
  lines.push("=== ZAMÓWIENIA ===");
  lines.push("Numer;Data;Status;Suma;Płatność");
  for (const order of orders) {
    const date = new Date(order.dateAdd).toLocaleDateString("pl-PL");
    lines.push(`${order.reference};${date};${order.status};${order.totalPaid.toFixed(2)} PLN;${order.payment}`);
  }
  lines.push("");

  // Order items
  lines.push("=== POZYCJE ZAMÓWIEŃ ===");
  lines.push("Numer zamówienia;Produkt;Ilość;Cena jednostkowa");
  for (const order of orders) {
    for (const item of order.items) {
      lines.push(`${order.reference};${item.productName};${item.quantity};${item.unitPrice.toFixed(2)} PLN`);
    }
  }

  return lines.join("\n");
}

function generateHTML(
  customer: { id: number; email: string; firstName: string; lastName: string } | null,
  orders: any[],
  addresses: any[]
): string {
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString("pl-PL");
  const formatPrice = (price: number) => `${price.toFixed(2)} PLN`;

  return `<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="UTF-8">
  <title>Moje dane osobowe</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
    h2 { color: #666; margin-top: 30px; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
    th { background-color: #f5f5f5; }
    .info-row { display: flex; margin: 8px 0; }
    .info-label { font-weight: bold; width: 150px; }
    .footer { margin-top: 40px; color: #999; font-size: 12px; text-align: center; }
    @media print { body { margin: 0; } }
  </style>
</head>
<body>
  <h1>Moje dane osobowe</h1>
  <p>Data wygenerowania: ${new Date().toLocaleDateString("pl-PL")} ${new Date().toLocaleTimeString("pl-PL")}</p>

  <h2>Dane konta</h2>
  ${customer ? `
  <div class="info-row"><span class="info-label">Imię:</span> ${customer.firstName}</div>
  <div class="info-row"><span class="info-label">Nazwisko:</span> ${customer.lastName}</div>
  <div class="info-row"><span class="info-label">Email:</span> ${customer.email}</div>
  <div class="info-row"><span class="info-label">ID klienta:</span> ${customer.id}</div>
  ` : '<p>Brak danych</p>'}

  <h2>Adresy (${addresses.length})</h2>
  ${addresses.length > 0 ? `
  <table>
    <thead>
      <tr>
        <th>Alias</th>
        <th>Imię i nazwisko</th>
        <th>Adres</th>
        <th>Telefon</th>
      </tr>
    </thead>
    <tbody>
      ${addresses.map(addr => `
      <tr>
        <td>${addr.alias}</td>
        <td>${addr.firstName} ${addr.lastName}</td>
        <td>${addr.address1}, ${addr.postcode} ${addr.city}, ${addr.country}</td>
        <td>${addr.phone || addr.phoneMobile || '-'}</td>
      </tr>
      `).join('')}
    </tbody>
  </table>
  ` : '<p>Brak zapisanych adresów</p>'}

  <h2>Historia zamówień (${orders.length})</h2>
  ${orders.length > 0 ? `
  <table>
    <thead>
      <tr>
        <th>Numer</th>
        <th>Data</th>
        <th>Status</th>
        <th>Suma</th>
      </tr>
    </thead>
    <tbody>
      ${orders.map(order => `
      <tr>
        <td>${order.reference}</td>
        <td>${formatDate(order.dateAdd)}</td>
        <td>${order.status}</td>
        <td>${formatPrice(order.totalPaid)}</td>
      </tr>
      `).join('')}
    </tbody>
  </table>
  ` : '<p>Brak zamówień</p>'}

  <div class="footer">
    <p>Dokument wygenerowany automatycznie zgodnie z RODO (Art. 15 - Prawo dostępu).</p>
    <p>Aby wydrukować jako PDF, użyj funkcji "Drukuj" w przeglądarce (Ctrl+P) i wybierz "Zapisz jako PDF".</p>
  </div>
</body>
</html>`;
}
