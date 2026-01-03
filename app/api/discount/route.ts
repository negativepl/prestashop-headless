import { NextRequest, NextResponse } from "next/server";
import { BinshopsClient } from "@/lib/binshops/client";

interface CartItem {
  productId: number;
  quantity: number;
  productAttributeId: number;
}

/**
 * POST /api/discount
 * Apply a discount code to the cart
 *
 * Body: { code: string, items: CartItem[] }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, items } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Kod rabatowy jest wymagany", success: false },
        { status: 400 }
      );
    }

    const trimmedCode = code.trim().toUpperCase();

    if (!trimmedCode) {
      return NextResponse.json(
        { error: "Kod rabatowy jest wymagany", success: false },
        { status: 400 }
      );
    }

    // Create new Binshops client and initialize session
    const client = new BinshopsClient();
    await client.initSession();

    // Add cart items to Binshops cart if provided
    if (items && Array.isArray(items) && items.length > 0) {
      for (const item of items as CartItem[]) {
        try {
          await client.addToCart(
            item.productId,
            item.quantity,
            item.productAttributeId || 0
          );
        } catch {
          // Ignore individual product errors - voucher will fail if cart is empty
        }
      }
    }

    // Apply the voucher code
    const response = await client.applyVoucher(trimmedCode);

    if (!response) {
      return NextResponse.json(
        { error: "Nie udało się połączyć z serwerem", success: false },
        { status: 500 }
      );
    }

    // Check for errors in the response
    const psdata = response.psdata as {
      errors?: string[];
      vouchers?: {
        allowed: number;
        added: Record<string, {
          id_cart_rule: number;
          name: string;
          code: string;
          reduction_percent: string;
          reduction_amount: number;
          reduction_formatted: string;
          free_shipping: boolean;
        }>;
      };
    };

    const errors = psdata?.errors;
    if (errors && errors.length > 0) {
      const errorMessage = mapErrorMessage(errors[0]);
      return NextResponse.json(
        { error: errorMessage, success: false },
        { status: 400 }
      );
    }

    // Check if vouchers are allowed
    const vouchersAllowed = psdata?.vouchers?.allowed ?? 0;
    if (vouchersAllowed === 0) {
      return NextResponse.json(
        { error: "Kody rabatowe są obecnie niedostępne", success: false },
        { status: 400 }
      );
    }

    // Get added vouchers - it's an object with id_cart_rule as key
    const addedVouchers = psdata?.vouchers?.added || {};
    const vouchersArray = Object.values(addedVouchers);

    // Find the voucher we just applied (case-insensitive)
    const appliedVoucher = vouchersArray.find(
      (v) => v.code.toUpperCase() === trimmedCode
    );

    if (!appliedVoucher) {
      return NextResponse.json(
        { error: "Nieprawidłowy kod rabatowy", success: false },
        { status: 400 }
      );
    }

    // Parse reduction amount from formatted string (e.g., "-3,50 zł" -> 3.50)
    const parseReduction = (formatted: string): number => {
      const match = formatted.replace(/[^\d,.-]/g, '').replace(',', '.');
      return Math.abs(parseFloat(match) || 0);
    };

    const reductionAmount = parseReduction(appliedVoucher.reduction_formatted);

    return NextResponse.json({
      success: true,
      voucher: {
        id_cart_rule: appliedVoucher.id_cart_rule,
        name: appliedVoucher.name,
        code: appliedVoucher.code,
        reduction_percent: parseFloat(appliedVoucher.reduction_percent) || 0,
        reduction_amount: reductionAmount,
        free_shipping: appliedVoucher.free_shipping,
      },
      totalDiscount: reductionAmount,
    });
  } catch (error) {
    console.error("Error applying discount:", error);
    return NextResponse.json(
      { error: "Wystąpił błąd podczas aplikowania kodu", success: false },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/discount
 * Remove a discount code (just returns success - actual removal is handled client-side)
 */
export async function DELETE() {
  // Since we create a new session for each discount validation,
  // removing is just a client-side operation (clear local state)
  return NextResponse.json({ success: true });
}

/**
 * Map PrestaShop error messages to Polish
 */
function mapErrorMessage(error: string): string {
  const errorMap: Record<string, string> = {
    "You must enter a voucher code.": "Musisz wprowadzić kod rabatowy.",
    "The voucher code is invalid.": "Nieprawidłowy kod rabatowy.",
    "This voucher does not exist.": "Ten kod rabatowy nie istnieje.",
    "This voucher has already been used.": "Ten kod rabatowy został już wykorzystany.",
    "This voucher is disabled.": "Ten kod rabatowy jest nieaktywny.",
    "This voucher has expired.": "Ten kod rabatowy wygasł.",
    "You cannot use this voucher anymore (usage limit reached).":
      "Nie możesz już użyć tego kodu (osiągnięto limit użyć).",
    "You cannot use this voucher with these products.":
      "Nie możesz użyć tego kodu z tymi produktami.",
    "You must spend at least": "Minimalna wartość zamówienia to",
    "This voucher is not valid yet.": "Ten kod rabatowy nie jest jeszcze aktywny.",
  };

  // Check for exact match
  if (errorMap[error]) {
    return errorMap[error];
  }

  // Check for partial match
  for (const [key, value] of Object.entries(errorMap)) {
    if (error.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }

  // Return original error if no mapping found
  return error;
}
