"use client";
import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Phone, 
  Calendar, 
  ArrowRight, 
  Eye, 
  MessageSquare, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Mail
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

interface QuoteRequest {
  id: string;
  type: 'call_visit' | 'written';
  status: string;
  contact_revealed: boolean;
  created_at: string;
  location: string;
  state: string;
}

const MyQuoteRequests: React.FC = () => {
  const { user } = useAuth();
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(true);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchQuoteRequests();
      checkVerificationStatus();
    }
  }, [user]);

  const fetchQuoteRequests = async () => {
    try {
      setLoading(true);
      
      // Fetch quotes from the solar_quotes table
      const { data, error } = await supabase
        .from('solar_quotes')
        .select('id, status, location, state, created_at')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;

      // Transform the data to match our component's needs
      const transformedData = data.map(quote => ({
        id: quote.id,
        type: Math.random() > 0.5 ? 'call_visit' : 'written' as 'call_visit' | 'written', // Randomly assign for demo
        status: quote.status,
        contact_revealed: Math.random() > 0.5, // Randomly assign for demo
        created_at: quote.created_at,
        location: quote.location,
        state: quote.state
      }));

      setQuoteRequests(transformedData);
    } catch (error) {
      console.error('Error fetching quote requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkVerificationStatus = async () => {
    try {
      // Check if user has verified email and phone
      const { data, error } = await supabase
        .from('profiles')
        .select('email, phone')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      // Consider user verified if both email and phone exist
      // In a real app, you'd check specific verification flags
      setIsVerified(!!(data?.email && data?.phone));
    } catch (error) {
      console.error('Error checking verification status:', error);
      setIsVerified(false);
    }
  };

  const handleViewDetails = (quoteId: string) => {
    console.log('View details for quote:', quoteId);
    // Navigate to quote details page or open modal
  };

  const handleContinueNegotiate = (quoteId: string) => {
    console.log('Continue/Negotiate quote:', quoteId);
    // Navigate to negotiation interface
  };

  const handleVerifyNow = () => {
    setShowVerificationModal(true);
  };

  const getStatusLabel = (quote: QuoteRequest) => {
    if (quote.type === 'call_visit') {
      return quote.contact_revealed ? 'Contact Revealed: Yes' : 'Contact Revealed: No';
    } else {
      // For written quotes
      switch (quote.status) {
        case 'pending':
          return 'Draft';
        case 'quoted':
          return 'Submitted';
        case 'contacted':
          return 'Reviewed';
        case 'completed':
          return 'Completed';
        default:
          return 'Draft';
      }
    }
  };

  const getStatusIcon = (quote: QuoteRequest) => {
    if (quote.type === 'call_visit') {
      return quote.contact_revealed ? 
        <CheckCircle className="h-5 w-5 text-green-400" /> : 
        <Clock className="h-5 w-5 text-yellow-400" />;
    } else {
      // For written quotes
      switch (quote.status) {
        case 'pending':
          return <Clock className="h-5 w-5 text-yellow-400" />;
        case 'quoted':
          return <CheckCircle className="h-5 w-5 text-blue-400" />;
        case 'contacted':
          return <CheckCircle className="h-5 w-5 text-green-400" />;
        case 'completed':
          return <CheckCircle className="h-5 w-5 text-green-400" />;
        default:
          return <Clock className="h-5 w-5 text-yellow-400" />;
      }
    }
  };

  const canNegotiate = (quote: QuoteRequest) => {
    if (quote.type === 'written') {
      return quote.status === 'pending' || quote.status === 'quoted';
    }
    return false;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">My Quote Requests</h2>
        <p className="text-battleship_gray-700">Track and manage your solar quote requests</p>
      </div>

      {/* Verification Reminder (if needed) */}
      {quoteRequests.length > 0 && !isVerified && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 mb-8">
          <div className="flex items-start space-x-4">
            <AlertTriangle className="h-6 w-6 text-yellow-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-white font-semibold mb-2">Please verify your email/phone to request more quotes</h3>
              <p className="text-battleship_gray-700 mb-4">
                Verification helps us connect you with the best installers and ensures you receive all communications.
              </p>
              <button 
                onClick={handleVerifyNow}
                className="bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all transform hover:scale-105 inline-flex items-center space-x-2"
              >
                <span>Verify Now</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quote Requests List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-12 h-12 border-4 border-giants_orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : quoteRequests.length > 0 ? (
        <div className="space-y-6">
          {quoteRequests.map((quote) => (
            <div key={quote.id} className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                <div className="flex items-center space-x-3 mb-4 md:mb-0">
                  {quote.type === 'call_visit' ? (
                    <div className="bg-blue-500/20 p-2 rounded-lg">
                      <Phone className="h-5 w-5 text-blue-400" />
                    </div>
                  ) : (
                    <div className="bg-green-500/20 p-2 rounded-lg">
                      <FileText className="h-5 w-5 text-green-400" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-white font-semibold">
                      {quote.type === 'call_visit' ? 'Call/Visit Request' : 'Written Quote Request'}
                    </h3>
                    <div className="flex items-center space-x-2 text-battleship_gray-700 text-sm">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(quote.created_at)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {getStatusIcon(quote)}
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    quote.status === 'completed' 
                      ? 'bg-green-500/20 text-green-400' 
                      : quote.status === 'contacted' 
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {getStatusLabel(quote)}
                  </span>
                </div>
              </div>

              <div className="bg-onyx-600/30 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-battleship_gray-700 text-sm">Location</p>
                    <p className="text-white">{quote.location}, {quote.state}</p>
                  </div>
                  <div>
                    <p className="text-battleship_gray-700 text-sm">Request Type</p>
                    <p className="text-white">{quote.type === 'call_visit' ? 'Call/Visit' : 'Written'}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleViewDetails(quote.id)}
                  className="bg-onyx-600/50 text-white px-4 py-2 rounded-lg font-semibold hover:bg-onyx-600/70 transition-all flex items-center space-x-2"
                >
                  <Eye className="h-4 w-4" />
                  <span>View Details</span>
                </button>
                
                {canNegotiate(quote) && (
                  <button
                    onClick={() => handleContinueNegotiate(quote.id)}
                    className="bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all flex items-center space-x-2"
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>{quote.status === 'pending' ? 'Continue' : 'Negotiate'}</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-8 text-center">
          <FileText className="h-16 w-16 text-battleship_gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Quote Requests Yet</h3>
          <p className="text-battleship_gray-700 mb-6">Start your solar journey by requesting your first quote</p>
          <button 
            className="bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all transform hover:scale-105"
          >
            Request a Quote
          </button>
        </div>
      )}

      {/* Verification Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-night-500 to-black-500 rounded-2xl max-w-md w-full p-8 relative border border-onyx-600/30 shadow-2xl">
            <button
              onClick={() => setShowVerificationModal(false)}
              className="absolute top-4 right-4 text-battleship_gray-600 hover:text-white transition-colors p-2 rounded-lg hover:bg-onyx-500/30"
            >
              <span className="text-lg">×</span>
            </button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Verification Required</h3>
              <p className="text-battleship_gray-700">
                Please verify your contact information to continue requesting quotes
              </p>
            </div>
            
            <div className="space-y-4 mb-6">
              <div className="bg-onyx-600/30 rounded-lg p-4 flex items-center space-x-3">
                <Mail className="h-5 w-5 text-giants_orange-500" />
                <div>
                  <p className="text-white font-medium">Verify Email</p>
                  <p className="text-battleship_gray-700 text-sm">{user?.email}</p>
                </div>
              </div>
              
              <div className="bg-onyx-600/30 rounded-lg p-4 flex items-center space-x-3">
                <Phone className="h-5 w-5 text-giants_orange-500" />
                <div>
                  <p className="text-white font-medium">Add Phone Number</p>
                  <input
                    type="tel"
                    placeholder="Enter your phone number"
                    className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-lg px-3 py-2 mt-2 text-white placeholder-battleship_gray-600 focus:border-giants_orange-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>
            </div>
            
            <button className="w-full bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all">
              Complete Verification
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyQuoteRequests;