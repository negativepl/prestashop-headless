/**
 * Prisma Seed - początkowe dane dla płatności i dostaw
 *
 * Uruchom: npx prisma db seed
 */

import { PrismaClient } from "../lib/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ============================================
  // PAYMENT PROVIDERS
  // ============================================

  // Stripe
  const stripe = await prisma.paymentProvider.upsert({
    where: { code: "stripe" },
    update: {},
    create: {
      code: "stripe",
      name: "Stripe",
      description: "Karty płatnicze Visa, Mastercard",
      icon: "CreditCard",
      isActive: false, // Włącz po dodaniu kluczy API
      isTestMode: true,
      position: 1,
      config: JSON.stringify({
        // Dodaj klucze w .env.local:
        // STRIPE_SECRET_KEY=sk_test_...
        // STRIPE_PUBLISHABLE_KEY=pk_test_...
        // STRIPE_WEBHOOK_SECRET=whsec_...
      }),
    },
  });

  // PayU
  const payu = await prisma.paymentProvider.upsert({
    where: { code: "payu" },
    update: {},
    create: {
      code: "payu",
      name: "PayU",
      description: "BLIK, przelewy online, raty",
      icon: "Wallet",
      isActive: false, // Włącz po dodaniu kluczy API
      isTestMode: true,
      position: 2,
      config: JSON.stringify({
        // Dodaj klucze w .env.local:
        // PAYU_POS_ID=...
        // PAYU_SECOND_KEY=...
        // PAYU_OAUTH_CLIENT_ID=...
        // PAYU_OAUTH_CLIENT_SECRET=...
        // PAYU_SANDBOX=true
      }),
    },
  });

  // COD - zawsze aktywny
  const cod = await prisma.paymentProvider.upsert({
    where: { code: "cod" },
    update: {},
    create: {
      code: "cod",
      name: "Płatność przy odbiorze",
      description: "Zapłać kurierowi",
      icon: "Banknote",
      isActive: true, // COD nie wymaga konfiguracji
      isTestMode: false,
      position: 10,
      config: "{}",
    },
  });

  console.log("✅ Payment providers created");

  // ============================================
  // PAYMENT METHODS
  // ============================================

  // Stripe methods
  await prisma.paymentMethod.upsert({
    where: { providerId_code: { providerId: stripe.id, code: "card" } },
    update: {},
    create: {
      code: "card",
      name: "Karta płatnicza",
      description: "Visa, Mastercard, Maestro",
      icon: "CreditCard",
      isActive: true,
      position: 1,
      providerId: stripe.id,
      surcharge: 0,
    },
  });

  // PayU methods
  await prisma.paymentMethod.upsert({
    where: { providerId_code: { providerId: payu.id, code: "blik" } },
    update: {},
    create: {
      code: "blik",
      name: "BLIK",
      description: "Szybka płatność kodem BLIK",
      icon: "Wallet",
      isActive: true,
      position: 1,
      providerId: payu.id,
      surcharge: 0,
      maxAmount: 10000, // BLIK limit
    },
  });

  await prisma.paymentMethod.upsert({
    where: { providerId_code: { providerId: payu.id, code: "transfer" } },
    update: {},
    create: {
      code: "transfer",
      name: "Przelew online",
      description: "Płatność przez Twój bank",
      icon: "Building2",
      isActive: true,
      position: 2,
      providerId: payu.id,
      surcharge: 0,
    },
  });

  await prisma.paymentMethod.upsert({
    where: { providerId_code: { providerId: payu.id, code: "installments" } },
    update: {},
    create: {
      code: "installments",
      name: "Raty PayU",
      description: "Kup teraz, zapłać później",
      icon: "Wallet",
      isActive: true,
      position: 3,
      providerId: payu.id,
      surcharge: 0,
      minAmount: 300, // Raty od 300 PLN
    },
  });

  // COD method
  await prisma.paymentMethod.upsert({
    where: { providerId_code: { providerId: cod.id, code: "cod" } },
    update: {},
    create: {
      code: "cod",
      name: "Płatność przy odbiorze",
      description: "Zapłać gotówką lub kartą kurierowi",
      icon: "Banknote",
      isActive: true,
      position: 1,
      providerId: cod.id,
      surcharge: 5, // Dopłata 5 PLN za COD
      maxAmount: 1000, // COD do 1000 PLN
    },
  });

  console.log("✅ Payment methods created");

  // ============================================
  // SHIPPING PROVIDERS
  // ============================================

  await prisma.shippingProvider.upsert({
    where: { code: "inpost_locker" },
    update: {},
    create: {
      code: "inpost_locker",
      name: "Paczkomat InPost",
      description: "Odbiór w najbliższym paczkomacie",
      icon: "Package",
      isActive: true,
      position: 1,
      prestashopCarrierId: 26, // Twój carrier ID
      basePrice: 12.99,
      freeFromAmount: 100, // Darmowa od 100 PLN
      deliveryTimeMin: 1,
      deliveryTimeMax: 2,
      requiresPoint: true,
      config: JSON.stringify({
        // Dodaj klucze w .env.local:
        // INPOST_API_TOKEN=...
        // INPOST_ORGANIZATION_ID=...
        // INPOST_SANDBOX=true
      }),
    },
  });

  await prisma.shippingProvider.upsert({
    where: { code: "inpost_courier" },
    update: {},
    create: {
      code: "inpost_courier",
      name: "Kurier InPost",
      description: "Dostawa pod drzwi",
      icon: "Truck",
      isActive: true,
      position: 2,
      prestashopCarrierId: 26,
      basePrice: 15.99,
      freeFromAmount: 100,
      deliveryTimeMin: 1,
      deliveryTimeMax: 2,
      requiresPoint: false,
      config: "{}",
    },
  });

  await prisma.shippingProvider.upsert({
    where: { code: "dpd_courier" },
    update: {},
    create: {
      code: "dpd_courier",
      name: "Kurier DPD",
      description: "Dostawa pod wskazany adres",
      icon: "Truck",
      isActive: true,
      position: 3,
      prestashopCarrierId: 26,
      basePrice: 14.99,
      freeFromAmount: 100,
      deliveryTimeMin: 1,
      deliveryTimeMax: 2,
      requiresPoint: false,
      config: "{}",
    },
  });

  await prisma.shippingProvider.upsert({
    where: { code: "dpd_express" },
    update: {},
    create: {
      code: "dpd_express",
      name: "Kurier Express",
      description: "Dostawa następnego dnia roboczego",
      icon: "Truck",
      isActive: true,
      position: 4,
      prestashopCarrierId: 26,
      basePrice: 24.99,
      freeFromAmount: null, // Express nigdy darmowy
      deliveryTimeMin: 1,
      deliveryTimeMax: 1,
      requiresPoint: false,
      config: "{}",
    },
  });

  await prisma.shippingProvider.upsert({
    where: { code: "pickup" },
    update: {},
    create: {
      code: "pickup",
      name: "Odbiór osobisty",
      description: "Odbierz w naszym punkcie",
      icon: "Building2",
      isActive: true,
      position: 10,
      prestashopCarrierId: 26,
      basePrice: 0,
      freeFromAmount: null,
      deliveryTimeMin: 0,
      deliveryTimeMax: 0,
      requiresPoint: false,
      config: "{}",
    },
  });

  console.log("✅ Shipping providers created");

  console.log("🎉 Seed completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
