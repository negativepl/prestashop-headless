// PrestaShop API Types

export interface PSProduct {
  id: number;
  id_manufacturer: number;
  id_supplier: number;
  id_category_default: number;
  new: string;
  cache_default_attribute: number;
  id_default_image: number;
  id_default_combination: number;
  id_tax_rules_group: number;
  position_in_category: number;
  type: string;
  id_shop_default: number;
  reference: string;
  supplier_reference: string;
  location: string;
  width: string;
  height: string;
  depth: string;
  weight: string;
  quantity_discount: string;
  ean13: string;
  isbn: string;
  upc: string;
  mpn: string;
  cache_is_pack: string;
  cache_has_attachments: string;
  is_virtual: string;
  state: string;
  additional_delivery_times: string;
  delivery_in_stock: PSMultiLang[];
  delivery_out_stock: PSMultiLang[];
  on_sale: string;
  online_only: string;
  ecotax: string;
  minimal_quantity: string;
  low_stock_threshold: string | null;
  low_stock_alert: string;
  price: string;
  wholesale_price: string;
  unity: string;
  unit_price: string;
  unit_price_ratio: string;
  additional_shipping_cost: string;
  customizable: string;
  text_fields: string;
  uploadable_files: string;
  active: string;
  redirect_type: string;
  id_type_redirected: string;
  available_for_order: string;
  available_date: string;
  show_condition: string;
  condition: string;
  show_price: string;
  indexed: string;
  visibility: string;
  advanced_stock_management: string;
  date_add: string;
  date_upd: string;
  pack_stock_type: string;
  meta_description: PSMultiLang[];
  meta_keywords: PSMultiLang[];
  meta_title: PSMultiLang[];
  link_rewrite: PSMultiLang[];
  name: PSMultiLang[];
  description: PSMultiLang[];
  description_short: PSMultiLang[];
  available_now: PSMultiLang[];
  available_later: PSMultiLang[];
  associations?: {
    categories?: { id: string }[];
    images?: { id: string }[];
    combinations?: { id: string }[];
    product_option_values?: { id: string }[];
    product_features?: { id: string; id_feature_value: string }[];
    stock_availables?: { id: string; id_product_attribute: string }[];
  };
}

export interface PSMultiLang {
  id: string;
  value: string;
}

export interface PSCategory {
  id: number;
  id_parent: number;
  level_depth: number;
  nb_products_recursive: number;
  active: string;
  id_shop_default: number;
  is_root_category: string;
  position: number;
  date_add: string;
  date_upd: string;
  name: PSMultiLang[];
  link_rewrite: PSMultiLang[];
  description: PSMultiLang[];
  meta_title: PSMultiLang[];
  meta_description: PSMultiLang[];
  meta_keywords: PSMultiLang[];
  associations?: {
    categories?: { id: string }[];
    products?: { id: string }[];
  };
}

export interface PSCart {
  id: number;
  id_address_delivery: number;
  id_address_invoice: number;
  id_currency: number;
  id_customer: number;
  id_guest: number;
  id_lang: number;
  id_shop_group: number;
  id_shop: number;
  id_carrier: number;
  recyclable: string;
  gift: string;
  gift_message: string;
  mobile_theme: string;
  delivery_option: string;
  secure_key: string;
  allow_separated_package: string;
  date_add: string;
  date_upd: string;
  associations?: {
    cart_rows?: PSCartRow[];
  };
}

export interface PSCartRow {
  id_product: string;
  id_product_attribute: string;
  id_address_delivery: string;
  id_customization: string;
  quantity: string;
}

export interface PSOrder {
  id: number;
  id_address_delivery: number;
  id_address_invoice: number;
  id_cart: number;
  id_currency: number;
  id_lang: number;
  id_customer: number;
  id_carrier: number;
  current_state: number;
  module: string;
  invoice_number: string;
  invoice_date: string;
  delivery_number: string;
  delivery_date: string;
  valid: string;
  date_add: string;
  date_upd: string;
  shipping_number: string;
  id_shop_group: number;
  id_shop: number;
  secure_key: string;
  payment: string;
  recyclable: string;
  gift: string;
  gift_message: string;
  mobile_theme: string;
  total_discounts: string;
  total_discounts_tax_incl: string;
  total_discounts_tax_excl: string;
  total_paid: string;
  total_paid_tax_incl: string;
  total_paid_tax_excl: string;
  total_paid_real: string;
  total_products: string;
  total_products_wt: string;
  total_shipping: string;
  total_shipping_tax_incl: string;
  total_shipping_tax_excl: string;
  carrier_tax_rate: string;
  total_wrapping: string;
  total_wrapping_tax_incl: string;
  total_wrapping_tax_excl: string;
  round_mode: string;
  round_type: string;
  conversion_rate: string;
  reference: string;
  associations?: {
    order_rows?: PSOrderRow[];
  };
}

