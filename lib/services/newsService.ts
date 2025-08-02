export interface NewsArticle {
  id: string
  title: string
  description: string
  link: string
  pubDate: string
  category?: string
  author?: string
}

export interface NewsResponse {
  articles: NewsArticle[]
  error: string | null
  lastUpdated: string
}

// Cache for news articles
let newsCache: NewsResponse | null = null
let lastFetchTime = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export class NewsService {
  static async fetchNews(limit: number = 5): Promise<NewsResponse> {
    const now = Date.now()
    
    // Return cached data if still fresh
    if (newsCache && (now - lastFetchTime) < CACHE_DURATION) {
      return {
        ...newsCache,
        articles: newsCache.articles.slice(0, limit)
      }
    }

    // Mock data for demo purposes
    const mockArticles: NewsArticle[] = [
      {
        id: '1',
        title: 'New Solar Rebate Program Announced for 2024',
        description: 'The Australian government has announced enhanced rebate programs for residential solar installations, providing up to $3,000 in additional savings.',
        link: '#',
        pubDate: new Date().toISOString(),
        category: 'Government Policy',
        author: 'Department of Energy'
      },
      {
        id: '2',
        title: 'Battery Storage Incentives Extended Through 2025',
        description: 'Home battery storage rebates have been extended through 2025 with increased funding allocation across all Australian states.',
        link: '#',
        pubDate: new Date(Date.now() - 86400000).toISOString(),
        category: 'Rebates',
        author: 'Clean Energy Council'
      },
      {
        id: '3',
        title: 'Solar Feed-in Tariff Updates for Major Cities',
        description: 'New feed-in tariff rates announced for solar energy exported to the grid, with increases in Sydney, Melbourne, and Brisbane.',
        link: '#',
        pubDate: new Date(Date.now() - 172800000).toISOString(),
        category: 'Policy',
        author: 'Energy Regulator'
      }
    ]

    const result: NewsResponse = {
      articles: mockArticles.slice(0, limit),
      error: null,
      lastUpdated: new Date().toISOString()
    }

    // Update cache
    newsCache = result
    lastFetchTime = now

    return result
  }

  // Format date for display
  static formatDate(dateString: string): string {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-AU', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch {
      return 'Recent'
    }
  }

  // Clear cache (useful for manual refresh)
  static clearCache(): void {
    newsCache = null
    lastFetchTime = 0
  }
}