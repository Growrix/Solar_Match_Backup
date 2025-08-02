import React, { useState, useEffect } from 'react';
import { 
  Gavel, 
  ArrowUpDown, 
  Clock, 
  CheckCircle, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Star, 
  DollarSign, 
  Calendar, 
  AlertCircle, 
  MessageSquare,
  Check,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useInstallerAuth } from '../../hooks/useInstallerAuth';
import { supabase } from '../../lib/supabase';

interface Bid {
  id: string;
  quote_id: string;
  installer_id: string;
  homeowner_id: string;
  round: number;
  offer_price: number;
  install_time: string;
  notes: string | null;
  sender_type: 'installer' | 'homeowner';
  created_at: string;
}

interface BiddingStatus {
  quote_id: string;
  status: 'in_negotiation' | 'accepted' | 'declined' | 'expired';
  start_time: string;
  expiry_time: string;
  extension_requested: boolean;
  extension_granted: boolean;
  rounds_completed: number;
}

interface Homeowner {
  id: string;
  full_name: string;
  email: string;
}

interface WrittenQuote {
  id: string;
  homeowner_id: string;
  installer_id: string;
  price: number;
  system_type: string;
  install_time: string;
  status: string;
  interested: boolean;
  created_at: string;
}

interface BidCard {
  quote: WrittenQuote;
  homeowner: Homeowner;
  bids: Bid[];
  bidding_status: BiddingStatus;
}

