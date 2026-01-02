import { MeiliSearch, Index } from "meilisearch";

// Meilisearch configuration
const MEILISEARCH_HOST = process.env.MEILISEARCH_HOST || "http://localhost:7700";
const MEILISEARCH_API_KEY = process.env.MEILISEARCH_API_KEY || "";

// Product document structure for Meilisearch
export interface MeiliProduct {
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
}

// Category document structure for Meilisearch
export interface MeiliCategory {
  id: number;
  name: string;
  parentId: number;
  level: number;
  productCount: number;
}

// Search result type
export interface SearchResult {
  id: number;
  name: string;
  nameHighlighted: string;
  price: number;
  imageUrl: string | null;
  categoryName: string;
  manufacturerName: string;
  quantity: number;
  reference: string;
}

// Category search result type
export interface CategorySearchResult {
  id: number;
  name: string;
  nameHighlighted: string;
  productCount: number;
}

class MeilisearchClient {
  private client: MeiliSearch;
  private productsIndex: Index<MeiliProduct> | null = null;
  private categoriesIndex: Index<MeiliCategory> | null = null;

  constructor() {
    this.client = new MeiliSearch({
      host: MEILISEARCH_HOST,
      apiKey: MEILISEARCH_API_KEY,
    });
  }

  // Get or create products index
  async getProductsIndex(): Promise<Index<MeiliProduct>> {
    if (this.productsIndex) {
      return this.productsIndex;
    }

    try {
      this.productsIndex = this.client.index<MeiliProduct>("products");

      // Configure index settings for optimal search
      await this.productsIndex.updateSettings({
        // Fields to search in (ordered by priority)
        searchableAttributes: [
          "name",
          "reference",
          "ean13",
          "manufacturerName",
          "categoryName",
          "description",
        ],
        // Fields to return in search results
        displayedAttributes: [
          "id",
          "name",
          "price",
          "imageUrl",
          "quantity",
          "reference",
          "categoryName",
          "manufacturerName",
        ],
        // Fields for filtering
        filterableAttributes: [
          "categoryId",
          "categoryName",
          "manufacturerName",
          "price",
          "quantity",
          "active",
        ],
        // Fields for sorting
        sortableAttributes: [
          "price",
          "name",
          "quantity",
        ],
        // Ranking rules - prioritize exactness
        rankingRules: [
          "words",        // All query words present
          "typo",         // Fewer typos
          "proximity",    // Words close together
          "attribute",    // Match in important fields first
          "exactness",    // Exact matches over partial
          "sort",
        ],
        // Typo tolerance settings - stricter for numbers
        typoTolerance: {
          enabled: true,
          minWordSizeForTypos: {
            oneTypo: 5,   // Stricter - need 5+ chars for typo
            twoTypos: 9,  // Stricter - need 9+ chars for 2 typos
          },
          // Disable typos for numbers
          disableOnNumbers: true,
        },
        // Pagination
        pagination: {
          maxTotalHits: 1000,
        },
      });

      return this.productsIndex;
    } catch (error) {
      console.error("Failed to get/create products index:", error);
      throw error;
    }
  }

  // Get or create categories index
  async getCategoriesIndex(): Promise<Index<MeiliCategory>> {
    if (this.categoriesIndex) {
      return this.categoriesIndex;
    }

    try {
      this.categoriesIndex = this.client.index<MeiliCategory>("categories");

      await this.categoriesIndex.updateSettings({
        searchableAttributes: ["name"],
        displayedAttributes: ["id", "name", "productCount"],
        filterableAttributes: ["level", "productCount"],
        sortableAttributes: ["productCount", "name"],
        typoTolerance: {
          enabled: true,
          minWordSizeForTypos: { oneTypo: 4, twoTypos: 8 },
          disableOnNumbers: true,
        },
      });

      return this.categoriesIndex;
    } catch (error) {
      console.error("Failed to get/create categories index:", error);
      throw error;
    }
  }

