'use client'

import React, { useState, useEffect } from 'react'
import { MapPin, DollarSign, ArrowRight, Home, Zap, User, Mail, Phone, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import InstantQuoteForm from '@/components/common/InstantQuoteForm'
import AuthModal from '@/components/common/AuthModal'

interface NewQuoteFormProps {
  onComplete?: () => void
}

const NewQuoteForm: React.FC<NewQuoteFormProps> = ({ onComplete }) => {
  const { user } = useAuth()
  const [currentPhase, setCurrentPhase] = useState<'instant-quote' | 'contact-details'>('instant-quote')
  const [quoteType, setQuoteType] = useState<'call_visit' | 'written'>('written')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup')
  
  // Contact details form state
  const [contactDetails, setContactDetails] = useState({
    name: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    phone: user?.user_metadata?.phone || '',
    address: ''
  })

  const handleProceedToDetailedQuote = (type: 'call_visit' | 'written') => {
    setQuoteType(type)
    setCurrentPhase('contact-details')
    
    // Pre-fill contact details if user is logged in
    if (user) {
      setContactDetails({
        name: user.user_metadata?.full_name || '',
        email: user.email || '',
        phone: user.user_metadata?.phone || '',
        address: ''
      })
    }
  }

  const handleContactInputChange = (field: string, value: string) => {
    setContactDetails(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  const handleBackToQuoteType = () => {
    setCurrentPhase('instant-quote')
  }

  const handleSubmitQuoteRequest = async () => {
    // Validate required fields
    if (!contactDetails.name || !contactDetails.email || (quoteType === 'call_visit' && !contactDetails.phone)) {
      setError('Please fill in all required fields')
      return
    }

    // If user is not logged in, show auth modal
    if (!user) {
      setAuthMode('signup')
      setShowAuthModal(true)
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Mock quote creation for demo
      await new Promise(resolve => setTimeout(resolve, 1000))

      setSuccess(true)
      
      // Call onComplete callback if provided
      if (onComplete) {
        onComplete()
      }
    } catch (err: any) {
      console.error('Quote submission error:', err)
      setError(err.message || 'Failed to submit quote request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleAuthSuccess = () => {
    setShowAuthModal(false)
    // After successful auth, submit the quote request
    handleSubmitQuoteRequest()
  }

  return (
    <div className="max-w-4xl mx-auto">
      {currentPhase === 'instant-quote' ? (
        <InstantQuoteForm onProceedToDetailedQuote={handleProceedToDetailedQuote} />
      ) : (
        <div className="bg-onyx-500/30 backdrop-blur-sm p-8 lg:p-12 rounded-2xl border border-onyx-600/20">
          {!success ? (
            <>
              <h2 className="text-2xl font-bold text-white mb-6">
                Complete Your {quoteType === 'call_visit' ? 'Call/Visit' : 'Written'} Quote Request
              </h2>
              
              <div className="mb-6">
                <div className={`p-4 rounded-xl ${
                  quoteType === 'call_visit' 
                    ? 'bg-blue-500/10 border border-blue-500/30' 
                    : 'bg-green-500/10 border border-green-500/30'
                }`}>
                  <h3 className={`font-semibold ${
                    quoteType === 'call_visit' ? 'text-blue-400' : 'text-green-400'
                  }`}>
                    {quoteType === 'call_visit' 
                      ? 'Call/Visit Quote Selected' 
                      : 'Written Quote Selected'}
                  </h3>
                  <p className={`text-sm mt-1 ${
                    quoteType === 'call_visit' ? 'text-blue-300' : 'text-green-300'
                  }`}>
                    {quoteType === 'call_visit'
                      ? 'Installers will be able to call you directly or schedule a site visit.'
                      : 'You\'ll receive detailed written quotes through our secure platform.'}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">
                    <User className="inline h-4 w-4 mr-1" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={contactDetails.name}
                    onChange={(e) => handleContactInputChange('name', e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 text-white placeholder-battleship_gray-600 focus:border-giants_orange-500 focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">
                    <Mail className="inline h-4 w-4 mr-1" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={contactDetails.email}
                    onChange={(e) => handleContactInputChange('email', e.target.value)}
                    placeholder="your@email.com"
                    className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 text-white placeholder-battleship_gray-600 focus:border-giants_orange-500 focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div>
                  <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">
                    <Phone className="inline h-4 w-4 mr-1" />
                    Phone Number {quoteType === 'call_visit' ? '*' : '(Optional)'}
                  </label>
                  <input
                    type="tel"
                    value={contactDetails.phone}
                    onChange={(e) => handleContactInputChange('phone', e.target.value)}
                    placeholder="0400 000 000"
                    className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 text-white placeholder-battleship_gray-600 focus:border-giants_orange-500 focus:outline-none transition-colors"
                    required={quoteType === 'call_visit'}
                  />
                </div>

                <div>
                  <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">
                    <Home className="inline h-4 w-4 mr-1" />
                    Address (Optional)
                  </label>
                  <input
                    type="text"
                    value={contactDetails.address}
                    onChange={(e) => handleContactInputChange('address', e.target.value)}
                    placeholder="Enter your address"
                    className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 text-white placeholder-battleship_gray-600 focus:border-giants_orange-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Auth Notice */}
              {!user && (
                <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                  <p className="text-blue-300 text-sm">
                    <strong>Note:</strong> You'll need to create an account or sign in to submit your quote request. 
                    This helps you track and manage your quotes.
                  </p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mt-6 bg-red-500/20 border border-red-500/30 rounded-xl p-4 flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div className="flex justify-between mt-8">
                <button
                  onClick={handleBackToQuoteType}
                  className="bg-onyx-600/50 text-battleship_gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-onyx-600/70 hover:text-white transition-all flex items-center space-x-2"
                >
                  <ArrowLeft className="h-5 w-5" />
                  <span>Back</span>
                </button>
                
                <button
                  onClick={handleSubmitQuoteRequest}
                  disabled={loading}
                  className="bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Quote Request</span>
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-20 w-20 text-green-400 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-white mb-4">Quote Request Submitted!</h2>
              <p className="text-xl text-battleship_gray-700 mb-8">
                Thank you for your request. Our verified installers will review your details and prepare personalized quotes.
              </p>
              
              <div className="bg-onyx-600/30 rounded-xl p-6 mb-8 max-w-lg mx-auto">
                <h3 className="text-white font-semibold mb-4">What happens next?</h3>
                <ul className="space-y-3 text-left">
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-battleship_gray-700">
                      {quoteType === 'written' 
                        ? 'You\'ll receive written quotes from verified installers within 24-48 hours'
                        : 'Verified installers will contact you directly within 24-48 hours'}
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-battleship_gray-700">
                      {quoteType === 'written'
                        ? 'Compare quotes and communicate with installers through our platform'
                        : 'Discuss your requirements and schedule site visits if needed'}
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-battleship_gray-700">
                      Choose the best offer and proceed with your solar installation
                    </span>
                  </li>
                </ul>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    setCurrentPhase('instant-quote')
                    setSuccess(false)
                  }}
                  className="bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all transform hover:scale-105"
                >
                  Submit Another Request
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="bg-onyx-600/50 text-white px-6 py-3 rounded-xl font-semibold hover:bg-onyx-600/70 transition-all"
                >
                  Return to Home
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </div>
  )
}

export default NewQuoteForm