const BiddingResponse: React.FC = () => {
  const { user, installerData } = useInstallerAuth();
  const [bidCards, setBidCards] = useState<BidCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [showCounterOfferModal, setShowCounterOfferModal] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<WrittenQuote | null>(null);
  const [counterOfferPrice, setCounterOfferPrice] = useState<string>('');
  const [counterOfferTime, setCounterOfferTime] = useState<string>('');
  const [counterOfferNotes, setCounterOfferNotes] = useState<string>('');
  const [now, setNow] = useState(new Date());
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Update current time every second for countdown timers
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setNow(new Date());
    }, 1000);
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (user && installerData?.company_id) {
      fetchBiddingData();
      
      // Set up real-time subscription for bids
      const bidSubscription = supabase
        .channel('bids-changes')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'bids',
          filter: `installer_id=eq.${installerData.company_id}`
        }, () => {
          // Refresh data when a new bid is inserted
          fetchBiddingData();
        })
        .subscribe();
      
      // Set up real-time subscription for bidding status
      const statusSubscription = supabase
        .channel('bidding-status-changes')
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'quote_bidding_status'
        }, (payload) => {
          // Check if this status update affects any of our quotes
          const updatedQuoteId = payload.new.quote_id;
          if (bidCards.some(card => card.quote.id === updatedQuoteId)) {
            fetchBiddingData();
          }
        })
        .subscribe();
      
      return () => {
        supabase.removeChannel(bidSubscription);
        supabase.removeChannel(statusSubscription);
      };
    }
  }, [user, installerData?.company_id]);

  const fetchBiddingData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch written quotes for the installer
      const { data: quotesData, error: quotesError } = await supabase
        .from('written_quotes')
        .select('*')
        .eq('installer_id', installerData?.company_id)
        .in('status', ['submitted', 'reviewed', 'negotiation', 'deal']);

      if (quotesError) throw quotesError;

      if (!quotesData || quotesData.length === 0) {
        setBidCards([]);
        return;
      }

      // Fetch homeowners
      const { data: homeownersData, error: homeownersError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', quotesData.map(q => q.homeowner_id));

      if (homeownersError) throw homeownersError;

      // Fetch bidding statuses
      const { data: biddingStatusData, error: biddingStatusError } = await supabase
        .from('quote_bidding_status')
        .select('*')
        .in('quote_id', quotesData.map(q => q.id));

      if (biddingStatusError) throw biddingStatusError;

      // Fetch bids
      const { data: bidsData, error: bidsError } = await supabase
        .from('bids')
        .select('*')
        .in('quote_id', quotesData.map(q => q.id))
        .order('round', { ascending: true })
        .order('created_at', { ascending: true });

      if (bidsError) throw bidsError;

      // Combine data into bid cards
      const cards: BidCard[] = quotesData.map(quote => {
        const homeowner = homeownersData?.find(h => h.id === quote.homeowner_id) || {
          id: quote.homeowner_id,
          full_name: 'Unknown Homeowner',
          email: 'unknown@example.com'
        };
        
        const bidding_status = biddingStatusData?.find(bs => bs.quote_id === quote.id) || {
          quote_id: quote.id,
          status: 'in_negotiation',
          start_time: new Date().toISOString(),
          expiry_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          extension_requested: false,
          extension_granted: false,
          rounds_completed: 0
        };
        
        const bids = bidsData?.filter(b => b.quote_id === quote.id) || [];
        
        return {
          quote,
          homeowner,
          bids,
          bidding_status
        };
      });

      // Sort cards by expiry time (soonest first)
      cards.sort((a, b) => {
        const aExpiry = new Date(a.bidding_status.expiry_time).getTime();
        const bExpiry = new Date(b.bidding_status.expiry_time).getTime();
        return aExpiry - bExpiry;
      });

      setBidCards(cards);
      
      // Initialize expanded state for all cards
      const expanded: Record<string, boolean> = {};
      cards.forEach(card => {
        expanded[card.quote.id] = true; // Start with all expanded
      });
      setExpandedCards(expanded);
    } catch (err) {
      console.error('Error fetching bidding data:', err);
      setError('Failed to load bidding data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCard = (quoteId: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [quoteId]: !prev[quoteId]
    }));
  };

  const handleCounterOffer = (card: BidCard) => {
    setSelectedQuote(card.quote);
    
    // Pre-fill with last bid values
    const lastBid = card.bids[card.bids.length - 1];
    if (lastBid) {
      setCounterOfferPrice(lastBid.offer_price.toString());
      setCounterOfferTime(lastBid.install_time);
    } else {
      setCounterOfferPrice(card.quote.price.toString());
      setCounterOfferTime(card.quote.install_time);
    }
    
    setCounterOfferNotes('');
    setShowCounterOfferModal(true);
  };

  const handleSubmitCounterOffer = async () => {
    if (!selectedQuote || !counterOfferPrice || !counterOfferTime || !installerData?.company_id) return;
    
    try {
      // Get current round
      const card = bidCards.find(c => c.quote.id === selectedQuote.id);
      if (!card) return;
      
      const currentRound = card.bidding_status.rounds_completed + 1;
      
      // Check if we've reached the maximum rounds
      if (currentRound > 3) {
        setError('Maximum 3 bidding rounds allowed');
        return;
      }
      
      // Submit counter offer
      const bid = {
        quote_id: selectedQuote.id,
        installer_id: installerData.company_id,
        homeowner_id: selectedQuote.homeowner_id,
        round: currentRound,
        offer_price: parseFloat(counterOfferPrice),
        install_time: counterOfferTime,
        notes: counterOfferNotes,
        sender_type: 'installer' as const
      };
      
      const { error } = await supabase
        .from('bids')
        .insert(bid);

      if (error) throw error;
      
      // Create notification for homeowner
      try {
        await supabase.rpc('create_notification', {
          p_user_id: selectedQuote.homeowner_id,
          p_type: 'bid',
          p_title: 'New Counter Offer',
          p_message: `You've received a new counter offer of ${parseFloat(counterOfferPrice).toLocaleString('en-AU', {
            style: 'currency',
            currency: 'AUD'
          })}`,
          p_action_link: `bid_${selectedQuote.id}`,
          p_metadata: JSON.stringify({
            quote_id: selectedQuote.id,
            installer_id: installerData.company_id,
            installer_name: installerData.installer_companies?.company_name || 'Solar Installer',
            bid_amount: parseFloat(counterOfferPrice)
          })
        });
      } catch (notifError) {
        console.error('Error creating notification:', notifError);
        // Continue even if notification fails
      }
      
      // Close modal and refresh data
      setShowCounterOfferModal(false);
      fetchBiddingData();
    } catch (err) {
      console.error('Error submitting counter offer:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit counter offer. Please try again.');
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

  const getTimeRemaining = (expiryTime: string) => {
    const expiry = new Date(expiryTime);
    const remaining = expiry.getTime() - now.getTime();
    
    if (remaining <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    }
    
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
    
    return { days, hours, minutes, seconds, total: remaining };
  };

  const formatTimeRemaining = (expiryTime: string) => {
    const { days, hours, minutes, seconds, total } = getTimeRemaining(expiryTime);
    
    if (total <= 0) {
      return 'Expired';
    }
    
    if (days > 0) {
      return `${days}d ${hours}h remaining`;
    }
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    }
    
    return `${minutes}m ${seconds}s remaining`;
  };

  const getTimeRemainingColor = (expiryTime: string) => {
    const { total } = getTimeRemaining(expiryTime);
    
    if (total <= 0) {
      return 'text-red-400';
    }
    
    if (total <= 24 * 60 * 60 * 1000) { // Less than 24 hours
      return 'text-red-400';
    }
    
    if (total <= 3 * 24 * 60 * 60 * 1000) { // Less than 3 days
      return 'text-yellow-400';
    }
    
    return 'text-blue-400';
  };

  const getTimeRemainingProgress = (expiryTime: string) => {
    const expiry = new Date(expiryTime).getTime();
    const start = new Date(expiryTime).getTime() - (7 * 24 * 60 * 60 * 1000); // 7 days before expiry
    const current = now.getTime();
    
    const total = expiry - start;
    const elapsed = current - start;
    
    if (elapsed <= 0) return 0;
    if (elapsed >= total) return 100;
    
    return (elapsed / total) * 100;
  };

  const getTimeRemainingProgressColor = (expiryTime: string) => {
    const { total } = getTimeRemaining(expiryTime);
    
    if (total <= 24 * 60 * 60 * 1000) { // Less than 24 hours
      return 'bg-red-500';
    }
    
    if (total <= 3 * 24 * 60 * 60 * 1000) { // Less than 3 days
      return 'bg-yellow-500';
    }
    
    return 'bg-blue-500';
  };

  const canCounterOffer = (card: BidCard) => {
    // Check if bidding is active
    if (card.bidding_status.status !== 'in_negotiation') {
      return false;
    }
    
    // Check if we've reached maximum rounds
    if (card.bidding_status.rounds_completed >= 3) {
      return false;
    }
    
    // Check if time has expired
    const { total } = getTimeRemaining(card.bidding_status.expiry_time);
    if (total <= 0) {
      return false;
    }
    
    // Check if it's installer's turn
    const lastBid = card.bids[card.bids.length - 1];
    if (!lastBid) {
      // No bids yet, installer can make first offer
      return true;
    }
    
    // Installer can counter if last bid was from homeowner
    return lastBid.sender_type === 'homeowner';
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Bidding Room</h2>
        <p className="text-battleship_gray-700">Respond to homeowner counter-offers and negotiate deals</p>
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

      {/* Bidding Cards */}
      {!loading && bidCards.length > 0 ? (
        <div className="space-y-8">
          {bidCards.map((card) => (
            <div 
              key={card.quote.id} 
              className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 overflow-hidden"
            >
              {/* Card Header */}
              <div className="p-6 border-b border-onyx-600/30 bg-onyx-600/20">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="flex items-center space-x-3 mb-4 md:mb-0">
                    <div className="bg-giants_orange-500/20 p-2 rounded-lg">
                      <Gavel className="h-5 w-5 text-giants_orange-500" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="text-white font-semibold">{card.homeowner.full_name}</h3>
                      </div>
                      <p className="text-battleship_gray-700 text-sm">
                        {card.quote.system_type}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
                    {/* Status Badge */}
                    <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-semibold ${
                      card.bidding_status.status === 'in_negotiation'
                        ? 'bg-blue-500/20 text-blue-400'
                        : card.bidding_status.status === 'accepted'
                          ? 'bg-green-500/20 text-green-400'
                          : card.bidding_status.status === 'declined'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {card.bidding_status.status === 'in_negotiation' && <ArrowUpDown className="h-4 w-4" />}
                      {card.bidding_status.status === 'accepted' && <CheckCircle className="h-4 w-4" />}
                      {card.bidding_status.status === 'declined' && <X className="h-4 w-4" />}
                      {card.bidding_status.status === 'expired' && <Clock className="h-4 w-4" />}
                      <span>
                        {card.bidding_status.status === 'in_negotiation' ? 'In Negotiation' : 
                         card.bidding_status.status === 'accepted' ? 'Accepted' :
                         card.bidding_status.status === 'declined' ? 'Declined' : 'Expired'}
                      </span>
                    </div>
                    
                    {/* Countdown Timer (only for active negotiations) */}
                    {card.bidding_status.status === 'in_negotiation' && (
                      <div className="flex flex-col">
                        <div className={`text-sm font-medium ${getTimeRemainingColor(card.bidding_status.expiry_time)}`}>
                          {formatTimeRemaining(card.bidding_status.expiry_time)}
                        </div>
                        <div className="w-full h-1 bg-onyx-600/50 rounded-full mt-1">
                          <div 
                            className={`h-1 rounded-full ${getTimeRemainingProgressColor(card.bidding_status.expiry_time)}`}
                            style={{ width: `${getTimeRemainingProgress(card.bidding_status.expiry_time)}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    {/* Expand/Collapse Button */}
                    <button
                      onClick={() => handleToggleCard(card.quote.id)}
                      className="ml-auto md:ml-0 text-battleship_gray-600 hover:text-white transition-colors p-1 rounded-lg hover:bg-onyx-500/30"
                    >
                      {expandedCards[card.quote.id] ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Card Content (expandable) */}
              {expandedCards[card.quote.id] && (
                <div className="p-6">
                  {/* Current Offer Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-onyx-600/30 rounded-xl p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <DollarSign className="h-5 w-5 text-giants_orange-500" />
                        <h4 className="text-white font-semibold">Current Price</h4>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {formatCurrency(card.bids.length > 0 
                          ? card.bids[card.bids.length - 1].offer_price 
                          : card.quote.price)}
                      </p>
                    </div>
                    
                    <div className="bg-onyx-600/30 rounded-xl p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className="h-5 w-5 text-giants_orange-500" />
                        <h4 className="text-white font-semibold">Install Time</h4>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {card.bids.length > 0 
                          ? card.bids[card.bids.length - 1].install_time 
                          : card.quote.install_time}
                      </p>
                    </div>
                    
                    <div className="bg-onyx-600/30 rounded-xl p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <ArrowUpDown className="h-5 w-5 text-giants_orange-500" />
                        <h4 className="text-white font-semibold">Bidding Rounds</h4>
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {card.bidding_status.rounds_completed} of 3
                      </p>
                    </div>
                  </div>
                  
                  {/* Bid History */}
                  {card.bids.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-white font-semibold mb-3">Bid History</h4>
                      <div className="space-y-4">
                        {card.bids.map((bid, index) => (
                          <div 
                            key={bid.id} 
                            className={`p-4 rounded-xl ${
                              bid.sender_type === 'installer' 
                                ? 'bg-blue-500/10 border border-blue-500/30' 
                                : 'bg-giants_orange-500/10 border border-giants_orange-500/30'
                            }`}
                          >
                            <div className="flex justify-between mb-2">
                              <span className={`text-sm font-medium ${
                                bid.sender_type === 'installer' ? 'text-blue-400' : 'text-giants_orange-500'
                              }`}>
                                {bid.sender_type === 'installer' ? 'Your Offer' : 'Homeowner Counter Offer'}
                              </span>
                              <span className="text-battleship_gray-600 text-sm">Round {bid.round}</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <p className="text-battleship_gray-700 text-sm">Price:</p>
                                <p className="text-white font-semibold">{formatCurrency(bid.offer_price)}</p>
                              </div>
                              <div>
                                <p className="text-battleship_gray-700 text-sm">Install Time:</p>
                                <p className="text-white">{bid.install_time}</p>
                              </div>
                            </div>
                            {bid.notes && (
                              <div className="mt-2">
                                <p className="text-battleship_gray-700 text-sm">Notes:</p>
                                <p className="text-white">{bid.notes}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    {/* Counter Offer Button */}
                    <button
                      onClick={() => handleCounterOffer(card)}
                      disabled={!canCounterOffer(card)}
                      className={`px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 ${
                        canCounterOffer(card)
                          ? 'bg-giants_orange-500 text-white hover:bg-giants_orange-600'
                          : 'bg-onyx-600/30 text-battleship_gray-600 cursor-not-allowed'
                      }`}
                    >
                      <ArrowUpDown className="h-4 w-4" />
                      <span>Counter Offer</span>
                    </button>
                    
                    {/* Chat Button */}
                    <button
                      onClick={() => {
                        // Navigate to chat section
                        window.dispatchEvent(new CustomEvent('navigate-dashboard', { detail: 'chat' }));
                      }}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-all flex items-center space-x-2"
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>Chat with Homeowner</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : !loading && (
        <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-8 text-center">
          <Gavel className="h-16 w-16 text-battleship_gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Active Negotiations</h3>
          <p className="text-battleship_gray-700 mb-6">
            You don't have any active bidding negotiations. Submit quotes to homeowners to start the negotiation process.
          </p>
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('navigate-dashboard', { detail: 'quote-generator' }))}
            className="bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all transform hover:scale-105"
          >
            Create Quotes
          </button>
        </div>
      )}

      {/* Counter Offer Modal */}
      {showCounterOfferModal && selectedQuote && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-night-500 to-black-500 rounded-2xl max-w-md w-full p-8 relative border border-onyx-600/30 shadow-2xl">
            <button
              onClick={() => setShowCounterOfferModal(false)}
              className="absolute top-4 right-4 text-battleship_gray-600 hover:text-white transition-colors p-2 rounded-lg hover:bg-onyx-500/30"
            >
              <X className="h-6 w-6" />
            </button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-giants_orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowUpDown className="h-8 w-8 text-giants_orange-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Make Counter Offer</h3>
              <p className="text-battleship_gray-700">
                Submit your counter offer to {bidCards.find(c => c.quote.id === selectedQuote.id)?.homeowner.full_name}
              </p>
            </div>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">
                  Your Offer Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-battleship_gray-600">$</span>
                  <input
                    type="number"
                    value={counterOfferPrice}
                    onChange={(e) => setCounterOfferPrice(e.target.value)}
                    className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl pl-8 pr-4 py-3 text-white placeholder-battleship_gray-600 focus:border-giants_orange-500 focus:outline-none transition-colors"
                    placeholder="Enter amount"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">
                  Install Time
                </label>
                <select
                  value={counterOfferTime}
                  onChange={(e) => setCounterOfferTime(e.target.value)}
                  className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 text-white focus:border-giants_orange-500 focus:outline-none transition-colors"
                >
                  <option value="1 week">1 week</option>
                  <option value="2 weeks">2 weeks</option>
                  <option value="3 weeks">3 weeks</option>
                  <option value="4 weeks">4 weeks</option>
                  <option value="5 weeks">5 weeks</option>
                  <option value="6 weeks">6 weeks</option>
                </select>
              </div>
              
              <div>
                <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={counterOfferNotes}
                  onChange={(e) => setCounterOfferNotes(e.target.value)}
                  className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 text-white placeholder-battleship_gray-600 focus:border-giants_orange-500 focus:outline-none transition-colors min-h-[100px] resize-none"
                  placeholder="Add any notes or requirements..."
                />
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCounterOfferModal(false)}
                className="flex-1 bg-onyx-600/50 text-battleship_gray-700 py-3 rounded-xl font-semibold hover:bg-onyx-600/70 hover:text-white transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitCounterOffer}
                disabled={!counterOfferPrice || !counterOfferTime}
                className="flex-1 bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white py-3 rounded-xl font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Counter Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BiddingResponse;