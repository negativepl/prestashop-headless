// Binshops REST API Pro Types
// These are the raw API response types from Binshops

// Product detail response
export interface BinshopsProductDetail {
  id_product: number;
  name: string;
  description: string;
  description_short: string;
  reference: string;
  ean13: string;
  price: number; // with tax
  price_without_reduction: number;
  regular_price: number;
  quantity: number;
  minimal_quantity: number;
  weight: number;
  manufacturer_name: string;
  id_manufacturer: number;
  category_name: string;
  id_category_default: number;
  cover_image: string;
  images: BinshopsImage[];
  features: BinshopsFeature[];
  attributes?: BinshopsAttribute[];
  combinations?: BinshopsCombination[];
  availability: string;
  available_for_order: boolean;
  show_price: boolean;
  condition: string;
  active: boolean;
}

export interface BinshopsImage {
  id_image: number;
  url: string;
  legend: string;
}

export interface BinshopsFeature {
  name: string;
  value: string;
}

export interface BinshopsAttribute {
  id_attribute_group: number;
  group_name: string;
  id_attribute: number;
  attribute_name: string;
}

export interface BinshopsCombination {
  id_product_attribute: number;
  reference: string;
  ean13: string;
  quantity: number;
  price: number;
  attributes: BinshopsAttribute[];
}

// Category products response
export interface BinshopsCategoryProductsResponse {
  psdata: {
    products: BinshopsProductListItem[];
    pagination: BinshopsPagination;
    sort_orders: BinshopsSortOrder[];
    facets: BinshopsFacet[];
    category: BinshopsCategory;
  };
  success: boolean;
}

export interface BinshopsProductListItem {
  id_product: number;
  name: string;
  price: number;
  regular_price: number;
  price_without_reduction: number;
  reduction: number;
  reference: string;
  ean13: string;
  quantity: number;
  cover_image: string;
  manufacturer_name: string;
  category_name: string;
  availability: string;
  available_for_order: boolean;
  new: boolean;
  on_sale: boolean;
}

export interface BinshopsPagination {
  total_items: number;
  items_shown_from: number;
  items_shown_to: number;
  pages_count: number;
  current_page: number;
  pages: { page: number; current: boolean; url: string }[];
}

export interface BinshopsSortOrder {
  entity: string;
  field: string;
  direction: string;
  label: string;
  current: boolean;
}

export interface BinshopsFacet {
  label: string;
  type: string;
  active: boolean;
  filters: BinshopsFacetFilter[];
}

export interface BinshopsFacetFilter {
  label: string;
  type: string;
  active: boolean;
  displayed: boolean;
  magnitude: number;
  value: string | number;
}

export interface BinshopsCategory {
  id: number;
  name: string;
  description: string;
  image: string;
}

// Bootstrap response
export interface BinshopsBootstrapResponse {
  psdata: {
    currency?: BinshopsCurrency;
    customer?: BinshopsCustomer | null;
    cart?: BinshopsCart;
    categories?: BinshopsCategoryTree[];
    menuItems?: BinshopsMenuItem[];
    featured_products?: BinshopsProductListItem[];
  };
  success: boolean;
}

export interface BinshopsMenuItem {
  id: number;
  slug: string;
  type: string;
  label: string;
  url: string;
  children: BinshopsMenuItem[];
  image_urls?: string[];
  depth?: number;
}

export interface BinshopsCurrency {
  id: number;
  name: string;
  iso_code: string;
  sign: string;
  format: number;
}

export interface BinshopsCustomer {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  gender: number;
  birthday: string;
  newsletter: boolean;
}

export interface BinshopsCart {
  products: BinshopsCartProduct[];
  totals: BinshopsCartTotals;
  products_count: number;
  subtotals: BinshopsCartSubtotals;
  vouchers: BinshopsVoucher[];
}

export interface BinshopsCartProduct {
  id_product: number;
  id_product_attribute: number;
  id_customization: number;
  quantity: number;
  name: string;
  price: number;
  total: number;
  cover_image: string;
  reference: string;
  attributes?: string;
}

export interface BinshopsCartTotals {
  total: { value: number; label: string };
  total_including_tax: { value: number; label: string };
  total_excluding_tax: { value: number; label: string };
}

export interface BinshopsCartSubtotals {
  products: { value: number; label: string };
  shipping: { value: number; label: string };
  tax: { value: number; label: string };
  discounts?: { value: number; label: string };
}

