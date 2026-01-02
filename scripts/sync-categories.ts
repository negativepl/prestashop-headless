/**
 * Sync categories from PrestaShop to Meilisearch
 *
 * Usage:
 *   npx tsx scripts/sync-categories.ts
 */

import { MeiliSearch } from "meilisearch";

// Configuration
const PRESTASHOP_API_URL = process.env.PRESTASHOP_API_URL || (process.env.PRESTASHOP_URL ? `${process.env.PRESTASHOP_URL}/api` : "");
const PRESTASHOP_API_KEY = process.env.PRESTASHOP_API_KEY || "";
const MEILISEARCH_HOST = process.env.MEILISEARCH_HOST || "http://localhost:7700";
const MEILISEARCH_API_KEY = process.env.MEILISEARCH_API_KEY || "";

interface PSCategory {
  id: number;
  id_parent: string;
  level_depth: string;
  nb_products_recursive: string;
  active: string;
  name: Array<{ id: number; value: string }> | string;
}

interface MeiliCategory {
  id: number;
  name: string;
  parentId: number;
  level: number;
  productCount: number;
}

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

async function fetchPrestaShop<T>(endpoint: string): Promise<T> {
  const url = `${PRESTASHOP_API_URL}/${endpoint}${endpoint.includes("?") ? "&" : "?"}output_format=JSON`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Basic ${Buffer.from(`${PRESTASHOP_API_KEY}:`).toString("base64")}`,
    },
  });

  if (!response.ok) {
    throw new Error(`PrestaShop API error: ${response.status}`);
  }
  return response.json();
}

async function syncCategories() {
  console.log("\n=== Meilisearch Category Sync ===\n");
  console.log(`PrestaShop: ${PRESTASHOP_API_URL}`);
  console.log(`Meilisearch: ${MEILISEARCH_HOST}\n`);

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

  // Fetch categories
  console.log("Fetching categories from PrestaShop...");
  const catResp = await fetchPrestaShop<{ categories?: PSCategory[] }>(
    "categories?display=[id,name,id_parent,level_depth,nb_products_recursive,active]"
  );

  const categories = Array.isArray(catResp.categories) ? catResp.categories : [];
  console.log(`  Found ${categories.length} categories`);

  // Transform to Meilisearch format
  const meiliCategories: MeiliCategory[] = categories
    .filter((c) => c.active === "1" && parseInt(c.nb_products_recursive) > 0)
    .map((c) => ({
      id: c.id,
      name: getLocalizedValue(c.name),
      parentId: parseInt(c.id_parent) || 0,
      level: parseInt(c.level_depth) || 0,
      productCount: parseInt(c.nb_products_recursive) || 0,
    }));

  console.log(`  ${meiliCategories.length} active categories with products\n`);

  // Configure and index
  const index = meili.index<MeiliCategory>("categories");

  console.log("Configuring index settings...");
  await index
    .updateSettings({
      searchableAttributes: ["name"],
      displayedAttributes: ["id", "name", "productCount"],
      filterableAttributes: ["level", "productCount"],
      sortableAttributes: ["productCount", "name"],
      typoTolerance: {
        enabled: true,
        minWordSizeForTypos: { oneTypo: 4, twoTypos: 8 },
        disableOnNumbers: true,
      },
    })
    .waitTask({ timeout: 30000 });
  console.log("  Settings applied");

  console.log("Indexing categories...");
  await index.addDocuments(meiliCategories, { primaryKey: "id" }).waitTask({ timeout: 30000 });
  console.log(`  Indexed ${meiliCategories.length} categories`);

  // Stats
  const stats = await index.getStats();
  console.log(`\n=== Complete: ${stats.numberOfDocuments} categories in index ===\n`);
}

syncCategories().catch((e) => {
  console.error("Sync failed:", e);
  process.exit(1);
});
