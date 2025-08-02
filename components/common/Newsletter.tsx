'use client'

import React, { useState } from 'react'
import { Mail, Send, CheckCircle, AlertCircle } from 'lucide-react'

const Newsletter = () => {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setLoading(true)
    setError(null)

    try {
      // Mock subscription for demo
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setIsSubmitted(true)
      console.log('Newsletter subscription successful:', email)
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false)
        setEmail('')
      }, 3000)
    } catch (err: any) {
      console.error('Newsletter subscription error:', err)
      setError(err.message || 'Failed to subscribe. Please try again.')
      
      // Clear error after 5 seconds
      setTimeout(() => {
        setError(null)
      }, 5000)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="bg-gradient-to-br from-onyx-200 to-night-300 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-onyx-500/50 to-night-500/50 p-8 lg:p-12 rounded-2xl border border-onyx-600/30 shadow-lg">
            <div className="text-center mb-8">
              <div className="bg-gradient-to-br from-giants_orange-500 to-giants_orange-600 p-4 rounded-2xl w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-lg">
                <Mail className="h-10 w-10 text-white" />
              </div>
              
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Stay Solar Smart
              </h2>
              <p className="text-xl text-battleship_gray-700 max-w-2xl mx-auto">
                Get rebate updates, solar tips, and industry insights delivered straight to your inbox. 
                No spam, just valuable information to help you save money.
              </p>
            </div>

            {/* Success Message */}
            {isSubmitted && (
              <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 mb-6 flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
                <p className="text-green-400 text-sm">
                  Successfully subscribed! Check your email for confirmation.
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6 flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-full px-6 py-4 text-white placeholder-battleship_gray-600 focus:border-giants_orange-500 focus:outline-none transition-colors text-lg"
                    required
                    disabled={loading || isSubmitted}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || isSubmitted || !email}
                  className={`px-8 py-4 rounded-full text-lg font-semibold transition-all transform hover:scale-105 inline-flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${
                    isSubmitted
                      ? 'bg-green-500 text-white'
                      : 'bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white hover:from-giants_orange-600 hover:to-giants_orange-700'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Subscribing...</span>
                    </>
                  ) : isSubmitted ? (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      <span>Subscribed!</span>
                    </>
                  ) : (
                    <>
                      <span>Subscribe</span>
                      <Send className="h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-battleship_gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-giants_orange-500 rounded-full"></div>
                <span>Weekly solar tips</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-giants_orange-500 rounded-full"></div>
                <span>Rebate alerts</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-giants_orange-500 rounded-full"></div>
                <span>Industry updates</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-giants_orange-500 rounded-full"></div>
                <span>Unsubscribe anytime</span>
              </div>
            </div>

            {/* Privacy Notice */}
            <div className="mt-6 text-center">
              <p className="text-xs text-battleship_gray-700">
                We respect your privacy. Your email will never be shared with third parties.
                <br />
                You can unsubscribe at any time by clicking the link in our emails.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Newsletter