import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  MessageCircle, 
  BookOpen, 
  AlertTriangle,
  CheckCircle,
  Gavel,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

interface DashboardStats {
  totalQuotes: number;
  pendingQuotes: number;
  activeBids: number;
  isVerified: boolean;
}

const DashboardOverview: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalQuotes: 0,
    pendingQuotes: 0,
    activeBids: 0,
    isVerified: false
  });
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState('');

  useEffect(() => {
    if (user) {
      fetchUserData();
      fetchStats();
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      if (data?.full_name) {
        // Extract first name from full name
        const firstNameOnly = data.full_name.split(' ')[0];
        setFirstName(firstNameOnly);
      } else {
        // Fallback to user metadata if profile not found
        const metadataName = user?.user_metadata?.full_name || '';
        const firstNameOnly = metadataName.split(' ')[0];
        setFirstName(firstNameOnly || 'there');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Fallback to user metadata
      const metadataName = user?.user_metadata?.full_name || '';
      const firstNameOnly = metadataName.split(' ')[0];
      setFirstName(firstNameOnly || 'there');
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      // Fetch total quotes
      const { data: quotesData, error: quotesError } = await supabase
        .from('solar_quotes')
        .select('id, status')
        .eq('user_id', user?.id);

      if (quotesError) throw quotesError;

      // Fetch active bids
      const { data: bidsData, error: bidsError } = await supabase
        .from('installer_lead_purchases')
        .select('id, contact_status')
        .eq('contact_status', 'quoted')
        .in('lead_id', quotesData?.map(q => q.id) || []);

      if (bidsError) throw bidsError;

      // Check verification status
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('email, phone')
        .eq('id', user?.id)
        .single();

      if (userError) throw userError;

      // Calculate stats
      const totalQuotes = quotesData?.length || 0;
      const pendingQuotes = quotesData?.filter(q => q.status === 'pending').length || 0;
      const activeBids = bidsData?.length || 0;
      
      // Check if both email and phone exist (simple verification check)
      const isVerified = !!(userData?.email && userData?.phone);

      setStats({
        totalQuotes,
        pendingQuotes,
        activeBids,
        isVerified
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Set default values in case of error
      setStats({
        totalQuotes: 0,
        pendingQuotes: 0,
        activeBids: 0,
        isVerified: false
      });
    } finally {
      setLoading(false);
    }
  };

  const showVerificationReminder = stats.totalQuotes >= 1 && !stats.isVerified;

  return (
    <div className="p-8">
      {/* Welcome Message */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Welcome, {firstName}!
        </h2>
        <p className="text-battleship_gray-700">Here's an overview of your solar journey</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-battleship_gray-700 text-sm">Total Quotes</p>
              <p className="text-2xl font-bold text-white">
                {loading ? '...' : stats.totalQuotes}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <FileText className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-battleship_gray-700 text-sm">Pending Quotes</p>
              <p className="text-2xl font-bold text-white">
                {loading ? '...' : stats.pendingQuotes}
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
              <FileText className="h-6 w-6 text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-battleship_gray-700 text-sm">Active Bids</p>
              <p className="text-2xl font-bold text-white">
                {loading ? '...' : stats.activeBids}
              </p>
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
              <p className="text-2xl font-bold text-white">
                {loading ? '...' : (stats.isVerified ? 'Yes' : 'No')}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              {stats.isVerified ? (
                <CheckCircle className="h-6 w-6 text-green-400" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-yellow-400" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Verification Reminder (Conditional) */}
      {showVerificationReminder && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 mb-8">
          <div className="flex items-start space-x-4">
            <AlertTriangle className="h-6 w-6 text-yellow-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-white font-semibold mb-2">Verify your email/phone to unlock more quotes</h3>
              <p className="text-battleship_gray-700 mb-4">
                Complete verification to receive additional quotes from our network of trusted installers.
              </p>
              <button className="bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all transform hover:scale-105 inline-flex items-center space-x-2">
                <span>Verify Now</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

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
          className={`${
            !stats.isVerified && stats.totalQuotes >= 1 
              ? 'bg-onyx-600/30 text-battleship_gray-600 cursor-not-allowed' 
              : 'bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white hover:from-giants_orange-600 hover:to-giants_orange-700'
          } p-4 rounded-xl font-semibold transition-all flex flex-col items-center justify-center space-y-2 h-32`}
          disabled={!stats.isVerified && stats.totalQuotes >= 1}
          title={!stats.isVerified && stats.totalQuotes >= 1 ? "Verify your contact info first" : ""}
        >
          <FileText className="h-8 w-8" />
          <span>Request New Quote</span>
        </button>
        
        <button 
          className="bg-onyx-600/50 hover:bg-onyx-600/70 text-white p-4 rounded-xl font-semibold transition-all flex flex-col items-center justify-center space-y-2 h-32"
          onClick={() => window.dispatchEvent(new CustomEvent('navigate-dashboard', { detail: 'chat' }))}
        >
          <MessageCircle className="h-8 w-8 text-green-400" />
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
      <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-6">
        <h3 className="text-white font-semibold mb-4">Recent Activity</h3>
        {stats.totalQuotes > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-onyx-600/30 rounded-lg">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <div>
                <p className="text-white font-medium">Quote request submitted</p>
                <p className="text-battleship_gray-700 text-sm">We're matching you with installers</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-battleship_gray-700">No recent activity to display</p>
            <button className="mt-4 bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all">
              Get Started
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardOverview;