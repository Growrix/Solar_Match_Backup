'use client'

import React from 'react'
import { Building, LogIn } from 'lucide-react'

interface TopBarProps {
  isInstaller: boolean
}

const TopBar: React.FC<TopBarProps> = ({ isInstaller }) => {
  // Don't show top bar if user is already an installer
  if (isInstaller) return null

  const handleBecomePartnerClick = () => {
    // In Next.js, we'll handle this through routing or state management
    console.log('Become partner clicked')
  }

  const handlePartnerSignInClick = () => {
    // In Next.js, we'll handle this through routing or state management
    console.log('Partner sign in clicked')
  }

  return (
    <div className="bg-gradient-to-r from-onyx-500/80 to-night-500/80 backdrop-blur-sm border-b border-onyx-600/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center space-x-1 text-xs text-battleship_gray-700">
            <Building className="h-3 w-3" />
            <span>For Solar Installers:</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBecomePartnerClick}
              className="text-xs font-medium text-battleship_gray-700 hover:text-giants_orange-500 transition-colors flex items-center space-x-1"
            >
              <Building className="h-3 w-3" />
              <span>Become a Partner</span>
            </button>
            
            <div className="w-px h-4 bg-onyx-600/30"></div>
            
            <button
              onClick={handlePartnerSignInClick}
              className="text-xs font-medium text-giants_orange-500 hover:text-giants_orange-400 transition-colors flex items-center space-x-1"
            >
              <LogIn className="h-3 w-3" />
              <span>Partner Sign In</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TopBar