/*
  # Fetch News RSS Feed

  1. Edge Function
    - Fetches RSS feed from external source
    - Parses XML and filters for solar-related content
    - Returns structured JSON response
  
  2. Security
    - No authentication required (public endpoint)
    - CORS enabled for frontend access
*/

import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

// RSS feed URL
const RSS_FEED_URL = 'https://rss.app/feeds/IocWsCJ4zhVlnAjr.xml'

// Solar-related keywords for filtering
const SOLAR_KEYWORDS = [
  'solar', 'renewable', 'rebate', 'stc', 'small-scale technology certificate',
  'photovoltaic', 'pv', 'clean energy', 'green energy', 'solar panel',
  'solar power', 'solar system', 'solar installation', 'solar incentive',
  'feed-in tariff', 'net metering', 'battery storage', 'energy storage',
  'rooftop solar', 'residential solar', 'solar subsidy', 'solar scheme',
  'renewable energy target', 'ret', 'lret', 'sres', 'solar credit',
  'solar voucher', 'solar grant', 'solar program', 'solar initiative',
  'solar policy', 'energy efficiency', 'sustainable energy', 'carbon neutral'
]

interface NewsArticle {
  id: string
  title: string
  description: string
  link: string
  pubDate: string
  category?: string
  author?: string
}

interface NewsResponse {
  articles: NewsArticle[]
  error: string | null
  lastUpdated: string
}

// Check if article is solar/renewable energy related
function isSolarRelated(title: string, description: string): boolean {
  const content = `${title} ${description}`.toLowerCase()
  
  return SOLAR_KEYWORDS.some(keyword => 
    content.includes(keyword.toLowerCase())
  )
}

// Clean HTML tags and decode entities
function cleanText(text: string): string {
  if (!text) return ''
  
  // Remove HTML tags
  const withoutTags = text.replace(/<[^>]*>/g, '')
  
  // Decode common HTML entities
  const decoded = withoutTags
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
  
  // Limit description length for grid layout
  if (decoded.length > 120) {
    return decoded.substring(0, 120) + '...'
  }
  
  return decoded
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    })
  }

  try {
    const url = new URL(req.url)
    const limit = parseInt(url.searchParams.get('limit') || '5')

    // Fetch RSS feed directly from the server
    const response = await fetch(RSS_FEED_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SolarQuoteBot/1.0)',
        'Accept': 'application/rss+xml, application/xml, text/xml'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const xmlText = await response.text()

    // Parse XML using DOMParser from deno_dom
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlText, 'text/xml')

    if (!xmlDoc) {
      throw new Error('Failed to parse RSS feed')
    }

    // Extract articles from RSS
    const items = xmlDoc.querySelectorAll('item')
    const articles: NewsArticle[] = []

    items.forEach((item, index) => {
      const title = item.querySelector('title')?.textContent?.trim() || ''
      const description = item.querySelector('description')?.textContent?.trim() || ''
      const link = item.querySelector('link')?.textContent?.trim() || ''
      const pubDate = item.querySelector('pubDate')?.textContent?.trim() || ''
      const category = item.querySelector('category')?.textContent?.trim() || ''
      const author = item.querySelector('author')?.textContent?.trim() || ''

      if (title && link) {
        // Filter for solar-related content
        if (isSolarRelated(title, description)) {
          articles.push({
            id: `news-${index}-${Date.now()}`,
            title: cleanText(title),
            description: cleanText(description),
            link,
            pubDate,
            category,
            author
          })
        }
      }
    })

    // Sort by date (newest first)
    articles.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime())

    const result: NewsResponse = {
      articles: articles.slice(0, limit),
      error: null,
      lastUpdated: new Date().toISOString()
    }

    return new Response(
      JSON.stringify(result),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      },
    )

  } catch (error) {
    console.error('Error fetching news:', error)
    
    const errorResponse: NewsResponse = {
      articles: [],
      error: error instanceof Error ? error.message : 'Failed to fetch news',
      lastUpdated: new Date().toISOString()
    }

    return new Response(
      JSON.stringify(errorResponse),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      },
    )
  }
})