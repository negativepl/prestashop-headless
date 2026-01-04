import type {
  BinshopsProductDetail,
  BinshopsProductListItem,
  BinshopsCategoryProductsResponse,
  BinshopsBootstrapResponse,
  BinshopsLoginResponse,
  BinshopsRegisterResponse,
  BinshopsAccountInfoResponse,
  BinshopsOrderHistoryResponse,
  BinshopsOrder,
  BinshopsAddressResponse,
  BinshopsAddress,
  BinshopsCarriersResponse,
  BinshopsPaymentOptionsResponse,
  BinshopsCartUpdateResponse,
  BinshopsNewProductsResponse,
  BinshopsBestSalesResponse,
  BinshopsFeaturedProductsResponse,
  BinshopsRelatedProductsResponse,
  BinshopsResponse,
  BinshopsCategoryTree,
} from "./types";
import { apiLogger, logError } from "@/lib/logger";

// Re-export frontend types from prestashop (they stay the same)
import type {
  Product,
  Category,
  Order,
  OrderItem,
  Address,
} from "@/lib/prestashop/types";

export type { Product, Category, Order, OrderItem, Address };

interface BinshopsClientOptions {
  sessionCookie?: string;
  baseUrl?: string;
  apiKey?: string;
}

export class BinshopsClient {
  private baseUrl: string;
  private apiKey: string;
  private sessionCookie: string | null = null;

  constructor(options?: BinshopsClientOptions) {
    this.baseUrl = options?.baseUrl || process.env.PRESTASHOP_URL || "http://localhost:8080";
    this.apiKey = options?.apiKey || process.env.BINSHOPS_API_KEY || "";
    this.sessionCookie = options?.sessionCookie || null;
  }

  private getHeaders(withAuth: boolean = false): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (withAuth && this.apiKey) {
      headers["Authorization"] = `Basic ${this.apiKey}`;
    }

    if (this.sessionCookie) {
      headers["Cookie"] = this.sessionCookie;
    }

