/**
 * PayloadCMS Client
 * Fetches content from external PayloadCMS instance
 */

const CMS_URL = process.env.CMS_URL || 'http://localhost:3001'

interface CMSResponse<T> {
  docs: T[]
  totalDocs: number
  limit: number
  totalPages: number
  page: number
  pagingCounter: number
  hasPrevPage: boolean
  hasNextPage: boolean
  prevPage: number | null
  nextPage: number | null
}

// Types for CMS data
export interface HeroSlide {
  id: string
  title: string
  subtitle?: string
  image: {
    url: string
    alt: string
    width?: number
    height?: number
  }
  cta?: {
    text?: string
    link?: string
  }
  textPosition?: 'left' | 'center' | 'right'
  order: number
  enabled: boolean
}

export interface Brand {
  id: string
  name: string
  logo: {
    url: string
    alt: string
  }
  link?: string
  order: number
  enabled: boolean
}

export interface TrustItem {
  id: string
  title: string
  description?: string
  icon?: string
  order: number
  enabled: boolean
}

async function fetchCMS<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${CMS_URL}/api/${endpoint}`)

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value)
    })
  }

  const res = await fetch(url.toString(), {
    next: { revalidate: 60 }, // Cache for 60 seconds
  })

  if (!res.ok) {
    throw new Error(`CMS fetch failed: ${res.status} ${res.statusText}`)
  }

  return res.json()
}

export async function getHeroSlides(): Promise<HeroSlide[]> {
  try {
    const data = await fetchCMS<CMSResponse<any>>('hero-slides', {
      'where[enabled][equals]': 'true',
      sort: 'order',
      limit: '10',
      depth: '1', // Include related media
    })

    return data.docs.map((slide) => {
      // Support both uploaded images and external URLs
      let imageUrl = ''
      let imageAlt = slide.title || 'Hero slide'

      if (slide.imageUrl) {
        // External URL takes priority
        imageUrl = slide.imageUrl
      } else if (slide.image?.url) {
        // Uploaded image
        imageUrl = `${CMS_URL}${slide.image.url}`
        imageAlt = slide.image.alt || slide.title
      }

      return {
        id: slide.id,
        title: slide.title,
        subtitle: slide.subtitle,
        image: {
          url: imageUrl,
          alt: imageAlt,
          width: slide.image?.width,
          height: slide.image?.height,
        },
        cta: slide.cta,
        textPosition: slide.textPosition || 'left',
        order: slide.order,
        enabled: slide.enabled,
      }
    }).filter(slide => slide.image.url) // Only return slides with valid images
  } catch (error) {
    console.error('Failed to fetch hero slides from CMS:', error)
    return []
  }
}

export async function getBrands(): Promise<Brand[]> {
  try {
    const data = await fetchCMS<CMSResponse<any>>('brands', {
      'where[enabled][equals]': 'true',
      sort: 'order',
      limit: '20',
      depth: '1',
    })

    return data.docs.map((brand) => ({
      id: brand.id,
      name: brand.name,
      logo: {
        url: brand.logo?.url ? `${CMS_URL}${brand.logo.url}` : '',
        alt: brand.logo?.alt || brand.name,
      },
      link: brand.link,
      order: brand.order,
      enabled: brand.enabled,
    }))
  } catch (error) {
    console.error('Failed to fetch brands from CMS:', error)
    return []
  }
}

export async function getTrustItems(): Promise<TrustItem[]> {
  try {
    const data = await fetchCMS<CMSResponse<any>>('trust-items', {
      'where[enabled][equals]': 'true',
      sort: 'order',
      limit: '10',
    })

    return data.docs.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      icon: item.icon,
      order: item.order,
      enabled: item.enabled,
    }))
  } catch (error) {
    console.error('Failed to fetch trust items from CMS:', error)
    return []
  }
}

export async function getSiteSettings() {
  try {
    return await fetchCMS<any>('globals/site-settings')
  } catch (error) {
    console.error('Failed to fetch site settings from CMS:', error)
    return null
  }
}

export async function getHomepage() {
  try {
    return await fetchCMS<any>('globals/homepage')
  } catch (error) {
    console.error('Failed to fetch homepage config from CMS:', error)
    return null
  }
}

export async function getFooter() {
  try {
    return await fetchCMS<any>('globals/footer')
  } catch (error) {
    console.error('Failed to fetch footer from CMS:', error)
    return null
  }
}

// CMS availability check
export async function isCMSAvailable(): Promise<boolean> {
  try {
    const res = await fetch(`${CMS_URL}/api/users/me`, {
      next: { revalidate: 0 },
    })
    return res.ok || res.status === 401 // 401 means CMS is running but not authenticated
  } catch {
    return false
  }
}
