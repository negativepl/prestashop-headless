import type {
  PSProduct,
  PSCategory,
  PSCart,
  PSStockAvailable,
  PSOrder,
  PSOrderState,
  PSAddress,
  PSCountry,
  PSMultiLang,
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
  private countryId: number;
  private taxRatesCache: Map<number, number> | null = null; // tax_rules_group_id -> rate

  constructor() {
    this.baseUrl = process.env.PRESTASHOP_URL || "http://localhost:8080";
    this.apiKey = process.env.PRESTASHOP_API_KEY || "";
    this.langId = 1; // Polish
    this.countryId = 14; // Poland
  }

  // Load tax rates from API and build cache
  private async loadTaxRates(): Promise<Map<number, number>> {
    if (this.taxRatesCache) return this.taxRatesCache;

    try {
      // Fetch all taxes (id -> rate)
      const taxesResponse = await this.fetch<{ taxes: { id: number; rate: string }[] }>(
        "taxes?display=full",
        undefined,
        3600 // Cache for 1 hour
      );
      const taxesMap = new Map<number, number>();
      for (const tax of taxesResponse.taxes || []) {
        taxesMap.set(tax.id, parseFloat(tax.rate) || 0);
      }

      // Fetch tax rules for our country
      const rulesResponse = await this.fetch<{
        tax_rules: { id_tax_rules_group: string; id_country: string; id_tax: string }[];
      }>("tax_rules?display=full", undefined, 3600);

      // Build map: tax_rules_group_id -> rate (for our country)
      this.taxRatesCache = new Map<number, number>();
      for (const rule of rulesResponse.tax_rules || []) {
        const countryId = parseInt(rule.id_country);
        if (countryId === this.countryId || countryId === 0) {
          const groupId = parseInt(rule.id_tax_rules_group);
          const taxId = parseInt(rule.id_tax);
          const rate = taxesMap.get(taxId) || 0;
          this.taxRatesCache.set(groupId, rate);
        }
      }

      return this.taxRatesCache;
    } catch (error) {
      console.error("Failed to load tax rates:", error);
      // Fallback: return empty map (will use 0% tax)
      this.taxRatesCache = new Map();
      return this.taxRatesCache;
    }
  }

  // Get tax rate for a product's tax_rules_group
  private async getTaxRate(taxRulesGroupId: number): Promise<number> {
    const rates = await this.loadTaxRates();
    return rates.get(taxRulesGroupId) || 0;
  }

  private getHeaders(): HeadersInit {
    return {
      Authorization: `Basic ${Buffer.from(this.apiKey + ":").toString("base64")}`,
      "Content-Type": "application/json",
    };
  }

  private async fetch<T>(
    endpoint: string,
    options?: RequestInit,
    cacheTime: number = 60
  ): Promise<T> {
    const url = `${this.baseUrl}/api/${endpoint}`;
    const separator = url.includes("?") ? "&" : "?";
    const fullUrl = `${url}${separator}output_format=JSON`;

    // Disable cache for requests with filters (customer-specific data)
    const shouldCache = !endpoint.includes("filter[") && cacheTime > 0;

    const response = await fetch(fullUrl, {
      ...options,
      headers: this.getHeaders(),
      ...(shouldCache ? { next: { revalidate: cacheTime } } : { cache: "no-store" }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`PrestaShop API error (${response.status}) for ${fullUrl}:`, errorText.slice(0, 200));
      throw new Error(`PrestaShop API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Fetch with XML body for POST/PUT requests (PrestaShop requires XML for write operations)
  private async fetchXml<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}/api/${endpoint}`;
    const separator = url.includes("?") ? "&" : "?";
    const fullUrl = `${url}${separator}output_format=JSON`;

    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        Authorization: `Basic ${Buffer.from(this.apiKey + ":").toString("base64")}`,
        "Content-Type": "application/xml",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("PrestaShop API error response:", text);
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
    withImages?: boolean;
    withStock?: boolean;
    sortByStock?: boolean;
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

    const requestedLimit = params?.limit || 24;
    const requestedOffset = params?.offset || 0;

    // When sorting by stock, fetch more to have a better pool to sort from
    // This ensures first pages have mostly in-stock products
    // Keep multipliers low to stay under 2MB cache limit
    let fetchMultiplier = 1;
    if (params?.sortByStock) {
      fetchMultiplier = 2; // fetch 2x more products to sort properly (reduced from 4x)
    }
    if (params?.withImages) {
      fetchMultiplier = fetchMultiplier * 1.5; // reduced from 3x
    }

    // Cap at 24 products per request to stay under 2MB cache limit (~75KB per product)
    const fetchLimit = Math.min(Math.ceil(requestedLimit * fetchMultiplier), 24);
    const fetchOffset = requestedOffset;

    const separator = endpoint.includes("?") ? "&" : "?";
    endpoint += `${separator}limit=${fetchOffset},${fetchLimit}`;

    // Sort by ID descending (newest first)
    endpoint += "&sort=[id_DESC]";
    endpoint += "&display=full";

    const response = await this.fetch<PSResponse<PSProduct[]>>(endpoint);
    let products: PSProduct[] = (response.products as PSProduct[]) || [];

    // Filter products with images if requested
    if (params?.withImages) {
      products = products.filter(p => (p.associations?.images?.length ?? 0) > 0);
    }

    // Fetch stock for all products if requested
    let stockMap: Map<number, number> = new Map();
    if (params?.withStock && products.length > 0) {
      try {
        const productIds = products.map(p => p.id);
        const stockResponse = await this.fetch<PSResponse<PSStockAvailable[]>>(
          `stock_availables?filter[id_product]=[${productIds.join("|")}]&filter[id_product_attribute]=0&display=[id_product,quantity]`
        );
        const stocks = (stockResponse.stock_availables as PSStockAvailable[]) || [];
        for (const stock of stocks) {
          stockMap.set(stock.id_product, stock.quantity);
        }
      } catch {
        // Stock not available
      }
    }

    // Sort by stock if requested (in-stock first, out-of-stock last)
    if (params?.sortByStock) {
      products.sort((a, b) => {
        const aQty = stockMap.get(a.id) ?? 999;
        const bQty = stockMap.get(b.id) ?? 999;
        const aInStock = aQty > 0 ? 0 : 1;
        const bInStock = bQty > 0 ? 0 : 1;
        return aInStock - bInStock;
      });
    }

    // Limit to requested amount
    if (params?.limit) {
      products = products.slice(0, requestedLimit);
    }

    return Promise.all(products.map((p) => this.mapProduct(p, false, stockMap.get(p.id))));
  }

  // Lightweight method - returns only product IDs with stock quantities
  async getProductIdsWithStock(categoryId: number): Promise<{ id: number; quantity: number }[]> {
    // Fetch all product IDs for category (just IDs, minimal data)
    const endpoint = `products?filter[id_category_default]=${categoryId}&filter[active]=1&display=[id]&limit=1000`;
    const response = await this.fetch<PSResponse<{ id: number }[]>>(endpoint);
    const products = (response.products || []) as { id: number }[];

    if (products.length === 0) return [];

    // Fetch stock for all products in one request
    const productIds = products.map(p => p.id);
    let stockMap: Map<number, number> = new Map();

    try {
      const stockResponse = await this.fetch<PSResponse<PSStockAvailable[]>>(
        `stock_availables?filter[id_product]=[${productIds.join("|")}]&filter[id_product_attribute]=0&display=[id_product,quantity]&limit=1000`
      );
      const stocks = (stockResponse.stock_availables as PSStockAvailable[]) || [];
      for (const stock of stocks) {
        stockMap.set(stock.id_product, stock.quantity);
      }
    } catch {
      // Stock not available - assume all in stock
    }

    return products.map(p => ({
      id: p.id,
      quantity: stockMap.get(p.id) ?? 999,
    }));
  }

  // Fetch multiple products by IDs
  async getProductsByIds(ids: number[]): Promise<Product[]> {
    if (ids.length === 0) return [];

    const endpoint = `products?filter[id]=[${ids.join("|")}]&filter[active]=1&display=full`;
    const response = await this.fetch<PSResponse<PSProduct[]>>(endpoint);
    const products = (response.products as PSProduct[]) || [];

    // Fetch stock
    let stockMap: Map<number, number> = new Map();
    if (products.length > 0) {
      try {
        const stockResponse = await this.fetch<PSResponse<PSStockAvailable[]>>(
          `stock_availables?filter[id_product]=[${ids.join("|")}]&filter[id_product_attribute]=0&display=[id_product,quantity]`
        );
        const stocks = (stockResponse.stock_availables as PSStockAvailable[]) || [];
        for (const stock of stocks) {
          stockMap.set(stock.id_product, stock.quantity);
        }
      } catch {
        // Stock not available
      }
    }

    // Map products and maintain the order of input IDs
    const productMap = new Map<number, PSProduct>();
    products.forEach(p => productMap.set(p.id, p));

    const orderedProducts = ids
      .map(id => productMap.get(id))
      .filter((p): p is PSProduct => p !== undefined);

    return Promise.all(orderedProducts.map((p) => this.mapProduct(p, false, stockMap.get(p.id))));
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
      const rawProducts = response.products as PSProduct | PSProduct[] | undefined;
      const products: PSProduct[] = Array.isArray(rawProducts) ? rawProducts : rawProducts ? [rawProducts] : [];

      // Fetch stock for all products
      let stockMap: Map<number, number> = new Map();
      if (products.length > 0) {
        try {
          const productIds = products.map(p => p.id);
          const stockResponse = await this.fetch<PSResponse<PSStockAvailable[]>>(
            `stock_availables?filter[id_product]=[${productIds.join("|")}]&filter[id_product_attribute]=0&display=[id_product,quantity]`
          );
          const stocks = (stockResponse.stock_availables as PSStockAvailable[]) || [];
          for (const stock of stocks) {
            stockMap.set(stock.id_product, stock.quantity);
          }
        } catch {
          // Stock not available
        }
      }

      return Promise.all(products.map((p) => this.mapProduct(p, false, stockMap.get(p.id))));
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
      return this.mapProduct(product, true); // fetchExtras for single product
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

  private async mapProduct(p: PSProduct, fetchExtras: boolean = false, preloadedQuantity?: number): Promise<Product> {
    const imageIds = p.associations?.images?.map((img) => img.id) || [];
    const images = imageIds.map((imgId) => this.getPublicImageUrl(imgId));

    let quantity: number | null = preloadedQuantity ?? null;
    let manufacturerName: string | null = (p as any).manufacturer_name || null;

    // Only fetch extras for single product view (not for lists)
    if (fetchExtras) {
      try {
        const stockResponse = await this.fetch<PSResponse<PSStockAvailable[]>>(
          `stock_availables?filter[id_product]=${p.id}&filter[id_product_attribute]=0&display=[id_product,quantity]`
        );
        const stocks = (stockResponse.stock_availables as PSStockAvailable[]) || [];
        if (stocks.length > 0) {
          quantity = (stocks[0] as PSStockAvailable).quantity;
        }
      } catch {
        // Stock not available
      }

      if (!manufacturerName && p.id_manufacturer && p.id_manufacturer > 0) {
        try {
          const mfResponse = await this.fetch<PSResponse<{ id: number; name: string }[]>>(
            `manufacturers/${p.id_manufacturer}?display=full`
          );
          const manufacturerRaw = mfResponse.manufacturers?.[0] || mfResponse.manufacturer;
          const manufacturer = Array.isArray(manufacturerRaw) ? manufacturerRaw[0] : manufacturerRaw;
          if (manufacturer) {
            manufacturerName = manufacturer.name;
          }
        } catch {
          // Manufacturer not available
        }
      }
    }

    // Fetch product features
    const features: { id: number; name: string; value: string }[] = [];
    if (fetchExtras && p.associations?.product_features?.length) {
      try {
        for (const feature of p.associations.product_features) {
          // Fetch feature name
          const featureResponse = await this.fetch<PSResponse<{ product_feature: { id: number; name: PSMultiLang[] } }>>(
            `product_features/${feature.id}?display=full`
          );
          const featureData = (featureResponse as any).product_feature || (featureResponse as any).product_features?.[0];

          // Fetch feature value
          const valueResponse = await this.fetch<PSResponse<{ product_feature_value: { id: number; value: PSMultiLang[] } }>>(
            `product_feature_values/${feature.id_feature_value}?display=full`
          );
          const valueData = (valueResponse as any).product_feature_value || (valueResponse as any).product_feature_values?.[0];

          if (featureData && valueData) {
            features.push({
              id: parseInt(feature.id),
              name: this.getMultiLangValue(featureData.name),
              value: this.getMultiLangValue(valueData.value),
            });
          }
        }
      } catch {
        // Features not available
      }
    }

    // Calculate gross price (with VAT)
    const netPrice = parseFloat(p.price) || 0;
    const taxRate = await this.getTaxRate(p.id_tax_rules_group);
    const grossPrice = Math.round(netPrice * (1 + taxRate / 100) * 100) / 100;

    return {
      id: p.id,
      name: this.getMultiLangValue(p.name),
      description: this.getMultiLangValue(p.description),
      descriptionShort: this.getMultiLangValue(p.description_short),
      price: grossPrice,
      reference: p.reference,
      ean13: p.ean13 || null,
      imageUrl: images.length > 0 ? images[0] : null,
      images,
      categoryId: p.id_category_default,
      active: p.active === "1",
      quantity,
      weight: parseFloat(p.weight) || 0,
      manufacturerId: p.id_manufacturer,
      manufacturerName,
      features,
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
    const rawCategories = response.categories as PSCategory | PSCategory[] | undefined;
    const categories: PSCategory[] = Array.isArray(rawCategories) ? rawCategories : rawCategories ? [rawCategories] : [];

    return categories.map((c) => this.mapCategory(c));
  }

  async getCategory(id: number): Promise<Category | null> {
    try {
      const response = await this.fetch<PSResponse<PSCategory | PSCategory[]>>(`categories/${id}?display=full`);
      // API returns either { category: {...} } or { categories: [{...}] }
      const category = response.category
        ? (response.category as PSCategory)
        : (response.categories as PSCategory[])?.[0];
      if (!category) return null;
      return this.mapCategory(category);
    } catch {
      return null;
    }
  }

  async getCategoryPath(categoryId: number): Promise<Category[]> {
    const path: Category[] = [];
    let currentId = categoryId;

    // Root category in PrestaShop is usually id=2, stop there
    while (currentId > 2) {
      const category = await this.getCategory(currentId);
      if (!category) break;
      path.unshift(category); // Add at beginning to get correct order
      currentId = category.parentId;
    }

    return path;
  }

  async getCategoriesWithChildren(_rootParentId: number = 2): Promise<Category[]> {
    // Load from static JSON file (run `npx tsx scripts/sync-categories.ts` to update)
    try {
      const categories = await import("@/data/categories.json");
      return categories.default as Category[];
    } catch {
      console.error("Categories file not found. Run: npx tsx scripts/sync-categories.ts");
      return [];
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
      const rawStates = statesResponse.order_states as PSOrderState | PSOrderState[] | undefined;
      const states: PSOrderState[] = Array.isArray(rawStates) ? rawStates : rawStates ? [rawStates] : [];
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
      const rawStates2 = statesResponse.order_states as PSOrderState | PSOrderState[] | undefined;
      const states: PSOrderState[] = Array.isArray(rawStates2) ? rawStates2 : rawStates2 ? [rawStates2] : [];
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
      const rawAddresses = response.addresses as PSAddress | PSAddress[] | undefined;
      const addresses: PSAddress[] = Array.isArray(rawAddresses) ? rawAddresses : rawAddresses ? [rawAddresses] : [];

      // Get countries for names - with fallback for PrestaShop API issues
      const countriesMap = new Map<number, string>();
      // Hardcoded Poland as fallback (id=14)
      countriesMap.set(14, "Polska");

      try {
        const countriesResponse = await this.fetch<PSResponse<PSCountry[]>>(
          "countries?display=full"
        );
        const rawCountries = countriesResponse.countries as PSCountry | PSCountry[] | undefined;
        const countries: PSCountry[] = Array.isArray(rawCountries) ? rawCountries : rawCountries ? [rawCountries] : [];
        countries.forEach((country) => {
          countriesMap.set(country.id, this.getMultiLangValue(country.name));
        });
      } catch (countriesError) {
        console.warn("Could not fetch countries, using fallback:", countriesError);
      }

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
      // PrestaShop API requires XML for POST requests
      const xmlBody = `<?xml version="1.0" encoding="UTF-8"?>
<prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
  <address>
    <id_customer>${customerId}</id_customer>
    <id_country>${data.countryId}</id_country>
    <alias><![CDATA[${data.alias}]]></alias>
    <lastname><![CDATA[${data.lastName}]]></lastname>
    <firstname><![CDATA[${data.firstName}]]></firstname>
    <address1><![CDATA[${data.address1}]]></address1>
    <address2><![CDATA[${data.address2 || ""}]]></address2>
    <postcode><![CDATA[${data.postcode}]]></postcode>
    <city><![CDATA[${data.city}]]></city>
    <phone><![CDATA[${data.phone || ""}]]></phone>
    <company><![CDATA[${data.company || ""}]]></company>
  </address>
</prestashop>`;

      const response = await this.fetchXml<PSResponse<PSAddress>>("addresses", {
        method: "POST",
        body: xmlBody,
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
      const url = `${this.baseUrl}/api/addresses/${addressId}`;
      const response = await fetch(url, {
        method: "DELETE",
        headers: this.getHeaders(),
      });

      // DELETE returns 200/204 with empty body on success
      if (response.ok) {
        return true;
      }

      console.error(`Failed to delete address ${addressId}: ${response.status}`);
      return false;
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
