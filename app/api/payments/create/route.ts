import { NextRequest, NextResponse } from "next/server";
import { createPayment, getActivePaymentMethods, validatePaymentMethod } from "@/lib/payments";

interface CreatePaymentBody {
  orderId: number;
  orderReference?: string;
  amount: number;
  currency?: string;
  methodCode: string;       // blik, card, transfer, etc.
  customerEmail: string;
  customerName: string;
  description?: string;
  returnUrl: string;
  cancelUrl?: string;
}

/**
 * POST /api/payments/create
 *
 * Tworzy sesję płatności u providera (Stripe/PayU)
 *
 * Body:
 * - orderId: ID zamówienia w PrestaShop
 * - amount: Kwota do zapłaty
 * - methodCode: Kod metody płatności (blik, card, etc.)
 * - customerEmail: Email klienta
 * - customerName: Imię i nazwisko
 * - returnUrl: URL powrotu po płatności
 */
export async function POST(request: NextRequest) {
  try {
    const body: CreatePaymentBody = await request.json();

    // Walidacja
    if (!body.orderId || !body.amount || !body.methodCode) {
      return NextResponse.json(
        { error: "Brakujące wymagane pola: orderId, amount, methodCode" },
        { status: 400 }
      );
    }

    if (!body.customerEmail || !body.customerName) {
      return NextResponse.json(
        { error: "Brakujące dane klienta: customerEmail, customerName" },
        { status: 400 }
      );
    }

    if (!body.returnUrl) {
      return NextResponse.json(
        { error: "Brakujący returnUrl" },
        { status: 400 }
      );
    }

    // Znajdź metodę płatności i jej providera
    const methods = await getActivePaymentMethods();
    const method = methods.find((m) => m.code === body.methodCode);

    if (!method) {
      return NextResponse.json(
        { error: `Nieznana metoda płatności: ${body.methodCode}` },
        { status: 400 }
      );
    }

    // Walidacja kwoty dla metody
    const validation = validatePaymentMethod(method, body.amount);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Oblicz całkowitą kwotę (z dopłatą za metodę)
    const totalAmount = body.amount + (method.surcharge || 0);

    // Utwórz płatność u providera
    const result = await createPayment({
      providerCode: method.providerCode,
      orderId: body.orderId,
      orderReference: body.orderReference,
      amount: totalAmount,
      currency: body.currency || "PLN",
      methodCode: body.methodCode,
      customerEmail: body.customerEmail,
      customerName: body.customerName,
      description: body.description || `Zamówienie #${body.orderId}`,
      returnUrl: body.returnUrl,
      cancelUrl: body.cancelUrl || body.returnUrl,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error?.message || "Błąd tworzenia płatności",
          code: result.error?.code,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      transactionId: result.transactionId,
      externalId: result.externalId,
      paymentUrl: result.paymentUrl,
      clientSecret: result.clientSecret, // Dla Stripe Elements
      status: result.status,
      surcharge: method.surcharge || 0,
      totalAmount,
    });
  } catch (error) {
    console.error("[API] /payments/create error:", error);
    return NextResponse.json(
      { error: "Błąd serwera" },
      { status: 500 }
    );
  }
}