export interface BinshopsVoucher {
  id_cart_rule: number;
  name: string;
  code: string;
  reduction_amount: number;
}

export interface BinshopsCategoryTree {
  id: number;
  name: string;
  link: string;
  image: string;
  children: BinshopsCategoryTree[];
}

// Auth responses
export interface BinshopsLoginResponse {
  psdata: {
    customer: BinshopsCustomer;
    registered: boolean;
  };
  success: boolean;
  message?: string;
}

export interface BinshopsRegisterResponse {
  psdata: {
    customer: BinshopsCustomer;
  };
  success: boolean;
  message?: string;
  errors?: string[];
}

// Account info
export interface BinshopsAccountInfoResponse {
  psdata: {
    customer: BinshopsCustomer;
  };
  success: boolean;
}

// Order history
export interface BinshopsOrderHistoryResponse {
  psdata: {
    orders: BinshopsOrder[];
  };
  success: boolean;
}

export interface BinshopsOrder {
  id_order: number;
  reference: string;
  order_state: string;
  id_order_state: number;
  date_add: string;
  total_paid: number;
  total_products: number;
  total_shipping: number;
  payment: string;
  details?: BinshopsOrderDetails;
}

export interface BinshopsOrderDetails {
  products: BinshopsOrderProduct[];
  shipping: BinshopsOrderShipping;
  addresses: {
    delivery: BinshopsAddress;
    invoice: BinshopsAddress;
  };
}

export interface BinshopsOrderProduct {
  id_order_detail: number;
  id_product: number;
  id_product_attribute: number;
  product_name: string;
  product_reference: string;
  product_quantity: number;
  unit_price_tax_incl: number;
  total_price_tax_incl: number;
  cover_image?: string;
}

export interface BinshopsOrderShipping {
  carrier_name: string;
  tracking_number?: string;
}

// Address types
export interface BinshopsAddressResponse {
  psdata: {
    addresses: BinshopsAddress[];
  };
  success: boolean;
}

export interface BinshopsAddress {
  id_address: number;
  alias: string;
  firstname: string;
  lastname: string;
  company: string;
  address1: string;
  address2: string;
  postcode: string;
  city: string;
  id_country: number;
  country: string;
  id_state: number;
  state?: string;
  phone: string;
  phone_mobile: string;
}

export interface BinshopsAddressFormResponse {
  psdata: {
    countries: BinshopsCountry[];
    states: BinshopsState[];
  };
  success: boolean;
}

export interface BinshopsCountry {
  id_country: number;
  name: string;
  iso_code: string;
  contains_states: boolean;
}

export interface BinshopsState {
  id_state: number;
  id_country: number;
  name: string;
  iso_code: string;
}

// Checkout types
export interface BinshopsCarriersResponse {
  psdata: {
    carriers: BinshopsCarrier[];
  };
  success: boolean;
}

export interface BinshopsCarrier {
  id_carrier: number;
  name: string;
  delay: string;
  price: number;
  logo?: string;
}

export interface BinshopsPaymentOptionsResponse {
  psdata: {
    payment_options: BinshopsPaymentOption[];
  };
  success: boolean;
}

export interface BinshopsPaymentOption {
  id: string;
  module_name: string;
  call_to_action_text: string;
  logo?: string;
  form?: string;
}

// Generic response wrapper
export interface BinshopsResponse<T> {
  psdata: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

// Product listings
export interface BinshopsNewProductsResponse {
  psdata: {
    products: BinshopsProductListItem[];
  };
  success: boolean;
}

export interface BinshopsBestSalesResponse {
  psdata: {
    products: BinshopsProductListItem[];
  };
  success: boolean;
}

export interface BinshopsFeaturedProductsResponse {
  psdata: {
    products: BinshopsProductListItem[];
  };
  success: boolean;
}

export interface BinshopsRelatedProductsResponse {
  psdata: {
    products: BinshopsProductListItem[];
  };
  success: boolean;
}

// Search
export interface BinshopsSearchResponse {
  psdata: {
    products: BinshopsProductListItem[];
    pagination: BinshopsPagination;
  };
  success: boolean;
}

// Cart update response
export interface BinshopsCartUpdateResponse {
  psdata: {
    cart: BinshopsCart;
    errors?: string[];
  };
  success: boolean;
  message?: string;
  code?: number;
}
