import React from 'react';
import { 
  FileText, 
  MessageSquare, 
  BookOpen, 
  AlertTriangle,
  CheckCircle,
  Gavel,
  ArrowRight,
  DollarSign,
  Calendar,
  TrendingUp,
  Clock,
  Star,
  MapPin,
  Zap,
  Battery,
  Sun
} from 'lucide-react';

const DashboardHome: React.FC = () => {
  return (
    <div className="p-8">
      {/* Welcome Message */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Welcome to Your Solar Dashboard!
        </h2>
        <p className="text-battleship_gray-700">Track your quotes, chat with installers, and manage your solar journey</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-battleship_gray-700 text-sm">Active Quotes</p>
              <p className="text-2xl font-bold text-white">3</p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-battleship_gray-700 text-sm">Unread Messages</p>
              <p className="text-2xl font-bold text-white">2</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <MessageSquare className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-battleship_gray-700 text-sm">Active Bids</p>
              <p className="text-2xl font-bold text-white">1</p>
            </div>
            <div className="w-12 h-12 bg-giants_orange-500/20 rounded-xl flex items-center justify-center">
              <Gavel className="h-6 w-6 text-giants_orange-500" />
            </div>
          </div>
        </div>

        <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-battleship_gray-700 text-sm">Verified</p>
              <p className="text-2xl font-bold text-white">Yes</p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <button 
          className="bg-onyx-600/50 hover:bg-onyx-600/70 text-white p-4 rounded-xl font-semibold transition-all flex flex-col items-center justify-center space-y-2 h-32"
          onClick={() => window.dispatchEvent(new CustomEvent('navigate-dashboard', { detail: 'quotes' }))}
        >
          <FileText className="h-8 w-8 text-blue-400" />
          <span>Compare Quotes</span>
        </button>
        
        <button 
          className="bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white hover:from-giants_orange-600 hover:to-giants_orange-700 p-4 rounded-xl font-semibold transition-all flex flex-col items-center justify-center space-y-2 h-32"
        >
          <FileText className="h-8 w-8" />
          <span>Request New Quote</span>
        </button>
        
        <button 
          className="bg-onyx-600/50 hover:bg-onyx-600/70 text-white p-4 rounded-xl font-semibold transition-all flex flex-col items-center justify-center space-y-2 h-32"
          onClick={() => window.dispatchEvent(new CustomEvent('navigate-dashboard', { detail: 'chat' }))}
        >
          <MessageSquare className="h-8 w-8 text-green-400" />
          <span>View Messages</span>
        </button>
        
        <button 
          className="bg-onyx-600/50 hover:bg-onyx-600/70 text-white p-4 rounded-xl font-semibold transition-all flex flex-col items-center justify-center space-y-2 h-32"
          onClick={() => window.dispatchEvent(new CustomEvent('navigate-dashboard', { detail: 'guides' }))}
        >
          <BookOpen className="h-8 w-8 text-purple-400" />
          <span>Solar Guide Access</span>
        </button>
      </div>

      {/* Recent Activity */}
      <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-6 mb-8">
        <h3 className="text-white font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-onyx-600/30 rounded-lg">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <div>
              <p className="text-white font-medium">New message from Solar Pro Installations</p>
              <p className="text-battleship_gray-700 text-sm">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-onyx-600/30 rounded-lg">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <div>
              <p className="text-white font-medium">Quote received from Green Energy Solutions</p>
              <p className="text-battleship_gray-700 text-sm">Yesterday</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-onyx-600/30 rounded-lg">
            <div className="w-2 h-2 bg-giants_orange-500 rounded-full"></div>
            <div>
              <p className="text-white font-medium">Bidding started for your quotes</p>
              <p className="text-battleship_gray-700 text-sm">2 days ago</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-6">
        <h3 className="text-white font-semibold mb-4">Quick Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button 
            className="flex items-center space-x-3 p-3 bg-onyx-600/30 rounded-lg hover:bg-onyx-600/50 transition-colors text-left"
            onClick={() => window.dispatchEvent(new CustomEvent('navigate-dashboard', { detail: 'written-quotes' }))}
          >
            <FileText className="h-5 w-5 text-giants_orange-500" />
            <span className="text-white">Written Quotes</span>
          </button>
          
          <button 
            className="flex items-center space-x-3 p-3 bg-onyx-600/30 rounded-lg hover:bg-onyx-600/50 transition-colors text-left"
            onClick={() => window.dispatchEvent(new CustomEvent('navigate-dashboard', { detail: 'call-visit-leads' }))}
          >
            <MessageSquare className="h-5 w-5 text-giants_orange-500" />
            <span className="text-white">Call/Visit Leads</span>
          </button>
          
          <button 
            className="flex items-center space-x-3 p-3 bg-onyx-600/30 rounded-lg hover:bg-onyx-600/50 transition-colors text-left"
            onClick={() => window.dispatchEvent(new CustomEvent('navigate-dashboard', { detail: 'bidding-room' }))}
          >
            <Gavel className="h-5 w-5 text-giants_orange-500" />
            <span className="text-white">Bidding Room</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;