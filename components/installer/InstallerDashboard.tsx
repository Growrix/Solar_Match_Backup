"use client";
import React, { useState, useEffect } from 'react';
import { Suspense } from 'react';
import { 
  LayoutDashboard, 
  Rss, 
  ShoppingBag, 
  BarChart3, 
  Building, 
  Calculator, 
  FileText,
  Gavel,
  MessageCircle,
  Bell,
  Settings, 
  HelpCircle,
  LogOut,
  DollarSign,
  Users,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  Headphones,
  User,
  Shield,
  Sun,
  MapPin,
  Phone,
  Mail,
  Home,
  Wallet
} from 'lucide-react';
import { useInstallerAuth } from '@/hooks/useInstallerAuth';
import { signOut, clearUserType } from '@/lib/utils/auth';

// Move lazy imports to top level
const LazyLeadFeed = React.lazy(() => import('./LeadFeed'));
const LazyPurchasedLeads = React.lazy(() => import('./PurchasedLeads'));
const LazyLeadInsights = React.lazy(() => import('./LeadInsights'));
const LazyQuoteSubmission = React.lazy(() => import('./QuoteSubmission'));
const LazyBiddingResponse = React.lazy(() => import('./BiddingResponse'));

type TabType = 'dashboard' | 'leads' | 'purchased' | 'insights' | 'profile' | 'wallet' | 'quote-generator' | 'settings';

const InstallerDashboard = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const installerAuth = useInstallerAuth();
  
  // Safely extract values with fallbacks
  const user = installerAuth?.user ?? null;
  const isInstaller = installerAuth?.isInstaller ?? false;
  const loading = installerAuth?.loading ?? true;
  const installerData = installerAuth?.installerData ?? null;
  
  const [userInfo, setUserInfo] = useState({
    companyName: 'Solar Pro Installations',
    contactName: 'John Smith',
    email: 'john@solarpro.com.au',
    phone: '1300 123 456'
  });

  // Redirect non-installers to home page
  useEffect(() => {
    if (!loading && (!user || !isInstaller)) {
      console.log('Non-installer detected on dashboard, redirecting to home');
      // Clear any stale installer data
      clearUserType();
      window.location.href = '/';
      return;
    }
  }, [user, isInstaller, loading]);

  // Load installer data
  useEffect(() => {
    if (installerData) {
      setUserInfo({
        companyName: installerData.installer_companies?.company_name || 'Solar Pro Installations',
        contactName: installerData.full_name || 'John Smith',
        email: installerData.email || 'john@solarpro.com.au',
        phone: installerData.installer_companies?.phone || '1300 123 456'
      });
    } else {
      // Load from localStorage as fallback
      const installerSignupData = localStorage.getItem('installer_signup_data');
      if (installerSignupData) {
        try {
          const data = JSON.parse(installerSignupData);
          setUserInfo({
            companyName: data.companyName || 'Solar Pro Installations',
            contactName: data.contactName || 'John Smith',
            email: data.email || 'john@solarpro.com.au',
            phone: data.phone || '1300 123 456'
          });
        } catch (error) {
          console.error('Error parsing installer signup data:', error);
        }
      }
    }
  }, [installerData]);

  const sidebarItems = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'leads' as TabType, label: 'Lead Feed', icon: Rss },
    { id: 'purchased' as TabType, label: 'Purchased Leads', icon: ShoppingBag },
    { id: 'insights' as TabType, label: 'Lead Insights', icon: BarChart3 },
    { id: 'quote-generator' as TabType, label: 'Quote Generator', icon: Calculator },
    { id: 'quote-requests' as TabType, label: 'Quote Requests', icon: FileText },
    { id: 'bidding-room' as TabType, label: 'Bidding Room', icon: Gavel },
    { id: 'chat' as TabType, label: 'Chat', icon: MessageCircle },
    { id: 'profile' as TabType, label: 'Company Profile', icon: Building },
    { id: 'notifications' as TabType, label: 'Notifications', icon: Bell },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
    { id: 'help' as TabType, label: 'Help Center', icon: HelpCircle },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      // Clear installer data
      localStorage.removeItem('installer_signup_data');
      localStorage.removeItem('installer_remember_me');
      clearUserType();
      
      // Force page reload and redirect to main site
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
      // Force redirect even if sign out fails
      clearUserType();
      window.location.href = '/';
    }
  };

  const handleBackToPublicSite = () => {
    // Navigate to public site without signing out
    window.location.href = '/';
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black-500 to-night-500 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-giants_orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // If not an installer, show access denied
  if (!user || !isInstaller) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black-500 to-night-500 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-battleship_gray-700 mb-6">
            This dashboard is only accessible to verified installer partners.
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all transform hover:scale-105"
          >
            Return to Main Site
          </button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardHome userInfo={userInfo} notificationsEnabled={notificationsEnabled} setNotificationsEnabled={setNotificationsEnabled} />;
      case 'leads':
        return <LazyLeadFeed />;
      case 'purchased':
        return <LazyPurchasedLeads />;
      case 'insights':
        return <LazyLeadInsights />;
      case 'quote-generator':
        return <LazyQuoteSubmission />;
      case 'bidding-room':
        return <LazyBiddingResponse />;
      case 'profile':
        return <CompanyProfile userInfo={userInfo} />;
      case 'quote-requests':
        return <QuoteRequests />;
      case 'chat':
        return <ChatSection />;
      case 'notifications':
        return <NotificationsSection />;
      case 'settings':
        return <InstallerSettings userInfo={userInfo} />;
      case 'help':
        return <HelpCenter />;
      default:
        return <DashboardHome userInfo={userInfo} notificationsEnabled={notificationsEnabled} setNotificationsEnabled={setNotificationsEnabled} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black-500 to-night-500 flex">
      {/* Sidebar */}
      <div className="w-64 bg-onyx-500/30 border-r border-onyx-600/30 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-onyx-600/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-giants_orange-500 to-giants_orange-600 rounded-lg flex items-center justify-center">
              <Sun className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">SolarMatch</h1>
              <p className="text-battleship_gray-700 text-xs">Installer Portal</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-onyx-600/30">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-giants_orange-500 to-giants_orange-600 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm truncate">{userInfo.companyName}</p>
              <p className="text-battleship_gray-700 text-xs truncate">{userInfo.contactName}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white shadow-lg'
                    : 'text-battleship_gray-700 hover:text-white hover:bg-onyx-500/50'
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Back to Public Site */}
        <div className="p-4 border-t border-onyx-600/30">
          <button
            onClick={handleBackToPublicSite}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-all mb-2"
          >
            <Home className="h-5 w-5" />
            <span className="font-medium">View Public Site</span>
          </button>
          
          <button
            onClick={handleSignOut}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <Suspense fallback={
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-giants_orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white text-lg">Loading...</p>
            </div>
          </div>
        }>
          {renderContent()}
        </Suspense>
      </div>
    </div>
  );
};

