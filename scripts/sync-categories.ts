import { writeFileSync } from "fs";
import { join } from "path";

interface PSCategory {
  id: number;
  id_parent: number;
  level_depth: number;
  active: string;
  name: { id: string; value: string }[];
  description: { id: string; value: string }[];
}

interface Category {
  id: number;
  name: string;
  description: string;
  parentId: number;
  level: number;
  active: boolean;
  children?: Category[];
}

const PRESTASHOP_URL = process.env.PRESTASHOP_URL;
const PRESTASHOP_API_KEY = process.env.PRESTASHOP_API_KEY;

if (!PRESTASHOP_URL || !PRESTASHOP_API_KEY) {
  throw new Error(
    "Missing required environment variables: PRESTASHOP_URL and PRESTASHOP_API_KEY must be set"
  );
}

async function fetchCategories(): Promise<PSCategory[]> {
  const url = `${PRESTASHOP_URL}/api/categories?filter[active]=1&display=full&output_format=JSON`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Basic ${Buffer.from(PRESTASHOP_API_KEY + ":").toString("base64")}`,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  return data.categories || [];
}

function getMultiLangValue(field: { id: string; value: string }[] | undefined, langId: string = "1"): string {
  if (!field || field.length === 0) return "";
  const langValue = field.find((f) => f.id === langId);
  return langValue?.value || field[0]?.value || "";
}

function buildCategoryTree(categories: PSCategory[], rootParentId: number = 2): Category[] {
  const mapped = categories.map((c) => ({
    id: c.id,
    name: getMultiLangValue(c.name),
    description: getMultiLangValue(c.description),
    parentId: c.id_parent,
    level: c.level_depth,
    active: c.active === "1",
  }));

  const visited = new Set<number>();

  const buildTree = (parentId: number, depth: number = 0): Category[] => {
    if (depth > 3 || visited.has(parentId)) return [];
    visited.add(parentId);

    const children = mapped
      .filter((cat) => cat.parentId === parentId && cat.id !== parentId)
      .map((cat) => {
        const subChildren = buildTree(cat.id, depth + 1);
        return {
          ...cat,
          children: subChildren.length > 0 ? subChildren : undefined,
        };
      });

    visited.delete(parentId);
    return children;
  };

  return buildTree(rootParentId);
}

async function main() {
  console.log("Fetching categories from PrestaShop...");

  const categories = await fetchCategories();
  console.log(`Fetched ${categories.length} categories`);

  const tree = buildCategoryTree(categories);
  console.log(`Built tree with ${tree.length} top-level categories`);

  const outputPath = join(process.cwd(), "data", "categories.json");

  // Create data directory if not exists
  const { mkdirSync, existsSync } = await import("fs");
  const dataDir = join(process.cwd(), "data");
  if (!existsSync(dataDir)) {
    mkdirSync(dataDir, { recursive: true });
  }

  writeFileSync(outputPath, JSON.stringify(tree, null, 2));
  console.log(`Saved to ${outputPath}`);
}

main().catch(console.error);
