import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  MapPin, 
  Home, 
  Zap, 
  Phone, 
  Mail, 
  User, 
  Calendar, 
  Clock, 
  CheckCircle, 
  X, 
  AlertCircle,
  Search,
  Filter,
  MessageSquare,
  FileText,
  Star,
  RefreshCw,
  ArrowRight,
  Rss
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useInstallerAuth } from '@/hooks/useInstallerAuth';

interface PurchasedLead {
  id: string;
  lead_id: string;
  purchase_price: number;
  purchase_date: string;
  contact_status: 'new' | 'contacted' | 'quoted' | 'won' | 'lost';
  lead: {
    property_type: string;
    location: string;
    state: string;
    postcode?: string;
    estimated_system_size?: number;
    budget_range?: string;
    energy_usage?: number;
    roof_type?: string;
    lead_quality_score: number;
    urgency: string;
    customer_name: string;
    customer_email: string;
    customer_phone?: string;
    lead_type: string;
  };
  quote_amount?: number;
  contact_notes?: string;
}

const PurchasedLeads: React.FC = () => {
  const { user, installerData } = useInstallerAuth();
  const [leads, setLeads] = useState<PurchasedLead[]>([]);
  const [filteredLeads, setFilteredLeads] = useState<PurchasedLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [leadTypeFilter, setLeadTypeFilter] = useState('');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<PurchasedLead | null>(null);
  const [updateForm, setUpdateForm] = useState({
    contact_status: '',
    quote_amount: '',
    contact_notes: ''
  });

  useEffect(() => {
    if (user && installerData?.company_id) {
      fetchPurchasedLeads();
    }
  }, [user, installerData?.company_id]);

  useEffect(() => {
    // Apply filters and search
    let results = [...leads];
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(lead => 
        lead.lead.location.toLowerCase().includes(term) ||
        lead.lead.state.toLowerCase().includes(term) ||
        lead.lead.customer_name.toLowerCase().includes(term) ||
        lead.lead.customer_email.toLowerCase().includes(term) ||
        (lead.lead.customer_phone && lead.lead.customer_phone.includes(term))
      );
    }
    
    // Apply status filter
    if (statusFilter) {
      results = results.filter(lead => lead.contact_status === statusFilter);
    }
    
    // Apply lead type filter
    if (leadTypeFilter) {
      results = results.filter(lead => lead.lead.lead_type === leadTypeFilter);
    }
    
    setFilteredLeads(results);
  }, [leads, searchTerm, statusFilter, leadTypeFilter]);

  const fetchPurchasedLeads = async () => {
    // Check if installer data and company_id are available
    if (!installerData?.company_id) {
      setError('Company information not available. Please ensure you are properly authenticated.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Fetch purchased leads with lead details
      const { data, error } = await supabase
        .from('installer_lead_purchases')
        .select(`
          id,
          lead_id,
          purchase_price,
          created_at,
          contact_status,
          quote_amount,
          contact_notes,
          lead:installer_leads (
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
            customer_name,
            customer_email,
            customer_phone,
            lead_type
          )
        `)
        .eq('company_id', installerData.company_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform data for easier use
      const transformedLeads: PurchasedLead[] = (data || []).map(item => ({
        id: item.id,
        lead_id: item.lead_id,
        purchase_price: item.purchase_price,
        purchase_date: item.created_at,
        contact_status: item.contact_status as 'new' | 'contacted' | 'quoted' | 'won' | 'lost',
        lead: {
          ...item.lead,
          lead_type: item.lead.lead_type || 'written' // Default to 'written' if not specified
        },
        quote_amount: item.quote_amount,
        contact_notes: item.contact_notes
      }));

      setLeads(transformedLeads);
      setFilteredLeads(transformedLeads);
    } catch (err) {
      console.error('Error fetching purchased leads:', err);
      setError(err instanceof Error ? err.message : 'Failed to load purchased leads');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPurchasedLeads();
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleUpdateLead = (lead: PurchasedLead) => {
    setSelectedLead(lead);
    setUpdateForm({
      contact_status: lead.contact_status,
      quote_amount: lead.quote_amount?.toString() || '',
      contact_notes: lead.contact_notes || ''
    });
    setShowUpdateModal(true);
  };

  const handleUpdateSubmit = async () => {
    if (!selectedLead) return;
    
    try {
      // Validate quote amount if provided
      if (updateForm.quote_amount && isNaN(parseFloat(updateForm.quote_amount))) {
        throw new Error('Quote amount must be a valid number');
      }
      
      // Update lead purchase record
      const { error } = await supabase
        .from('installer_lead_purchases')
        .update({
          contact_status: updateForm.contact_status,
          quote_amount: updateForm.quote_amount ? parseFloat(updateForm.quote_amount) : null,
          contact_notes: updateForm.contact_notes || null
        })
        .eq('id', selectedLead.id)
        .eq('company_id', installerData?.company_id); // Add company_id check for security

      if (error) throw error;
      
      // Update local state
      setLeads(prev => prev.map(lead => 
        lead.id === selectedLead.id 
          ? {
              ...lead,
              contact_status: updateForm.contact_status as any,
              quote_amount: updateForm.quote_amount ? parseFloat(updateForm.quote_amount) : undefined,
              contact_notes: updateForm.contact_notes || undefined
            }
          : lead
      ));
      
      // Close modal
      setShowUpdateModal(false);
      setSelectedLead(null);
      
    } catch (err) {
      console.error('Error updating lead:', err);
      setError(err instanceof Error ? err.message : 'Failed to update lead');
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs font-semibold">New</span>;
      case 'contacted':
        return <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs font-semibold">Contacted</span>;
      case 'quoted':
        return <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full text-xs font-semibold">Quoted</span>;
      case 'won':
        return <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-semibold">Won</span>;
      case 'lost':
        return <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-xs font-semibold">Lost</span>;
      default:
        return <span className="bg-gray-500/20 text-gray-400 px-2 py-1 rounded-full text-xs font-semibold">Unknown</span>;
    }
  };

  // Get lead type badge
  const getLeadTypeBadge = (leadType: string) => {
    if (leadType === 'call_visit') {
      return (
        <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs font-semibold flex items-center">
          <Phone className="h-3 w-3 mr-1" />
          <span>Call/Visit</span>
        </span>
      );
    } else {
      return (
        <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-semibold flex items-center">
          <FileText className="h-3 w-3 mr-1" />
          <span>Written Quote</span>
        </span>
      );
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h2 className="text-3xl font-bold text-white mb-2">Purchased Leads</h2>
            <p className="text-battleship_gray-700">Manage and track your purchased leads</p>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-battleship_gray-600" />
            <input
              type="text"
              placeholder="Search by name, email, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl pl-10 pr-4 py-3 text-white placeholder-battleship_gray-600 focus:border-giants_orange-500 focus:outline-none transition-colors"
            />
          </div>
          
          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-battleship_gray-600" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl pl-10 pr-4 py-3 text-white focus:border-giants_orange-500 focus:outline-none transition-colors appearance-none"
            >
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="quoted">Quoted</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
            </select>
          </div>
          
          {/* Lead Type Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-battleship_gray-600" />
            <select
              value={leadTypeFilter}
              onChange={(e) => setLeadTypeFilter(e.target.value)}
              className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl pl-10 pr-4 py-3 text-white focus:border-giants_orange-500 focus:outline-none transition-colors appearance-none"
            >
              <option value="">All Lead Types</option>
              <option value="call_visit">Call/Visit Leads</option>
              <option value="written">Written Quotes</option>
            </select>
          </div>
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
          <ShoppingBag className="h-16 w-16 text-battleship_gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Purchased Leads</h3>
          <p className="text-battleship_gray-700 mb-6">
            {searchTerm || statusFilter || leadTypeFilter
              ? 'No leads match your current filters. Try adjusting your search criteria.'
              : 'You haven\'t purchased any leads yet. Visit the Lead Feed to find and purchase leads.'}
          </p>
          {(searchTerm || statusFilter || leadTypeFilter) ? (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('');
                setLeadTypeFilter('');
              }}
              className="bg-onyx-600/50 text-white px-6 py-3 rounded-xl font-semibold hover:bg-onyx-600/70 transition-all"
            >
              Clear Filters
            </button>
          ) : (
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('navigate-dashboard', { detail: 'leads' }))}
              className="bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
            >
              <Rss className="h-5 w-5" />
              <span>Browse Lead Feed</span>
            </button>
          )}
        </div>
      )}

      {/* Lead Cards */}
      {!loading && filteredLeads.length > 0 && (
        <div className="space-y-6">
          {filteredLeads.map((lead) => (
            <div key={lead.id} className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-6">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <div className="flex items-center space-x-3 mb-4 md:mb-0">
                  <div className="bg-giants_orange-500/20 p-2 rounded-lg">
                    <ShoppingBag className="h-5 w-5 text-giants_orange-500" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-white font-semibold">{lead.lead.customer_name}</h3>
                      {getStatusBadge(lead.contact_status)}
                      {getLeadTypeBadge(lead.lead.lead_type)}
                    </div>
                    <div className="flex items-center space-x-2 text-battleship_gray-700 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>Purchased on {formatDate(lead.purchase_date)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-battleship_gray-600">
                    <span className="text-white font-semibold">${lead.purchase_price}</span> paid
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-white text-sm">{lead.lead.lead_quality_score}/10</span>
                  </div>
                </div>
              </div>

              {/* Lead Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Location */}
                <div className="bg-onyx-600/30 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="h-5 w-5 text-giants_orange-500" />
                    <h4 className="text-white font-semibold">Location</h4>
                  </div>
                  <p className="text-white">{lead.lead.location}, {lead.lead.state}</p>
                  {lead.lead.postcode && <p className="text-battleship_gray-700 text-sm">Postcode: {lead.lead.postcode}</p>}
                </div>
                
                {/* Property Details */}
                <div className="bg-onyx-600/30 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Home className="h-5 w-5 text-giants_orange-500" />
                    <h4 className="text-white font-semibold">Property</h4>
                  </div>
                  <p className="text-white">{lead.lead.property_type}</p>
                  {lead.lead.roof_type && <p className="text-battleship_gray-700 text-sm">Roof: {lead.lead.roof_type}</p>}
                </div>
                
                {/* System Requirements */}
                <div className="bg-onyx-600/30 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Zap className="h-5 w-5 text-giants_orange-500" />
                    <h4 className="text-white font-semibold">System</h4>
                  </div>
                  {lead.lead.estimated_system_size && (
                    <p className="text-white">{lead.lead.estimated_system_size}kW System</p>
                  )}
                  {lead.lead.budget_range && (
                    <p className="text-battleship_gray-700 text-sm">Budget: ${lead.lead.budget_range}</p>
                  )}
                  {lead.lead.energy_usage && (
                    <p className="text-battleship_gray-700 text-sm">Usage: {lead.lead.energy_usage} kWh/month</p>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-onyx-600/30 rounded-xl p-4 mb-6">
                <h4 className="text-white font-semibold mb-3">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-giants_orange-500" />
                    <div>
                      <p className="text-white">{lead.lead.customer_name}</p>
                      <p className="text-battleship_gray-700 text-sm">Customer</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-giants_orange-500" />
                    <div>
                      <a 
                        href={`mailto:${lead.lead.customer_email}`} 
                        className="text-white hover:text-giants_orange-500 transition-colors"
                      >
                        {lead.lead.customer_email}
                      </a>
                      <p className="text-battleship_gray-700 text-sm">Email</p>
                    </div>
                  </div>
                  {lead.lead.customer_phone && lead.lead.lead_type === 'call_visit' && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-giants_orange-500" />
                      <div>
                        <a 
                          href={`tel:${lead.lead.customer_phone}`} 
                          className="text-white hover:text-giants_orange-500 transition-colors"
                        >
                          {lead.lead.customer_phone}
                        </a>
                        <p className="text-battleship_gray-700 text-sm">Phone</p>
                      </div>
                    </div>
                  )}
                  {lead.lead.lead_type === 'written' && (
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-giants_orange-500" />
                      <div>
                        <p className="text-white">Written Quote Only</p>
                        <p className="text-battleship_gray-700 text-sm">No direct contact</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Lead Type Specific Information */}
              {lead.lead.lead_type === 'call_visit' ? (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
                  <div className="flex items-start space-x-2">
                    <Phone className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <p className="text-blue-300 text-sm">
                      <strong>Call/Visit Lead:</strong> You can contact this customer directly by phone or schedule a site visit.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6">
                  <div className="flex items-start space-x-2">
                    <FileText className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <p className="text-green-300 text-sm">
                      <strong>Written Quote Lead:</strong> Communication with this customer must be through our platform. Direct contact information is not provided.
                    </p>
                  </div>
                </div>
              )}

              {/* Quote Information (if quoted) */}
              {lead.contact_status === 'quoted' && lead.quote_amount && (
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4 mb-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <FileText className="h-5 w-5 text-purple-400" />
                    <h4 className="text-white font-semibold">Quote Information</h4>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-battleship_gray-700">Quote Amount:</span>
                    <span className="text-white font-semibold">${lead.quote_amount.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Notes (if any) */}
              {lead.contact_notes && (
                <div className="bg-onyx-600/30 rounded-xl p-4 mb-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <FileText className="h-5 w-5 text-giants_orange-500" />
                    <h4 className="text-white font-semibold">Notes</h4>
                  </div>
                  <p className="text-battleship_gray-700">{lead.contact_notes}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleUpdateLead(lead)}
                  className="bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all flex items-center space-x-2"
                >
                  <Clock className="h-4 w-4" />
                  <span>Update Status</span>
                </button>
                
                {lead.lead.lead_type === 'call_visit' ? (
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-all flex items-center space-x-2"
                  >
                    <Phone className="h-4 w-4" />
                    <span>Call Customer</span>
                  </button>
                ) : (
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-all flex items-center space-x-2"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Message Customer</span>
                  </button>
                )}
                
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition-all flex items-center space-x-2"
                >
                  <FileText className="h-4 w-4" />
                  <span>Create Quote</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Update Status Modal */}
      {showUpdateModal && selectedLead && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-night-500 to-black-500 rounded-2xl max-w-md w-full p-8 relative border border-onyx-600/30 shadow-2xl">
            <button
              onClick={() => {
                setShowUpdateModal(false);
                setSelectedLead(null);
              }}
              className="absolute top-4 right-4 text-battleship_gray-600 hover:text-white transition-colors p-2 rounded-lg hover:bg-onyx-500/30"
            >
              <X className="h-6 w-6" />
            </button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Update Lead Status</h3>
              <p className="text-battleship_gray-700">
                Update the status and details for {selectedLead.lead.customer_name}
              </p>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">
                  Contact Status
                </label>
                <select
                  value={updateForm.contact_status}
                  onChange={(e) => setUpdateForm(prev => ({ ...prev, contact_status: e.target.value }))}
                  className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 text-white focus:border-giants_orange-500 focus:outline-none transition-colors"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="quoted">Quoted</option>
                  <option value="won">Won</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
              
              {updateForm.contact_status === 'quoted' && (
                <div>
                  <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">
                    Quote Amount ($)
                  </label>
                  <input
                    type="number"
                    value={updateForm.quote_amount}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, quote_amount: e.target.value }))}
                    placeholder="Enter quote amount"
                    className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 text-white placeholder-battleship_gray-600 focus:border-giants_orange-500 focus:outline-none transition-colors"
                  />
                </div>
              )}
              
              <div>
                <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">
                  Notes
                </label>
                <textarea
                  value={updateForm.contact_notes}
                  onChange={(e) => setUpdateForm(prev => ({ ...prev, contact_notes: e.target.value }))}
                  placeholder="Add notes about this lead..."
                  className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 text-white placeholder-battleship_gray-600 focus:border-giants_orange-500 focus:outline-none transition-colors min-h-[100px] resize-none"
                />
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowUpdateModal(false);
                  setSelectedLead(null);
                }}
                className="flex-1 bg-onyx-600/50 text-battleship_gray-700 py-3 rounded-xl font-semibold hover:bg-onyx-600/70 hover:text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateSubmit}
                className="flex-1 bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white py-3 rounded-xl font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all"
              >
                Update Lead
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchasedLeads;