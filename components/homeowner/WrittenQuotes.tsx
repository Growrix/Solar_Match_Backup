import React, { useState, useEffect } from 'react';
import { PenTool, Star, MessageSquare, ArrowUpDown as ArrowsUpDown, Check, Trash2, AlertCircle, Clock, CheckCircle, FileText } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import ChatWithInstaller from '@/components/homeowner/ChatWithInstaller';

interface WrittenQuote {
  id: string;
  installer_id: string;
  installer_name: string;
  installer_rating: number;
  price: number;
  system_type: string;
  install_time: string;
  status: 'draft' | 'submitted' | 'reviewed' | 'negotiation' | 'deal' | 'rejected';
  interested: boolean;
  created_at: string;
}

const WrittenQuotes: React.FC = () => {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<WrittenQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<WrittenQuote | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);

  useEffect(() => {
    if (user) {
      fetchWrittenQuotes();
    }
  }, [user]);

  const fetchWrittenQuotes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // In a real app, this would fetch from a written_quotes table
      // For demo purposes, we'll create mock data based on solar_quotes
      const { data: quotesData, error: quotesError } = await supabase
        .from('solar_quotes')
        .select('id, created_at, status, estimated_cost, system_size')
        .eq('user_id', user?.id)
        .eq('type', 'written')
        .order('created_at', { ascending: false })
        .limit(6);

      if (quotesError) throw quotesError;

      // Fetch installer data (in a real app, this would be a join)
      const { data: installersData, error: installersError } = await supabase
        .from('installer_companies')
        .select('id, company_name');

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

      // Transform the data to match our component's needs
      const transformedData: WrittenQuote[] = quotesData.map(quote => {
        // Randomly select an installer for demo purposes
        const randomInstaller = installersData[Math.floor(Math.random() * installersData.length)];
        
        // Map status to our specific written quote statuses
        let mappedStatus: WrittenQuote['status'] = 'draft';
        switch (quote.status) {
          case 'pending': mappedStatus = 'draft'; break;
          case 'quoted': mappedStatus = 'submitted'; break;
          case 'contacted': mappedStatus = 'reviewed'; break;
          case 'completed': mappedStatus = 'deal'; break;
          default: mappedStatus = 'draft';
        }

        return {
          id: quote.id,
          installer_id: randomInstaller?.id || 'unknown',
          installer_name: randomInstaller?.company_name || 'Solar Company',
          installer_rating: installerRatings[randomInstaller?.id || ''] || 4.5,
          price: quote.estimated_cost || Math.floor(Math.random() * 15000) + 10000,
          system_type: `${quote.system_size || Math.floor(Math.random() * 10) + 3}kW Solar System`,
          install_time: `${Math.floor(Math.random() * 4) + 1} weeks`,
          status: mappedStatus,
          interested: Math.random() > 0.7, // Randomly set for demo
          created_at: quote.created_at
        };
      });

      setQuotes(transformedData);
    } catch (err) {
      console.error('Error fetching written quotes:', err);
      setError('Failed to load your written quotes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleChat = (quote: WrittenQuote) => {
    if (quote.interested) {
      // Open chat directly
      setSelectedQuote(quote);
      setShowChatModal(true);
    } else {
      // Show interest confirmation modal
      setSelectedQuote(quote);
      setShowInterestModal(true);
    }
  };

  const handleNegotiate = (quote: WrittenQuote) => {
    console.log('Negotiate quote:', quote.id);
    // In a real app, this would open a negotiation interface
  };

  const handleAcceptDeal = (quote: WrittenQuote) => {
    console.log('Accept deal for quote:', quote.id);
    // In a real app, this would update the quote status and reveal contact info
  };

  const handleReject = (quote: WrittenQuote) => {
    setSelectedQuote(quote);
    setShowRejectModal(true);
  };

  const confirmInterest = async () => {
    if (!selectedQuote) return;
    
    try {
      // In a real app, this would update the 'interested' field in the database
      setQuotes(quotes.map(q => 
        q.id === selectedQuote.id ? { ...q, interested: true } : q
      ));
      
      // Close the modal
      setShowInterestModal(false);
      setSelectedQuote(null);
      
      // Show success message or open chat directly
      console.log('Interest confirmed for quote:', selectedQuote.id);
      
      // Open chat modal
      setShowChatModal(true);
    } catch (err) {
      console.error('Error confirming interest:', err);
    }
  };

  const confirmReject = async () => {
    if (!selectedQuote) return;
    
    try {
      // In a real app, this would update the status to 'rejected' in the database
      setQuotes(quotes.filter(q => q.id !== selectedQuote.id));
      
      // Close the modal
      setShowRejectModal(false);
      setSelectedQuote(null);
      
      console.log('Quote rejected:', selectedQuote.id);
    } catch (err) {
      console.error('Error rejecting quote:', err);
    }
  };

  const getStatusBadge = (status: WrittenQuote['status']) => {
    switch (status) {
      case 'draft':
        return (
          <div className="flex items-center space-x-1 bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full text-xs font-semibold">
            <Clock className="h-3 w-3" />
            <span>Draft</span>
          </div>
        );
      case 'submitted':
        return (
          <div className="flex items-center space-x-1 bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs font-semibold">
            <FileText className="h-3 w-3" />
            <span>Submitted</span>
          </div>
        );
      case 'reviewed':
        return (
          <div className="flex items-center space-x-1 bg-purple-500/20 text-purple-400 px-2 py-1 rounded-full text-xs font-semibold">
            <CheckCircle className="h-3 w-3" />
            <span>Reviewed</span>
          </div>
        );
      case 'negotiation':
        return (
          <div className="flex items-center space-x-1 bg-giants_orange-500/20 text-giants_orange-500 px-2 py-1 rounded-full text-xs font-semibold">
            <ArrowsUpDown className="h-3 w-3" />
            <span>Negotiation</span>
          </div>
        );
      case 'deal':
        return (
          <div className="flex items-center space-x-1 bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-semibold">
            <Check className="h-3 w-3" />
            <span>Deal</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center space-x-1 bg-gray-500/20 text-gray-400 px-2 py-1 rounded-full text-xs font-semibold">
            <span>Unknown</span>
          </div>
        );
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
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
        <h2 className="text-3xl font-bold text-white mb-2">Your Written Quotes</h2>
        <p className="text-battleship_gray-700">Compare and respond to quotes from verified installers</p>
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

      {/* Quote List */}
      {!loading && quotes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quotes.map((quote) => (
            <div key={quote.id} className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 overflow-hidden hover:border-giants_orange-500/50 transition-all">
              {/* Header */}
              <div className="p-4 border-b border-onyx-600/30 bg-onyx-600/20">
                <div className="flex justify-between items-center">
                  <h3 className="text-white font-semibold truncate">{quote.installer_name}</h3>
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-white text-sm">{quote.installer_rating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="text-xs text-battleship_gray-600 mt-1">
                  Received: {formatDate(quote.created_at)}
                </div>
              </div>
              
              {/* Quote Summary */}
              <div className="p-4">
                <div className="mb-4">
                  {getStatusBadge(quote.status)}
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between">
                    <span className="text-battleship_gray-700">Price:</span>
                    <span className="text-white font-semibold">{formatCurrency(quote.price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-battleship_gray-700">System:</span>
                    <span className="text-white">{quote.system_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-battleship_gray-700">Install Time:</span>
                    <span className="text-white">{quote.install_time}</span>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleChat(quote)}
                    disabled={!quote.interested}
                    className={`flex items-center justify-center space-x-1 px-3 py-2 rounded-lg text-sm font-semibold ${
                      quote.interested
                        ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                        : 'bg-onyx-600/30 text-battleship_gray-600 cursor-not-allowed'
                    }`}
                    title={!quote.interested ? "Click 'I'm Interested' first" : ""}
                  >
                    <MessageSquare className="h-4 w-4" />
                    <span>Chat</span>
                  </button>
                  
                  <button
                    onClick={() => handleNegotiate(quote)}
                    disabled={!['submitted', 'reviewed'].includes(quote.status)}
                    className={`flex items-center justify-center space-x-1 px-3 py-2 rounded-lg text-sm font-semibold ${
                      ['submitted', 'reviewed'].includes(quote.status)
                        ? 'bg-giants_orange-500/20 text-giants_orange-500 hover:bg-giants_orange-500/30'
                        : 'bg-onyx-600/30 text-battleship_gray-600 cursor-not-allowed'
                    }`}
                  >
                    <ArrowsUpDown className="h-4 w-4" />
                    <span>Negotiate</span>
                  </button>
                  
                  <button
                    onClick={() => handleAcceptDeal(quote)}
                    disabled={quote.status !== 'negotiation'}
                    className={`flex items-center justify-center space-x-1 px-3 py-2 rounded-lg text-sm font-semibold ${
                      quote.status === 'negotiation'
                        ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                        : 'bg-onyx-600/30 text-battleship_gray-600 cursor-not-allowed'
                    }`}
                    title={quote.status !== 'negotiation' ? "Only available during negotiation" : ""}
                  >
                    <Check className="h-4 w-4" />
                    <span>Accept Deal</span>
                  </button>
                  
                  <button
                    onClick={() => handleReject(quote)}
                    disabled={quote.status === 'deal'}
                    className={`flex items-center justify-center space-x-1 px-3 py-2 rounded-lg text-sm font-semibold ${
                      quote.status !== 'deal'
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        : 'bg-onyx-600/30 text-battleship_gray-600 cursor-not-allowed'
                    }`}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Reject</span>
                  </button>
                </div>
                
                {/* Interest Button (if not already interested) */}
                {!quote.interested && (
                  <button
                    onClick={() => {
                      setSelectedQuote(quote);
                      setShowInterestModal(true);
                    }}
                    className="w-full mt-3 bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white py-2 rounded-lg font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all"
                  >
                    I'm Interested
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : !loading && (
        <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-8 text-center">
          <PenTool className="h-16 w-16 text-battleship_gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Written Quotes Yet</h3>
          <p className="text-battleship_gray-700 mb-6">
            You haven't received any written quotes yet. Request a quote to get started.
          </p>
          <button className="bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all transform hover:scale-105">
            Request a Quote
          </button>
        </div>
      )}

      {/* Interest Confirmation Modal */}
      {showInterestModal && selectedQuote && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-night-500 to-black-500 rounded-2xl max-w-md w-full p-8 relative border border-onyx-600/30 shadow-2xl">
            <button
              onClick={() => {
                setShowInterestModal(false);
                setSelectedQuote(null);
              }}
              className="absolute top-4 right-4 text-battleship_gray-600 hover:text-white transition-colors p-2 rounded-lg hover:bg-onyx-500/30"
            >
              <span className="text-lg">×</span>
            </button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Confirm Your Interest</h3>
              <p className="text-battleship_gray-700">
                By confirming your interest, you'll be able to chat directly with {selectedQuote.installer_name} about this quote.
              </p>
            </div>
            
            <div className="bg-onyx-600/30 rounded-lg p-4 mb-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-battleship_gray-700">Installer:</span>
                  <span className="text-white">{selectedQuote.installer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-battleship_gray-700">Quote Amount:</span>
                  <span className="text-white">{formatCurrency(selectedQuote.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-battleship_gray-700">System:</span>
                  <span className="text-white">{selectedQuote.system_type}</span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowInterestModal(false);
                  setSelectedQuote(null);
                }}
                className="flex-1 bg-onyx-600/50 text-battleship_gray-700 py-3 rounded-xl font-semibold hover:bg-onyx-600/70 hover:text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmInterest}
                className="flex-1 bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white py-3 rounded-xl font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all"
              >
                Confirm Interest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Quote Modal */}
      {showRejectModal && selectedQuote && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-night-500 to-black-500 rounded-2xl max-w-md w-full p-8 relative border border-onyx-600/30 shadow-2xl">
            <button
              onClick={() => {
                setShowRejectModal(false);
                setSelectedQuote(null);
              }}
              className="absolute top-4 right-4 text-battleship_gray-600 hover:text-white transition-colors p-2 rounded-lg hover:bg-onyx-500/30"
            >
              <span className="text-lg">×</span>
            </button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-8 w-8 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Reject This Quote?</h3>
              <p className="text-battleship_gray-700">
                Are you sure you want to reject this quote from {selectedQuote.installer_name}? This action cannot be undone.
              </p>
            </div>
            
            <div className="bg-onyx-600/30 rounded-lg p-4 mb-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-battleship_gray-700">Quote Amount:</span>
                  <span className="text-white">{formatCurrency(selectedQuote.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-battleship_gray-700">System:</span>
                  <span className="text-white">{selectedQuote.system_type}</span>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedQuote(null);
                }}
                className="flex-1 bg-onyx-600/50 text-battleship_gray-700 py-3 rounded-xl font-semibold hover:bg-onyx-600/70 hover:text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmReject}
                className="flex-1 bg-red-500/80 text-white py-3 rounded-xl font-semibold hover:bg-red-500 transition-all"
              >
                Reject Quote
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {showChatModal && selectedQuote && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-night-500 to-black-500 rounded-2xl max-w-3xl w-full p-6 relative border border-onyx-600/30 shadow-2xl">
            <button
              onClick={() => {
                setShowChatModal(false);
                setSelectedQuote(null);
              }}
              className="absolute top-4 right-4 text-battleship_gray-600 hover:text-white transition-colors p-2 rounded-lg hover:bg-onyx-500/30"
            >
              <X className="h-6 w-6" />
            </button>
            
            <ChatWithInstaller
              quoteId={selectedQuote.id}
              quoteType="written"
              installerName={selectedQuote.installer_name}
              installerCompanyId={selectedQuote.installer_id}
              isEmbedded={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default WrittenQuotes;