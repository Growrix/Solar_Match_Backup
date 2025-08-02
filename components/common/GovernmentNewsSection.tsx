'use client'

import React, { useState, useEffect } from 'react'
import { ExternalLink, Calendar, RefreshCw, Newspaper, AlertCircle, Sun } from 'lucide-react'

const GovernmentNewsSection = () => {
  const [articles, setArticles] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  useEffect(() => {
    // Mock data for demo
    const mockArticles = [
      {
        id: '1',
        title: 'New Solar Rebate Program Announced for 2024',
        description: 'The Australian government has announced enhanced rebate programs for residential solar installations.',
        link: '#',
        pubDate: new Date().toISOString(),
        category: 'Government Policy',
        author: 'Department of Energy'
      },
      {
        id: '2',
        title: 'Battery Storage Incentives Extended',
        description: 'Home battery storage rebates have been extended through 2025 with increased funding.',
        link: '#',
        pubDate: new Date(Date.now() - 86400000).toISOString(),
        category: 'Rebates',
        author: 'Clean Energy Council'
      },
      {
        id: '3',
        title: 'Solar Feed-in Tariff Updates',
        description: 'New feed-in tariff rates announced for solar energy exported to the grid.',
        link: '#',
        pubDate: new Date(Date.now() - 172800000).toISOString(),
        category: 'Policy',
        author: 'Energy Regulator'
      }
    ]

    setArticles(mockArticles)
    setLoading(false)
    setLastUpdated(new Date().toISOString())
  }, [])

  const handleRefresh = () => {
    setLoading(true)
    // Simulate refresh
    setTimeout(() => {
      setLoading(false)
      setLastUpdated(new Date().toISOString())
    }, 1000)
  }

  return (
    <section className="bg-gradient-to-br from-onyx-200 to-night-300 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-br from-giants_orange-500 to-giants_orange-600 p-3 rounded-2xl shadow-lg">
              <Sun className="h-8 w-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
            Latest Solar & Rebate News
          </h2>
          <p className="text-xl text-battleship_gray-700 max-w-3xl mx-auto mb-6">
            Stay informed with the latest updates on solar rebates, renewable energy policies, and government incentives
          </p>
          
          {/* Refresh Button */}
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="bg-onyx-600/50 text-battleship_gray-700 hover:text-white hover:bg-onyx-600/70 px-4 py-2 rounded-lg font-semibold transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            {lastUpdated && (
              <span className="text-sm text-battleship_gray-600">
                Last updated: {new Date(lastUpdated).toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && articles.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-giants_orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-battleship_gray-700">Loading latest solar news...</p>
          </div>
        )}

        {/* Error State */}
        {error && articles.length === 0 && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-6 mb-8 flex items-center space-x-3">
            <AlertCircle className="h-6 w-6 text-red-400 flex-shrink-0" />
            <div>
              <p className="text-red-400 font-semibold">Unable to load news</p>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* News Articles Grid - 3 Columns */}
        {articles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article, index) => (
              <article 
                key={article.id} 
                className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 overflow-hidden hover:border-giants_orange-500/50 transition-all group hover:transform hover:scale-105 shadow-lg hover:shadow-xl h-full flex flex-col"
              >
                <div className="p-6 flex flex-col h-full">
                  {/* Category Badge */}
                  {article.category && (
                    <div className="mb-3">
                      <span className="text-xs font-semibold text-giants_orange-500 bg-giants_orange-500/20 px-2 py-1 rounded-full">
                        {article.category}
                      </span>
                    </div>
                  )}

                  {/* Article Title */}
                  <h3 className="text-lg font-bold text-white mb-3 leading-tight group-hover:text-giants_orange-500 transition-colors flex-grow">
                    <a 
                      href={article.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:underline line-clamp-3"
                    >
                      {article.title}
                    </a>
                  </h3>

                  {/* Article Description */}
                  {article.description && (
                    <p className="text-battleship_gray-700 mb-4 leading-relaxed text-sm line-clamp-3 flex-grow">
                      {article.description}
                    </p>
                  )}

                  {/* Article Meta */}
                  <div className="mt-auto">
                    <div className="flex items-center justify-between text-xs text-battleship_gray-600 mb-3">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{article.pubDate ? new Date(article.pubDate).toLocaleDateString('en-AU', { 
                          month: 'short', 
                          day: 'numeric'
                        }) : 'Recent'}</span>
                      </div>
                      {article.author && (
                        <span className="text-xs truncate max-w-20">{article.author}</span>
                      )}
                    </div>
                    
                    {/* Read More Link */}
                    <a
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-giants_orange-500 hover:text-giants_orange-600 transition-colors inline-flex items-center space-x-1 font-semibold text-sm w-full justify-center bg-giants_orange-500/10 hover:bg-giants_orange-500/20 py-2 px-3 rounded-lg"
                    >
                      <span>Read Article</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* View All News Button */}
        {articles.length > 0 && (
          <div className="text-center mt-12">
            <button className="bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all transform hover:scale-105 inline-flex items-center space-x-2 shadow-lg">
              <span>View All Solar News</span>
              <ExternalLink className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Custom CSS for line clamping */}
      <style jsx>{`
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  )
}

export default GovernmentNewsSection