// Dashboard Home Component
const DashboardHome: React.FC<{ 
  userInfo: any; 
  notificationsEnabled: boolean; 
  setNotificationsEnabled: (enabled: boolean) => void 
}> = ({ userInfo, notificationsEnabled, setNotificationsEnabled }) => {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Welcome back, {userInfo.companyName}!</h2>
        <p className="text-battleship_gray-700">Here's your installer dashboard overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-battleship_gray-700 text-sm">Available Leads</p>
              <p className="text-2xl font-bold text-white">12</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Rss className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-battleship_gray-700 text-sm">Active Projects</p>
              <p className="text-2xl font-bold text-white">8</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <Calendar className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-battleship_gray-700 text-sm">Wallet Balance</p>
              <p className="text-2xl font-bold text-white">$1,250</p>
            </div>
            <div className="w-12 h-12 bg-giants_orange-500/20 rounded-xl flex items-center justify-center">
              <Wallet className="h-6 w-6 text-giants_orange-500" />
            </div>
          </div>
        </div>

        <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-battleship_gray-700 text-sm">This Month</p>
              <p className="text-2xl font-bold text-white">$47k</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Active Projects */}
        <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Active Projects</span>
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-onyx-600/30 rounded-lg">
              <div>
                <p className="text-white font-medium">6.6kW System - Sydney</p>
                <p className="text-battleship_gray-700 text-sm">Installation scheduled for tomorrow</p>
              </div>
              <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs">In Progress</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-onyx-600/30 rounded-lg">
              <div>
                <p className="text-white font-medium">10kW System - Melbourne</p>
                <p className="text-battleship_gray-700 text-sm">Quote sent, awaiting approval</p>
              </div>
              <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs">Quoted</span>
            </div>
          </div>
        </div>

        {/* Installation Schedule */}
        <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Installation Schedule</span>
          </h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-onyx-600/30 rounded-lg">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <div>
                <p className="text-white font-medium">Tomorrow 9:00 AM</p>
                <p className="text-battleship_gray-700 text-sm">Smith Residence - 6.6kW</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-onyx-600/30 rounded-lg">
              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
              <div>
                <p className="text-white font-medium">Friday 10:00 AM</p>
                <p className="text-battleship_gray-700 text-sm">Johnson Property - 8kW</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Requests & Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Customer Requests */}
        <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Recent Customer Requests</span>
          </h3>
          <div className="space-y-3">
            <div className="p-3 bg-onyx-600/30 rounded-lg">
              <p className="text-white font-medium">Quote Request - Brisbane</p>
              <p className="text-battleship_gray-700 text-sm">8kW system for residential property</p>
              <span className="text-xs text-giants_orange-500">2 hours ago</span>
            </div>
            <div className="p-3 bg-onyx-600/30 rounded-lg">
              <p className="text-white font-medium">Maintenance Request - Perth</p>
              <p className="text-battleship_gray-700 text-sm">Panel cleaning and inspection</p>
              <span className="text-xs text-giants_orange-500">5 hours ago</span>
            </div>
          </div>
        </div>

        {/* Documentation & Support */}
        <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Documentation Center</span>
          </h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 bg-onyx-600/30 rounded-lg hover:bg-onyx-600/50 transition-colors">
              <div className="flex items-center space-x-3">
                <FileText className="h-4 w-4 text-giants_orange-500" />
                <div>
                  <p className="text-white font-medium">Installation Guidelines</p>
                  <p className="text-battleship_gray-700 text-sm">Latest CEC standards and procedures</p>
                </div>
              </div>
            </button>
            <button className="w-full text-left p-3 bg-onyx-600/30 rounded-lg hover:bg-onyx-600/50 transition-colors">
              <div className="flex items-center space-x-3">
                <Headphones className="h-4 w-4 text-giants_orange-500" />
                <div>
                  <p className="text-white font-medium">Support Resources</p>
                  <p className="text-battleship_gray-700 text-sm">Get help with leads and technical issues</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Profile Settings Quick Access */}
      <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-6 mb-8">
        <h3 className="text-white font-semibold mb-4 flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>Profile Settings</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-onyx-600/30 rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <Building className="h-4 w-4 text-giants_orange-500" />
              <span className="text-white font-medium">Company Info</span>
            </div>
            <p className="text-battleship_gray-700 text-sm">{userInfo.companyName}</p>
          </div>
          <div className="p-4 bg-onyx-600/30 rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <Mail className="h-4 w-4 text-giants_orange-500" />
              <span className="text-white font-medium">Contact Email</span>
            </div>
            <p className="text-battleship_gray-700 text-sm">{userInfo.email}</p>
          </div>
          <div className="p-4 bg-onyx-600/30 rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <Phone className="h-4 w-4 text-giants_orange-500" />
              <span className="text-white font-medium">Phone</span>
            </div>
            <p className="text-battleship_gray-700 text-sm">{userInfo.phone}</p>
          </div>
        </div>
      </div>

      {/* Notifications Toggle */}
      <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold mb-2">Lead Notifications</h3>
            <p className="text-battleship_gray-700 text-sm">Get notified when new matching leads are available</p>
          </div>
          <button
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              notificationsEnabled ? 'bg-giants_orange-500' : 'bg-onyx-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

