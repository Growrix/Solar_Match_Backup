import React, { useState, useEffect } from 'react';
import { 
  Unlock, 
  Lock, 
  Users, 
  Mail, 
  Phone, 
  CheckCircle, 
  AlertTriangle, 
  DollarSign,
  ArrowRight,
  X,
  Info
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

interface QuoteUnlockStats {
  callVisitUsed: number;
  callVisitTotal: number;
  writtenUsed: number;
  writtenTotal: number;
  isVerified: boolean;
  hasReferral: boolean;
}

interface ReferralData {
  code: string;
  referrals: number;
  unlocksEarned: number;
}

const QuoteUnlocks: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<QuoteUnlockStats>({
    callVisitUsed: 0,
    callVisitTotal: 3,
    writtenUsed: 0,
    writtenTotal: 3,
    isVerified: false,
    hasReferral: false
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showAdminRequestModal, setShowAdminRequestModal] = useState(false);
  const [referralData, setReferralData] = useState<ReferralData>({
    code: '',
    referrals: 0,
    unlocksEarned: 0
  });
  const [selectedPackage, setSelectedPackage] = useState<{amount: number, price: number} | null>(null);

  useEffect(() => {
    if (user) {
      fetchQuoteUnlockStats();
      generateReferralCode();
    }
  }, [user]);

  const fetchQuoteUnlockStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch call/visit quotes
      const { data: callVisitData, error: callVisitError } = await supabase
        .from('solar_quotes')
        .select('id')
        .eq('user_id', user?.id)
        .eq('type', 'call_visit');

      if (callVisitError) throw callVisitError;

      // Fetch written quotes
      const { data: writtenData, error: writtenError } = await supabase
        .from('solar_quotes')
        .select('id')
        .eq('user_id', user?.id)
        .eq('type', 'written');

      if (writtenError) throw writtenError;

      // Check verification status
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('email, phone')
        .eq('id', user?.id)
        .single();

      if (userError) throw userError;

      // Check if user has referrals
      const { data: referralData, error: referralError } = await supabase
        .from('quote_unlocks')
        .select('count')
        .eq('user_id', user?.id)
        .eq('unlock_type', 'referral');

      if (referralError) throw referralError;

      // Calculate total unlocks based on usage and referrals
      const callVisitUsed = callVisitData?.length || 0;
      const writtenUsed = writtenData?.length || 0;
      
      // Determine total available quotes
      let callVisitTotal = 3; // Base amount
      let writtenTotal = 3; // Base amount
      
      // Add referral bonuses if any
      const hasReferral = referralData && referralData.length > 0;
      if (hasReferral) {
        callVisitTotal += 2; // +2 for call/visit from referral
        writtenTotal += 2; // +2 for written from referral
      }
      
      // Add admin granted quote for written
      writtenTotal += 1; // +1 for admin granted (we'll assume it's granted for demo)
      
      // Check if user is verified (has both email and phone)
      const isVerified = !!(userData?.email && userData?.phone);

      setStats({
        callVisitUsed,
        callVisitTotal,
        writtenUsed,
        writtenTotal,
        isVerified,
        hasReferral
      });
    } catch (err) {
      console.error('Error fetching quote unlock stats:', err);
      setError('Failed to load quote unlock data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const generateReferralCode = () => {
    if (!user) return;
    
    // Generate a referral code based on user ID
    const code = `${user.id.substring(0, 6)}${Math.floor(Math.random() * 1000)}`;
    
    setReferralData({
      code,
      referrals: Math.floor(Math.random() * 3), // Mock data
      unlocksEarned: Math.floor(Math.random() * 4) // Mock data
    });
  };

  const handleVerifyNow = () => {
    setShowVerificationModal(true);
  };

  const handleReferFriend = () => {
    setShowReferralModal(true);
  };

  const handleRequestAdminQuote = () => {
    setShowAdminRequestModal(true);
  };

  const handleBuyQuotes = () => {
    setShowPurchaseModal(true);
  };

  const handleSelectPackage = (amount: number, price: number) => {
    setSelectedPackage({ amount, price });
  };

  const handlePurchaseQuotes = () => {
    if (!selectedPackage) return;
    
    // Mock purchase process
    console.log(`Purchasing ${selectedPackage.amount} quotes for $${selectedPackage.price}`);
    
    // Update stats (in a real app, this would happen after payment confirmation)
    setStats(prev => ({
      ...prev,
      writtenTotal: prev.writtenTotal + selectedPackage.amount
    }));
    
    // Close modal
    setShowPurchaseModal(false);
    setSelectedPackage(null);
  };

  const handleSubmitVerification = () => {
    // Mock verification process
    console.log('Submitting verification');
    
    // Update verification status
    setStats(prev => ({
      ...prev,
      isVerified: true
    }));
    
    // Close modal
    setShowVerificationModal(false);
  };

  const handleCopyReferralCode = () => {
    navigator.clipboard.writeText(referralData.code);
    alert('Referral code copied to clipboard!');
  };

  const handleSubmitAdminRequest = () => {
    // Mock admin request process
    console.log('Submitting admin request for additional quote');
    
    // Update stats (in a real app, this would happen after admin approval)
    setStats(prev => ({
      ...prev,
      writtenTotal: prev.writtenTotal + 1
    }));
    
    // Close modal
    setShowAdminRequestModal(false);
  };

  const getCallVisitUnlockStatus = () => {
    if (stats.callVisitUsed >= stats.callVisitTotal) {
      return 'maxed';
    }
    
    if (stats.callVisitUsed > 0 && !stats.isVerified) {
      return 'verification_required';
    }
    
    return 'available';
  };

  const getWrittenUnlockStatus = () => {
    if (stats.writtenUsed >= stats.writtenTotal) {
      if (stats.writtenTotal < 6) {
        return 'referral_required';
      }
      return 'purchase_required';
    }
    
    if (stats.writtenUsed >= 3 && stats.writtenUsed < 4) {
      return 'admin_request';
    }
    
    return 'available';
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Quote Unlocks</h2>
        <p className="text-battleship_gray-700">Manage your quote requests and unlock more options</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-center space-x-3">
          <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-12 h-12 border-4 border-giants_orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Verification Status */}
          {!stats.isVerified && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
              <div className="flex items-start space-x-4">
                <div className="bg-yellow-500/20 p-3 rounded-xl">
                  <AlertTriangle className="h-6 w-6 text-yellow-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-lg mb-2">Verification Required</h3>
                  <p className="text-battleship_gray-700 mb-4">
                    To protect your privacy and ensure quality service, please verify your email and phone number before requesting additional quotes.
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

          {/* Call/Visit Quotes Section */}
          <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 overflow-hidden">
            <div className="p-6 border-b border-onyx-600/30 bg-onyx-600/20">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-500/20 p-2 rounded-lg">
                  <Phone className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Call/Visit Quote Requests</h3>
                  <p className="text-battleship_gray-700 text-sm">
                    Installers can call you or schedule a site visit
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-battleship_gray-700 text-sm">
                    Quotes Used: {stats.callVisitUsed}/{stats.callVisitTotal}
                  </span>
                  <span className="text-battleship_gray-700 text-sm">
                    {Math.max(0, stats.callVisitTotal - stats.callVisitUsed)} remaining
                  </span>
                </div>
                <div className="w-full h-3 bg-onyx-600/50 rounded-full">
                  <div 
                    className="h-3 bg-blue-500 rounded-full"
                    style={{ width: `${(stats.callVisitUsed / stats.callVisitTotal) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Rules */}
              <div className="bg-onyx-600/30 rounded-xl p-4 mb-6">
                <h4 className="text-white font-semibold mb-3 flex items-center space-x-2">
                  <Info className="h-4 w-4 text-blue-400" />
                  <span>Call/Visit Quote Rules</span>
                </h4>
                <ul className="space-y-2 text-battleship_gray-700 text-sm">
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>You can only request 1 Call/Visit quote at a time</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Maximum of 5 quotes total (3 base + 2 via referral)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Verification required after first quote</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>Your contact information is revealed to the installer</span>
                  </li>
                </ul>
              </div>
              
              {/* Action Button */}
              {getCallVisitUnlockStatus() === 'available' && (
                <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center space-x-2">
                  <Unlock className="h-5 w-5" />
                  <span>Request Call/Visit Quote</span>
                </button>
              )}
              
              {getCallVisitUnlockStatus() === 'verification_required' && (
                <button 
                  onClick={handleVerifyNow}
                  className="w-full bg-yellow-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-yellow-600 transition-all flex items-center justify-center space-x-2"
                >
                  <Mail className="h-5 w-5" />
                  <span>Verify to Request More</span>
                </button>
              )}
              
              {getCallVisitUnlockStatus() === 'maxed' && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center space-x-3">
                  <Lock className="h-5 w-5 text-red-400 flex-shrink-0" />
                  <p className="text-red-400 text-sm">
                    You've reached the maximum of {stats.callVisitTotal} Call/Visit quotes. You can still request Written quotes.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Written Quotes Section */}
          <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 overflow-hidden">
            <div className="p-6 border-b border-onyx-600/30 bg-onyx-600/20">
              <div className="flex items-center space-x-3">
                <div className="bg-green-500/20 p-2 rounded-lg">
                  <Mail className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Written Quote Requests</h3>
                  <p className="text-battleship_gray-700 text-sm">
                    Get detailed quotes without revealing contact info
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-battleship_gray-700 text-sm">
                    Quotes Used: {stats.writtenUsed}/{stats.writtenTotal}
                  </span>
                  <span className="text-battleship_gray-700 text-sm">
                    {Math.max(0, stats.writtenTotal - stats.writtenUsed)} remaining
                  </span>
                </div>
                <div className="w-full h-3 bg-onyx-600/50 rounded-full">
                  <div 
                    className="h-3 bg-green-500 rounded-full"
                    style={{ width: `${(stats.writtenUsed / stats.writtenTotal) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              {/* Rules */}
              <div className="bg-onyx-600/30 rounded-xl p-4 mb-6">
                <h4 className="text-white font-semibold mb-3 flex items-center space-x-2">
                  <Info className="h-4 w-4 text-green-400" />
                  <span>Written Quote Rules</span>
                </h4>
                <ul className="space-y-2 text-battleship_gray-700 text-sm">
                  <li className="flex items-start space-x-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>Request up to 3 quotes at once</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>After 3 quotes, request 1 more free quote from admin</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>Refer a friend to unlock 2 more quotes (total = 6)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>Purchase additional quotes after using all free ones</span>
                  </li>
                </ul>
              </div>
              
              {/* Action Button */}
              {getWrittenUnlockStatus() === 'available' && (
                <button className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center space-x-2">
                  <Unlock className="h-5 w-5" />
                  <span>Request Written Quote</span>
                </button>
              )}
              
              {getWrittenUnlockStatus() === 'admin_request' && (
                <button 
                  onClick={handleRequestAdminQuote}
                  className="w-full bg-purple-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-purple-600 transition-all flex items-center justify-center space-x-2"
                >
                  <Mail className="h-5 w-5" />
                  <span>Request 1 More Free Quote</span>
                </button>
              )}
              
              {getWrittenUnlockStatus() === 'referral_required' && (
                <button 
                  onClick={handleReferFriend}
                  className="w-full bg-yellow-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-yellow-600 transition-all flex items-center justify-center space-x-2"
                >
                  <Users className="h-5 w-5" />
                  <span>Refer a Friend to Unlock 2 More</span>
                </button>
              )}
              
              {getWrittenUnlockStatus() === 'purchase_required' && (
                <button 
                  onClick={handleBuyQuotes}
                  className="w-full bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all flex items-center justify-center space-x-2"
                >
                  <DollarSign className="h-5 w-5" />
                  <span>Buy More Quotes</span>
                </button>
              )}
            </div>
          </div>

          {/* Referral Program */}
          <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="mb-4 md:mb-0">
                <h3 className="text-white font-semibold text-lg mb-2 flex items-center space-x-2">
                  <Users className="h-5 w-5 text-giants_orange-500" />
                  <span>Referral Program</span>
                </h3>
                <p className="text-battleship_gray-700">
                  Refer friends to SolarMatch and earn additional quote unlocks
                </p>
              </div>
              <button
                onClick={handleReferFriend}
                className="bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all transform hover:scale-105 flex items-center space-x-2 whitespace-nowrap"
              >
                <Users className="h-4 w-4" />
                <span>Refer Friends</span>
              </button>
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-onyx-600/30 rounded-xl p-4">
                <p className="text-battleship_gray-700 text-sm mb-1">Your Referral Code</p>
                <div className="flex items-center space-x-2">
                  <p className="text-white font-mono font-semibold">{referralData.code}</p>
                  <button 
                    onClick={handleCopyReferralCode}
                    className="text-giants_orange-500 hover:text-giants_orange-400 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="bg-onyx-600/30 rounded-xl p-4">
                <p className="text-battleship_gray-700 text-sm mb-1">Friends Referred</p>
                <p className="text-white font-semibold">{referralData.referrals}</p>
              </div>
              <div className="bg-onyx-600/30 rounded-xl p-4">
                <p className="text-battleship_gray-700 text-sm mb-1">Unlocks Earned</p>
                <p className="text-white font-semibold">{referralData.unlocksEarned}</p>
              </div>
            </div>
          </div>
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
              <X className="h-6 w-6" />
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
                  <button className="mt-2 bg-giants_orange-500/20 text-giants_orange-500 px-3 py-1 rounded-lg text-sm font-semibold hover:bg-giants_orange-500/30 transition-colors">
                    Resend Verification
                  </button>
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
                  <button className="mt-2 bg-giants_orange-500/20 text-giants_orange-500 px-3 py-1 rounded-lg text-sm font-semibold hover:bg-giants_orange-500/30 transition-colors">
                    Send OTP
                  </button>
                </div>
              </div>
            </div>
            
            <button 
              onClick={handleSubmitVerification}
              className="w-full bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all"
            >
              Complete Verification
            </button>
          </div>
        </div>
      )}

      {/* Referral Modal */}
      {showReferralModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-night-500 to-black-500 rounded-2xl max-w-md w-full p-8 relative border border-onyx-600/30 shadow-2xl">
            <button
              onClick={() => setShowReferralModal(false)}
              className="absolute top-4 right-4 text-battleship_gray-600 hover:text-white transition-colors p-2 rounded-lg hover:bg-onyx-500/30"
            >
              <X className="h-6 w-6" />
            </button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-giants_orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-giants_orange-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Refer Friends, Get More Quotes</h3>
              <p className="text-battleship_gray-700">
                Share your referral code with friends. When they sign up and verify their account, you'll both receive 2 extra quote unlocks.
              </p>
            </div>
            
            <div className="bg-onyx-600/30 rounded-lg p-4 mb-6">
              <p className="text-battleship_gray-700 text-sm mb-2">Your Referral Code</p>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={referralData.code}
                  readOnly
                  className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-lg px-3 py-2 text-white font-mono"
                />
                <button 
                  onClick={handleCopyReferralCode}
                  className="bg-giants_orange-500 text-white p-2 rounded-lg hover:bg-giants_orange-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              <button className="w-full bg-blue-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-blue-600 transition-all flex items-center justify-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>Share on Facebook</span>
              </button>
              
              <button className="w-full bg-[#1DA1F2] text-white py-3 px-4 rounded-xl font-semibold hover:bg-[#1a91da] transition-all flex items-center justify-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
                <span>Share on Twitter</span>
              </button>
              
              <button className="w-full bg-green-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-green-600 transition-all flex items-center justify-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                <span>Share on WhatsApp</span>
              </button>
            </div>
            
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-blue-300 text-sm">
                <strong>Tip:</strong> You can also share your referral link directly: 
                <span className="font-mono ml-1">solarmatch.com.au/r/{referralData.code}</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Admin Request Modal */}
      {showAdminRequestModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-night-500 to-black-500 rounded-2xl max-w-md w-full p-8 relative border border-onyx-600/30 shadow-2xl">
            <button
              onClick={() => setShowAdminRequestModal(false)}
              className="absolute top-4 right-4 text-battleship_gray-600 hover:text-white transition-colors p-2 rounded-lg hover:bg-onyx-500/30"
            >
              <X className="h-6 w-6" />
            </button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="h-8 w-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Request One More Free Quote</h3>
              <p className="text-battleship_gray-700">
                To prevent spam, we limit free quotes — but if you're a serious buyer, you can request one more free quote.
              </p>
            </div>
            
            <div className="bg-onyx-600/30 rounded-lg p-4 mb-6">
              <p className="text-battleship_gray-700 text-sm mb-2">Why do you need an additional quote?</p>
              <textarea
                placeholder="Please explain why you need an additional quote..."
                className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-lg px-3 py-2 text-white placeholder-battleship_gray-600 focus:border-giants_orange-500 focus:outline-none transition-colors min-h-[100px] resize-none"
              ></textarea>
            </div>
            
            <button 
              onClick={handleSubmitAdminRequest}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-purple-600 hover:to-purple-700 transition-all"
            >
              Submit Request
            </button>
          </div>
        </div>
      )}

      {/* Purchase Modal */}
      {showPurchaseModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-gradient-to-br from-night-500 to-black-500 rounded-2xl max-w-md w-full p-8 relative border border-onyx-600/30 shadow-2xl">
            <button
              onClick={() => setShowPurchaseModal(false)}
              className="absolute top-4 right-4 text-battleship_gray-600 hover:text-white transition-colors p-2 rounded-lg hover:bg-onyx-500/30"
            >
              <X className="h-6 w-6" />
            </button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-giants_orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="h-8 w-8 text-giants_orange-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Purchase Additional Quotes</h3>
              <p className="text-battleship_gray-700">
                You've used all 6 of your free quote requests. Purchase additional quote requests to find the perfect installer.
              </p>
            </div>
            
            <div className="space-y-3 mb-6">
              <div 
                onClick={() => handleSelectPackage(1, 10)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedPackage?.amount === 1 
                    ? 'border-giants_orange-500 bg-giants_orange-500/10' 
                    : 'border-onyx-600/30 bg-onyx-600/20 hover:border-onyx-600/50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-white font-semibold">+1 Quote</h4>
                    <p className="text-battleship_gray-700 text-sm">Single quote request</p>
                  </div>
                  <p className="text-giants_orange-500 font-bold">$10</p>
                </div>
              </div>
              
              <div 
                onClick={() => handleSelectPackage(2, 18)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedPackage?.amount === 2 
                    ? 'border-giants_orange-500 bg-giants_orange-500/10' 
                    : 'border-onyx-600/30 bg-onyx-600/20 hover:border-onyx-600/50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-white font-semibold">+2 Quotes</h4>
                    <p className="text-battleship_gray-700 text-sm">Save $2</p>
                  </div>
                  <p className="text-giants_orange-500 font-bold">$18</p>
                </div>
              </div>
              
              <div 
                onClick={() => handleSelectPackage(3, 25)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedPackage?.amount === 3 
                    ? 'border-giants_orange-500 bg-giants_orange-500/10' 
                    : 'border-onyx-600/30 bg-onyx-600/20 hover:border-onyx-600/50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-white font-semibold">+3 Quotes</h4>
                    <p className="text-battleship_gray-700 text-sm">Save $5</p>
                  </div>
                  <p className="text-giants_orange-500 font-bold">$25</p>
                </div>
              </div>
              
              <div 
                onClick={() => handleSelectPackage(5, 39)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedPackage?.amount === 5 
                    ? 'border-giants_orange-500 bg-giants_orange-500/10' 
                    : 'border-onyx-600/30 bg-onyx-600/20 hover:border-onyx-600/50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-white font-semibold">+5 Quotes</h4>
                    <p className="text-battleship_gray-700 text-sm">Best value! Save $11</p>
                  </div>
                  <p className="text-giants_orange-500 font-bold">$39</p>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
              <p className="text-blue-300 text-sm">
                <strong>💡 Tip:</strong> More options = better savings. The right installer might be just 1 quote away.
              </p>
            </div>
            
            <button 
              onClick={handlePurchaseQuotes}
              disabled={!selectedPackage}
              className="w-full bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {selectedPackage 
                ? `Purchase ${selectedPackage.amount} Quote${selectedPackage.amount > 1 ? 's' : ''} for $${selectedPackage.price}` 
                : 'Select a Package'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuoteUnlocks;