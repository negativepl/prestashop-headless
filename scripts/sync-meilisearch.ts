/**
 * Sync products from PrestaShop to Meilisearch
 * Memory-efficient version with retry logic and task waiting
 *
 * Usage:
 *   npx tsx scripts/sync-meilisearch.ts
 *   npx tsx scripts/sync-meilisearch.ts --resume 10000  # Resume from offset
 */

import { MeiliSearch } from "meilisearch";

// Configuration
const PRESTASHOP_API_URL = process.env.PRESTASHOP_API_URL || "";
const PRESTASHOP_API_KEY = process.env.PRESTASHOP_API_KEY || "";
const MEILISEARCH_HOST = process.env.MEILISEARCH_HOST || "http://localhost:7700";
const MEILISEARCH_API_KEY = process.env.MEILISEARCH_API_KEY || "";

const BATCH_SIZE = 500;
const MAX_RETRIES = 3;
const RETRY_DELAY = 5000;

// Types
interface PSProduct {
  id: number;
  name: Array<{ id: number; value: string }> | { id: number; value: string } | string;
  description: Array<{ id: number; value: string }> | { id: number; value: string } | string;
  description_short: Array<{ id: number; value: string }> | { id: number; value: string } | string;
  price: string;
  reference: string;
  ean13: string;
  id_category_default: string;
  id_manufacturer: string;
  id_default_image: string;
  active: string;
  associations?: {
    product_features?: { id: string; id_feature_value: string }[];
  };
}

interface PSFeature {
  id: number;
  name: Array<{ id: number; value: string }> | string;
}

interface PSFeatureValue {
  id: number;
  id_feature: string;
  value: Array<{ id: number; value: string }> | string;
}

interface PSCategory {
  id: number;
  name: Array<{ id: number; value: string }> | string;
}

interface PSManufacturer {
  id: number;
  name: string;
}

interface PSStockAvailable {
  id_product: string;
  quantity: string;
}

interface MeiliProduct {
  id: number;
  name: string;
  description: string;
  price: number;
  reference: string;
  ean13: string;
  categoryId: number;
  categoryName: string;
  manufacturerName: string;
  imageUrl: string | null;
  quantity: number;
  active: boolean;
  // Features
  features: string; // Combined text for search: "Kolor: czarny, Materiał: silikon"
  featuresList: string[]; // Array for filtering: ["Kolor: czarny", "Materiał: silikon"]
  [key: string]: unknown; // Dynamic feature fields like feat_Kolor, feat_Materiał
}

// Helpers
function getLocalizedValue(field: unknown, langId: number = 1): string {
  if (!field) return "";
  if (typeof field === "string") return field;
  if (Array.isArray(field)) {
    const found = field.find((f) => f.id === langId);
    return found?.value || field[0]?.value || "";
  }
  if (typeof field === "object" && field !== null && "value" in field) {
    return (field as { value: string }).value;
  }
  return "";
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 500);
}

async function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