// Company Profile Component
const CompanyProfile: React.FC<{ userInfo: any }> = ({ userInfo }) => {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Company Profile</h2>
        <p className="text-battleship_gray-700">Manage your company information and preferences</p>
      </div>

      <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-8">
        <div className="flex items-center space-x-6 mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-giants_orange-500 to-giants_orange-600 rounded-2xl flex items-center justify-center">
            <Building className="h-10 w-10 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">{userInfo.companyName}</h3>
            <p className="text-battleship_gray-700">{userInfo.email}</p>
            <p className="text-battleship_gray-700">Contact: {userInfo.contactName}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="text-white font-semibold mb-4">Company Details</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">Company Name</label>
                <input
                  type="text"
                  value={userInfo.companyName}
                  className="w-full bg-onyx-600/50 border border-onyx-600/30 rounded-xl px-4 py-3 text-white"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">ABN</label>
                <input
                  type="text"
                  placeholder="Enter your ABN"
                  className="w-full bg-onyx-600/50 border border-onyx-600/30 rounded-xl px-4 py-3 text-white placeholder-battleship_gray-600"
                />
              </div>
              <div>
                <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">License Number</label>
                <input
                  type="text"
                  placeholder="Enter your license number"
                  className="w-full bg-onyx-600/50 border border-onyx-600/30 rounded-xl px-4 py-3 text-white placeholder-battleship_gray-600"
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Service Areas</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">States/Territories</label>
                <div className="grid grid-cols-2 gap-2">
                  {['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'].map((state) => (
                    <label key={state} className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-white text-sm">{state}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button className="bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

// Quote Requests Component
const QuoteRequests = () => {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Quote Requests</h2>
        <p className="text-battleship_gray-700">Manage and respond to customer quote requests</p>
      </div>

      <div className="text-center py-16">
        <FileText className="h-16 w-16 text-battleship_gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Quote Requests Yet</h3>
        <p className="text-battleship_gray-700 mb-6">
          Quote requests from customers will appear here once they're submitted.
        </p>
      </div>
    </div>
  );
};

// Bidding Room Component
const BiddingRoom = () => {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Bidding Room</h2>
        <p className="text-battleship_gray-700">Negotiate with customers on quotes</p>
      </div>

      <div className="text-center py-16">
        <Gavel className="h-16 w-16 text-battleship_gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Active Bids</h3>
        <p className="text-battleship_gray-700 mb-6">
          Active bidding negotiations with customers will appear here.
        </p>
      </div>
    </div>
  );
};

// Chat Section Component
const ChatSection = () => {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Chat</h2>
        <p className="text-battleship_gray-700">Communicate with customers about their quotes</p>
      </div>

      <div className="text-center py-16">
        <MessageCircle className="h-16 w-16 text-battleship_gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Active Conversations</h3>
        <p className="text-battleship_gray-700 mb-6">
          Chat conversations with customers will appear here.
        </p>
      </div>
    </div>
  );
};

// Notifications Section Component
const NotificationsSection = () => {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Notifications</h2>
        <p className="text-battleship_gray-700">Stay updated on important events</p>
      </div>

      <div className="text-center py-16">
        <Bell className="h-16 w-16 text-battleship_gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No Notifications</h3>
        <p className="text-battleship_gray-700 mb-6">
          Your notifications will appear here.
        </p>
      </div>
    </div>
  );
};

