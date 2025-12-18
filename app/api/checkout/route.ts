import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

const PRESTASHOP_URL = process.env.PRESTASHOP_URL || "http://localhost:8080";
const API_KEY = process.env.PRESTASHOP_API_KEY || "";

function getAuthHeader() {
  return `Basic ${Buffer.from(API_KEY + ":").toString("base64")}`;
}

async function psGet(endpoint: string) {
  const url = `${PRESTASHOP_URL}/api/${endpoint}`;
  const separator = url.includes("?") ? "&" : "?";
  const fullUrl = `${url}${separator}output_format=JSON`;

  const response = await fetch(fullUrl, {
    headers: { Authorization: getAuthHeader() },
  });

  if (!response.ok) {
    throw new Error(`GET ${endpoint}: ${response.status}`);
  }

  return response.json();
}

async function psPost(endpoint: string, xml: string) {
  const url = `${PRESTASHOP_URL}/api/${endpoint}?output_format=JSON`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/xml",
    },
    body: xml,
  });

  const text = await response.text();

  if (!response.ok) {
    console.error(`POST ${endpoint} error:`, text);
    throw new Error(`POST ${endpoint}: ${response.status} - ${text}`);
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

interface CheckoutRequest {
  customer: {
    email: string;
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postcode: string;
    phone: string;
  };
  items: {
    productId: number;
    quantity: number;
    productAttributeId: number;
  }[];
}

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutRequest = await request.json();
    const { customer, items } = body;

    // Check if user is logged in via JWT session
    const session = await getSession();

    // 1. Use logged-in customer or create/find by email
    let customerId: number;
    try {
      if (session?.customerId) {
        // User is logged in - use their customer ID from JWT
        customerId = session.customerId;
      } else {
        // Not logged in - find or create customer by email
        const searchRes = await psGet(
          `customers?filter[email]=${encodeURIComponent(customer.email)}&display=full`
        );
        const customers = searchRes.customers || [];

        if (customers.length > 0) {
          customerId = customers[0].id;
        } else {
          const passwd = Math.random().toString(36).slice(-10) + "Aa1!";
          const customerXml = `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <customer>
    <id_default_group>3</id_default_group>
    <id_lang>1</id_lang>
    <newsletter>0</newsletter>
    <optin>0</optin>
    <active>1</active>
    <is_guest>0</is_guest>
    <id_shop>1</id_shop>
    <id_shop_group>1</id_shop_group>
    <passwd>${passwd}</passwd>
    <lastname>${escapeXml(customer.lastName)}</lastname>
    <firstname>${escapeXml(customer.firstName)}</firstname>
    <email>${escapeXml(customer.email)}</email>
  </customer>
</prestashop>`;

          const createRes = await psPost("customers", customerXml);
          customerId = createRes.customer?.id || createRes.customers?.[0]?.id;

          if (!customerId) {
            throw new Error("Brak ID klienta w odpowiedzi");
          }
        }
      }
    } catch (err) {
      console.error("Customer error:", err);
      throw new Error("Nie udało się utworzyć konta klienta");
    }

    // 2. Create address
    let addressId: number;
    try {
      const addressXml = `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <address>
    <id_customer>${customerId}</id_customer>
    <id_country>14</id_country>
    <alias>Domowy</alias>
    <lastname>${escapeXml(customer.lastName)}</lastname>
    <firstname>${escapeXml(customer.firstName)}</firstname>
    <address1>${escapeXml(customer.address)}</address1>
    <postcode>${escapeXml(customer.postcode)}</postcode>
    <city>${escapeXml(customer.city)}</city>
    <phone>${escapeXml(customer.phone)}</phone>
  </address>
</prestashop>`;

      const addressRes = await psPost("addresses", addressXml);
      addressId = addressRes.address?.id || addressRes.addresses?.[0]?.id;

      if (!addressId) {
        throw new Error("Brak ID adresu w odpowiedzi");
      }
    } catch (err) {
      console.error("Address error:", err);
      throw new Error("Nie udało się zapisać adresu");
    }

    // 3. Create cart
    let cartId: number;
    try {
      const cartRowsXml = items
        .map(
          (item) => `
      <cart_row>
        <id_product>${item.productId}</id_product>
        <id_product_attribute>${item.productAttributeId || 0}</id_product_attribute>
        <id_address_delivery>${addressId}</id_address_delivery>
        <quantity>${item.quantity}</quantity>
      </cart_row>`
        )
        .join("");

      const cartXml = `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <cart>
    <id_currency>1</id_currency>
    <id_lang>1</id_lang>
    <id_customer>${customerId}</id_customer>
    <id_address_delivery>${addressId}</id_address_delivery>
    <id_address_invoice>${addressId}</id_address_invoice>
    <id_shop>1</id_shop>
    <id_shop_group>1</id_shop_group>
    <associations>
      <cart_rows>${cartRowsXml}
      </cart_rows>
    </associations>
  </cart>
</prestashop>`;

      const cartRes = await psPost("carts", cartXml);
      cartId = cartRes.cart?.id || cartRes.carts?.[0]?.id;

      if (!cartId) {
        throw new Error("Brak ID koszyka w odpowiedzi");
      }
    } catch (err) {
      console.error("Cart error:", err);
      throw new Error("Nie udało się utworzyć koszyka");
    }

    // 4. Calculate totals
    let totalProducts = 0;
    for (const item of items) {
      try {
        const productRes = await psGet(`products/${item.productId}?display=full`);
        const product = productRes.product || productRes.products?.[0];
        if (product) {
          totalProducts += parseFloat(product.price) * item.quantity;
        }
      } catch {
        // Skip if product not found
      }
    }

    // 5. Create order
    let orderId: number;
    try {
      const orderRowsXml = items
        .map(
          (item) => `
      <order_row>
        <product_id>${item.productId}</product_id>
        <product_attribute_id>${item.productAttributeId || 0}</product_attribute_id>
        <product_quantity>${item.quantity}</product_quantity>
      </order_row>`
        )
        .join("");

      const orderXml = `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <order>
    <id_address_delivery>${addressId}</id_address_delivery>
    <id_address_invoice>${addressId}</id_address_invoice>
    <id_cart>${cartId}</id_cart>
    <id_currency>1</id_currency>
    <id_lang>1</id_lang>
    <id_customer>${customerId}</id_customer>
    <id_carrier>1</id_carrier>
    <current_state>1</current_state>
    <module>ps_checkpayment</module>
    <payment>Przelew bankowy</payment>
    <total_paid>${totalProducts.toFixed(6)}</total_paid>
    <total_paid_tax_incl>${totalProducts.toFixed(6)}</total_paid_tax_incl>
    <total_paid_tax_excl>${totalProducts.toFixed(6)}</total_paid_tax_excl>
    <total_paid_real>0.000000</total_paid_real>
    <total_products>${totalProducts.toFixed(6)}</total_products>
    <total_products_wt>${totalProducts.toFixed(6)}</total_products_wt>
    <total_shipping>0.000000</total_shipping>
    <total_shipping_tax_incl>0.000000</total_shipping_tax_incl>
    <total_shipping_tax_excl>0.000000</total_shipping_tax_excl>
    <conversion_rate>1.000000</conversion_rate>
    <associations>
      <order_rows>${orderRowsXml}
      </order_rows>
    </associations>
  </order>
</prestashop>`;

      const orderRes = await psPost("orders", orderXml);
      orderId = orderRes.order?.id || orderRes.orders?.[0]?.id;

      if (!orderId) {
        throw new Error("Brak ID zamówienia w odpowiedzi");
      }
    } catch (err) {
      console.error("Order error:", err);
      throw new Error("Nie udało się utworzyć zamówienia");
    }

    return NextResponse.json({
      success: true,
      orderId,
      customerId,
      cartId,
    });

  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Błąd serwera" },
      { status: 500 }
    );
  }
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