    return headers;
  }

  private async fetch<T>(
    endpoint: string,
    options?: RequestInit & { withAuth?: boolean },
    cacheTime: number = 300 // 5 minutes default cache
  ): Promise<T> {
    // Use non-friendly URL format (works without route registration)
    // endpoint format: "controller?param=value" -> "index.php?fc=module&module=binshopsrest&controller=XXX&param=value"
    const [controller, queryString] = endpoint.split("?");

    // Build URL with fc, module, controller FIRST, then other params
    const baseParams = `fc=module&module=binshopsrest&controller=${controller}`;
    const url = queryString
      ? `${this.baseUrl}/index.php?${baseParams}&${queryString}`
      : `${this.baseUrl}/index.php?${baseParams}`;

    const { withAuth, ...fetchOptions } = options || {};

    const shouldCache = !endpoint.includes("cart") &&
                       !endpoint.includes("account") &&
                       !endpoint.includes("order") &&
                       cacheTime > 0;

    const response = await fetch(url, {
      ...fetchOptions,
      headers: this.getHeaders(withAuth),
      credentials: "include" as RequestCredentials,
      ...(shouldCache ? { next: { revalidate: cacheTime } } : { cache: "no-store" }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      // Log endpoint only (not full URL) to avoid exposing sensitive data
      apiLogger.error({ status: response.status, endpoint, error: errorText.slice(0, 200) }, "Binshops API error");
      throw new Error(`Binshops API error: ${response.status} ${response.statusText}`);
    }

    // Save session cookie for subsequent requests
    // Try getSetCookie() first (modern method), fallback to get("set-cookie")
    const setCookieHeaders = (response.headers as any).getSetCookie?.() || [];
    const setCookieHeader = response.headers.get("set-cookie");

    const allCookies: string[] = [];
    if (setCookieHeaders.length > 0) {
      allCookies.push(...setCookieHeaders);
    } else if (setCookieHeader) {
      // Fallback: might be comma-separated or single value
      allCookies.push(setCookieHeader);
    }

    for (const cookie of allCookies) {
      // Extract just the cookie name=value part (before any semicolons)
      const cookiePart = cookie.split(";")[0];
      if (!cookiePart) continue;

      // Merge with existing cookies if we have any
      if (this.sessionCookie) {
        const existingCookies = this.sessionCookie.split("; ").filter(c => {
          const existingName = c.split("=")[0];
          const newName = cookiePart.split("=")[0];
          return existingName !== newName;
        });
        existingCookies.push(cookiePart);
        this.sessionCookie = existingCookies.join("; ");
      } else {
        this.sessionCookie = cookiePart;
      }
    }

    return response.json();
  }

  // =====================
  // PRODUCTS
  // =====================

  async getProduct(id: number): Promise<Product | null> {
    try {
      const response = await this.fetch<any>(
        `productdetail?product_id=${id}&image_type=large&with_all_images=1`
      );

      if (!response.success || !response.psdata) {
        return null;
      }

      // psdata is the product directly, not { product: ... }
      return this.mapProduct(response.psdata);
    } catch (error) {
      console.error("Error fetching product:", error);
      return null;
    }
  }

  async getProducts(params?: {
    limit?: number;
    offset?: number;
    categoryId?: number;
    page?: number;
    sortBy?: "date" | "price_asc" | "price_desc" | "name" | "sales";
  }): Promise<{ products: Product[]; total: number; pagination?: any }> {
    const categoryId = params?.categoryId || 2; // Root category
    const page = params?.page || Math.floor((params?.offset || 0) / (params?.limit || 24)) + 1;
    const resultsPerPage = params?.limit || 24;

    // Map sort options to Binshops format
    const sortMap: Record<string, string> = {
      date: "product.date_add.desc",
      price_asc: "product.price.asc",
      price_desc: "product.price.desc",
      name: "product.name.asc",
      sales: "product.sales.desc",
    };
    const order = sortMap[params?.sortBy || "date"] || "product.date_add.desc";

    try {
      const response = await this.fetch<BinshopsCategoryProductsResponse>(
        `categoryproducts?id_category=${categoryId}&page=${page}&resultsPerPage=${resultsPerPage}&with_all_images=0&image_size=home_default&order=${order}`
      );

      if (!response.success || !response.psdata?.products) {
        return { products: [], total: 0 };
      }

      const products = response.psdata.products.map((p) => this.mapProductListItem(p));

      return {
        products,
        total: response.psdata.pagination?.total_items || products.length,
        pagination: response.psdata.pagination,
      };
    } catch (error) {
      console.error("Error fetching products:", error);
      return { products: [], total: 0 };
    }
  }

  async getNewProducts(limit: number = 10): Promise<Product[]> {
    try {
      const response = await this.fetch<BinshopsNewProductsResponse>("new-products");

      if (!response.success || !response.psdata?.products) {
        return [];
      }

      return response.psdata.products.slice(0, limit).map((p) => this.mapProductListItem(p));
    } catch (error) {
      console.error("Error fetching new products:", error);
      return [];
    }
  }

  async getBestSellers(limit: number = 10): Promise<Product[]> {
    try {
      const response = await this.fetch<BinshopsBestSalesResponse>("best-sales");

      if (!response.success || !response.psdata?.products) {
        return [];
      }

      return response.psdata.products.slice(0, limit).map((p) => this.mapProductListItem(p));
    } catch (error) {
      console.error("Error fetching best sellers:", error);
      return [];
    }
  }

  async getFeaturedProducts(limit: number = 10): Promise<Product[]> {
    try {
      const response = await this.fetch<any>("featuredproducts");

      if (!response.success) {
        return [];
      }

      // psdata can be array directly or { products: [] }
      const products = Array.isArray(response.psdata)
        ? response.psdata
        : response.psdata?.products || [];

      return products.slice(0, limit).map((p: any) => this.mapProductListItem(p));
    } catch (error) {
      console.error("Error fetching featured products:", error);
      return [];
    }
  }

  async getRelatedProducts(productId: number, limit: number = 10): Promise<Product[]> {
    try {
      const response = await this.fetch<BinshopsRelatedProductsResponse>(
        `related-products?id_product=${productId}`
      );

      if (!response.success || !response.psdata?.products) {
        return [];
      }

      return response.psdata.products.slice(0, limit).map((p) => this.mapProductListItem(p));
    } catch (error) {
      console.error("Error fetching related products:", error);
      return [];
    }
  }

  async searchProducts(query: string, limit: number = 10): Promise<Product[]> {
    try {
      const response = await this.fetch<BinshopsCategoryProductsResponse>(
        `productsearch?s=${encodeURIComponent(query)}&resultsPerPage=${limit}`
      );

      if (!response.success || !response.psdata?.products) {
        return [];
      }

      return response.psdata.products.map((p) => this.mapProductListItem(p));
    } catch (error) {
      console.error("Error searching products:", error);
      return [];
    }
  }

  async getProductsByIds(ids: number[]): Promise<Product[]> {
    // Fetch products in parallel
    const products = await Promise.all(
      ids.map((id) => this.getProduct(id))
    );

    // Filter out nulls and maintain order
    return products.filter((p): p is Product => p !== null);
  }

  async getProductIdsWithStock(categoryId: number): Promise<{ id: number; quantity: number }[]> {
    try {
      const allProducts: { id: number; quantity: number }[] = [];
      let page = 1;
      const pageSize = 50; // Binshops can handle 50 products per request
      let hasMore = true;

      while (hasMore) {
        const { products, total } = await this.getProducts({
          categoryId,
          limit: pageSize,
          page,
        });

        allProducts.push(
          ...products.map((p) => ({
            id: p.id,
            quantity: p.quantity || 0,
          }))
        );

        // Check if there are more pages
        hasMore = allProducts.length < total && products.length === pageSize;
        page++;

        // Safety limit to prevent infinite loops
        if (page > 20) break;
      }

      return allProducts;
    } catch (error) {
      console.error("Error fetching product IDs with stock:", error);
      return [];
    }
  }

  // =====================
  // CATEGORIES
  // =====================

  async getBootstrap(): Promise<BinshopsBootstrapResponse | null> {
    try {
      const response = await this.fetch<BinshopsBootstrapResponse>(
        "bootstrap?menu_with_images=single"
      );
      return response;
    } catch (error) {
      console.error("Error fetching bootstrap:", error);
      return null;
    }
  }

  async getCategoryTree(): Promise<Category[]> {
    const bootstrap = await this.getBootstrap();

    // Binshops returns categories in menuItems, not categories
    if (!bootstrap?.psdata?.menuItems) {
      return [];
    }

    // Filter only category-type menu items and map them
    const categoryItems = bootstrap.psdata.menuItems.filter(
      (item: any) => item.type === "category"
    );

    return this.mapMenuItemsToCategories(categoryItems);
  }

  async getCategory(id: number): Promise<Category | null> {
    const bootstrap = await this.getBootstrap();
    if (!bootstrap?.psdata?.menuItems) {
      return null;
    }

    const findCategory = (items: any[]): Category | null => {
      for (const item of items) {
        if (item.type !== "category") continue;

        if (item.id === id) {
          return {
            id: item.id,
            name: item.label,
            description: "",
            parentId: 0,
            level: item.depth || 0,
            active: true,
            children: item.children?.length > 0
              ? this.mapMenuItemsToCategories(item.children.filter((c: any) => c.type === "category"))
              : undefined,
          };
        }
        if (item.children) {
          const found = findCategory(item.children);
          if (found) return found;
        }
      }
      return null;
    };

    return findCategory(bootstrap.psdata.menuItems);
  }

  async getCategoryPathBySlug(slug: string): Promise<Category[]> {
    const bootstrap = await this.getBootstrap();
    if (!bootstrap?.psdata?.menuItems) {
      return [];
    }

    const path: Category[] = [];

    const findPath = (items: any[], currentPath: Category[]): boolean => {
      for (const item of items) {
        if (item.type !== "category") continue;

        const category: Category = {
          id: item.id,
          name: item.label,
          description: "",
          parentId: 0,
          level: item.depth || 0,
          active: true,
        };

        const newPath = [...currentPath, category];

        if (item.slug === slug) {
          path.push(...newPath);
          return true;
        }

        if (item.children && findPath(item.children, newPath)) {
          return true;
        }
      }
      return false;
    };

    findPath(bootstrap.psdata.menuItems, []);
    return path;
  }

  async getCategories(params?: { parentId?: number }): Promise<Category[]> {
    const tree = await this.getCategoryTree();

    if (!params?.parentId) {
      return tree;
    }

    // Find parent and return its children
    const findChildren = (categories: Category[]): Category[] => {
      for (const cat of categories) {
        if (cat.id === params.parentId) {
          return cat.children || [];
        }
        if (cat.children) {
          const found = findChildren(cat.children);
          if (found.length > 0) return found;
        }
      }
      return [];
    };

    return findChildren(tree);
  }

  // =====================
  // AUTHENTICATION
  // =====================

  async login(
    email: string,
    password: string
  ): Promise<{ success: boolean; customer?: any; error?: string }> {
    try {
      // Binshops uses Tools::getValue() which expects URL params or form-urlencoded, not JSON
      const params = new URLSearchParams({ email, password });

      const response = await this.fetch<any>(`login?${params.toString()}`, {
        method: "POST",
      });

      // Binshops returns user data in psdata.user, not psdata.customer
      const user = response.psdata?.user || response.psdata?.customer;

      if (response.success && response.code === 200 && user) {
        return {
          success: true,
          customer: {
            id: user.id,
            email: user.email,
            firstName: user.firstname,
            lastName: user.lastname,
          },
        };
      }

      return {
        success: false,
        error: response.psdata?.message || response.message || "Nieprawidłowy email lub hasło",
      };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Wystąpił błąd podczas logowania" };
    }
  }

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    gender?: string;
    birthday?: string;
    newsletter?: boolean;
  }): Promise<{ success: boolean; customerId?: number; error?: string }> {
    try {
      // Binshops register only accepts basic fields
      const params = new URLSearchParams({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      });

      const response = await this.fetch<any>(`register?${params.toString()}`, {
        method: "POST",
      });

      if (response.success && response.code === 200 && response.psdata?.registered) {
        const customerId = parseInt(response.psdata.customer_id);

        // After successful registration, login first then update profile
        if (data.gender || data.birthday || data.newsletter) {
          // First call lightbootstrap (no cache) to get session cookies (as per Binshops docs)
          await this.initSession();

          // Login to get session cookie
          const loginResult = await this.login(data.email, data.password);

          if (loginResult.success) {
            await this.updateAccountAfterRegister({
              email: data.email,
              password: data.password,
              firstName: data.firstName,
              lastName: data.lastName,
              gender: data.gender,
              birthday: data.birthday,
              newsletter: data.newsletter,
            });
          }
        }

        // Also subscribe via emailsubscription endpoint for module compatibility
        if (data.newsletter) {
          await this.subscribeToNewsletter(data.email);
        }

        return {
          success: true,
          customerId,
        };
      }

      // Handle specific error codes from Binshops
      const errorMessages: Record<number, string> = {
        301: "Email jest wymagany",
        304: "Imię jest wymagane",
        305: "Nazwisko jest wymagane",
        306: "Hasło jest wymagane",
        310: response.psdata || "Hasło jest zbyt słabe",
      };

      return {
        success: false,
        error: errorMessages[response.code] || response.psdata || response.message || "Wystąpił błąd podczas rejestracji",
      };
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, error: "Wystąpił błąd podczas rejestracji" };
    }
  }

  private async updateAccountAfterRegister(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    gender?: string;
    birthday?: string;
    newsletter?: boolean;
  }): Promise<boolean> {
    try {
      // Use URL params like other Binshops endpoints
      const params = new URLSearchParams({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      });

      if (data.gender) {
        params.set("gender", data.gender);
      }
      if (data.birthday) {
        params.set("birthday", data.birthday);
      }
      if (data.newsletter !== undefined) {
        params.set("newsletter", data.newsletter ? "1" : "0");
      }

      const response = await this.fetch<any>(`accountedit?${params.toString()}`, {
        method: "POST",
      });

      return response.success;
    } catch (error) {
      console.error("Error updating account after register:", error);
      return false;
    }
  }

  async subscribeToNewsletter(email: string): Promise<boolean> {
    try {
      const response = await this.fetch<any>(`emailsubscription?email=${encodeURIComponent(email)}`, {
        method: "POST",
      });
      return response.success;
    } catch (error) {
      console.error("Error subscribing to newsletter:", error);
      return false;
    }
  }

  async logout(): Promise<boolean> {
    try {
      await this.fetch("logout");
      this.sessionCookie = null;
      return true;
    } catch {
      return false;
    }
  }

  async getAccountInfo(): Promise<{
    id: number;
    email: string;
    firstName: string;
    lastName: string;
  } | null> {
    try {
      const response = await this.fetch<BinshopsAccountInfoResponse>("accountinfo");
      console.log("accountinfo API response:", JSON.stringify(response, null, 2));

      if (response.success && response.psdata?.customer) {
        const c = response.psdata.customer;
        return {
          id: c.id,
          email: c.email,
          firstName: c.firstname,
          lastName: c.lastname,
        };
      }

      return null;
    } catch (error) {
      console.error("getAccountInfo error:", error);
      return null;
    }
  }

  async updateAccount(data: {
    email?: string;
    firstName?: string;
    lastName?: string;
    password?: string;
    newPassword?: string;
  }): Promise<boolean> {
    try {
      const response = await this.fetch<BinshopsResponse<any>>("accountedit", {
        method: "POST",
        body: JSON.stringify({
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          password: data.password,
          new_password: data.newPassword,
        }),
      });

      return response.success;
    } catch {
      return false;
    }
  }

  // =====================
  // ORDERS
  // =====================

  async getCustomerOrders(): Promise<Order[]> {
    try {
      const response = await this.fetch<BinshopsOrderHistoryResponse>("orderhistory");

      if (!response.success || !response.psdata?.orders) {
        return [];
      }

      return response.psdata.orders.map((o) => this.mapOrder(o));
    } catch (error) {
      console.error("Error fetching orders:", error);
      return [];
    }
  }

  async getOrder(orderId: number): Promise<Order | null> {
    try {
      const response = await this.fetch<BinshopsResponse<{ order: BinshopsOrder }>>(
        `orderhistory?id_order=${orderId}`
      );

      if (!response.success || !response.psdata?.order) {
        return null;
      }

      return this.mapOrder(response.psdata.order);
    } catch (error) {
      console.error("Error fetching order:", error);
      return null;
    }
  }

  // =====================
  // ADDRESSES
  // =====================

  async getCustomerAddresses(): Promise<Address[]> {
    try {
      const response = await this.fetch<BinshopsAddressResponse>("alladdresses");

      if (!response.success || !response.psdata?.addresses) {
        return [];
      }

      return response.psdata.addresses.map((a) => this.mapAddress(a));
    } catch (error) {
      console.error("Error fetching addresses:", error);
      return [];
    }
  }

  async createAddress(data: {
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
  }): Promise<Address | null> {
    try {
      const response = await this.fetch<BinshopsResponse<{ address: BinshopsAddress }>>(
        "address",
        {
          method: "POST",
          body: JSON.stringify({
            alias: data.alias,
            firstname: data.firstName,
            lastname: data.lastName,
            address1: data.address1,
            address2: data.address2 || "",
            postcode: data.postcode,
            city: data.city,
            id_country: data.countryId,
            phone: data.phone || "",
            company: data.company || "",
          }),
        }
      );

      if (response.success && response.psdata?.address) {
        return this.mapAddress(response.psdata.address);
      }

      return null;
    } catch (error) {
      console.error("Error creating address:", error);
      return null;
    }
  }

  async deleteAddress(addressId: number): Promise<boolean> {
    try {
      const response = await this.fetch<BinshopsResponse<any>>("address", {
        method: "DELETE",
        body: JSON.stringify({ id_address: addressId }),
      });

      return response.success;
    } catch {
      return false;
    }
  }

  // =====================
  // CART
  // =====================

  async getCart(): Promise<BinshopsCartUpdateResponse | null> {
    try {
      const response = await this.fetch<BinshopsCartUpdateResponse>(
        "cart?image_size=medium_default"
      );
      return response;
    } catch {
      return null;
    }
  }

  async addToCart(
    productId: number,
    quantity: number = 1,
    productAttributeId: number = 0
  ): Promise<BinshopsCartUpdateResponse | null> {
    try {
      const response = await this.fetch<BinshopsCartUpdateResponse>(
        `cart?update=1&id_product=${productId}&id_product_attribute=${productAttributeId}&op=up&action=update&qty=${quantity}&image_size=medium_default`
      );
      return response;
    } catch {
      return null;
    }
  }

  async updateCartItem(
    productId: number,
    quantity: number,
    productAttributeId: number = 0
  ): Promise<BinshopsCartUpdateResponse | null> {
    try {
      const response = await this.fetch<BinshopsCartUpdateResponse>(
        `cart?update=1&id_product=${productId}&id_product_attribute=${productAttributeId}&action=update&qty=${quantity}&image_size=medium_default`
      );
      return response;
    } catch {
      return null;
    }
  }

  async removeFromCart(
    productId: number,
    productAttributeId: number = 0
  ): Promise<BinshopsCartUpdateResponse | null> {
    try {
      const response = await this.fetch<BinshopsCartUpdateResponse>(
        `cart?delete=1&id_product=${productId}&id_product_attribute=${productAttributeId}&action=update&image_size=medium_default`
      );
      return response;
    } catch {
      return null;
    }
  }

  async applyVoucher(code: string): Promise<BinshopsCartUpdateResponse | null> {
    try {
      const response = await this.fetch<BinshopsCartUpdateResponse>(
        `cart?action=update&addDiscount=1&discount_name=${encodeURIComponent(code)}&image_size=medium_default`
      );
      return response;
    } catch {
      return null;
    }
  }

  async removeVoucher(cartRuleId: number): Promise<BinshopsCartUpdateResponse | null> {
    try {
      const response = await this.fetch<BinshopsCartUpdateResponse>(
        `cart?action=update&deleteDiscount=${cartRuleId}&image_size=medium_default`
      );
      return response;
    } catch {
      return null;
    }
  }

  // =====================
  // CHECKOUT
  // =====================

  async setCheckoutAddress(
    deliveryAddressId: number,
    invoiceAddressId?: number
  ): Promise<boolean> {
    try {
      const response = await this.fetch<BinshopsResponse<any>>("setaddresscheckout", {
        method: "POST",
        body: JSON.stringify({
          id_address_delivery: deliveryAddressId,
          id_address_invoice: invoiceAddressId || deliveryAddressId,
        }),
      });
      return response.success;
    } catch {
      return false;
    }
  }

  async getCarriers(): Promise<BinshopsCarriersResponse | null> {
    try {
      const response = await this.fetch<BinshopsCarriersResponse>("carriers");
      return response;
    } catch {
      return null;
    }
  }

  async setCarrier(addressId: number, carrierId: number): Promise<boolean> {
    try {
      const response = await this.fetch<BinshopsResponse<any>>("setcarriercheckout", {
        method: "POST",
        body: JSON.stringify({
          id_address: addressId,
          id_carrier: carrierId,
        }),
      });
      return response.success;
    } catch {
      return false;
    }
  }

  async getPaymentOptions(): Promise<BinshopsPaymentOptionsResponse | null> {
    try {
      const response = await this.fetch<BinshopsPaymentOptionsResponse>("paymentoptions");
      return response;
    } catch {
      return null;
    }
  }

  // =====================
  // MAPPERS
  // =====================

  private mapProduct(p: any): Product {
    // Handle product detail response
    const price = p.float_price ?? p.price_amount ?? p.price_without_reduction ?? 0;
    const imageUrl = p.cover_image || null;
    // Handle different image formats: string, {url: "..."}, {src: "..."}, or full object
    const images = p.images?.map((img: any) => {
      if (typeof img === "string") return img;
      return img.url || img.src || img.large || img.medium || img.small || null;
    }).filter(Boolean) || (imageUrl ? [imageUrl] : []);

    return {
      id: p.id_product,
      name: p.name,
      description: p.description || "",
      descriptionShort: p.description_short || "",
      price: typeof price === "number" ? price : parseFloat(String(price).replace(",", ".").replace(/[^\d.]/g, "")) || 0,
      reference: p.reference || "",
      ean13: p.ean13 || null,
      imageUrl,
      images,
      categoryId: p.id_category_default || 0,
      categorySlug: p.category_name || null,
      active: p.active === 1 || p.active === "1" || p.active === true,
      quantity: p.quantity ?? 0,
      weight: parseFloat(p.weight) || 0,
      manufacturerId: p.id_manufacturer || 0,
      manufacturerName: p.manufacturer_name || null,
      features: p.features?.map((f: any) => ({
        id: 0,
        name: f.name,
        value: f.value,
      })) || [],
    };
  }

  private mapProductListItem(p: any): Product {
    // Handle both list item format and full product format
    // NOTE: We intentionally skip description/descriptionShort here to reduce response size
    // Full descriptions are only fetched in getProduct() for product detail page
    const price = p.price_amount ?? p.float_price ?? p.price_without_reduction ?? 0;
    const imageUrl = p.cover_image || p.cover?.url || null;

    return {
      id: p.id_product,
      name: p.name,
      description: "", // Skipped for list performance
      descriptionShort: "", // Skipped for list performance
      price: typeof price === "number" ? price : parseFloat(String(price).replace(",", ".").replace(/[^\d.]/g, "")) || 0,
      reference: p.reference || "",
      ean13: p.ean13 || null,
      imageUrl,
      images: imageUrl ? [imageUrl] : [],
      categoryId: p.id_category_default || 0,
      categorySlug: p.category_name || null,
      active: p.active === 1 || p.active === "1" || p.active === true,
      quantity: p.quantity ?? 0,
      weight: parseFloat(p.weight) || 0,
      manufacturerId: p.id_manufacturer || 0,
      manufacturerName: p.manufacturer_name || null,
      features: [],
    };
  }

  private mapCategoryTree(categories: BinshopsCategoryTree[]): Category[] {
    return categories.map((c) => ({
      id: c.id,
      name: c.name,
      description: "",
      parentId: 0,
      level: 0,
      active: true,
      children: c.children ? this.mapCategoryTree(c.children) : undefined,
    }));
  }

  private mapMenuItemsToCategories(items: any[]): Category[] {
    return items
      .filter((item) => item.type === "category")
      .map((item) => ({
        id: item.id,
        name: item.label,
        description: "",
        parentId: 0,
        level: item.depth || 0,
        active: true,
        children: item.children?.length > 0
          ? this.mapMenuItemsToCategories(item.children)
          : undefined,
      }));
  }

  private mapOrder(o: BinshopsOrder): Order {
    const items: OrderItem[] = o.details?.products?.map((p) => ({
      id: p.id_order_detail,
      productId: p.id_product,
      productName: p.product_name,
      productReference: p.product_reference || "",
      quantity: p.product_quantity,
      unitPrice: p.unit_price_tax_incl,
    })) || [];

    return {
      id: o.id_order,
      reference: o.reference,
      status: o.order_state,
      statusId: o.id_order_state,
      dateAdd: o.date_add,
      totalPaid: o.total_paid,
      totalProducts: o.total_products,
      totalShipping: o.total_shipping,
      payment: o.payment,
      items,
    };
  }

  private mapAddress(a: BinshopsAddress): Address {
    return {
      id: a.id_address,
      alias: a.alias,
      firstName: a.firstname,
      lastName: a.lastname,
      company: a.company || undefined,
      address1: a.address1,
      address2: a.address2 || undefined,
      postcode: a.postcode,
      city: a.city,
      country: a.country,
      countryId: a.id_country,
      phone: a.phone || undefined,
      phoneMobile: a.phone_mobile || undefined,
    };
  }

  // Initialize session (get cookies without cache)
  async initSession(): Promise<void> {
    try {
      // Reset session cookie first
      this.sessionCookie = null;
      // Call lightbootstrap without cache to get fresh session cookies
      await this.fetch<any>("lightbootstrap", { cache: "no-store" }, 0);
      console.log("[Binshops] Session initialized, cookie:", this.sessionCookie ? "set" : "not set");
    } catch (error) {
      console.error("[Binshops] Failed to initialize session:", error);
      // Ignore errors, we just want the cookies
    }
  }

  // Get current session cookie (for debugging)
  getSessionCookie(): string | null {
    return this.sessionCookie;
  }

  // Test connection
  async testConnection(): Promise<boolean> {
    try {
      const response = await this.fetch<BinshopsBootstrapResponse>("lightbootstrap");
      return response.success;
    } catch {
      return false;
    }
  }
}

// Singleton instance
export const binshops = new BinshopsClient();
export default binshops;
