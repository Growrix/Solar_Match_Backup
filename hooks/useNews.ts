import { useState, useEffect } from 'react';
import { NewsService, type NewsResponse } from '@/lib/services/newsService';

export const useNews = (limit: number = 5, autoRefresh: boolean = true) => {
  const [news, setNews] = useState<NewsResponse>({
    articles: [],
    error: null,
    lastUpdated: ''
  });
  const [loading, setLoading] = useState(true);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const result = await NewsService.fetchNews(limit);
      setNews(result);
    } catch (error) {
      setNews({
        articles: [],
        error: error instanceof Error ? error.message : 'Failed to fetch news',
        lastUpdated: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();

    // Set up auto-refresh if enabled
    if (autoRefresh) {
      const interval = setInterval(fetchNews, 5 * 60 * 1000); // Refresh every 5 minutes
      return () => clearInterval(interval);
    }
  }, [limit, autoRefresh]);

  const refresh = () => {
    NewsService.clearCache();
    fetchNews();
  };

  return {
    articles: news.articles,
    error: news.error,
    lastUpdated: news.lastUpdated,
    loading,
    refresh
  };
};