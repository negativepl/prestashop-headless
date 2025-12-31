/**
 * PrestaShop Orders API
 *
 * Funkcje pomocnicze do zarządzania zamówieniami w PrestaShop
 */

const PRESTASHOP_URL = process.env.PRESTASHOP_URL || "";
const API_KEY = process.env.PRESTASHOP_API_KEY || "";

function getAuthHeader() {
  return `Basic ${Buffer.from(API_KEY + ":").toString("base64")}`;
}

/**
 * Aktualizuje status zamówienia w PrestaShop
 *
 * @param orderId - ID zamówienia
 * @param statusId - ID nowego statusu (np. 2 = płatność zaakceptowana)
 */
export async function updateOrderStatus(
  orderId: number,
  statusId: number
): Promise<boolean> {
  try {
    if (!PRESTASHOP_URL || !API_KEY) {
      console.warn("[PrestaShop] Brak konfiguracji API");
      return false;
    }

    // PrestaShop wymaga PUT z pełnym XML zamówienia
    // Najpierw pobierz aktualne zamówienie
    const getResponse = await fetch(
      `${PRESTASHOP_URL}/api/orders/${orderId}?output_format=JSON`,
      {
        headers: { Authorization: getAuthHeader() },
      }
    );

    if (!getResponse.ok) {
      throw new Error(`GET order failed: ${getResponse.status}`);
    }

    const orderData = await getResponse.json();
    const order = orderData.order || orderData.orders?.[0];

    if (!order) {
      throw new Error("Order not found");
    }

    // Aktualizuj status
    const updateXml = `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <order>
    <id>${orderId}</id>
    <current_state>${statusId}</current_state>
  </order>
</prestashop>`;

    const putResponse = await fetch(
      `${PRESTASHOP_URL}/api/orders/${orderId}?output_format=JSON`,
      {
        method: "PUT",
        headers: {
          Authorization: getAuthHeader(),
          "Content-Type": "application/xml",
        },
        body: updateXml,
      }
    );

    if (!putResponse.ok) {
      const errorText = await putResponse.text();
      throw new Error(`PUT order failed: ${putResponse.status} - ${errorText}`);
    }

    console.log(`[PrestaShop] Order ${orderId} status updated to ${statusId}`);
    return true;
  } catch (error) {
    console.error("[PrestaShop] updateOrderStatus error:", error);
    return false;
  }
}

/**
 * Dodaje komentarz/notatkę do zamówienia
 */
export async function addOrderNote(
  orderId: number,
  message: string
): Promise<boolean> {
  try {
    if (!PRESTASHOP_URL || !API_KEY) {
      return false;
    }

    // PrestaShop order_histories
    const historyXml = `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <order_history>
    <id_order>${orderId}</id_order>
    <id_employee>0</id_employee>
    <id_order_state>3</id_order_state>
  </order_history>
</prestashop>`;

    const response = await fetch(
      `${PRESTASHOP_URL}/api/order_histories?output_format=JSON`,
      {
        method: "POST",
        headers: {
          Authorization: getAuthHeader(),
          "Content-Type": "application/xml",
        },
        body: historyXml,
      }
    );

    return response.ok;
  } catch (error) {
    console.error("[PrestaShop] addOrderNote error:", error);
    return false;
  }
}

/**
 * Mapowanie statusów płatności na PrestaShop order states
 */
export const ORDER_STATUS = {
  // Standardowe statusy PrestaShop
  AWAITING_PAYMENT: 1,        // Oczekiwanie na płatność (nie istnieje w Twoim PS)
  PAYMENT_ACCEPTED: 2,        // Płatność zaakceptowana
  PROCESSING: 3,              // Przygotowanie w toku
  SHIPPED: 4,                 // Dostarczane
  DELIVERED: 5,               // Dostarczone
  CANCELED: 6,                // Anulowane
  REFUNDED: 7,                // Zwróconych pieniędzy
  PAYMENT_ERROR: 8,           // Błąd płatności

  // Niestandardowe statusy (Twoja instalacja)
  PRZELEWY24_WAITING: 17,     // Oczekiwanie na płatność Przelewy24
  PRZELEWY24_ACCEPTED: 18,    // Płatność Przelewy24 przyjęta
  DROP_SHIPPED: 29,           // Zrealizowany drop
  ORDER_COMPLETED: 30,        // Zamówienie zrealizowane
} as const;

/**
 * Pobiera szczegóły zamówienia
 */
export async function getOrder(orderId: number) {
  try {
    if (!PRESTASHOP_URL || !API_KEY) {
      return null;
    }

    const response = await fetch(
      `${PRESTASHOP_URL}/api/orders/${orderId}?display=full&output_format=JSON`,
      {
        headers: { Authorization: getAuthHeader() },
      }
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.order || data.orders?.[0] || null;
  } catch (error) {
    console.error("[PrestaShop] getOrder error:", error);
    return null;
  }
}
