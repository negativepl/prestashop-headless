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

// Search result type
export interface SearchResult {
  id: number;
  name: string;
  price: number;
  imageUrl: string | null;
}

class MeilisearchClient {
  private client: MeiliSearch;
  private productsIndex: Index<MeiliProduct> | null = null;

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
          "description",
          "manufacturerName",
          "categoryName",
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
        // Typo tolerance settings
        typoTolerance: {
          enabled: true,
          minWordSizeForTypos: {
            oneTypo: 4,
            twoTypos: 8,
          },
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
        filter: filter ? `${filter} AND active = true` : "active = true",
        sort,
        attributesToRetrieve: ["id", "name", "price", "imageUrl"],
      });

      return {
        products: results.hits.map((hit) => ({
          id: hit.id,
          name: hit.name,
          price: hit.price,
          imageUrl: hit.imageUrl,
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
