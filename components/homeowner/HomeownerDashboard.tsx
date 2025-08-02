"use client";
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  PenTool, 
  Phone, 
  Gavel, 
  MessageCircle, 
  Unlock, 
  BookOpen, 
  Bell, 
  Settings, 
  LogOut,
  Home,
  DollarSign,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Star,
  MapPin,
  Zap,
  Battery,
  Sun,
  User,
  Mail,
  Shield
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from '@/lib/utils/auth';
import DashboardOverview from '@/components/homeowner/DashboardOverview';
import MyQuoteRequests from '@/components/homeowner/MyQuoteRequests';
import WrittenQuotes from '@/components/homeowner/WrittenQuotes';
import CallVisitLeads from '@/components/homeowner/CallVisitLeads';
import BiddingRoom from '@/components/homeowner/BiddingRoom';
import ChatSection from '@/components/homeowner/ChatSection';
import QuoteUnlocks from '@/components/homeowner/QuoteUnlocks';
import Notifications from '@/components/homeowner/Notifications';

type TabType = 'dashboard' | 'quotes' | 'written-quotes' | 'call-visit-leads' | 'bidding-room' | 'chat' | 'quote-unlocks' | 'guides' | 'notifications' | 'settings';

const HomeownerDashboard = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const { user } = useAuth();

  // Listen for navigation events from child components
  useEffect(() => {
    const handleNavigate = (event: CustomEvent) => {
      if (event.detail && typeof event.detail === 'string') {
        setActiveTab(event.detail as TabType);
      }
    };

    window.addEventListener('navigate-dashboard' as any, handleNavigate);
    
    return () => {
      window.removeEventListener('navigate-dashboard' as any, handleNavigate);
    };
  }, []);

  const sidebarItems = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'quotes' as TabType, label: 'My Quotes', icon: FileText },
    { id: 'written-quotes' as TabType, label: 'Written Quotes', icon: PenTool },
    { id: 'call-visit-leads' as TabType, label: 'Call/Visit Leads', icon: Phone },
    { id: 'bidding-room' as TabType, label: 'Bidding Room', icon: Gavel },
    { id: 'chat' as TabType, label: 'Chat', icon: MessageCircle },
    { id: 'quote-unlocks' as TabType, label: 'Quote Unlocks', icon: Unlock },
    { id: 'guides' as TabType, label: 'Guides', icon: BookOpen },
    { id: 'notifications' as TabType, label: 'Notifications', icon: Bell },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleBackToPublicSite = () => {
    window.location.href = '/';
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'quotes':
        return <MyQuoteRequests />;
      case 'written-quotes':
        return <WrittenQuotes />; // Now using the imported component
      case 'call-visit-leads':
        return <CallVisitLeads />;
      case 'bidding-room':
        return <BiddingRoom />; // Now using the imported component
      case 'chat':
        return <ChatSection />;
      case 'quote-unlocks':
        return <QuoteUnlocks />; // Now using the imported component
      case 'guides':
        return <Guides />;
      case 'notifications':
        return <Notifications />; // Now using the imported component
      case 'settings':
        return <SettingsSection />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black-500 to-night-500 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 md:h-screen md:fixed bg-onyx-500/30 border-r border-onyx-600/30 flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-onyx-600/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-giants_orange-500 to-giants_orange-600 rounded-lg flex items-center justify-center">
              <Sun className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">SolarMatch</h1>
              <p className="text-battleship_gray-700 text-xs">Homeowner Portal</p>
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
              <p className="text-white font-medium text-sm truncate">
                {user?.user_metadata?.full_name || 'Homeowner'}
              </p>
              <p className="text-battleship_gray-700 text-xs truncate">{user?.email}</p>
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

        {/* Back to Public Site & Sign Out */}
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
      <div className="flex-1 md:ml-64 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};

// Guides Component
const Guides: React.FC = () => {
  const guides = [
    {
      title: 'Solar Installation Process',
      description: 'Step-by-step guide to getting solar installed',
      readTime: '5 min read'
    },
    {
      title: 'Understanding Solar Rebates',
      description: 'How to maximize your government rebates',
      readTime: '8 min read'
    },
    {
      title: 'Choosing the Right System Size',
      description: 'Calculate the perfect system for your home',
      readTime: '6 min read'
    }
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Solar Guides</h2>
        <p className="text-battleship_gray-700">Learn everything about solar energy and installation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {guides.map((guide, index) => (
          <div key={index} className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-6 hover:border-giants_orange-500/50 transition-all cursor-pointer">
            <BookOpen className="h-8 w-8 text-giants_orange-500 mb-4" />
            <h3 className="text-white font-semibold mb-2">{guide.title}</h3>
            <p className="text-battleship_gray-700 text-sm mb-4">{guide.description}</p>
            <span className="text-giants_orange-500 text-sm font-medium">{guide.readTime}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Settings Component
const SettingsSection: React.FC = () => {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Settings</h2>
        <p className="text-battleship_gray-700">Manage your account preferences</p>
      </div>

      <div className="space-y-6">
        <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-6">
          <h3 className="text-white font-semibold mb-4">Account Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Email Notifications</p>
                <p className="text-battleship_gray-700 text-sm">Receive updates about your quotes</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-giants_orange-500">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">SMS Notifications</p>
                <p className="text-battleship_gray-700 text-sm">Get text updates for important events</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-onyx-600">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-6">
          <h3 className="text-white font-semibold mb-4">Privacy Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">Share Data with Installers</p>
                <p className="text-battleship_gray-700 text-sm">Allow installers to see your energy usage data</p>
              </div>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-giants_orange-500">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeownerDashboard;