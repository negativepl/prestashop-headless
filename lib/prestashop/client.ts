import type {
  PSProduct,
  PSCategory,
  PSCart,
  PSStockAvailable,
  PSOrder,
  PSOrderState,
  PSAddress,
  PSCountry,
  Product,
  Category,
  Order,
  OrderItem,
  Address,
} from "./types";

interface PSResponse<T> {
  [key: string]: T | T[];
}

class PrestaShopClient {
  private baseUrl: string;
  private apiKey: string;
  private langId: number;

  constructor() {
    this.baseUrl = process.env.PRESTASHOP_URL || "http://localhost:8080";
    this.apiKey = process.env.PRESTASHOP_API_KEY || "";
    this.langId = 1; // Polish
  }

  private getHeaders(): HeadersInit {
    return {
      Authorization: `Basic ${Buffer.from(this.apiKey + ":").toString("base64")}`,
      "Content-Type": "application/json",
    };
  }

  private async fetch<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}/api/${endpoint}`;
    const separator = url.includes("?") ? "&" : "?";
    const fullUrl = `${url}${separator}output_format=JSON`;

    const response = await fetch(fullUrl, {
      ...options,
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`PrestaShop API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Helper to get value from multilang field
  private getMultiLangValue(field: { id: string; value: string }[] | undefined): string {
    if (!field || field.length === 0) return "";
    const langValue = field.find((f) => f.id === String(this.langId));
    return langValue?.value || field[0]?.value || "";
  }

  // Products
  async getProducts(params?: {
    limit?: number;
    offset?: number;
    categoryId?: number;
    active?: boolean;
  }): Promise<Product[]> {
    const filters: string[] = [];

    if (params?.categoryId) {
      filters.push(`filter[id_category_default]=${params.categoryId}`);
    }
    if (params?.active !== false) {
      filters.push("filter[active]=1");
    }

    let endpoint = "products";
    if (filters.length > 0) {
      endpoint += `?${filters.join("&")}`;
    }

    if (params?.limit) {
      const separator = endpoint.includes("?") ? "&" : "?";
      endpoint += `${separator}limit=${params.offset || 0},${params.limit}`;
    }

    endpoint += `${endpoint.includes("?") ? "&" : "?"}display=full`;

    const response = await this.fetch<PSResponse<PSProduct[]>>(endpoint);
    const products = response.products || [];

    return Promise.all(products.map((p) => this.mapProduct(p)));
  }

  async searchProducts(query: string, limit: number = 10): Promise<Product[]> {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const searchTerm = query.trim();
    // PrestaShop API uses SQL LIKE syntax: % for wildcard
    const endpoint = `products?filter[name]=[${encodeURIComponent(searchTerm)}]%&filter[active]=1&display=full&limit=${limit}`;

    try {
      const response = await this.fetch<PSResponse<PSProduct[]>>(endpoint);
      const products = response.products || [];
      return Promise.all(products.map((p) => this.mapProduct(p)));
    } catch (error) {
      console.error("Search error:", error);
      return [];
    }
  }

  async getProduct(id: number): Promise<Product | null> {
    try {
      const response = await this.fetch<PSResponse<PSProduct | PSProduct[]>>(`products/${id}?display=full`);
      // API returns either { product: {...} } or { products: [{...}] }
      const product = response.product
        ? (response.product as PSProduct)
        : (response.products as PSProduct[])?.[0];
      if (!product) return null;
      return this.mapProduct(product);
    } catch {
      return null;
    }
  }

  // Generate public image URL (PrestaShop stores images in nested folders by digit)
  private getPublicImageUrl(imageId: string | number): string {
    const id = String(imageId);
    const path = id.split("").join("/");
    return `${this.baseUrl}/img/p/${path}/${id}.jpg`;
  }

  private async mapProduct(p: PSProduct): Promise<Product> {
    const imageIds = p.associations?.images?.map((img) => img.id) || [];
    const images = imageIds.map((imgId) => this.getPublicImageUrl(imgId));

    let quantity = 0;
    try {
      const stockResponse = await this.fetch<PSResponse<PSStockAvailable[]>>(
        `stock_availables?filter[id_product]=${p.id}&filter[id_product_attribute]=0&display=full`
      );
      const stocks = stockResponse.stock_availables || [];
      if (stocks.length > 0) {
        quantity = (stocks[0] as PSStockAvailable).quantity;
      }
    } catch {
      // Stock not available
    }

    let manufacturerName: string | null = null;
    if (p.id_manufacturer && p.id_manufacturer > 0) {
      try {
        const mfResponse = await this.fetch<PSResponse<{ id: number; name: string }[]>>(
          `manufacturers/${p.id_manufacturer}?display=full`
        );
        const manufacturer = mfResponse.manufacturers?.[0] || mfResponse.manufacturer;
        if (manufacturer) {
          manufacturerName = manufacturer.name;
        }
      } catch {
        // Manufacturer not available
      }
    }

    return {
      id: p.id,
      name: this.getMultiLangValue(p.name),
      description: this.getMultiLangValue(p.description),
      descriptionShort: this.getMultiLangValue(p.description_short),
      price: parseFloat(p.price) || 0,
      reference: p.reference,
      imageUrl: images.length > 0 ? images[0] : null,
      images,
      categoryId: p.id_category_default,
      active: p.active === "1",
      quantity,
      weight: parseFloat(p.weight) || 0,
      manufacturerId: p.id_manufacturer,
      manufacturerName,
    };
  }

  // Categories
  async getCategories(params?: { parentId?: number; active?: boolean }): Promise<Category[]> {
    const filters: string[] = [];

    if (params?.parentId !== undefined) {
      filters.push(`filter[id_parent]=${params.parentId}`);
    }
    if (params?.active !== false) {
      filters.push("filter[active]=1");
    }

    let endpoint = "categories";
    if (filters.length > 0) {
      endpoint += `?${filters.join("&")}`;
    }

    endpoint += `${endpoint.includes("?") ? "&" : "?"}display=full`;

    const response = await this.fetch<PSResponse<PSCategory[]>>(endpoint);
    const categories = response.categories || [];

    return categories.map((c) => this.mapCategory(c));
  }

  async getCategory(id: number): Promise<Category | null> {
    try {
      const response = await this.fetch<PSResponse<PSCategory>>(`categories/${id}?display=full`);
      const category = response.category as PSCategory;
      return this.mapCategory(category);
    } catch {
      return null;
    }
  }

  private mapCategory(c: PSCategory): Category {
    return {
      id: c.id,
      name: this.getMultiLangValue(c.name),
      description: this.getMultiLangValue(c.description),
      parentId: c.id_parent,
      level: c.level_depth,
      active: c.active === "1",
    };
  }

  // Cart operations
  async createCart(guestId?: number): Promise<PSCart> {
    const cartData = {
      cart: {
        id_currency: 1,
        id_lang: this.langId,
        id_guest: guestId || 0,
        id_shop: 1,
        id_shop_group: 1,
      },
    };

    const response = await this.fetch<PSResponse<PSCart>>("carts", {
      method: "POST",
      body: JSON.stringify(cartData),
    });

    return response.cart as PSCart;
  }

  async getCart(id: number): Promise<PSCart | null> {
    try {
      const response = await this.fetch<PSResponse<PSCart>>(`carts/${id}?display=full`);
      return response.cart as PSCart;
    } catch {
      return null;
    }
  }

  async addToCart(
    cartId: number,
    productId: number,
    quantity: number = 1,
    productAttributeId: number = 0
  ): Promise<PSCart> {
    const cart = await this.getCart(cartId);
    if (!cart) {
      throw new Error("Cart not found");
    }

    const cartRows = cart.associations?.cart_rows || [];
    const existingRow = cartRows.find(
      (row) =>
        row.id_product === String(productId) &&
        row.id_product_attribute === String(productAttributeId)
    );

    if (existingRow) {
      existingRow.quantity = String(parseInt(existingRow.quantity) + quantity);
    } else {
      cartRows.push({
        id_product: String(productId),
        id_product_attribute: String(productAttributeId),
        id_address_delivery: "0",
        id_customization: "0",
        quantity: String(quantity),
      });
    }

    const updateData = {
      cart: {
        ...cart,
        associations: {
          cart_rows: cartRows,
        },
      },
    };

    const response = await this.fetch<PSResponse<PSCart>>(`carts/${cartId}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    });

    return response.cart as PSCart;
  }

  async updateCartItem(
    cartId: number,
    productId: number,
    quantity: number,
    productAttributeId: number = 0
  ): Promise<PSCart> {
    const cart = await this.getCart(cartId);
    if (!cart) {
      throw new Error("Cart not found");
    }

    const cartRows = cart.associations?.cart_rows || [];
    const existingRow = cartRows.find(
      (row) =>
        row.id_product === String(productId) &&
        row.id_product_attribute === String(productAttributeId)
    );

    if (existingRow) {
      if (quantity <= 0) {
        // Remove item
        const index = cartRows.indexOf(existingRow);
        cartRows.splice(index, 1);
      } else {
        existingRow.quantity = String(quantity);
      }
    }

    const updateData = {
      cart: {
        ...cart,
        associations: {
          cart_rows: cartRows,
        },
      },
    };

    const response = await this.fetch<PSResponse<PSCart>>(`carts/${cartId}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    });

    return response.cart as PSCart;
  }

  async removeFromCart(
    cartId: number,
    productId: number,
    productAttributeId: number = 0
  ): Promise<PSCart> {
    return this.updateCartItem(cartId, productId, 0, productAttributeId);
  }

  // Image URL helper
  getProductImageUrl(productId: number, imageId: number, size: "small" | "medium" | "large" | "home" = "large"): string {
    return `${this.baseUrl}/${productId}-${imageId}-${size}_default.jpg`;
  }

  // Customer operations
  async registerCustomer(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<{ success: boolean; customerId?: number; error?: string }> {
    try {
      // Check if email already exists
      const existingResponse = await this.fetch<PSResponse<any[]>>(
        `customers?filter[email]=${encodeURIComponent(data.email)}&display=full`
      );
      const existingCustomers = existingResponse.customers || [];

      if (existingCustomers.length > 0) {
        return { success: false, error: "Email już istnieje w systemie" };
      }

      // PrestaShop API requires XML for POST operations
      const xmlData = `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <customer>
    <id_default_group>3</id_default_group>
    <id_lang>${this.langId}</id_lang>
    <deleted>0</deleted>
    <passwd>${this.escapeXml(data.password)}</passwd>
    <lastname>${this.escapeXml(data.lastName)}</lastname>
    <firstname>${this.escapeXml(data.firstName)}</firstname>
    <email>${this.escapeXml(data.email)}</email>
    <id_gender>0</id_gender>
    <newsletter>0</newsletter>
    <optin>0</optin>
    <active>1</active>
    <is_guest>0</is_guest>
    <id_shop>1</id_shop>
    <id_shop_group>1</id_shop_group>
  </customer>
</prestashop>`;

      const url = `${this.baseUrl}/api/customers`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Basic ${Buffer.from(this.apiKey + ":").toString("base64")}`,
          "Content-Type": "application/xml",
        },
        body: xmlData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("PrestaShop registration error:", response.status, errorText);
        return { success: false, error: "Wystąpił błąd podczas rejestracji" };
      }

      const responseText = await response.text();
      // Parse the ID from XML response
      const idMatch = responseText.match(/<id><!\[CDATA\[(\d+)\]\]><\/id>|<id>(\d+)<\/id>/);
      const customerId = idMatch ? parseInt(idMatch[1] || idMatch[2]) : undefined;

      return { success: true, customerId };
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, error: "Wystąpił błąd podczas rejestracji" };
    }
  }

  // Helper to escape XML special characters
  private escapeXml(str: string): string {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  async loginCustomer(
    email: string,
    password: string
  ): Promise<{ success: boolean; customer?: any; error?: string }> {
    try {
      // PrestaShop API doesn't have a direct login endpoint
      // We need to find customer by email and verify password
      const response = await this.fetch<PSResponse<any[]>>(
        `customers?filter[email]=${encodeURIComponent(email)}&display=full`
      );
      const customers = response.customers || [];

      if (customers.length === 0) {
        return { success: false, error: "Nieprawidłowy email lub hasło" };
      }

      // Note: PrestaShop API doesn't expose password verification directly
      // In production, you'd need a custom module or use PrestaShop's webservice auth
      const customer = customers[0];

      return {
        success: true,
        customer: {
          id: customer.id,
          email: customer.email,
          firstName: customer.firstname,
          lastName: customer.lastname,
        }
      };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Wystąpił błąd podczas logowania" };
    }
  }

  async getCustomer(customerId: number): Promise<{
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  } | null> {
    try {
      const response = await this.fetch<PSResponse<any[]>>(
        `customers/${customerId}?display=full`
      );
      const customers = response.customers || [];
      const customer = customers[0];

      if (!customer) {
        return null;
      }

      return {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstname,
        lastName: customer.lastname,
      };
    } catch (error) {
      console.error("Error fetching customer:", error);
      return null;
    }
  }

  async updateCustomer(
    customerId: number,
    data: {
      firstName?: string;
      lastName?: string;
      email?: string;
    }
  ): Promise<boolean> {
    try {
      // First get current customer data
      const response = await this.fetch<PSResponse<any[]>>(
        `customers/${customerId}?display=full`
      );
      const customers = response.customers || [];
      const customer = customers[0];

      if (!customer) {
        return false;
      }

      const updateData = {
        customer: {
          ...customer,
          firstname: data.firstName || customer.firstname,
          lastname: data.lastName || customer.lastname,
          email: data.email || customer.email,
        },
      };

      await this.fetch(`customers/${customerId}`, {
        method: "PUT",
        body: JSON.stringify(updateData),
      });

      return true;
    } catch (error) {
      console.error("Error updating customer:", error);
      return false;
    }
  }

  async updateCustomerPassword(
    customerId: number,
    newPassword: string
  ): Promise<boolean> {
    try {
      // Get current customer data
      const response = await this.fetch<PSResponse<any[]>>(
        `customers/${customerId}?display=full`
      );
      const customers = response.customers || [];
      const customer = customers[0];

      if (!customer) {
        return false;
      }

      const updateData = {
        customer: {
          ...customer,
          passwd: newPassword,
        },
      };

      await this.fetch(`customers/${customerId}`, {
        method: "PUT",
        body: JSON.stringify(updateData),
      });

      return true;
    } catch (error) {
      console.error("Error updating password:", error);
      return false;
    }
  }

  // Orders
  async getCustomerOrders(customerId: number): Promise<Order[]> {
    try {
      const response = await this.fetch<PSResponse<PSOrder[]>>(
        `orders?filter[id_customer]=${customerId}&display=full`
      );
      const orders = (response.orders || []) as PSOrder[];

      // Get order states for status names
      const statesResponse = await this.fetch<PSResponse<PSOrderState[]>>(
        "order_states?display=full"
      );
      const states = statesResponse.order_states || [];
      const statesMap = new Map<number, string>();
      states.forEach((state) => {
        statesMap.set(state.id, this.getMultiLangValue(state.name));
      });

      return orders.map((o) => this.mapOrder(o, statesMap));
    } catch (error) {
      console.error("Error fetching orders:", error);
      return [];
    }
  }

  async getOrder(orderId: number): Promise<Order | null> {
    try {
      console.log("PrestaShop API: Fetching order", orderId);
      const response = await this.fetch<PSResponse<PSOrder[]>>(
        `orders/${orderId}?display=full`
      );
      console.log("PrestaShop API: Order response", JSON.stringify(response).slice(0, 500));
      // API returns {orders: [...]} even for single order
      const orders = response.orders as PSOrder[];
      const order = orders?.[0];

      if (!order) {
        console.log("PrestaShop API: No order in response");
        return null;
      }

      // Get order state
      const statesResponse = await this.fetch<PSResponse<PSOrderState[]>>(
        "order_states?display=full"
      );
      const states = statesResponse.order_states || [];
      const statesMap = new Map<number, string>();
      states.forEach((state) => {
        statesMap.set(state.id, this.getMultiLangValue(state.name));
      });

      return this.mapOrder(order, statesMap);
    } catch (error) {
      console.error("PrestaShop API: Error fetching order", orderId, error);
      return null;
    }
  }

  private mapOrder(o: PSOrder, statesMap: Map<number, string>): Order {
    const items: OrderItem[] = (o.associations?.order_rows || []).map((row) => ({
      id: parseInt(row.id),
      productId: parseInt(row.product_id),
      productName: row.product_name,
      productReference: row.product_reference,
      quantity: parseInt(row.product_quantity),
      unitPrice: parseFloat(row.unit_price_tax_incl),
    }));

    return {
      id: o.id,
      reference: o.reference,
      status: statesMap.get(o.current_state) || "Nieznany",
      statusId: o.current_state,
      dateAdd: o.date_add,
      totalPaid: parseFloat(o.total_paid_tax_incl),
      totalProducts: parseFloat(o.total_products_wt),
      totalShipping: parseFloat(o.total_shipping_tax_incl),
      payment: o.payment,
      items,
    };
  }

  // Addresses
  async getCustomerAddresses(customerId: number): Promise<Address[]> {
    try {
      const response = await this.fetch<PSResponse<PSAddress[]>>(
        `addresses?filter[id_customer]=${customerId}&filter[deleted]=0&display=full`
      );
      const addresses = response.addresses || [];

      // Get countries for names
      const countriesResponse = await this.fetch<PSResponse<PSCountry[]>>(
        "countries?display=full"
      );
      const countries = countriesResponse.countries || [];
      const countriesMap = new Map<number, string>();
      countries.forEach((country) => {
        countriesMap.set(country.id, this.getMultiLangValue(country.name));
      });

      return addresses.map((addr) => ({
        id: addr.id,
        alias: addr.alias,
        firstName: addr.firstname,
        lastName: addr.lastname,
        company: addr.company || undefined,
        address1: addr.address1,
        address2: addr.address2 || undefined,
        postcode: addr.postcode,
        city: addr.city,
        country: countriesMap.get(parseInt(addr.id_country)) || "Polska",
        countryId: parseInt(addr.id_country),
        phone: addr.phone || undefined,
        phoneMobile: addr.phone_mobile || undefined,
      }));
    } catch (error) {
      console.error("Error fetching addresses:", error);
      return [];
    }
  }

  async createAddress(
    customerId: number,
    data: {
      alias: string;
      firstName: string;
      lastName: string;
      address1: string;
      address2?: string;
      postcode: string;
      city: string;
      countryId: number;
      phone?: string;
      company?: string;
    }
  ): Promise<Address | null> {
    try {
      const addressData = {
        address: {
          id_customer: String(customerId),
          id_country: String(data.countryId),
          alias: data.alias,
          lastname: data.lastName,
          firstname: data.firstName,
          address1: data.address1,
          address2: data.address2 || "",
          postcode: data.postcode,
          city: data.city,
          phone: data.phone || "",
          company: data.company || "",
        },
      };

      const response = await this.fetch<PSResponse<PSAddress>>("addresses", {
        method: "POST",
        body: JSON.stringify(addressData),
      });

      const addr = response.address as PSAddress;

      // Get country name
      const countriesResponse = await this.fetch<PSResponse<PSCountry[]>>(
        `countries/${data.countryId}?display=full`
      );
      const country = (countriesResponse.countries as PSCountry[])?.[0];
      const countryName = country ? this.getMultiLangValue(country.name) : "Polska";

      return {
        id: addr.id,
        alias: addr.alias,
        firstName: addr.firstname,
        lastName: addr.lastname,
        company: addr.company || undefined,
        address1: addr.address1,
        address2: addr.address2 || undefined,
        postcode: addr.postcode,
        city: addr.city,
        country: countryName,
        countryId: parseInt(addr.id_country),
        phone: addr.phone || undefined,
        phoneMobile: addr.phone_mobile || undefined,
      };
    } catch (error) {
      console.error("Error creating address:", error);
      return null;
    }
  }

  async deleteAddress(addressId: number): Promise<boolean> {
    try {
      await this.fetch(`addresses/${addressId}`, {
        method: "DELETE",
      });
      return true;
    } catch (error) {
      console.error("Error deleting address:", error);
      return false;
    }
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      await this.fetch("products?limit=1");
      return true;
    } catch {
      return false;
    }
  }
}

// Singleton instance
export const prestashop = new PrestaShopClient();
export default prestashop;