// PrestaShop API with retry
async function fetchPrestaShop<T>(endpoint: string, retries = MAX_RETRIES): Promise<T> {
  const url = `${PRESTASHOP_API_URL}/${endpoint}${endpoint.includes("?") ? "&" : "?"}output_format=JSON`;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 180000); // 180s timeout for large responses

      const response = await fetch(url, {
        headers: {
          Authorization: `Basic ${Buffer.from(`${PRESTASHOP_API_KEY}:`).toString("base64")}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      // PrestaShop sometimes returns 500 status with valid JSON data (known bug)
      // Try to parse JSON even on error status
      const text = await response.text();
      try {
        const data = JSON.parse(text);
        // If we got valid JSON with data, use it even if status was 500
        if (data && typeof data === 'object' && Object.keys(data).length > 0) {
          return data as T;
        }
      } catch {
        // JSON parse failed, throw the original error
      }

      if (!response.ok) {
        throw new Error(`PrestaShop API error: ${response.status}`);
      }
      return JSON.parse(text);
    } catch (error) {
      const isLastAttempt = attempt === retries;
      if (isLastAttempt) throw error;

      console.log(`  Retry ${attempt}/${retries} after error: ${(error as Error).message}`);
      await sleep(RETRY_DELAY * attempt);
    }
  }
  throw new Error("Unreachable");
}

function buildImageUrl(imageId: string | number | undefined): string | null {
  if (!imageId || imageId === "0" || imageId === 0) return null;
  // PrestaShop stores images in nested folders by digit
  // e.g., image ID 10769 -> /img/p/1/0/7/6/9/10769.jpg
  const id = String(imageId);
  const path = id.split("").join("/");
  // Use base URL without /api
  const baseUrl = PRESTASHOP_API_URL.replace("/api", "");
  return `${baseUrl}/img/p/${path}/${id}.jpg`;
}

// Main
async function syncProducts() {
  // Parse command line args for resume
  const resumeArg = process.argv.indexOf("--resume");
  const startOffset = resumeArg !== -1 ? parseInt(process.argv[resumeArg + 1]) || 0 : 0;

  console.log("\n=== Meilisearch Product Sync ===\n");
  console.log(`PrestaShop: ${PRESTASHOP_API_URL}`);
  console.log(`Meilisearch: ${MEILISEARCH_HOST}`);
  if (startOffset > 0) {
    console.log(`Resuming from product ID: ${startOffset}`);
  }
  console.log();

  if (!PRESTASHOP_API_URL || !PRESTASHOP_API_KEY) {
    console.error("Error: PRESTASHOP_API_URL and PRESTASHOP_API_KEY required");
    process.exit(1);
  }

  const meili = new MeiliSearch({
    host: MEILISEARCH_HOST,
    apiKey: MEILISEARCH_API_KEY,
  });

  try {
    await meili.health();
    console.log("Meilisearch: OK\n");
  } catch {
    console.error("Cannot connect to Meilisearch");
    process.exit(1);
  }

  // Fetch lookups (small data)
  console.log("Fetching categories...");
  const catResp = await fetchPrestaShop<{ categories?: PSCategory[] }>("categories?display=[id,name]");
  const categories = new Map<number, string>();
  for (const c of Array.isArray(catResp.categories) ? catResp.categories : []) {
    categories.set(c.id, getLocalizedValue(c.name));
  }
  console.log(`  ${categories.size} categories`);

  console.log("Fetching manufacturers...");
  const manResp = await fetchPrestaShop<{ manufacturers?: PSManufacturer[] }>("manufacturers?display=[id,name]");
  const manufacturers = new Map<number, string>();
  for (const m of Array.isArray(manResp.manufacturers) ? manResp.manufacturers : []) {
    manufacturers.set(m.id, m.name);
  }
  console.log(`  ${manufacturers.size} manufacturers`);

  console.log("Fetching stock...");
  const stockResp = await fetchPrestaShop<{ stock_availables?: PSStockAvailable[] }>(
    "stock_availables?filter[id_product_attribute]=0&display=[id_product,quantity]"
  );
  const stock = new Map<number, number>();
  for (const s of Array.isArray(stockResp.stock_availables) ? stockResp.stock_availables : []) {
    stock.set(parseInt(s.id_product), parseInt(s.quantity));
  }
  console.log(`  ${stock.size} stock entries`);

  // Features disabled for now - will use external optimized API later
  const featureNames = new Map<number, string>();
  const featureValues = new Map<number, { featureId: number; value: string }>();
  console.log("Skipping features (will use external API later)");
  console.log(`  ${featureValues.size} feature values\n`);

  // Configure Meilisearch index (only if starting fresh)
  const index = meili.index<MeiliProduct>("products");

  // Build list of all feature names for filtering
  const allFeatureKeys = Array.from(featureNames.values()).map(name =>
    `feat_${name.replace(/[^a-zA-Z0-9ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, "_")}`
  );

  if (startOffset === 0) {
    console.log("Configuring index settings...");
    await index.updateSettings({
      searchableAttributes: [
        "name",
        "reference",
        "ean13",
        "features",  // Combined features text for search
        "manufacturerName",
        "categoryName",
        "description",
      ],
      displayedAttributes: ["*"], // Show all fields
      filterableAttributes: [
        "categoryId", "categoryName", "manufacturerName",
        "price", "quantity", "active",
        "featuresList", // Array of "Feature: value" strings
        ...allFeatureKeys, // Dynamic feat_Kolor, feat_Materiał, etc.
      ],
      sortableAttributes: ["price", "name", "quantity"],
      typoTolerance: { enabled: true, minWordSizeForTypos: { oneTypo: 4, twoTypos: 8 } },
    }).waitTask({ timeout: 30000 });
    console.log(`  Settings applied (${allFeatureKeys.length} feature filters)\n`);
  }

  // Process products in batches using ID-based pagination
  // PrestaShop's offset doesn't work correctly with filters, so we use id > lastId
  let lastId = startOffset; // When resuming, startOffset is actually the last processed ID
  let totalIndexed = 0;
  let consecutiveEmptyBatches = 0;

  console.log("Syncing products...\n");

  while (consecutiveEmptyBatches < 3) {
    try {
      // Fetch batch with retry - use id-based pagination
      // PrestaShop filter syntax requires URL encoding: filter[id]<[lastId] for DESC order
      const filterParam = lastId > 0 ? `&filter%5Bid%5D=%3C%5B${lastId}%5D` : "";
      const resp = await fetchPrestaShop<{ products?: PSProduct[] }>(
        `products?filter[active]=1${filterParam}&display=full&limit=${BATCH_SIZE}&sort=[id_DESC]`
      );

      const products = resp.products;
      if (!products || (Array.isArray(products) && products.length === 0)) {
        consecutiveEmptyBatches++;
        continue;
      }

      consecutiveEmptyBatches = 0;
      const productList = Array.isArray(products) ? products : [products];

      // Transform to Meilisearch format
      const meiliProducts: MeiliProduct[] = productList.map((p) => {
        const categoryId = parseInt(p.id_category_default) || 0;
        const manufacturerId = parseInt(p.id_manufacturer) || 0;

        // Extract all features
        const productFeatures: { name: string; value: string }[] = [];
        const dynamicFeatures: Record<string, string> = {};

        if (p.associations?.product_features) {
          for (const pf of p.associations.product_features) {
            const fvId = parseInt(pf.id_feature_value);
            const fv = featureValues.get(fvId);
            if (fv) {
              const fName = featureNames.get(fv.featureId) || "";
              const fValue = fv.value;
              if (fName && fValue) {
                productFeatures.push({ name: fName, value: fValue });
                // Create dynamic field key (feat_Kolor, feat_Materiał, etc.)
                const featureKey = `feat_${fName.replace(/[^a-zA-Z0-9ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, "_")}`;
                dynamicFeatures[featureKey] = fValue;
              }
            }
          }
        }

        // Combined features text for search
        const featuresText = productFeatures.map(f => `${f.name}: ${f.value}`).join(", ");
        // Array for filtering
        const featuresList = productFeatures.map(f => `${f.name}: ${f.value}`);

        return {
          id: p.id,
          name: getLocalizedValue(p.name),
          description: stripHtml(getLocalizedValue(p.description) || getLocalizedValue(p.description_short)),
          price: parseFloat(p.price) || 0,
          reference: p.reference || "",
          ean13: p.ean13 || "",
          categoryId,
          categoryName: categories.get(categoryId) || "",
          manufacturerName: manufacturers.get(manufacturerId) || "",
          imageUrl: buildImageUrl(p.id_default_image),
          quantity: stock.get(p.id) ?? 0,
          active: p.active === "1",
          features: featuresText,
          featuresList,
          ...dynamicFeatures, // feat_Kolor: "czarny", feat_Materiał: "silikon", etc.
        };
      });

      // Index and wait for task to complete
      const result = await index.addDocuments(meiliProducts, { primaryKey: "id" }).waitTask({ timeout: 60000 });

      if (result.status !== "succeeded") {
        console.error(`  Task ${result.uid} failed:`, result.error);
        throw new Error(`Indexing task failed: ${result.error?.message}`);
      }

      // Track last ID for next batch (min ID since we're going DESC)
      lastId = Math.min(...productList.map((p) => p.id));
      totalIndexed += meiliProducts.length;
      console.log(`  Indexed ${totalIndexed} products (lastId: ${lastId})`);

      // Small delay to be nice to the API
      await sleep(100);
    } catch (error) {
      console.error(`\nError at lastId ${lastId}:`, (error as Error).message);
      console.log(`\nTo resume, run: npx tsx scripts/sync-meilisearch.ts --resume ${lastId}`);
      process.exit(1);
    }
  }

  console.log(`\n=== Complete: ${totalIndexed} products indexed ===\n`);

  // Final stats
  await sleep(2000);
  const stats = await index.getStats();
  console.log(`Documents in index: ${stats.numberOfDocuments}`);
}

syncProducts().catch((e) => {
  console.error("Sync failed:", e);
  process.exit(1);
});
