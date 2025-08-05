import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Calendar, 
  MapPin, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  PieChart,
  BarChart,
  LineChart,
  X,
  ShoppingBag,
  Star
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useInstallerAuth } from '@/hooks/useInstallerAuth';

interface InsightsData {
  totalLeads: number;
  purchasedLeads: number;
  conversionRate: number;
  averageQualityScore: number;
  totalSpent: number;
  averageLeadCost: number;
  bestPerformingState: string;
  leadsByState: Record<string, number>;
  leadsByStatus: Record<string, number>;
  leadsByMonth: Record<string, number>;
  recentActivity: {
    date: string;
    action: string;
    details: string;
  }[];
}

const LeadInsights: React.FC = () => {
  const { installerData } = useInstallerAuth();
  const [insights, setInsights] = useState<InsightsData>({
    totalLeads: 0,
    purchasedLeads: 0,
    conversionRate: 0,
    averageQualityScore: 0,
    totalSpent: 0,
    averageLeadCost: 0,
    bestPerformingState: '',
    leadsByState: {},
    leadsByStatus: {},
    leadsByMonth: {},
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('30days');

  useEffect(() => {
    if (installerData?.company_id) {
      fetchInsights();
    }
  }, [installerData?.company_id, timeRange]);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real implementation, this would fetch actual data from the database
      // For now, we'll generate mock data
      
      // Get date range
      const endDate = new Date();
      let startDate = new Date();
      
      switch (timeRange) {
        case '7days':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30days':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90days':
          startDate.setDate(endDate.getDate() - 90);
          break;
        case '12months':
          startDate.setMonth(endDate.getMonth() - 12);
          break;
        default:
          startDate.setDate(endDate.getDate() - 30);
      }
      
      // Generate mock data
      const mockInsights: InsightsData = {
        totalLeads: Math.floor(Math.random() * 100) + 50,
        purchasedLeads: Math.floor(Math.random() * 30) + 10,
        conversionRate: Math.floor(Math.random() * 30) + 15,
        averageQualityScore: (Math.random() * 3) + 7,
        totalSpent: Math.floor(Math.random() * 5000) + 1000,
        averageLeadCost: Math.floor(Math.random() * 50) + 30,
        bestPerformingState: ['NSW', 'VIC', 'QLD', 'WA', 'SA'][Math.floor(Math.random() * 5)],
        leadsByState: {
          'NSW': Math.floor(Math.random() * 20) + 5,
          'VIC': Math.floor(Math.random() * 20) + 5,
          'QLD': Math.floor(Math.random() * 20) + 5,
          'WA': Math.floor(Math.random() * 20) + 5,
          'SA': Math.floor(Math.random() * 20) + 5,
          'TAS': Math.floor(Math.random() * 10),
          'ACT': Math.floor(Math.random() * 10),
          'NT': Math.floor(Math.random() * 5)
        },
        leadsByStatus: {
          'new': Math.floor(Math.random() * 15) + 5,
          'contacted': Math.floor(Math.random() * 15) + 5,
          'quoted': Math.floor(Math.random() * 15) + 5,
          'won': Math.floor(Math.random() * 10),
          'lost': Math.floor(Math.random() * 10)
        },
        leadsByMonth: {
          'Jan': Math.floor(Math.random() * 15) + 5,
          'Feb': Math.floor(Math.random() * 15) + 5,
          'Mar': Math.floor(Math.random() * 15) + 5,
          'Apr': Math.floor(Math.random() * 15) + 5,
          'May': Math.floor(Math.random() * 15) + 5,
          'Jun': Math.floor(Math.random() * 15) + 5
        },
        recentActivity: [
          {
            date: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
            action: 'Lead Purchased',
            details: 'Purchased lead for $45 in Sydney, NSW'
          },
          {
            date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
            action: 'Quote Sent',
            details: 'Sent quote for $12,500 to John Smith'
          },
          {
            date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
            action: 'Lead Status Updated',
            details: 'Updated lead status to "Contacted" for Sarah Johnson'
          },
          {
            date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
            action: 'Deal Won',
            details: 'Marked lead as "Won" for Michael Brown - $15,000 sale'
          }
        ]
      };
      
      setInsights(mockInsights);
    } catch (err) {
      console.error('Error fetching insights:', err);
      setError(err instanceof Error ? err.message : 'Failed to load insights');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchInsights();
    setTimeout(() => setRefreshing(false), 500);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h2 className="text-3xl font-bold text-white mb-2">Lead Insights</h2>
            <p className="text-battleship_gray-700">Analytics and performance metrics for your leads</p>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Time Range Selector */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-lg px-3 py-2 text-white focus:border-giants_orange-500 focus:outline-none transition-colors text-sm"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="12months">Last 12 Months</option>
            </select>
            
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-onyx-600/50 text-battleship_gray-700 hover:text-white hover:bg-onyx-600/70 px-4 py-2 rounded-lg font-semibold transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="w-12 h-12 border-4 border-giants_orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Dashboard Content */}
      {!loading && (
        <div className="space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-battleship_gray-700 text-sm">Purchased Leads</p>
                  <p className="text-2xl font-bold text-white">{insights.purchasedLeads}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <ShoppingBag className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-battleship_gray-700 text-sm">Conversion Rate</p>
                  <p className="text-2xl font-bold text-white">{insights.conversionRate}%</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-battleship_gray-700 text-sm">Total Spent</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(insights.totalSpent)}</p>
                </div>
                <div className="w-12 h-12 bg-giants_orange-500/20 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-giants_orange-500" />
                </div>
              </div>
            </div>

            <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-battleship_gray-700 text-sm">Avg. Lead Quality</p>
                  <p className="text-2xl font-bold text-white">{insights.averageQualityScore.toFixed(1)}</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <Star className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Leads by State */}
            <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Leads by State</span>
              </h3>
              <div className="h-64 flex items-end space-x-4 pt-6">
                {Object.entries(insights.leadsByState).map(([state, count]) => (
                  <div key={state} className="flex flex-col items-center flex-1">
                    <div 
                      className="w-full bg-giants_orange-500/70 hover:bg-giants_orange-500 transition-colors rounded-t-lg"
                      style={{ height: `${(count / Math.max(...Object.values(insights.leadsByState))) * 100}%` }}
                    ></div>
                    <div className="mt-2 text-xs text-battleship_gray-700">{state}</div>
                    <div className="text-white font-semibold">{count}</div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Leads by Status */}
            <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-6">
              <h3 className="text-white font-semibold mb-4 flex items-center space-x-2">
                <PieChart className="h-5 w-5" />
                <span>Leads by Status</span>
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(insights.leadsByStatus).map(([status, count]) => {
                  const getStatusColor = (status: string) => {
                    switch (status) {
                      case 'new': return 'bg-blue-500/20 text-blue-400';
                      case 'contacted': return 'bg-yellow-500/20 text-yellow-400';
                      case 'quoted': return 'bg-purple-500/20 text-purple-400';
                      case 'won': return 'bg-green-500/20 text-green-400';
                      case 'lost': return 'bg-red-500/20 text-red-400';
                      default: return 'bg-gray-500/20 text-gray-400';
                    }
                  };
                  
                  return (
                    <div key={status} className="bg-onyx-600/30 rounded-lg p-3 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)}`}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </div>
                      </div>
                      <span className="text-white font-semibold">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Monthly Trends */}
          <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center space-x-2">
              <LineChart className="h-5 w-5" />
              <span>Monthly Lead Trends</span>
            </h3>
            <div className="h-64 flex items-end space-x-4 pt-6">
              {Object.entries(insights.leadsByMonth).map(([month, count]) => (
                <div key={month} className="flex flex-col items-center flex-1">
                  <div 
                    className="w-full bg-blue-500/70 hover:bg-blue-500 transition-colors rounded-t-lg"
                    style={{ height: `${(count / Math.max(...Object.values(insights.leadsByMonth))) * 100}%` }}
                  ></div>
                  <div className="mt-2 text-xs text-battleship_gray-700">{month}</div>
                  <div className="text-white font-semibold">{count}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Recent Activity</span>
            </h3>
            <div className="space-y-3">
              {insights.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-onyx-600/30 rounded-lg">
                  <div className="w-2 h-2 bg-giants_orange-500 rounded-full mt-2"></div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="text-white font-medium">{activity.action}</p>
                      <span className="text-xs text-battleship_gray-600">{formatDate(activity.date)}</span>
                    </div>
                    <p className="text-battleship_gray-700 text-sm">{activity.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Insights */}
          <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-6">
            <h3 className="text-white font-semibold mb-4">Performance Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-onyx-600/30 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <MapPin className="h-5 w-5 text-giants_orange-500" />
                  <h4 className="text-white font-semibold">Best Performing Region</h4>
                </div>
                <p className="text-2xl font-bold text-white mb-1">{insights.bestPerformingState}</p>
                <p className="text-battleship_gray-700 text-sm">Highest conversion rate</p>
              </div>
              
              <div className="bg-onyx-600/30 rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <DollarSign className="h-5 w-5 text-giants_orange-500" />
                  <h4 className="text-white font-semibold">Average Lead Cost</h4>
                </div>
                <p className="text-2xl font-bold text-white mb-1">{formatCurrency(insights.averageLeadCost)}</p>
                <p className="text-battleship_gray-700 text-sm">Per qualified lead</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadInsights;