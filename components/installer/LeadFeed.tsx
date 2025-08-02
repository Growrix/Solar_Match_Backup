"use client";
import React, { useState, useEffect } from 'react';
import { 
  Rss, 
  MapPin, 
  Home, 
  Zap, 
  DollarSign, 
  Clock, 
  Filter, 
  Search, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw,
  Calendar,
  Star,
  X,
  Info,
  Phone,
  FileText
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useInstallerAuth } from '@/hooks/useInstallerAuth';

interface Lead {
  id: string;
  property_type: string;
  location: string;
  state: string;
  postcode?: string;
  estimated_system_size?: number;
  budget_range?: string;
  energy_usage?: number;
  roof_type?: string;
  lead_quality_score: number;
  urgency: 'low' | 'medium' | 'high';
  price: number;
  status: 'available' | 'purchased' | 'expired';
  expires_at: string;
  created_at: string;
  lead_type: string;
  blurred_info: {
    name: string;
    phone: string;
    email: string;
  };
}

const LeadFeed: React.FC = () => {
  const { user, installerData } = useInstallerAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    state: '',
    propertyType: '',
    systemSize: '',
    priceRange: '',
    urgency: '',
    leadType: ''
  });
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [purchaseStatus, setPurchaseStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  useEffect(() => {
    if (user && installerData?.company_id) {
      fetchLeads();
      fetchWalletBalance();
    }
  }, [user, installerData?.company_id]);

  useEffect(() => {
    // Apply filters and search
    let results = [...leads];
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(lead => 
        lead.location.toLowerCase().includes(term) ||
        lead.state.toLowerCase().includes(term) ||
        lead.property_type.toLowerCase().includes(term) ||
        (lead.postcode && lead.postcode.includes(term))
      );
    }
    
    // Apply filters
    if (filters.state) {
      results = results.filter(lead => lead.state === filters.state);
    }
    
    if (filters.propertyType) {
      results = results.filter(lead => lead.property_type === filters.propertyType);
    }
    
    if (filters.systemSize) {
      const [min, max] = filters.systemSize.split('-').map(Number);
      results = results.filter(lead => 
        lead.estimated_system_size && 
        lead.estimated_system_size >= min && 
        lead.estimated_system_size <= max
      );
    }
    
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(Number);
      results = results.filter(lead => 
        lead.price >= min && 
        lead.price <= max
      );
    }
    
    if (filters.urgency) {
      results = results.filter(lead => lead.urgency === filters.urgency);
    }
    
    // Apply lead type filter
    if (filters.leadType) {
      if (filters.leadType === 'call_visit') {
        results = results.filter(lead => lead.lead_type === 'call_visit');
      } else if (filters.leadType === 'written') {
        results = results.filter(lead => lead.lead_type === 'written');
      }
    }
    
    setFilteredLeads(results);
  }, [leads, searchTerm, filters]);

  const fetchLeads = async () => {
    // Check if installer data and company_id are available
    if (!installerData?.company_id) {
      setError('Company information not available. Please ensure you are properly authenticated.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Get company service areas from installer data
      const serviceAreas = installerData?.installer_companies?.service_areas || [];
      
      // Fetch available leads from installer_leads table
      const { data, error } = await supabase
        .from('installer_leads')
        .select(`
          id,
          property_type,
          location,
          state,
          postcode,
          estimated_system_size,
          budget_range,
          energy_usage,
          roof_type,
          lead_quality_score,
          urgency,
          price,
          status,
          expires_at,
          created_at,
          customer_name,
          customer_email,
          customer_phone,
          lead_type
        `)
        .eq('status', 'available')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Check if we already purchased any of these leads
      const { data: purchasedLeads, error: purchasedError } = await supabase
        .from('installer_lead_purchases')
        .select('lead_id')
        .eq('company_id', installerData.company_id);

      if (purchasedError) throw purchasedError;

      // Filter out leads we've already purchased
      const purchasedLeadIds = purchasedLeads?.map(pl => pl.lead_id) || [];
      
      // Filter leads by service areas if available
      let filteredData = data || [];
      if (serviceAreas.length > 0) {
        filteredData = filteredData.filter(lead => serviceAreas.includes(lead.state));
      }
      
      // Filter out purchased leads
      filteredData = filteredData.filter(lead => !purchasedLeadIds.includes(lead.id));
      
      // Transform data to include blurred contact info
      const transformedLeads: Lead[] = filteredData.map(lead => ({
        id: lead.id,
        property_type: lead.property_type,
        location: lead.location,
        state: lead.state,
        postcode: lead.postcode,
        estimated_system_size: lead.estimated_system_size,
        budget_range: lead.budget_range,
        energy_usage: lead.energy_usage,
        roof_type: lead.roof_type,
        lead_quality_score: lead.lead_quality_score,
        urgency: lead.urgency as 'low' | 'medium' | 'high',
        price: lead.price,
        status: lead.status as 'available' | 'purchased' | 'expired',
        expires_at: lead.expires_at,
        created_at: lead.created_at,
        lead_type: lead.lead_type || 'written', // Default to 'written' if not specified
        blurred_info: {
          name: blurText(lead.customer_name),
          phone: blurText(lead.customer_phone || ''),
          email: blurEmail(lead.customer_email)
        }
      }));

      setLeads(transformedLeads);
      setFilteredLeads(transformedLeads);
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError(err instanceof Error ? err.message : 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      // In a real implementation, this would fetch the actual wallet balance
      // For now, we'll just set a mock balance
      setWalletBalance(1250);
    } catch (err) {
      console.error('Error fetching wallet balance:', err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLeads();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handlePurchaseLead = (lead: Lead) => {
    setSelectedLead(lead);
    setShowPurchaseModal(true);
    setPurchaseStatus('idle');
    setPurchaseError(null);
    setPurchaseStatus('idle');
    setPurchaseError(null);
  };

  const confirmPurchase = async () => {
    if (!selectedLead || !user || !installerData?.company_id) return;
    
    try {
      setPurchaseStatus('loading');
      setPurchaseError(null);
      setPurchaseError(null);
      
      // Check if we have enough balance
      if (walletBalance !== null && walletBalance < selectedLead.price) {
        throw new Error('Insufficient balance. Please top up your wallet.');
      }
      
      // Use the secure purchase_lead RPC function
      const { data, error } = await supabase.rpc('purchase_lead', {
        p_lead_id: selectedLead.id,
        p_payment_method: 'wallet'
      });
      
      if (error) throw error;
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to purchase lead');
      }
      
      // Update wallet balance (in a real app, this would be handled by a trigger)
      setWalletBalance(prev => prev !== null ? prev - selectedLead.price : null);
      
      // Update local state
      setLeads(prev => prev.filter(l => l.id !== selectedLead.id));
      
      setPurchaseStatus('success');
      
      // Close modal after success
      setTimeout(() => {
        setShowPurchaseModal(false);
        setSelectedLead(null);
      }, 2000);
      
    } catch (err) {
      console.error('Error purchasing lead:', err);
      setPurchaseError(err instanceof Error ? err.message : 'Failed to purchase lead');
      setPurchaseStatus('error');
    }
  };

  const handleFilterChange = (key: keyof typeof filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      state: '',
      propertyType: '',
      systemSize: '',
      priceRange: '',
      urgency: '',
      leadType: ''
    });
    setSearchTerm('');
  };

  // Utility function to blur text for privacy
  const blurText = (text: string): string => {
    if (!text) return '';
    const parts = text.split(' ');
    return parts.map(part => {
      if (part.length <= 1) return part;
      return `${part[0]}${'*'.repeat(part.length - 1)}`;
    }).join(' ');
  };

  // Utility function to blur email
  const blurEmail = (email: string): string => {
    if (!email) return '';
    const [username, domain] = email.split('@');
    if (!username || !domain) return email;
    return `${username[0]}${'*'.repeat(username.length - 1)}@${'*'.repeat(domain.length - 2)}${domain.slice(-2)}`;
  };

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) {
      return diffDays === 1 ? 'Yesterday' : `${diffDays} days ago`;
    }
    
    if (diffHours > 0) {
      return `${diffHours}h ago`;
    }
    
    if (diffMins > 0) {
      return `${diffMins}m ago`;
    }
    
    return 'Just now';
  };

  // Get urgency label and color
  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return { label: 'High Priority', color: 'bg-red-500/20 text-red-400' };
      case 'medium':
        return { label: 'Medium Priority', color: 'bg-yellow-500/20 text-yellow-400' };
      case 'low':
        return { label: 'Low Priority', color: 'bg-blue-500/20 text-blue-400' };
      default:
        return { label: 'Medium Priority', color: 'bg-yellow-500/20 text-yellow-400' };
    }
  };

  // Calculate time remaining until expiry
  const getTimeRemaining = (expiryTime: string) => {
    const expiry = new Date(expiryTime);
    const now = new Date();
    const diffMs = expiry.getTime() - now.getTime();
    
    if (diffMs <= 0) return 'Expired';
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    const remainingHours = diffHours % 24;
    
    if (diffDays > 0) {
      return `${diffDays}d ${remainingHours}h`;
    }
    
    return `${diffHours}h`;
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h2 className="text-3xl font-bold text-white mb-2">Lead Feed</h2>
            <p className="text-battleship_gray-700">Browse and purchase qualified solar leads</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-onyx-600/50 text-battleship_gray-700 hover:text-white hover:bg-onyx-600/70 px-4 py-2 rounded-lg font-semibold transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            
            {walletBalance !== null && (
              <div className="bg-onyx-600/50 px-4 py-2 rounded-lg flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-giants_orange-500" />
                <span className="text-white font-semibold">${walletBalance.toFixed(2)}</span>
              </div>
            )}
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

      {/* Search and Filters */}
      <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-battleship_gray-600" />
            <input
              type="text"
              placeholder="Search by location, state, or postcode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl pl-10 pr-4 py-3 text-white placeholder-battleship_gray-600 focus:border-giants_orange-500 focus:outline-none transition-colors"
            />
          </div>
          
          {/* Filter Dropdown */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-battleship_gray-600" />
            <select
              value={filters.state}
              onChange={(e) => handleFilterChange('state', e.target.value)}
              className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl pl-10 pr-4 py-3 text-white focus:border-giants_orange-500 focus:outline-none transition-colors appearance-none"
            >
              <option value="">All States</option>
              <option value="NSW">New South Wales</option>
              <option value="VIC">Victoria</option>
              <option value="QLD">Queensland</option>
              <option value="WA">Western Australia</option>
              <option value="SA">South Australia</option>
              <option value="TAS">Tasmania</option>
              <option value="ACT">Australian Capital Territory</option>
              <option value="NT">Northern Territory</option>
            </select>
          </div>
        </div>
        
        {/* Advanced Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <select
              value={filters.propertyType}
              onChange={(e) => handleFilterChange('propertyType', e.target.value)}
              className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-2 text-white focus:border-giants_orange-500 focus:outline-none transition-colors text-sm"
            >
              <option value="">All Property Types</option>
              <option value="house">House</option>
              <option value="townhouse">Townhouse</option>
              <option value="apartment">Apartment</option>
              <option value="commercial">Commercial</option>
            </select>
          </div>
          
          <div>
            <select
              value={filters.systemSize}
              onChange={(e) => handleFilterChange('systemSize', e.target.value)}
              className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-2 text-white focus:border-giants_orange-500 focus:outline-none transition-colors text-sm"
            >
              <option value="">All System Sizes</option>
              <option value="3-6">3kW - 6kW</option>
              <option value="6-10">6kW - 10kW</option>
              <option value="10-15">10kW - 15kW</option>
              <option value="15-30">15kW+</option>
            </select>
          </div>
          
          <div>
            <select
              value={filters.priceRange}
              onChange={(e) => handleFilterChange('priceRange', e.target.value)}
              className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-2 text-white focus:border-giants_orange-500 focus:outline-none transition-colors text-sm"
            >
              <option value="">All Price Ranges</option>
              <option value="0-50">$0 - $50</option>
              <option value="50-75">$50 - $75</option>
              <option value="75-100">$75 - $100</option>
              <option value="100-200">$100+</option>
            </select>
          </div>
          
          <div>
            <select
              value={filters.urgency}
              onChange={(e) => handleFilterChange('urgency', e.target.value)}
              className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-2 text-white focus:border-giants_orange-500 focus:outline-none transition-colors text-sm"
            >
              <option value="">All Urgency Levels</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>
        
        {/* Lead Type Filter */}
        <div className="mt-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-battleship_gray-700">Lead Type:</span>
            <div className="flex space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="leadType"
                  value=""
                  checked={filters.leadType === ''}
                  onChange={() => handleFilterChange('leadType', '')}
                  className="form-radio text-giants_orange-500 focus:ring-giants_orange-500"
                />
                <span className="text-white text-sm">All Leads</span>
              </label>
              
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="leadType"
                  value="call_visit"
                  checked={filters.leadType === 'call_visit'}
                  onChange={() => handleFilterChange('leadType', 'call_visit')}
                  className="form-radio text-giants_orange-500 focus:ring-giants_orange-500"
                />
                <span className="text-white text-sm">Call/Visit Leads</span>
              </label>
              
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="leadType"
                  value="written"
                  checked={filters.leadType === 'written'}
                  onChange={() => handleFilterChange('leadType', 'written')}
                  className="form-radio text-giants_orange-500 focus:ring-giants_orange-500"
                />
                <span className="text-white text-sm">Written Quotes</span>
              </label>
            </div>
          </div>
        </div>
        
        {/* Filter Actions */}
        <div className="flex justify-end mt-4">
          <button
            onClick={resetFilters}
            className="text-battleship_gray-600 hover:text-white transition-colors text-sm"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="w-12 h-12 border-4 border-giants_orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* No Results */}
      {!loading && filteredLeads.length === 0 && (
        <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-8 text-center">
          <Rss className="h-16 w-16 text-battleship_gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Leads Available</h3>
          <p className="text-battleship_gray-700 mb-6">
            {searchTerm || Object.values(filters).some(v => v !== '') 
              ? 'No leads match your current filters. Try adjusting your search criteria.'
              : 'There are no available leads at the moment. Check back later for new opportunities.'}
          </p>
          {(searchTerm || Object.values(filters).some(v => v !== '')) && (
            <button
              onClick={resetFilters}
              className="bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all transform hover:scale-105"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Lead Cards */}
      {!loading && filteredLeads.length > 0 && (
        <div className="space-y-6">
          {filteredLeads.map((lead) => {
            const urgency = getUrgencyLabel(lead.urgency);
            const timeRemaining = getTimeRemaining(lead.expires_at);
            
            return (
              <div key={lead.id} className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-6 hover:border-giants_orange-500/50 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${urgency.color}`}>
                      {urgency.label}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 ${
                      lead.lead_type === 'call_visit' 
                        ? 'bg-blue-500/20 text-blue-400' 
                        : 'bg-green-500/20 text-green-400'
                    }`}>
                      {lead.lead_type === 'call_visit' ? (
                        <>
                          <Phone className="h-3 w-3 mr-1" />
                          <span>Call/Visit</span>
                        </>
                      ) : (
                        <>
                          <FileText className="h-3 w-3 mr-1" />
                          <span>Written Quote</span>
                        </>
                      )}
                    </span>
                    <span className="text-battleship_gray-600 text-sm">{formatTimeAgo(lead.created_at)}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-sm text-battleship_gray-600 flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{timeRemaining} left</span>
                    </div>
                    <div className="text-giants_orange-500 font-bold text-lg">${lead.price}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {/* Location */}
                  <div className="bg-onyx-600/30 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="h-5 w-5 text-giants_orange-500" />
                      <h4 className="text-white font-semibold">Location</h4>
                    </div>
                    <p className="text-white">{lead.location}, {lead.state}</p>
                    {lead.postcode && <p className="text-battleship_gray-700 text-sm">Postcode: {lead.postcode}</p>}
                  </div>
                  
                  {/* Property Details */}
                  <div className="bg-onyx-600/30 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Home className="h-5 w-5 text-giants_orange-500" />
                      <h4 className="text-white font-semibold">Property</h4>
                    </div>
                    <p className="text-white">{lead.property_type}</p>
                    {lead.roof_type && <p className="text-battleship_gray-700 text-sm">Roof: {lead.roof_type}</p>}
                  </div>
                  
                  {/* System Requirements */}
                  <div className="bg-onyx-600/30 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Zap className="h-5 w-5 text-giants_orange-500" />
                      <h4 className="text-white font-semibold">System</h4>
                    </div>
                    {lead.estimated_system_size && (
                      <p className="text-white">{lead.estimated_system_size}kW System</p>
                    )}
                    {lead.budget_range && (
                      <p className="text-battleship_gray-700 text-sm">Budget: ${lead.budget_range}</p>
                    )}
                    {lead.energy_usage && (
                      <p className="text-battleship_gray-700 text-sm">Usage: {lead.energy_usage} kWh/month</p>
                    )}
                  </div>
                </div>

                {/* Blurred Contact Info */}
                <div className="bg-onyx-600/30 rounded-xl p-4 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-semibold">Contact Information (Blurred)</h4>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-white text-sm">{lead.lead_quality_score}/10</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-battleship_gray-600">Name: </span>
                      <span className="text-white">{lead.blurred_info.name}</span>
                    </div>
                    <div>
                      <span className="text-battleship_gray-600">Phone: </span>
                      <span className="text-white">{lead.blurred_info.phone}</span>
                    </div>
                    <div>
                      <span className="text-battleship_gray-600">Email: </span>
                      <span className="text-white">{lead.blurred_info.email}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handlePurchaseLead(lead)}
                  className="w-full bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <DollarSign className="h-5 w-5" />
                  <span>Buy Now - ${lead.price}</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Purchase Confirmation Modal */}
      {showPurchaseModal && selectedLead && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-night-500 to-black-500 rounded-2xl max-w-md w-full p-8 relative border border-onyx-600/30 shadow-2xl">
            <button
              onClick={() => {
                if (purchaseStatus !== 'loading') {
                  setShowPurchaseModal(false);
                  setSelectedLead(null);
                }
              }}
              disabled={purchaseStatus === 'loading'}
              className="absolute top-4 right-4 text-battleship_gray-600 hover:text-white transition-colors p-2 rounded-lg hover:bg-onyx-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X className="h-6 w-6" />
            </button>
            
            {purchaseStatus === 'idle' && (
              <>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-giants_orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="h-8 w-8 text-giants_orange-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Confirm Lead Purchase</h3>
                  <p className="text-battleship_gray-700">
                    You're about to purchase this lead for ${selectedLead.price}
                  </p>
                </div>
                
                <div className="bg-onyx-600/30 rounded-xl p-4 mb-6">
                  <h4 className="text-white font-semibold mb-3">Lead Details</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-battleship_gray-700">Location:</span>
                      <span className="text-white">{selectedLead.location}, {selectedLead.state}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-battleship_gray-700">Property Type:</span>
                      <span className="text-white">{selectedLead.property_type}</span>
                    </div>
                    {selectedLead.estimated_system_size && (
                      <div className="flex justify-between">
                        <span className="text-battleship_gray-700">System Size:</span>
                        <span className="text-white">{selectedLead.estimated_system_size}kW</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-battleship_gray-700">Lead Quality:</span>
                      <span className="text-white">{selectedLead.lead_quality_score}/10</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-battleship_gray-700">Lead Type:</span>
                      <span className="text-white">
                        {selectedLead.lead_type === 'call_visit' ? 'Call/Visit' : 'Written Quote'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Lead Type Specific Information */}
                {selectedLead.lead_type === 'call_visit' ? (
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
                    <div className="flex items-start space-x-2">
                      <Phone className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <p className="text-blue-300 text-sm">
                        This is a <strong>Call/Visit Lead</strong>. After purchase, you'll get full contact details and can call or visit the customer directly.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
                    <div className="flex items-start space-x-2">
                      <FileText className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <p className="text-green-300 text-sm">
                        This is a <strong>Written Quote Lead</strong>. After purchase, you'll be able to submit a written quote through our platform. Direct contact information will not be shared.
                      </p>
                    </div>
                  </div>
                )}
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowPurchaseModal(false);
                      setSelectedLead(null);
                    }}
                    className="flex-1 bg-onyx-600/50 text-battleship_gray-700 py-3 rounded-xl font-semibold hover:bg-onyx-600/70 hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmPurchase}
                    className="flex-1 bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white py-3 rounded-xl font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all"
                  >
                    Confirm Purchase
                  </button>
                </div>
              </>
            )}
            
            {purchaseStatus === 'loading' && (
              <div className="text-center py-8">
                <div className="w-16 h-16 border-4 border-giants_orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                <h3 className="text-xl font-bold text-white mb-2">Processing Purchase</h3>
                <p className="text-battleship_gray-700">Please wait while we process your purchase...</p>
              </div>
            )}
            
            {purchaseStatus === 'success' && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Purchase Successful!</h3>
                <p className="text-battleship_gray-700 mb-4">
                  You now have access to the full contact details for this lead.
                </p>
                <p className="text-green-400">
                  View this lead in your "Purchased Leads" section.
                </p>
              </div>
            )}
            
            {purchaseStatus === 'error' && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="h-8 w-8 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Purchase Failed</h3>
                <p className="text-red-400 mb-6">{purchaseError}</p>
                <button
                  onClick={() => {
                    setPurchaseStatus('idle');
                    setPurchaseError(null);
                  }}
                  className="bg-onyx-600/50 text-white px-6 py-3 rounded-xl font-semibold hover:bg-onyx-600/70 transition-all"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadFeed;