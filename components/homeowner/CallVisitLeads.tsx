import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  Globe, 
  Mail, 
  MessageSquare, 
  Star, 
  AlertCircle,
  ExternalLink,
  X
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import ChatWithInstaller from '@/components/homeowner/ChatWithInstaller';

interface Lead {
  id: string;
  installer_id: string;
  installer_name: string;
  installer_website: string;
  installer_phone: string;
  installer_email: string;
  purchase_date: string;
  chat_unlocked: boolean;
  rating_submitted: boolean;
  user_rating: number | null;
}

const CallVisitLeads: React.FC = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [ratingValue, setRatingValue] = useState<number>(0);
  const [ratingFeedback, setRatingFeedback] = useState<string>('');
  const [showChatModal, setShowChatModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchLeads();
    }
  }, [user]);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch solar quotes where contact has been revealed
      const { data: quotesData, error: quotesError } = await supabase
        .from('solar_quotes')
        .select('id, created_at')
        .eq('user_id', user?.id)
        .eq('type', 'call_visit')
        .eq('contact_revealed', true)
        .order('created_at', { ascending: false });

      if (quotesError) throw quotesError;

      if (!quotesData || quotesData.length === 0) {
        setLeads([]);
        return;
      }

      // Fetch installer data
      const { data: installersData, error: installersError } = await supabase
        .from('installer_companies')
        .select('id, company_name, website, phone, email');

      if (installersError) throw installersError;

      // Fetch installer ratings separately
      const { data: ratingsData, error: ratingsError } = await supabase
        .from('installer_ratings')
        .select('installer_id, rating');

      if (ratingsError) throw ratingsError;

      // Calculate average ratings for each installer
      const installerRatings: Record<string, number> = {};
      if (ratingsData) {
        const ratingsByInstaller: Record<string, number[]> = {};
        ratingsData.forEach(rating => {
          if (!ratingsByInstaller[rating.installer_id]) {
            ratingsByInstaller[rating.installer_id] = [];
          }
          ratingsByInstaller[rating.installer_id].push(rating.rating);
        });
        
        Object.entries(ratingsByInstaller).forEach(([installerId, ratings]) => {
          const avgRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
          installerRatings[installerId] = avgRating;
        });
      }

      // Fetch any existing ratings
      const { data: userRatingsData, error: userRatingsError } = await supabase
        .from('installer_ratings')
        .select('installer_id, rating')
        .eq('homeowner_id', user?.id);

      if (userRatingsError) throw userRatingsError;

      // Transform the data
      const transformedData: Lead[] = quotesData.map(quote => {
        // Randomly select an installer for demo purposes
        const randomInstaller = installersData[Math.floor(Math.random() * installersData.length)];
        
        // Check if user has already rated this installer
        const existingRating = userRatingsData?.find(r => r.installer_id === randomInstaller?.id);
        
        return {
          id: quote.id,
          installer_id: randomInstaller?.id || 'unknown',
          installer_name: randomInstaller?.company_name || 'Solar Company',
          installer_website: randomInstaller?.website || 'https://example.com',
          installer_phone: randomInstaller?.phone || '1300 123 456',
          installer_email: randomInstaller?.email || 'contact@example.com',
          purchase_date: quote.created_at,
          chat_unlocked: true, // For call/visit leads with revealed contact, chat is always unlocked
          rating_submitted: !!existingRating,
          user_rating: existingRating?.rating || null
        };
      });

      setLeads(transformedData);
    } catch (err) {
      console.error('Error fetching call/visit leads:', err);
      setError('Failed to load your leads. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleChat = (lead: Lead) => {
    setSelectedLead(lead);
    setShowChatModal(true);
  };

  const handleRate = (lead: Lead) => {
    setSelectedLead(lead);
    setRatingValue(lead.user_rating || 0);
    setRatingFeedback('');
    setShowRatingModal(true);
  };

  const submitRating = async () => {
    if (!selectedLead || ratingValue === 0) return;
    
    try {
      // In a real app, this would insert/update the rating in the database
      console.log('Submitting rating:', {
        leadId: selectedLead.id,
        installerId: selectedLead.installer_id,
        rating: ratingValue,
        feedback: ratingFeedback
      });
      
      // Update the local state
      setLeads(leads.map(lead => 
        lead.id === selectedLead.id 
          ? { ...lead, rating_submitted: true, user_rating: ratingValue } 
          : lead
      ));
      
      // Close the modal
      setShowRatingModal(false);
      setSelectedLead(null);
    } catch (err) {
      console.error('Error submitting rating:', err);
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
        <h2 className="text-3xl font-bold text-white mb-2">Your Call/Visit Leads</h2>
        <p className="text-battleship_gray-700">Contact information for installers who can call or visit you</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-center space-x-3">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="w-12 h-12 border-4 border-giants_orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Leads List */}
      {!loading && leads.length > 0 ? (
        <div className="space-y-6">
          {leads.map((lead) => (
            <div key={lead.id} className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-6">
              {/* Header with Installer Name and Website */}
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
                <div className="flex items-center space-x-3 mb-4 md:mb-0">
                  <div className="bg-blue-500/20 p-2 rounded-lg">
                    <Phone className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">{lead.installer_name}</h3>
                    <div className="flex items-center space-x-2 text-battleship_gray-700 text-sm">
                      <Globe className="h-4 w-4" />
                      <a 
                        href={lead.installer_website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-giants_orange-500 hover:text-giants_orange-400 transition-colors flex items-center"
                      >
                        Visit Website <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                  </div>
                </div>
                
                <div className="text-sm text-battleship_gray-600">
                  Contact revealed on {formatDate(lead.purchase_date)}
                </div>
              </div>
              
              {/* Contact Information */}
              <div className="bg-onyx-600/30 rounded-xl p-4 mb-6">
                <h4 className="text-white font-semibold mb-3">Installer Contact Information</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-giants_orange-500" />
                    <a 
                      href={`tel:${lead.installer_phone}`} 
                      className="text-white hover:text-giants_orange-500 transition-colors"
                    >
                      {lead.installer_phone}
                    </a>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-giants_orange-500" />
                    <a 
                      href={`mailto:${lead.installer_email}`} 
                      className="text-white hover:text-giants_orange-500 transition-colors"
                    >
                      {lead.installer_email}
                    </a>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-yellow-400 text-sm">You may receive a call from this installer</p>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleChat(lead)}
                  className="flex-1 bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white py-2 px-4 rounded-lg font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all flex items-center justify-center space-x-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Chat with Installer Now</span>
                </button>
                
                {lead.rating_submitted ? (
                  <div className="flex-1 bg-green-500/20 text-green-400 py-2 px-4 rounded-lg font-semibold flex items-center justify-center space-x-2">
                    <Star className="h-4 w-4 fill-green-400" />
                    <span>Rated: {lead.user_rating}/5</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleRate(lead)}
                    className="flex-1 bg-onyx-600/50 text-white py-2 px-4 rounded-lg font-semibold hover:bg-onyx-600/70 transition-all flex items-center justify-center space-x-2"
                  >
                    <Star className="h-4 w-4" />
                    <span>Rate Installer Experience</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : !loading && (
        <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-8 text-center">
          <Phone className="h-16 w-16 text-battleship_gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Call/Visit Leads Available</h3>
          <p className="text-battleship_gray-700 mb-6">
            No call/visit leads available yet. Unlock installer contact to see them here.
          </p>
          <button className="bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all transform hover:scale-105">
            Request a Call/Visit Quote
          </button>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && selectedLead && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-night-500 to-black-500 rounded-2xl max-w-md w-full p-8 relative border border-onyx-600/30 shadow-2xl">
            <button
              onClick={() => {
                setShowRatingModal(false);
                setSelectedLead(null);
              }}
              className="absolute top-4 right-4 text-battleship_gray-600 hover:text-white transition-colors p-2 rounded-lg hover:bg-onyx-500/30"
            >
              <span className="text-lg">×</span>
            </button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Rate Your Experience</h3>
              <p className="text-battleship_gray-700">
                How was your experience with {selectedLead.installer_name}?
              </p>
            </div>
            
            {/* Star Rating */}
            <div className="flex justify-center space-x-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRatingValue(star)}
                  className="p-1 focus:outline-none"
                >
                  <Star 
                    className={`h-8 w-8 ${
                      star <= ratingValue 
                        ? 'text-yellow-400 fill-yellow-400' 
                        : 'text-onyx-600'
                    }`} 
                  />
                </button>
              ))}
            </div>
            
            {/* Feedback Textarea */}
            <div className="mb-6">
              <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">
                Additional Feedback (Optional)
              </label>
              <textarea
                value={ratingFeedback}
                onChange={(e) => setRatingFeedback(e.target.value)}
                placeholder="Share your experience with this installer..."
                className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 text-white placeholder-battleship_gray-600 focus:border-giants_orange-500 focus:outline-none transition-colors min-h-[100px]"
              />
            </div>
            
            <button
              onClick={submitRating}
              disabled={ratingValue === 0}
              className="w-full bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white py-3 rounded-xl font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Rating
            </button>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {showChatModal && selectedLead && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-night-500 to-black-500 rounded-2xl max-w-3xl w-full p-6 relative border border-onyx-600/30 shadow-2xl">
            <button
              onClick={() => {
                setShowChatModal(false);
                setSelectedLead(null);
              }}
              className="absolute top-4 right-4 text-battleship_gray-600 hover:text-white transition-colors p-2 rounded-lg hover:bg-onyx-500/30"
            >
              <X className="h-6 w-6" />
            </button>
            
            <ChatWithInstaller
              quoteId={selectedLead.id}
              quoteType="call_visit"
              installerName={selectedLead.installer_name}
              installerCompanyId={selectedLead.installer_id}
              isEmbedded={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CallVisitLeads;