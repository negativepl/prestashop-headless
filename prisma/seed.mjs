/**
 * Prisma Seed - używając bezpośrednio better-sqlite3
 */

import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const Database = require('better-sqlite3');
const dbPath = path.resolve(__dirname, '../dev.db');

console.log("📂 Database path:", dbPath);
const db = new Database(dbPath);

function run() {
  console.log("🌱 Seeding database...");

  // ============================================
  // PAYMENT PROVIDERS
  // ============================================
  
  const insertProvider = db.prepare(`
    INSERT OR REPLACE INTO PaymentProvider 
    (id, code, name, description, icon, isActive, isTestMode, position, config, createdAt, updatedAt) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);
  
  insertProvider.run(1, 'stripe', 'Stripe', 'Karty płatnicze Visa, Mastercard', 'CreditCard', 0, 1, 1, '{}');
  insertProvider.run(2, 'payu', 'PayU', 'BLIK, przelewy online, raty', 'Wallet', 0, 1, 2, '{}');
  insertProvider.run(3, 'cod', 'Płatność przy odbiorze', 'Zapłać kurierowi', 'Banknote', 1, 0, 10, '{}');
  
  console.log("✅ Payment providers created");

  // ============================================
  // PAYMENT METHODS
  // ============================================
  
  const insertMethod = db.prepare(`
    INSERT OR REPLACE INTO PaymentMethod 
    (id, code, name, description, icon, isActive, position, providerId, surcharge, minAmount, maxAmount, createdAt, updatedAt) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);
  
  // Stripe methods
  insertMethod.run(1, 'card', 'Karta płatnicza', 'Visa, Mastercard, Maestro', 'CreditCard', 1, 1, 1, 0, null, null);
  
  // PayU methods
  insertMethod.run(2, 'blik', 'BLIK', 'Szybka płatność kodem BLIK', 'Wallet', 1, 1, 2, 0, null, 10000);
  insertMethod.run(3, 'transfer', 'Przelew online', 'Płatność przez Twój bank', 'Building2', 1, 2, 2, 0, null, null);
  insertMethod.run(4, 'installments', 'Raty PayU', 'Kup teraz, zapłać później', 'Wallet', 1, 3, 2, 0, 300, null);
  
  // COD method
  insertMethod.run(5, 'cod', 'Płatność przy odbiorze', 'Zapłać gotówką lub kartą kurierowi', 'Banknote', 1, 1, 3, 5, null, 1000);
  
  console.log("✅ Payment methods created");

  // ============================================
  // SHIPPING PROVIDERS
  // ============================================
  
  const insertShipping = db.prepare(`
    INSERT OR REPLACE INTO ShippingProvider 
    (id, code, name, description, icon, isActive, position, prestashopCarrierId, basePrice, freeFromAmount, deliveryTimeMin, deliveryTimeMax, requiresPoint, config, createdAt, updatedAt) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `);
  
  insertShipping.run(1, 'inpost_locker', 'Paczkomat InPost', 'Odbiór w najbliższym paczkomacie', 'Package', 1, 1, 26, 12.99, 100, 1, 2, 1, '{}');
  insertShipping.run(2, 'inpost_courier', 'Kurier InPost', 'Dostawa pod drzwi', 'Truck', 1, 2, 26, 15.99, 100, 1, 2, 0, '{}');
  insertShipping.run(3, 'dpd_courier', 'Kurier DPD', 'Dostawa pod wskazany adres', 'Truck', 1, 3, 26, 14.99, 100, 1, 2, 0, '{}');
  insertShipping.run(4, 'dpd_express', 'Kurier Express', 'Dostawa następnego dnia roboczego', 'Truck', 1, 4, 26, 24.99, null, 1, 1, 0, '{}');
  insertShipping.run(5, 'pickup', 'Odbiór osobisty', 'Odbierz w naszym punkcie', 'Building2', 1, 10, 26, 0, null, 0, 0, 0, '{}');
  
  console.log("✅ Shipping providers created");
  console.log("🎉 Seed completed!");
}

try {
  run();
} catch (e) {
  console.error("❌ Seed error:", e);
  process.exit(1);
} finally {
  db.close();
}
