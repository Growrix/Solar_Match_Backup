import React from 'react'
import { Calendar, User, ArrowRight } from 'lucide-react'

const BlogSection = () => {
  const articles = [
    {
      title: "2024 Solar Rebate Changes: What Australian Homeowners Need to Know",
      excerpt: "Understanding the latest updates to government solar incentives and how they affect your savings potential.",
      author: "Sarah Johnson",
      date: "March 15, 2024",
      readTime: "6 min read",
      category: "Policy Updates"
    },
    {
      title: "Tesla Powerwall vs Competitors: Battery Storage Comparison",
      excerpt: "An in-depth analysis of the top battery storage systems available in Australia, including costs and performance.",
      author: "Michael Chen",
      date: "March 10, 2024",
      readTime: "8 min read",
      category: "Technology"
    },
    {
      title: "Summer Solar Tips: Maximizing Your System's Performance",
      excerpt: "How to get the most out of your solar panels during Australia's peak sunshine months.",
      author: "Emma Thompson",
      date: "March 5, 2024",
      readTime: "4 min read",
      category: "Maintenance"
    }
  ]

  return (
    <section className="bg-gradient-to-br from-black-500 to-night-500 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
            Latest Solar News & Insights
          </h2>
          <p className="text-xl text-battleship_gray-700 max-w-3xl mx-auto">
            Stay informed with expert insights, industry updates, and practical tips from our solar specialists
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {articles.map((article, index) => (
            <article key={index} className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/20 overflow-hidden hover:border-giants_orange-500/50 transition-all group hover:transform hover:scale-105">
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-giants_orange-500 bg-giants_orange-500/20 px-3 py-1 rounded-full">
                    {article.category}
                  </span>
                  <span className="text-xs text-battleship_gray-600">
                    {article.readTime}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-4 leading-snug group-hover:text-giants_orange-500 transition-colors">
                  {article.title}
                </h3>
                <p className="text-battleship_gray-700 mb-6 leading-relaxed">
                  {article.excerpt}
                </p>
                
                <div className="flex items-center justify-between text-sm text-battleship_gray-600 mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <User className="h-4 w-4" />
                      <span>{article.author}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>{article.date}</span>
                    </div>
                  </div>
                </div>
                
                <button className="text-giants_orange-500 hover:text-giants_orange-600 transition-colors inline-flex items-center space-x-1 font-semibold">
                  <span>Read Article</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center">
          <button className="bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all transform hover:scale-105 inline-flex items-center space-x-2 shadow-lg">
            <span>See All Posts</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  )
}

export default BlogSection