-- CreateTable
CREATE TABLE "PaymentProvider" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isTestMode" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL DEFAULT 0,
    "config" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PaymentMethod" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL DEFAULT 0,
    "minAmount" REAL,
    "maxAmount" REAL,
    "surcharge" REAL NOT NULL DEFAULT 0,
    "providerId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PaymentMethod_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "PaymentProvider" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PaymentTransaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderId" INTEGER NOT NULL,
    "orderReference" TEXT,
    "providerId" INTEGER NOT NULL,
    "methodCode" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'PLN',
    "surcharge" REAL NOT NULL DEFAULT 0,
    "externalId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "webhookData" TEXT,
    "paymentUrl" TEXT,
    "errorCode" TEXT,
    "errorMessage" TEXT,
    "paidAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PaymentTransaction_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "PaymentProvider" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ShippingProvider" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "prestashopCarrierId" INTEGER,
    "basePrice" REAL NOT NULL DEFAULT 0,
    "freeFromAmount" REAL,
    "deliveryTimeMin" INTEGER,
    "deliveryTimeMax" INTEGER,
    "config" TEXT NOT NULL DEFAULT '{}',
    "requiresPoint" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Shipment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "orderId" INTEGER NOT NULL,
    "providerId" INTEGER NOT NULL,
    "trackingNumber" TEXT,
    "trackingUrl" TEXT,
    "pointId" TEXT,
    "pointName" TEXT,
    "pointAddress" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "trackingData" TEXT,
    "labelUrl" TEXT,
    "shippedAt" DATETIME,
    "deliveredAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Shipment_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "ShippingProvider" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DiscountCode" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "prestashopId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "minAmount" REAL,
    "maxUses" INTEGER,
    "usesCount" INTEGER NOT NULL DEFAULT 0,
    "validFrom" DATETIME,
    "validTo" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "syncedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentProvider_code_key" ON "PaymentProvider"("code");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentMethod_providerId_code_key" ON "PaymentMethod"("providerId", "code");

-- CreateIndex
CREATE INDEX "PaymentTransaction_orderId_idx" ON "PaymentTransaction"("orderId");

-- CreateIndex
CREATE INDEX "PaymentTransaction_externalId_idx" ON "PaymentTransaction"("externalId");

-- CreateIndex
CREATE INDEX "PaymentTransaction_status_idx" ON "PaymentTransaction"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ShippingProvider_code_key" ON "ShippingProvider"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Shipment_orderId_key" ON "Shipment"("orderId");

-- CreateIndex
CREATE INDEX "Shipment_trackingNumber_idx" ON "Shipment"("trackingNumber");

-- CreateIndex
CREATE INDEX "Shipment_status_idx" ON "Shipment"("status");

-- CreateIndex
CREATE UNIQUE INDEX "DiscountCode_prestashopId_key" ON "DiscountCode"("prestashopId");

-- CreateIndex
CREATE UNIQUE INDEX "DiscountCode_code_key" ON "DiscountCode"("code");
