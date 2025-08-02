'use client'

import React from 'react'
import { Phone, FileText, X, CheckCircle } from 'lucide-react'

interface QuoteOptionsModalProps {
  isOpen: boolean
  onClose: () => void
  onSelectOption: (type: 'call_visit' | 'written') => void
}

const QuoteOptionsModal: React.FC<QuoteOptionsModalProps> = ({ 
  isOpen, 
  onClose, 
  onSelectOption 
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-night-500 to-black-500 rounded-2xl max-w-3xl w-full p-8 relative border border-onyx-600/30 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-battleship_gray-600 hover:text-white transition-colors p-2 rounded-lg hover:bg-onyx-500/30"
        >
          <X className="h-6 w-6" />
        </button>
        
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Choose Your Quote Type</h2>
          <p className="text-battleship_gray-700 max-w-2xl mx-auto">
            Select how you'd like to receive quotes from our verified solar installers
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Call/Visit Quote Option */}
          <div 
            className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-6 hover:border-giants_orange-500/50 transition-all cursor-pointer hover:transform hover:scale-105"
            onClick={() => onSelectOption('call_visit')}
          >
            <div className="bg-blue-500/20 p-4 rounded-xl w-16 h-16 flex items-center justify-center mb-4">
              <Phone className="h-8 w-8 text-blue-400" />
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">Call/Visit Quote</h3>
            <p className="text-battleship_gray-700 mb-6">
              Speak directly with installers who can call you or schedule a site visit
            </p>
            
            <ul className="space-y-2 mb-6">
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <span className="text-battleship_gray-700">Phone or on-site consultation</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <span className="text-battleship_gray-700">Speak directly with installers</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <span className="text-battleship_gray-700">Faster quote turnaround</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <span className="text-battleship_gray-700">Personalized attention</span>
              </li>
            </ul>
            
            <button 
              onClick={() => onSelectOption('call_visit')}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-600 transition-all"
            >
              Select Call/Visit Quote
            </button>
          </div>
          
          {/* Written Quote Option */}
          <div 
            className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-6 hover:border-giants_orange-500/50 transition-all cursor-pointer hover:transform hover:scale-105"
            onClick={() => onSelectOption('written')}
          >
            <div className="bg-green-500/20 p-4 rounded-xl w-16 h-16 flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-green-400" />
            </div>
            
            <h3 className="text-xl font-bold text-white mb-2">Written Quote</h3>
            <p className="text-battleship_gray-700 mb-6">
              Receive detailed written quotes through our secure platform
            </p>
            
            <ul className="space-y-2 mb-6">
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-battleship_gray-700">No phone calls required</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-battleship_gray-700">Receive detailed written quotes</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-battleship_gray-700">Compare at your convenience</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-battleship_gray-700">Option to open bidding & negotiate</span>
              </li>
            </ul>
            
            <button 
              onClick={() => onSelectOption('written')}
              className="w-full bg-green-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-green-600 transition-all"
            >
              Select Written Quote
            </button>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-onyx-600/30 rounded-xl text-center">
          <p className="text-battleship_gray-700 text-sm">
            Both options connect you with our network of verified, licensed solar installers.
            Your information is secure and will only be shared with installers you choose to engage with.
          </p>
        </div>
      </div>
    </div>
  )
}

export default QuoteOptionsModal