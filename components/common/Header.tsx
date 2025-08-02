'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Sun, Menu, X, User, Building, LayoutDashboard } from 'lucide-react'
import { useAuth, UserType } from '@/hooks/useAuth'
import { signOut } from '@/lib/auth'
import AuthModal from './AuthModal'
import TopBar from './TopBar'

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [hideTopBar, setHideTopBar] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const { user, loading, userType: rawUserType } = useAuth()
  const userType: UserType = rawUserType;
  // userType is now correctly typed as UserType
  const router = useRouter()
  const pathname = usePathname()

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const handleAuthClick = (mode: 'signin' | 'signup') => {
    if (userType === 'installer') {
      router.push('/installer/dashboard')
      return
    }
    setAuthMode(mode)
    setShowAuthModal(true)
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const handleProfileClick = () => {
    if (userType === 'homeowner') {
      router.push('/homeowner/dashboard')
    } else if (userType === 'installer') {
      router.push('/installer/dashboard')
    }
  }

  // Handle scroll effect for header styling and top bar hiding
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const scrollThreshold = 50
      const topBarHideThreshold = 100
      
      setIsScrolled(scrollTop > scrollThreshold)
      setHideTopBar(scrollTop > topBarHideThreshold)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.user_metadata?.full_name) return 'U'
    const names = user.user_metadata.full_name.split(' ')
    return names.length > 1 
      ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
      : names[0][0].toUpperCase()
  }

  return (
    <>
      {/* Top Bar for Installer Buttons - Only show for non-installers */}
      {userType !== 'installer' && (
        <TopBar 
          isInstaller={(userType as any) === 'installer'}
        />
      )}

      <header className={`fixed left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
        isScrolled 
          ? 'bg-night-500/95 backdrop-blur-md shadow-lg' 
          : 'bg-gradient-to-r from-night-500 to-black-500'
      } ${
        // Adjust top position based on top bar visibility and user type
        userType === 'installer' 
          ? 'top-0' 
          : hideTopBar 
            ? 'top-0' 
            : 'top-8'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 cursor-pointer">
              <div className={`bg-gradient-to-br from-giants_orange-500 to-giants_orange-600 p-2 rounded-lg shadow-lg transition-transform duration-300 ${
                isScrolled ? 'scale-90' : 'scale-100'
              }`}>
                <Sun className="h-6 w-6 text-white" />
              </div>
              <span className="text-white text-xl font-bold">SolarMatch</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link 
                href="/"
                className={`transition-colors duration-200 relative group ${
                  pathname === '/' ? 'text-giants_orange-500' : 'text-battleship_gray-600 hover:text-white'
                }`}
              >
                Home
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-giants_orange-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link 
                href="/news"
                className={`transition-colors duration-200 relative group ${
                  pathname === '/news' ? 'text-giants_orange-500' : 'text-battleship_gray-600 hover:text-white'
                }`}
              >
                News
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-giants_orange-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link 
                href="/request-quote"
                className="text-battleship_gray-600 hover:text-white transition-colors duration-200 relative group"
              >
                Get Quote
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-giants_orange-500 transition-all duration-300 group-hover:w-full"></span>
              </Link>

              {/* Dashboard Links */}
              {userType === 'installer' && (
                <Link
                  href="/installer/dashboard"
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 flex items-center space-x-2"
                >
                  <Building className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              )}
              
              {userType === 'homeowner' && (
                <Link
                  href="/homeowner/dashboard"
                  className="bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all transform hover:scale-105 flex items-center space-x-2"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              )}
              
              {/* Auth Section */}
              {loading ? (
                <div className="w-8 h-8 border-2 border-giants_orange-500 border-t-transparent rounded-full animate-spin"></div>
              ) : user ? (
                <div className="flex items-center space-x-3">
                  {/* Circular Profile Icon */}
                  <button
                    onClick={handleProfileClick}
                    className="relative group"
                    title={userType === 'homeowner' ? 'My Profile' : 'Installer Dashboard'}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm hover:scale-105 transition-transform duration-200 shadow-lg ${
                      userType === 'installer' 
                        ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                        : 'bg-gradient-to-br from-giants_orange-500 to-giants_orange-600'
                    }`}>
                      {userType === 'installer' ? <Building className="h-5 w-5" /> : getUserInitials()}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-night-500"></div>
                  </button>
                  
                  <button
                    onClick={handleSignOut}
                    className="text-battleship_gray-600 hover:text-white transition-colors text-sm"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleAuthClick('signin')}
                    className="bg-transparent border border-giants_orange-500/50 text-giants_orange-500 hover:bg-giants_orange-500 hover:text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleAuthClick('signup')}
                    className="bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={toggleMenu}
              className="lg:hidden text-white p-2 hover:bg-onyx-500/50 rounded-lg transition-colors duration-200"
              aria-label="Toggle mobile menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          <div className={`lg:hidden transition-all duration-300 ease-in-out overflow-hidden ${
            isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}>
            <div className="pb-4">
              <div className="flex flex-col space-y-4">
                <Link 
                  href="/"
                  className={`text-left py-2 px-4 rounded-lg hover:bg-onyx-500/30 transition-colors duration-200 ${
                    pathname === '/' ? 'text-giants_orange-500' : 'text-battleship_gray-600 hover:text-white'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </Link>
                <Link 
                  href="/news"
                  className={`text-left py-2 px-4 rounded-lg hover:bg-onyx-500/30 transition-colors duration-200 ${
                    pathname === '/news' ? 'text-giants_orange-500' : 'text-battleship_gray-600 hover:text-white'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  News
                </Link>
                <Link 
                  href="/request-quote"
                  className="text-battleship_gray-600 hover:text-white transition-colors duration-200 py-2 px-4 rounded-lg hover:bg-onyx-500/30 text-left"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Get Quote
                </Link>
                
                {/* Mobile Auth Section */}
                {user ? (
                  <div className="border-t border-onyx-600/30 pt-4">
                    <button
                      onClick={() => {
                        handleProfileClick()
                        setIsMenuOpen(false)
                      }}
                      className="flex items-center space-x-3 text-white mb-4 px-4 py-2 rounded-lg hover:bg-onyx-500/30 w-full"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-xs ${
                        userType === 'installer' 
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                          : 'bg-gradient-to-br from-giants_orange-500 to-giants_orange-600'
                      }`}>
                        {userType === 'installer' ? <Building className="h-4 w-4" /> : getUserInitials()}
                      </div>
                      <span className="text-sm">
                        {userType === 'installer' ? 'Installer Dashboard' : 'Profile'}
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        handleSignOut()
                        setIsMenuOpen(false)
                      }}
                      className="w-full text-left px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="border-t border-onyx-600/30 pt-4 space-y-3">
                    <button
                      onClick={() => {
                        handleAuthClick('signin')
                        setIsMenuOpen(false)
                      }}
                      className="w-full bg-transparent border border-giants_orange-500/50 text-giants_orange-500 hover:bg-giants_orange-500 hover:text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => {
                        handleAuthClick('signup')
                        setIsMenuOpen(false)
                      }}
                      className="w-full bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all duration-200 shadow-lg"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </>
  )
}

export default Header