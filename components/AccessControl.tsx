import React, { useEffect } from 'react';
import { useInstallerAuth } from '../hooks/useInstallerAuth';

interface AccessControlProps {
  children: React.ReactNode;
}

const AccessControl: React.FC<AccessControlProps> = ({ children }) => {
  const installerAuth = useInstallerAuth();
  
  // Safely extract values with fallbacks
  const isInstaller = installerAuth?.isInstaller ?? false;
  const loading = installerAuth?.loading ?? true;
  const user = installerAuth?.user ?? null;

  useEffect(() => {
    // Only redirect if we're not loading and user is confirmed as installer
    if (!loading && user && isInstaller) {
      const currentPath = window.location.pathname;
      
      // If installer is trying to access public pages, redirect to dashboard
      if (!currentPath.startsWith('/installer/dashboard')) {
        console.log('Installer detected on public page, redirecting to dashboard');
        window.location.href = '/installer/dashboard';
        return;
      }
    }
  }, [isInstaller, loading, user]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black-500 to-night-500 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-giants_orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // If installer is authenticated and on public pages, show redirect message
  if (user && isInstaller && !window.location.pathname.startsWith('/installer/dashboard')) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black-500 to-night-500 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-giants_orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Redirecting to installer dashboard...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AccessControl;