export interface PSOrderRow {
  id: string;
  product_id: string;
  product_attribute_id: string;
  product_quantity: string;
  product_name: string;
  product_reference: string;
  product_ean13: string;
  product_isbn: string;
  product_upc: string;
  product_price: string;
  id_customization: string;
  unit_price_tax_incl: string;
  unit_price_tax_excl: string;
}

export interface PSStockAvailable {
  id: number;
  id_product: number;
  id_product_attribute: number;
  id_shop: number;
  id_shop_group: number;
  quantity: number;
  depends_on_stock: string;
  out_of_stock: string;
  location: string;
}

export interface PSImage {
  id: number;
  id_product: number;
  position: number;
  cover: string;
  legend: PSMultiLang[];
}

export interface PSCustomer {
  id: number;
  id_default_group: number;
  id_lang: number;
  newsletter_date_add: string;
  ip_registration_newsletter: string;
  last_passwd_gen: string;
  secure_key: string;
  deleted: string;
  passwd: string;
  lastname: string;
  firstname: string;
  email: string;
  id_gender: number;
  birthday: string;
  newsletter: string;
  optin: string;
  website: string;
  company: string;
  siret: string;
  ape: string;
  outstanding_allow_amount: string;
  show_public_prices: string;
  id_risk: number;
  max_payment_days: number;
  active: string;
  note: string;
  is_guest: string;
  id_shop: number;
  id_shop_group: number;
  date_add: string;
  date_upd: string;
  reset_password_token: string;
  reset_password_validity: string;
}

// Simplified types for frontend use
export interface ProductFeature {
  id: number;
  name: string;
  value: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  descriptionShort: string;
  price: number;
  reference: string;
  ean13: string | null;
  imageUrl: string | null;
  images: string[];
  categoryId: number;
  categorySlug: string | null;
  active: boolean;
  quantity: number | null;
  weight: number;
  manufacturerId: number;
  manufacturerName: string | null;
  features: ProductFeature[];
}

export interface Category {
  id: number;
  name: string;
  description: string;
  parentId: number;
  level: number;
  active: boolean;
  imageUrl?: string;
  children?: Category[];
}

export interface CartItem {
  productId: number;
  productAttributeId: number;
  quantity: number;
  product?: Product;
}

export interface Cart {
  id: number;
  items: CartItem[];
  total: number;
}

export interface Order {
  id: number;
  reference: string;
  status: string;
  statusId: number;
  dateAdd: string;
  totalPaid: number;
  totalProducts: number;
  totalShipping: number;
  payment: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productReference: string;
  quantity: number;
  unitPrice: number;
}

export interface PSOrderState {
  id: number;
  unremovable: string;
  delivery: string;
  hidden: string;
  send_email: string;
  module_name: string;
  invoice: string;
  color: string;
  logable: string;
  shipped: string;
  paid: string;
  pdf_delivery: string;
  pdf_invoice: string;
  deleted: string;
  name: PSMultiLang[];
}

export interface PSAddress {
  id: number;
  id_customer: string;
  id_country: string;
  id_state: string;
  alias: string;
  company: string;
  lastname: string;
  firstname: string;
  address1: string;
  address2: string;
  postcode: string;
  city: string;
  phone: string;
  phone_mobile: string;
  vat_number: string;
  dni: string;
  deleted: string;
  date_add: string;
  date_upd: string;
}

export interface Address {
  id: number;
  alias: string;
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  postcode: string;
  city: string;
  country: string;
  countryId: number;
  phone?: string;
  phoneMobile?: string;
}

export interface PSCountry {
  id: number;
  id_zone: string;
  id_currency: string;
  iso_code: string;
  call_prefix: string;
  active: string;
  contains_states: string;
  need_identification_number: string;
  need_zip_code: string;
  zip_code_format: string;
  display_tax_label: string;
  name: PSMultiLang[];
}