// Help Center Component
const HelpCenter = () => {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Help Center</h2>
        <p className="text-battleship_gray-700">Resources and support for installers</p>
      </div>

      <div className="text-center py-16">
        <HelpCircle className="h-16 w-16 text-battleship_gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Help Resources</h3>
        <p className="text-battleship_gray-700 mb-6">
          Support resources and documentation will appear here.
        </p>
      </div>
    </div>
  );
};

// Quote Generator Component
const QuoteGenerator = () => {
  return (
    <div className="p-8">
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-onyx-600/50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Calculator className="h-10 w-10 text-battleship_gray-600" />
        </div>
        <h2 className="text-3xl font-bold text-white mb-4">🚧 Quote Generator Coming Soon</h2>
        <p className="text-battleship_gray-700 text-lg max-w-2xl mx-auto mb-8">
          You'll soon be able to create instant, professional quotes for solar installations directly from this dashboard.
        </p>
        
        <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-6 max-w-md mx-auto">
          <h3 className="text-white font-semibold mb-3">Get Notified</h3>
          <p className="text-battleship_gray-700 text-sm mb-4">
            Be the first to know when the quote generator is available
          </p>
          <button className="bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white py-2 px-6 rounded-lg font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all">
            Notify Me
          </button>
        </div>
      </div>
    </div>
  );
};

// Settings Component
const InstallerSettings: React.FC<{ userInfo: any }> = ({ userInfo }) => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Settings</h2>
        <p className="text-battleship_gray-700">Manage your account and preferences</p>
      </div>

      <div className="space-y-8">
        {/* Account Settings */}
        <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-6">
          <h3 className="text-white font-semibold mb-4">Account Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">Email</label>
              <input
                type="email"
                value={userInfo.email}
                className="w-full bg-onyx-600/50 border border-onyx-600/30 rounded-xl px-4 py-3 text-white"
                readOnly
              />
            </div>
            <div>
              <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">Contact Name</label>
              <input
                type="text"
                value={userInfo.contactName}
                className="w-full bg-onyx-600/50 border border-onyx-600/30 rounded-xl px-4 py-3 text-white"
              />
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Security Settings</span>
          </h3>
          
          <div className="space-y-6">
            {/* Two-Factor Authentication */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-semibold mb-2">Two-Factor Authentication</h4>
                <p className="text-battleship_gray-700 text-sm">
                  Add an extra layer of security to your installer account
                </p>
              </div>
              <button
                onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  twoFactorEnabled ? 'bg-giants_orange-500' : 'bg-onyx-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {twoFactorEnabled && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                <p className="text-green-400 font-semibold mb-2">2FA Enabled</p>
                <p className="text-green-300 text-sm">
                  Your account is protected with two-factor authentication. Use your authenticator app to generate codes.
                </p>
              </div>
            )}

            {/* Change Password */}
            <div>
              <h4 className="text-white font-semibold mb-2">Change Password</h4>
              <button className="bg-onyx-600/50 text-battleship_gray-700 hover:text-white hover:bg-onyx-600/70 px-4 py-2 rounded-lg font-semibold transition-all">
                Update Password
              </button>
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-6">
          <h3 className="text-white font-semibold mb-4">Notification Preferences</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Email Notifications</p>
                <p className="text-battleship_gray-700 text-sm">Receive lead alerts via email</p>
              </div>
              <input type="checkbox" defaultChecked className="rounded" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">SMS Notifications</p>
                <p className="text-battleship_gray-700 text-sm">Receive urgent lead alerts via SMS</p>
              </div>
              <input type="checkbox" className="rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallerDashboard;