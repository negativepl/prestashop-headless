const WP_API_URL = "https://blog.trkhspl.com/wp-json/wp/v2";
const WP_LANGUAGE = "pl"; // Filter posts by language (pl, de, en, etc.)

export interface WPPost {
  id: number;
  slug: string;
  link: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  date: string;
  modified: string;
  featured_media: number;
  categories: number[];
  author: number;
  _embedded?: {
    "wp:featuredmedia"?: Array<{
      source_url: string;
      alt_text: string;
      media_details?: {
        sizes?: {
          medium?: { source_url: string };
          large?: { source_url: string };
          full?: { source_url: string };
        };
      };
    }>;
    "wp:term"?: Array<Array<{
      id: number;
      name: string;
      slug: string;
    }>>;
    author?: Array<{
      id: number;
      name: string;
      avatar_urls?: {
        "96"?: string;
      };
    }>;
  };
}

export interface WPCategory {
  id: number;
  name: string;
  slug: string;
  count: number;
}

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  date: string;
  image: string | null;
  imageAlt: string;
  category: string | null;
  categorySlug: string | null;
  author: string;
  authorAvatar: string | null;
  readTime: string;
}

function decodeHtmlEntities(text: string): string {
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#039;': "'",
    '&#8211;': '\u2013',
    '&#8212;': '\u2014',
    '&#8216;': '\u2018',
    '&#8217;': '\u2019',
    '&#8220;': '\u201C',
    '&#8221;': '\u201D',
    '&#8230;': '\u2026',
    '&nbsp;': ' ',
    '&#038;': '&',
    '&ndash;': '\u2013',
    '&mdash;': '\u2014',
    '&lsquo;': '\u2018',
    '&rsquo;': '\u2019',
    '&ldquo;': '\u201C',
    '&rdquo;': '\u201D',
    '&hellip;': '\u2026',
  };

  let result = text;
  for (const [entity, char] of Object.entries(entities)) {
    result = result.replace(new RegExp(entity, 'g'), char);
  }
  // Handle numeric entities
  result = result.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
  return result;
}

function stripHtml(html: string): string {
  return decodeHtmlEntities(html.replace(/<[^>]*>/g, "").trim());
}

function sanitizeContent(html: string): string {
  // Remove script tags and their content
  let sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  // Remove onclick, onerror and other inline event handlers
  sanitized = sanitized.replace(/\s+on\w+="[^"]*"/gi, "");
  sanitized = sanitized.replace(/\s+on\w+='[^']*'/gi, "");

  // Replace PrestaShop product iframes with our product widget placeholder
  sanitized = sanitized.replace(
    /<iframe[^>]*src="[^"]*(?:homescreen\.pl)?[^"]*products\?[^"]*category_ids=(\d+)[^"]*(?:limit=(\d+))?[^"]*"[^>]*>[\s\S]*?<\/iframe>/gi,
    (match, categoryId, limit) => {
      const productLimit = limit || 4;
      return `<div class="wp-product-widget" data-category-id="${categoryId}" data-limit="${productLimit}"></div>`;
    }
  );

  // Remove any remaining iframes from homescreen.pl
  sanitized = sanitized.replace(/<iframe[^>]*src="[^"]*homescreen\.pl[^"]*"[^>]*>[\s\S]*?<\/iframe>/gi, "");

  return sanitized;
}

function calculateReadTime(content: string): string {
  const text = stripHtml(content);
  const wordsPerMinute = 200;
  const words = text.split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min`;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function transformPost(post: WPPost): BlogPost {
  const featuredMedia = post._embedded?.["wp:featuredmedia"]?.[0];
  const categories = post._embedded?.["wp:term"]?.[0];
  const author = post._embedded?.author?.[0];

  return {
    id: post.id,
    slug: post.slug,
    title: stripHtml(post.title.rendered),
    content: sanitizeContent(post.content.rendered),
    excerpt: stripHtml(post.excerpt.rendered),
    date: formatDate(post.date),
    image: featuredMedia?.media_details?.sizes?.full?.source_url
      || featuredMedia?.source_url
      || null,
    imageAlt: featuredMedia?.alt_text || "",
    category: categories?.[0]?.name || null,
    categorySlug: categories?.[0]?.slug || null,
    author: author?.name || "Redakcja",
    authorAvatar: author?.avatar_urls?.["96"] || null,
    readTime: calculateReadTime(post.content.rendered),
  };
}

function isPostInLanguage(post: WPPost, lang: string): boolean {
  // Polylang uses URL pattern like /pl/, /de/, /en/ etc.
  return post.link.includes(`/${lang}/`);
}

export interface PaginatedPosts {
  posts: BlogPost[];
  totalPages: number;
  currentPage: number;
  total: number;
}

export const wordpress = {
  async getPosts(options: { limit?: number; category?: string; lang?: string } = {}): Promise<BlogPost[]> {
    const result = await this.getPostsPaginated({ ...options, page: 1 });
    return result.posts;
  },

  async getPostsPaginated(options: { limit?: number; page?: number; category?: string; lang?: string } = {}): Promise<PaginatedPosts> {
    const { limit = 9, page = 1, category, lang = WP_LANGUAGE } = options;

    const params = new URLSearchParams({
      per_page: limit.toString(),
      page: page.toString(),
      lang: lang,
      _embed: "true",
    });

    if (category) {
      params.append("categories", category);
    }

    const response = await fetch(`${WP_API_URL}/posts?${params}`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      return { posts: [], totalPages: 0, currentPage: page, total: 0 };
    }

    const posts: WPPost[] = await response.json();
    const total = parseInt(response.headers.get("X-WP-Total") || "0", 10);
    const totalPages = parseInt(response.headers.get("X-WP-TotalPages") || "0", 10);

    return {
      posts: posts.map(transformPost),
      totalPages,
      currentPage: page,
      total,
    };
  },

  async getPost(slug: string, lang: string = WP_LANGUAGE): Promise<BlogPost | null> {
    const params = new URLSearchParams({
      slug,
      _embed: "true",
    });

    const response = await fetch(`${WP_API_URL}/posts?${params}`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      console.error("Failed to fetch post:", response.status);
      return null;
    }

    const posts: WPPost[] = await response.json();

    // Find post in the correct language
    const post = posts.find(p => isPostInLanguage(p, lang));

    if (!post) {
      return null;
    }

    return transformPost(post);
  },

  async getCategories(): Promise<WPCategory[]> {
    const response = await fetch(`${WP_API_URL}/categories?per_page=50`, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      console.error("Failed to fetch categories:", response.status);
      return [];
    }

    return response.json();
  },

  async getRelatedPosts(currentSlug: string, categorySlug?: string | null, limit = 2, lang: string = WP_LANGUAGE): Promise<BlogPost[]> {
    const posts = await this.getPosts({ limit: limit + 5, lang });
    return posts
      .filter(post => post.slug !== currentSlug)
      .slice(0, limit);
  },
};
