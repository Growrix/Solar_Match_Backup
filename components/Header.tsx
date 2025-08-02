import React, { useState, useEffect } from 'react';
import { Sun, Menu, X, User, ChevronDown, Building } from 'lucide-react';
import { LayoutDashboard } from 'lucide-react';
import { Bell } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { signOut, isHomeowner, isInstaller } from '@/lib/utils/auth';
import AuthModal from './auth/AuthModal';
import ProfileDashboard from './profile/ProfileDashboard';
import HomeownerDashboard from './homeowner/HomeownerDashboard';
import NotificationBubble from './NotificationBubble';
import DatabaseStatus from './DatabaseStatus';
import InstallerEligibilityForm from './installer/InstallerEligibilityForm';
import InstallerAuthModal from './installer/InstallerAuthModal';
import InstallerSignIn from './installer/InstallerSignIn';
import TopBar from './TopBar';

interface HeaderProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Header: React.FC<HeaderProps> = ({ currentPage, onPageChange }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hideTopBar, setHideTopBar] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileDashboard, setShowProfileDashboard] = useState(false);
  const [showHomeownerDashboard, setShowHomeownerDashboard] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [showInstallerEligibility, setShowInstallerEligibility] = useState(false);
  const [showInstallerAuth, setShowInstallerAuth] = useState(false);
  const [showInstallerSignIn, setShowInstallerSignIn] = useState(false);
  const [installerAuthMode, setInstallerAuthMode] = useState<'signin' | 'signup'>('signup');
  const { user, loading, userType } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleAuthClick = (mode: 'signin' | 'signup') => {
    // Only show homeowner auth if user is not an installer
    if (userType === 'installer') {
      window.location.href = '/installer/dashboard';
      return;
    }
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowProfileDashboard(false);
      setProfilePicture(null);
      
      // Force page reload to clear any cached state
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleProfileClick = () => {
    // Only show profile dashboard for homeowners
    if (userType === 'homeowner') {
      setShowHomeownerDashboard(true);
    } else if (userType === 'installer') {
      // Redirect installers to their dashboard
      window.location.href = '/installer/dashboard';
    }
  };

  const handleBecomePartnerClick = () => {
    // If user is already an installer, redirect to dashboard
    if (userType === 'installer') {
      window.location.href = '/installer/dashboard';
      return;
    }
    setShowInstallerEligibility(true);
  };

  const handleInstallerEligible = () => {
    setInstallerAuthMode('signup');
    setShowInstallerAuth(true);
  };

  const handleInstallerSignInSuccess = () => {
    setShowInstallerSignIn(false);
    // Redirect handled in the component
  };

  const handleNavClick = (page: string, sectionId?: string) => {
    if (page === 'home' && sectionId) {
      // Navigate to home page first, then scroll to section
      onPageChange('home');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          const headerHeight = hideTopBar ? 80 : 120; // Adjust based on top bar visibility
          const elementPosition = element.offsetTop - headerHeight;
          window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
    } else {
      onPageChange(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  // Handle scroll effect for header styling and top bar hiding
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const scrollThreshold = 50;
      const topBarHideThreshold = 100;
      
      setIsScrolled(scrollTop > scrollThreshold);
      setHideTopBar(scrollTop > topBarHideThreshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load profile picture when user changes (only for homeowners)
  useEffect(() => {
    console.log('Header - User changed:', user?.email, 'User type:', userType);
    if (user?.id && userType === 'homeowner') {
      const savedPicture = localStorage.getItem(`profile_picture_${user.id}`);
      setProfilePicture(savedPicture);
    } else {
      setProfilePicture(null);
    }
  }, [user?.id, userType]);

  // Listen for custom events
  useEffect(() => {
    const handleOpenHomeownerAuth = () => {
      setAuthMode('signup');
      setShowAuthModal(true);
    };

    window.addEventListener('open-homeowner-auth', handleOpenHomeownerAuth);
    
    return () => {
      window.removeEventListener('open-homeowner-auth', handleOpenHomeownerAuth);
    };
  }, []);

  const handleViewAllNotifications = () => {
    setShowHomeownerDashboard(true);
    // Navigate to notifications tab
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('navigate-dashboard', { detail: 'notifications' }));
    }, 100);
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.user_metadata?.full_name) return 'U';
    const names = user.user_metadata.full_name.split(' ');
    return names.length > 1 
      ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
      : names[0][0].toUpperCase();
  };

  return (
    <>
      {/* Top Bar for Installer Buttons - Only show for non-installers */}
      {userType !== 'installer' && (
        <TopBar 
          onBecomePartnerClick={handleBecomePartnerClick}
          onPartnerSignInClick={() => setShowInstallerSignIn(true)}
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
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => handleNavClick('home', 'hero')}>
              <div className={`bg-gradient-to-br from-giants_orange-500 to-giants_orange-600 p-2 rounded-lg shadow-lg transition-transform duration-300 ${
                isScrolled ? 'scale-90' : 'scale-100'
              }`}>
                <Sun className="h-6 w-6 text-white" />
              </div>
              <span className="text-white text-xl font-bold">SolarMatch</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <button 
                onClick={() => handleNavClick('home', 'hero')}
                className={`transition-colors duration-200 relative group ${
                  currentPage === 'home' ? 'text-giants_orange-500' : 'text-battleship_gray-600 hover:text-white'
                }`}
              >
                Home
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-giants_orange-500 transition-all duration-300 group-hover:w-full"></span>
              </button>
              <button 
                onClick={() => handleNavClick('home', 'how-it-works')}
                className="text-battleship_gray-600 hover:text-white transition-colors duration-200 relative group"
              >
                How It Works
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-giants_orange-500 transition-all duration-300 group-hover:w-full"></span>
              </button>
              <button 
                onClick={() => handleNavClick('home', 'rebate-calculator')}
                className="text-battleship_gray-600 hover:text-white transition-colors duration-200 relative group"
              >
                Rebate Calculator
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-giants_orange-500 transition-all duration-300 group-hover:w-full"></span>
              </button>
              <button 
                onClick={() => handleNavClick('home', 'quote-preview')}
                className="text-battleship_gray-600 hover:text-white transition-colors duration-200 relative group"
              >
                Get Your Instant Quote
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-giants_orange-500 transition-all duration-300 group-hover:w-full"></span>
              </button>
              <button 
                onClick={() => handleNavClick('news')}
                className={`transition-colors duration-200 relative group ${
                  currentPage === 'news' ? 'text-giants_orange-500' : 'text-battleship_gray-600 hover:text-white'
                }`}
              >
                News
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-giants_orange-500 transition-all duration-300 group-hover:w-full"></span>
              </button>
              <button 
                onClick={() => handleNavClick('home', 'diy-tips')}
                className="text-battleship_gray-600 hover:text-white transition-colors duration-200 relative group"
              >
                DIY Tips
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-giants_orange-500 transition-all duration-300 group-hover:w-full"></span>
              </button>
              <button 
                onClick={() => handleNavClick('home', 'blog')}
                className="text-battleship_gray-600 hover:text-white transition-colors duration-200 relative group"
              >
                Blog
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-giants_orange-500 transition-all duration-300 group-hover:w-full"></span>
              </button>

              {/* Installer Dashboard Link - Only show if user is an installer */}
              {userType === 'installer' && (
                <button
                  onClick={() => window.location.href = '/installer/dashboard'}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all transform hover:scale-105 flex items-center space-x-2"
                >
                  <Building className="h-4 w-4" />
                  <span>Dashboard</span>
                </button>
              )}
              
              {/* Homeowner Dashboard Link - Only show if user is a homeowner */}
              {userType === 'homeowner' && (
                <button
                  onClick={() => setShowHomeownerDashboard(true)}
                  className="bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all transform hover:scale-105 flex items-center space-x-2"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </button>
              )}
              
              {/* Auth Section */}
              {loading ? (
                <div className="w-8 h-8 border-2 border-giants_orange-500 border-t-transparent rounded-full animate-spin"></div>
              ) : user ? (
                <div className="flex items-center space-x-3">
                  {/* Notifications Bell - Only show for homeowners */}
                  {userType === 'homeowner' && (
                    <NotificationBubble onViewAll={handleViewAllNotifications} />
                  )}
                  
                  {/* Circular Profile Icon */}
                  <button
                    onClick={handleProfileClick}
                    className="relative group"
                    title={userType === 'homeowner' ? 'My Profile' : 'Installer Dashboard'}
                  >
                    {profilePicture && userType === 'homeowner' ? (
                      <img
                        src={profilePicture}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover hover:scale-105 transition-transform duration-200 shadow-lg border-2 border-giants_orange-500/20"
                      />
                    ) : (
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm hover:scale-105 transition-transform duration-200 shadow-lg ${
                        userType === 'installer' 
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                          : 'bg-gradient-to-br from-giants_orange-500 to-giants_orange-600'
                      }`}>
                        {userType === 'installer' ? <Building className="h-5 w-5" /> : getUserInitials()}
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-night-500"></div>
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
                <button 
                  onClick={() => handleNavClick('home', 'hero')}
                  className={`text-left py-2 px-4 rounded-lg hover:bg-onyx-500/30 transition-colors duration-200 ${
                    currentPage === 'home' ? 'text-giants_orange-500' : 'text-battleship_gray-600 hover:text-white'
                  }`}
                >
                  Home
                </button>
                <button 
                  onClick={() => handleNavClick('home', 'how-it-works')}
                  className="text-battleship_gray-600 hover:text-white transition-colors duration-200 py-2 px-4 rounded-lg hover:bg-onyx-500/30 text-left"
                >
                  How It Works
                </button>
                <button 
                  onClick={() => handleNavClick('home', 'rebate-calculator')}
                  className="text-battleship_gray-600 hover:text-white transition-colors duration-200 py-2 px-4 rounded-lg hover:bg-onyx-500/30 text-left"
                >
                  Rebate Calculator
                </button>
                <button 
                  onClick={() => handleNavClick('home', 'quote-preview')}
                  className="text-battleship_gray-600 hover:text-white transition-colors duration-200 py-2 px-4 rounded-lg hover:bg-onyx-500/30 text-left"
                >
                  Request a Quote
                </button>
                <button 
                  onClick={() => handleNavClick('news')}
                  className={`text-left py-2 px-4 rounded-lg hover:bg-onyx-500/30 transition-colors duration-200 ${
                    currentPage === 'news' ? 'text-giants_orange-500' : 'text-battleship_gray-600 hover:text-white'
                  }`}
                >
                  News
                </button>
                <button 
                  onClick={() => handleNavClick('home', 'diy-tips')}
                  className="text-battleship_gray-600 hover:text-white transition-colors duration-200 py-2 px-4 rounded-lg hover:bg-onyx-500/30 text-left"
                >
                  DIY Tips
                </button>
                <button 
                  onClick={() => handleNavClick('home', 'blog')}
                  className="text-battleship_gray-600 hover:text-white transition-colors duration-200 py-2 px-4 rounded-lg hover:bg-onyx-500/30 text-left"
                >
                  Blog
                </button>

                {/* Mobile Installer Buttons - Only show if not an installer */}
                {userType !== 'installer' && !hideTopBar && (
                  <div className="border-t border-onyx-600/30 pt-4 space-y-3">
                    <button
                      onClick={handleBecomePartnerClick}
                      className="w-full bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <Building className="h-4 w-4" />
                      <span>Become a Partner</span>
                    </button>
                    
                    <button
                      onClick={() => setShowInstallerSignIn(true)}
                      className="w-full bg-transparent border border-giants_orange-500/50 text-giants_orange-500 hover:bg-giants_orange-500 hover:text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <Building className="h-4 w-4" />
                      <span>Partner Sign In</span>
                    </button>
                  </div>
                )}

                {/* Mobile Homeowner Dashboard Link - Only show if user is a homeowner */}
                {userType === 'homeowner' && (
                  <div className="border-t border-onyx-600/30 pt-4">
                    <button
                      onClick={() => setShowHomeownerDashboard(true)}
                      className="w-full bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      <span>Dashboard</span>
                    </button>
                  </div>
                )}
                {/* Mobile Installer Dashboard Link - Only show if user is an installer */}
                {userType === 'installer' && (
                  <div className="border-t border-onyx-600/30 pt-4">
                    <button
                      onClick={() => window.location.href = '/installer/dashboard'}
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      <Building className="h-4 w-4" />
                      <span>Installer Dashboard</span>
                    </button>
                  </div>
                )}
                
                {/* Mobile Auth Section */}
                {user ? (
                  <div className="border-t border-onyx-600/30 pt-4">
                    <button
                      onClick={handleProfileClick}
                      className="flex items-center space-x-3 text-white mb-4 px-4 py-2 rounded-lg hover:bg-onyx-500/30 w-full"
                    >
                      {profilePicture && userType === 'homeowner' ? (
                        <img
                          src={profilePicture}
                          alt="Profile"
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-xs ${
                          userType === 'installer' 
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600' 
                            : 'bg-gradient-to-br from-giants_orange-500 to-giants_orange-600'
                        }`}>
                          {userType === 'installer' ? <Building className="h-4 w-4" /> : getUserInitials()}
                        </div>
                      )}
                      <span className="text-sm">
                        {userType === 'installer' ? 'Installer Dashboard' : 'Profile'}
                      </span>
                    </button>
                  </div>
                ) : (
                  <div className="border-t border-onyx-600/30 pt-4 space-y-3">
                    <button
                      onClick={() => handleAuthClick('signin')}
                      className="w-full bg-transparent border border-giants_orange-500/50 text-giants_orange-500 hover:bg-giants_orange-500 hover:text-white py-3 px-4 rounded-lg font-semibold transition-all duration-200"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => handleAuthClick('signup')}
                      className="w-full bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all duration-200 shadow-lg"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Database Status Indicator - Development Only */}
          {process.env.NODE_ENV === 'development' && (
            <div className="hidden lg:block absolute bottom-2 right-4">
              <DatabaseStatus />
            </div>
          )}
        </div>
      </header>

      {/* Homeowner Auth Modal - Only show if not an installer */}
      {userType !== 'installer' && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode={authMode}
        />
      )}

      {/* Homeowner Profile Dashboard - Only show if homeowner */}
      {userType === 'homeowner' && (
        <ProfileDashboard
          isOpen={showProfileDashboard}
          onClose={() => setShowProfileDashboard(false)}
          onSignOut={handleSignOut}
        />
      )}

      {/* Homeowner Dashboard - Only show if homeowner */}
      {userType === 'homeowner' && (
        <HomeownerDashboardModal
          isOpen={showHomeownerDashboard}
          onClose={() => setShowHomeownerDashboard(false)}
        />
      )}

      {/* Installer Eligibility Form */}
      <InstallerEligibilityForm
        isOpen={showInstallerEligibility}
        onClose={() => setShowInstallerEligibility(false)}
        onEligible={handleInstallerEligible}
      />

      {/* Installer Auth Modal */}
      <InstallerAuthModal
        isOpen={showInstallerAuth}
        onClose={() => setShowInstallerAuth(false)}
        initialMode={installerAuthMode}
      />

      {/* Installer Sign In Modal */}
      <InstallerSignIn
        isOpen={showInstallerSignIn}
        onClose={() => setShowInstallerSignIn(false)}
        onSuccess={handleInstallerSignInSuccess}
      />
    </>
  );
};

// Homeowner Dashboard Modal Component
interface HomeownerDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HomeownerDashboardModal: React.FC<HomeownerDashboardModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 overflow-y-auto">
      <div className="min-h-full">
        <HomeownerDashboard />
        <button
          onClick={onClose}
          className="fixed top-4 right-4 text-white hover:text-giants_orange-500 transition-colors p-2 rounded-lg hover:bg-onyx-500/30 z-60"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

export default Header;