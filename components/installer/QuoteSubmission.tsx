import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  DollarSign, 
  Calendar, 
  Zap, 
  Send, 
  CheckCircle, 
  AlertCircle, 
  X,
  Info,
  User,
  Mail,
  Phone,
  MapPin,
  Home
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useInstallerAuth } from '@/hooks/useInstallerAuth';

interface PurchasedLead {
  id: string;
  lead_id: string;
  purchase_date: string;
  contact_status: string;
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
    source_quote_id?: string;
  };
}

const QuoteSubmission: React.FC = () => {
  const { user, installerData } = useInstallerAuth();
  const [purchasedLeads, setPurchasedLeads] = useState<PurchasedLead[]>([]);
  const [selectedLead, setSelectedLead] = useState<PurchasedLead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [quoteData, setQuoteData] = useState({
    price: '',
    systemType: '',
    installTime: '2 weeks',
    additionalNotes: ''
  });

  useEffect(() => {
    if (user && installerData?.company_id) {
      fetchPurchasedLeads();
    }
  }, [user, installerData?.company_id]);

  const fetchPurchasedLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch purchased leads that don't have quotes yet
      const { data, error } = await supabase
        .from('installer_lead_purchases')
        .select(`
          id,
          lead_id,
          created_at as purchase_date,
          contact_status,
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
            lead_type,
            source_quote_id
          )
        `)
        .eq('company_id', installerData.company_id)
        .eq('contact_status', 'new')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Filter out leads that already have written quotes
      const leadsWithoutQuotes = await filterLeadsWithoutQuotes(data || []);
      
      setPurchasedLeads(leadsWithoutQuotes);
    } catch (err) {
      console.error('Error fetching purchased leads:', err);
      setError(err instanceof Error ? err.message : 'Failed to load purchased leads');
    } finally {
      setLoading(false);
    }
  };

  const filterLeadsWithoutQuotes = async (leads: PurchasedLead[]) => {
    // Get all written quotes for this installer
    const { data: existingQuotes, error } = await supabase
      .from('written_quotes')
      .select('homeowner_id')
      .eq('installer_id', installerData.company_id);
    
    if (error) {
      console.error('Error checking existing quotes:', error);
      return leads; // Return all leads if we can't check
    }

    // Get homeowner IDs from source_quote_ids
    const sourceQuoteIds = leads
      .map(lead => lead.lead.source_quote_id)
      .filter(Boolean);
    
    if (sourceQuoteIds.length === 0) return leads;

    const { data: quoteUsers, error: userError } = await supabase
      .from('solar_quotes')
      .select('id, user_id')
      .in('id', sourceQuoteIds);
    
    if (userError) {
      console.error('Error fetching quote users:', userError);
      return leads;
    }

    // Create a map of source_quote_id to user_id
    const quoteUserMap = new Map();
    quoteUsers?.forEach(quote => {
      if (quote.user_id !== 'anonymous') {
        quoteUserMap.set(quote.id, quote.user_id);
      }
    });

    // Filter out leads that already have quotes for this homeowner
    const existingHomeownerIds = new Set(existingQuotes?.map(q => q.homeowner_id));
    
    return leads.filter(lead => {
      if (!lead.lead.source_quote_id) return true;
      
      const homeownerId = quoteUserMap.get(lead.lead.source_quote_id);
      if (!homeownerId || homeownerId === 'anonymous') return true;
      
      return !existingHomeownerIds.has(homeownerId);
    });
  };

  const handleSelectLead = (lead: PurchasedLead) => {
    setSelectedLead(lead);
    
    // Pre-fill quote data based on lead details
    if (lead.lead.estimated_system_size) {
      const systemSize = lead.lead.estimated_system_size;
      const basePrice = systemSize * 1500; // $1500 per kW as base price
      
      setQuoteData({
        price: basePrice.toString(),
        systemType: `${systemSize}kW Solar System`,
        installTime: '2 weeks',
        additionalNotes: ''
      });
    } else {
      // Default values if no system size
      setQuoteData({
        price: '10000',
        systemType: '6.6kW Solar System',
        installTime: '2 weeks',
        additionalNotes: ''
      });
    }
    
    setShowQuoteForm(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setQuoteData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedLead || !installerData?.company_id) return;
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Validate inputs
      if (!quoteData.price || !quoteData.systemType || !quoteData.installTime) {
        throw new Error('Please fill in all required fields');
      }
      
      // Get homeowner ID from source_quote_id
      if (!selectedLead.lead.source_quote_id) {
        throw new Error('Source quote ID not found');
      }
      
      const { data: quoteData, error: quoteError } = await supabase
        .from('solar_quotes')
        .select('user_id')
        .eq('id', selectedLead.lead.source_quote_id)
        .single();
      
      if (quoteError) throw quoteError;
      
      if (!quoteData || quoteData.user_id === 'anonymous') {
        throw new Error('Homeowner information not available');
      }
      
      // Create written quote
      const { data: quote, error: insertError } = await supabase
        .from('written_quotes')
        .insert({
          homeowner_id: quoteData.user_id,
          installer_id: installerData.company_id,
          price: parseFloat(quoteData.price),
          system_type: quoteData.systemType,
          install_time: quoteData.installTime,
          status: 'submitted'
        })
        .select()
        .single();
      
      if (insertError) throw insertError;
      
      // Update lead purchase status
      const { error: updateError } = await supabase
        .from('installer_lead_purchases')
        .update({
          contact_status: 'quoted',
          quote_amount: parseFloat(quoteData.price)
        })
        .eq('id', selectedLead.id);
      
      if (updateError) throw updateError;
      
      // Create notification for homeowner
      try {
        await supabase.rpc('create_notification', {
          p_user_id: quoteData.user_id,
          p_type: 'quote',
          p_title: 'New Quote Received',
          p_message: `You've received a new quote for a ${quoteData.systemType}`,
          p_action_link: `quote_${quote.id}`,
          p_metadata: JSON.stringify({
            quote_id: quote.id,
            installer_id: installerData.company_id,
            installer_name: installerData.installer_companies?.company_name || 'Solar Installer'
          })
        });
      } catch (notifError) {
        console.error('Error creating notification:', notifError);
        // Continue even if notification fails
      }
      
      setSuccess('Quote submitted successfully!');
      setShowQuoteForm(false);
      setSelectedLead(null);
      
      // Refresh the list
      fetchPurchasedLeads();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
    } catch (err) {
      console.error('Error submitting quote:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit quote');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Quote Submission</h2>
        <p className="text-battleship_gray-700">Create and submit quotes for your purchased leads</p>
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

      {/* Success Message */}
      {success && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6 flex items-center space-x-3">
          <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
          <p className="text-green-400 text-sm">{success}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="w-12 h-12 border-4 border-giants_orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Quote Form */}
      {showQuoteForm && selectedLead && (
        <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-8 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">Create Quote</h3>
            <button
              onClick={() => {
                setShowQuoteForm(false);
                setSelectedLead(null);
              }}
              className="text-battleship_gray-600 hover:text-white transition-colors p-2 rounded-lg hover:bg-onyx-500/30"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Lead Details */}
          <div className="bg-onyx-600/30 rounded-xl p-6 mb-6">
            <h4 className="text-white font-semibold mb-4">Lead Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-giants_orange-500" />
                  <span className="text-battleship_gray-700">Customer:</span>
                  <span className="text-white">{selectedLead.lead.customer_name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-giants_orange-500" />
                  <span className="text-battleship_gray-700">Email:</span>
                  <span className="text-white">{selectedLead.lead.customer_email}</span>
                </div>
                {selectedLead.lead.customer_phone && selectedLead.lead.lead_type === 'call_visit' && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-giants_orange-500" />
                    <span className="text-battleship_gray-700">Phone:</span>
                    <span className="text-white">{selectedLead.lead.customer_phone}</span>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-giants_orange-500" />
                  <span className="text-battleship_gray-700">Location:</span>
                  <span className="text-white">{selectedLead.lead.location}, {selectedLead.lead.state}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Home className="h-4 w-4 text-giants_orange-500" />
                  <span className="text-battleship_gray-700">Property:</span>
                  <span className="text-white">{selectedLead.lead.property_type}</span>
                </div>
                {selectedLead.lead.estimated_system_size && (
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-giants_orange-500" />
                    <span className="text-battleship_gray-700">Estimated Size:</span>
                    <span className="text-white">{selectedLead.lead.estimated_system_size}kW</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quote Form */}
          <form onSubmit={handleSubmitQuote}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">
                  <DollarSign className="inline h-4 w-4 mr-1" />
                  Quote Price (AUD) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-battleship_gray-600">$</span>
                  <input
                    type="number"
                    name="price"
                    value={quoteData.price}
                    onChange={handleInputChange}
                    placeholder="Enter quote amount"
                    className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl pl-8 pr-4 py-3 text-white placeholder-battleship_gray-600 focus:border-giants_orange-500 focus:outline-none transition-colors"
                    required
                    min="1000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">
                  <Zap className="inline h-4 w-4 mr-1" />
                  System Type *
                </label>
                <input
                  type="text"
                  name="systemType"
                  value={quoteData.systemType}
                  onChange={handleInputChange}
                  placeholder="e.g., 6.6kW Solar System"
                  className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 text-white placeholder-battleship_gray-600 focus:border-giants_orange-500 focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Installation Time *
                </label>
                <select
                  name="installTime"
                  value={quoteData.installTime}
                  onChange={handleInputChange}
                  className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 text-white focus:border-giants_orange-500 focus:outline-none transition-colors"
                  required
                >
                  <option value="1 week">1 week</option>
                  <option value="2 weeks">2 weeks</option>
                  <option value="3 weeks">3 weeks</option>
                  <option value="4 weeks">4 weeks</option>
                  <option value="5 weeks">5 weeks</option>
                  <option value="6 weeks">6 weeks</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">
                  Additional Notes
                </label>
                <textarea
                  name="additionalNotes"
                  value={quoteData.additionalNotes}
                  onChange={handleInputChange}
                  placeholder="Add any additional information about the quote..."
                  className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 text-white placeholder-battleship_gray-600 focus:border-giants_orange-500 focus:outline-none transition-colors min-h-[100px] resize-none"
                />
              </div>
            </div>

            {/* Lead Type Specific Information */}
            {selectedLead.lead.lead_type === 'call_visit' ? (
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

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowQuoteForm(false);
                  setSelectedLead(null);
                }}
                className="bg-onyx-600/50 text-battleship_gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-onyx-600/70 hover:text-white transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    <span>Submit Quote</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lead List */}
      {!loading && purchasedLeads.length > 0 ? (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-white">Leads Ready for Quoting</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {purchasedLeads.map((lead) => (
              <div 
                key={lead.id} 
                className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-6 hover:border-giants_orange-500/50 transition-all cursor-pointer"
                onClick={() => handleSelectLead(lead)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      lead.lead.lead_type === 'call_visit' 
                        ? 'bg-blue-500/20 text-blue-400' 
                        : 'bg-green-500/20 text-green-400'
                    }`}>
                      {lead.lead.lead_type === 'call_visit' ? 'Call/Visit' : 'Written Quote'}
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      lead.lead.urgency === 'high' 
                        ? 'bg-red-500/20 text-red-400' 
                        : lead.lead.urgency === 'medium'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {lead.lead.urgency.charAt(0).toUpperCase() + lead.lead.urgency.slice(1)} Priority
                    </div>
                  </div>
                  <span className="text-xs text-battleship_gray-600">
                    {formatDate(lead.purchase_date)}
                  </span>
                </div>
                
                <h4 className="text-white font-semibold mb-2">{lead.lead.customer_name}</h4>
                <p className="text-battleship_gray-700 text-sm mb-3">{lead.lead.location}, {lead.lead.state}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-battleship_gray-700 text-sm">Property:</span>
                    <span className="text-white text-sm">{lead.lead.property_type}</span>
                  </div>
                  {lead.lead.estimated_system_size && (
                    <div className="flex justify-between">
                      <span className="text-battleship_gray-700 text-sm">System Size:</span>
                      <span className="text-white text-sm">{lead.lead.estimated_system_size}kW</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-battleship_gray-700 text-sm">Budget:</span>
                    <span className="text-white text-sm">{lead.lead.budget_range}</span>
                  </div>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectLead(lead);
                  }}
                  className="w-full bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all flex items-center justify-center space-x-2"
                >
                  <FileText className="h-4 w-4" />
                  <span>Create Quote</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : !loading && (
        <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-8 text-center">
          <FileText className="h-16 w-16 text-battleship_gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Leads Ready for Quoting</h3>
          <p className="text-battleship_gray-700 mb-6">
            You don't have any purchased leads that need quotes. Purchase leads from the Lead Feed to get started.
          </p>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('navigate-dashboard', { detail: 'leads' }))}
            className="bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all transform hover:scale-105"
          >
            Browse Lead Feed
          </button>
        </div>
      )}
    </div>
  );
};

export default QuoteSubmission;