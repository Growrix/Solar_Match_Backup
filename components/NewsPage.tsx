import React, { useState } from 'react';
import { Calendar, ExternalLink, RefreshCw, Sun, AlertCircle, Search, Filter } from 'lucide-react';
import { useNews } from '@/hooks/useNews';

const NewsPage = () => {
  const { articles, error, loading, refresh, lastUpdated } = useNews(30, true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Get unique categories
  const categories = ['all', ...new Set(articles.map(article => article.category).filter(Boolean))];

  // Filter articles based on search and category
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleRefresh = () => {
    refresh();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black-500 to-night-500 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-br from-giants_orange-500 to-giants_orange-600 p-4 rounded-2xl shadow-lg">
              <Sun className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
            Solar & Rebate News
          </h1>
          <p className="text-xl text-battleship_gray-700 max-w-3xl mx-auto mb-8">
            Stay up-to-date with the latest solar rebates, renewable energy policies, and government incentives affecting Australian homeowners
          </p>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-8">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="bg-onyx-600/50 text-battleship_gray-700 hover:text-white hover:bg-onyx-600/70 px-6 py-3 rounded-lg font-semibold transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh News</span>
            </button>
            
            {lastUpdated && (
              <span className="text-sm text-battleship_gray-600">
                Last updated: {new Date(lastUpdated).toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-battleship_gray-600" />
              <input
                type="text"
                placeholder="Search solar news..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl pl-10 pr-4 py-3 text-white placeholder-battleship_gray-600 focus:border-giants_orange-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-battleship_gray-600" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl pl-10 pr-4 py-3 text-white focus:border-giants_orange-500 focus:outline-none transition-colors appearance-none"
              >
                {categories.map(category => (
                  <option key={category} value={category} className="bg-onyx-600 text-white">
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-battleship_gray-600">
            Showing {filteredArticles.length} solar-related articles
          </div>
        </div>

        {/* Loading State */}
        {loading && articles.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 border-4 border-giants_orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-xl text-battleship_gray-700">Loading latest solar news...</p>
          </div>
        )}

        {/* Error State */}
        {error && articles.length === 0 && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-8 mb-8 flex items-center space-x-4">
            <AlertCircle className="h-8 w-8 text-red-400 flex-shrink-0" />
            <div>
              <p className="text-red-400 font-semibold text-lg">Unable to load news</p>
              <p className="text-red-300">{error}</p>
              <button
                onClick={handleRefresh}
                className="mt-3 bg-red-500/20 text-red-400 hover:bg-red-500/30 px-4 py-2 rounded-lg font-semibold transition-all"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && filteredArticles.length === 0 && articles.length > 0 && (
          <div className="text-center py-16">
            <Search className="h-16 w-16 text-battleship_gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No articles found</h3>
            <p className="text-battleship_gray-700">Try adjusting your search terms or category filter</p>
          </div>
        )}

        {/* No Solar Articles */}
        {!loading && articles.length === 0 && !error && (
          <div className="text-center py-16">
            <Sun className="h-20 w-20 text-battleship_gray-600 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-white mb-4">No solar news available</h3>
            <p className="text-battleship_gray-700 text-lg">We're filtering for solar and renewable energy content. Check back later for updates.</p>
          </div>
        )}

        {/* News Articles Grid - 3 Columns */}
        {filteredArticles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((article, index) => (
              <article 
                key={article.id}
                className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 overflow-hidden hover:border-giants_orange-500/50 transition-all group shadow-lg hover:shadow-xl hover:transform hover:scale-105 h-full flex flex-col"
              >
                <div className="p-6 flex flex-col h-full">
                  {/* Category and Date */}
                  <div className="flex items-center justify-between mb-4">
                    {article.category && (
                      <span className="text-xs font-semibold text-giants_orange-500 bg-giants_orange-500/20 px-2 py-1 rounded-full">
                        {article.category}
                      </span>
                    )}
                    <div className="flex items-center space-x-1 text-xs text-battleship_gray-600">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {article.pubDate ? new Date(article.pubDate).toLocaleDateString('en-AU', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        }) : 'Recent'}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="text-lg font-bold text-white mb-3 leading-tight group-hover:text-giants_orange-500 transition-colors flex-grow">
                    <a 
                      href={article.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:underline line-clamp-3"
                    >
                      {article.title}
                    </a>
                  </h2>

                  {/* Description */}
                  {article.description && (
                    <p className="text-battleship_gray-700 mb-4 leading-relaxed text-sm line-clamp-4 flex-grow">
                      {article.description}
                    </p>
                  )}

                  {/* Meta and Link */}
                  <div className="mt-auto">
                    {article.author && (
                      <div className="mb-3">
                        <span className="text-xs text-battleship_gray-600">
                          By {article.author}
                        </span>
                      </div>
                    )}
                    
                    <a
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all transform hover:scale-105 inline-flex items-center space-x-2 shadow-lg w-full justify-center text-sm"
                    >
                      <span>Read Article</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Error Message for Cached Data */}
        {error && articles.length > 0 && (
          <div className="mt-8 bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4 flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-400 flex-shrink-0" />
            <p className="text-yellow-200 text-sm">{error}</p>
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
        
        .line-clamp-4 {
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default NewsPage;