  // Search categories
  async searchCategories(
    query: string,
    options: { limit?: number } = {}
  ): Promise<{ categories: CategorySearchResult[]; totalHits: number }> {
    const { limit = 5 } = options;

    try {
      const index = await this.getCategoriesIndex();

      const results = await index.search(query, {
        limit,
        filter: "productCount > 0",
        attributesToRetrieve: ["id", "name", "productCount"],
        attributesToHighlight: ["name"],
        highlightPreTag: '<mark class="bg-primary/20 text-foreground">',
        highlightPostTag: "</mark>",
      });

      return {
        categories: results.hits.map((hit) => ({
          id: hit.id,
          name: hit.name,
          nameHighlighted: hit._formatted?.name || hit.name,
          productCount: hit.productCount || 0,
        })),
        totalHits: results.estimatedTotalHits || results.hits.length,
      };
    } catch (error) {
      console.error("Meilisearch category search error:", error);
      return { categories: [], totalHits: 0 };
    }
  }

  // Search products
  async searchProducts(
    query: string,
    options: {
      limit?: number;
      offset?: number;
      filter?: string;
      sort?: string[];
    } = {}
  ): Promise<{ products: SearchResult[]; totalHits: number }> {
    const { limit = 10, offset = 0, filter, sort } = options;

    try {
      const index = await this.getProductsIndex();

      const results = await index.search(query, {
        limit,
        offset,
        filter: filter ? `${filter} AND active = true AND quantity > 0` : "active = true AND quantity > 0",
        sort,
        attributesToRetrieve: ["id", "name", "price", "imageUrl", "categoryName", "manufacturerName", "quantity", "reference"],
        attributesToHighlight: ["name"],
        highlightPreTag: '<mark class="bg-primary/20 text-foreground">',
        highlightPostTag: "</mark>",
      });

      return {
        products: results.hits.map((hit) => ({
          id: hit.id,
          name: hit.name,
          nameHighlighted: hit._formatted?.name || hit.name,
          price: hit.price,
          imageUrl: hit.imageUrl,
          categoryName: hit.categoryName || "",
          manufacturerName: hit.manufacturerName || "",
          quantity: hit.quantity || 0,
          reference: hit.reference || "",
        })),
        totalHits: results.estimatedTotalHits || results.hits.length,
      };
    } catch (error) {
      console.error("Meilisearch search error:", error);
      // Fallback: return empty results if Meilisearch is unavailable
      return { products: [], totalHits: 0 };
    }
  }

  // Index products (for sync script)
  async indexProducts(products: MeiliProduct[]): Promise<void> {
    try {
      const index = await this.getProductsIndex();

      // Add or update products in batches
      const batchSize = 1000;
      for (let i = 0; i < products.length; i += batchSize) {
        const batch = products.slice(i, i + batchSize);
        await index.addDocuments(batch, { primaryKey: "id" });
        console.log(`Indexed products ${i + 1} to ${Math.min(i + batchSize, products.length)}`);
      }
    } catch (error) {
      console.error("Failed to index products:", error);
      throw error;
    }
  }

  // Index categories (for sync script)
  async indexCategories(categories: MeiliCategory[]): Promise<void> {
    try {
      const index = await this.getCategoriesIndex();
      await index.addDocuments(categories, { primaryKey: "id" });
      console.log(`Indexed ${categories.length} categories`);
    } catch (error) {
      console.error("Failed to index categories:", error);
      throw error;
    }
  }

  // Delete products from index
  async deleteProducts(productIds: number[]): Promise<void> {
    try {
      const index = await this.getProductsIndex();
      await index.deleteDocuments(productIds);
    } catch (error) {
      console.error("Failed to delete products:", error);
      throw error;
    }
  }

  // Get index stats
  async getStats(): Promise<{ numberOfDocuments: number; isIndexing: boolean }> {
    try {
      const index = await this.getProductsIndex();
      const stats = await index.getStats();
      return {
        numberOfDocuments: stats.numberOfDocuments,
        isIndexing: stats.isIndexing,
      };
    } catch (error) {
      console.error("Failed to get stats:", error);
      return { numberOfDocuments: 0, isIndexing: false };
    }
  }

  // Health check
  async isHealthy(): Promise<boolean> {
    try {
      const health = await this.client.health();
      return health.status === "available";
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const meilisearch = new MeilisearchClient();
