'use client'

import React from 'react'
import InstantQuoteForm from './InstantQuoteForm'

const QuotePreview: React.FC = () => {
  const handleProceedToDetailedQuote = (quoteType: 'call_visit' | 'written') => {
    // In Next.js, we'll navigate to the request-quote page
    window.location.href = '/request-quote'
  }

  return (
    <section className="bg-gradient-to-br from-black-500 to-night-500 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
            Get Your Instant Solar Quote
          </h2>
          <p className="text-xl text-battleship_gray-700">
            Personalized recommendations and accurate pricing in under 2 minutes
          </p>
        </div>
        
        <InstantQuoteForm onProceedToDetailedQuote={handleProceedToDetailedQuote} />
      </div>
    </section>
  )
}

export default QuotePreview