import React, { useState, useEffect } from 'react';
import { MapPin, DollarSign, ArrowRight, Home, Zap, Calculator, CheckCircle, AlertCircle, Calendar, User, Mail, Phone, FileText } from 'lucide-react';
import { createSolarQuote, type QuoteFormData } from '@/lib/services/solarQuotes';
import { useAuth } from '@/hooks/useAuth';
import QuoteOptionsModal from '@/components/QuoteOptionsModal';
import AuthModal from '@/components/auth/AuthModal';

const RequestQuote: React.FC = () => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<'property_info' | 'energy_budget' | 'personal_details' | 'instant_quote_result' | 'success'>('property_info');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showQuoteOptionsModal, setShowQuoteOptionsModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedQuoteType, setSelectedQuoteType] = useState<'written' | 'call_visit'>('written');
  const [instantQuoteData, setInstantQuoteData] = useState<any>(null);

  const [formData, setFormData] = useState<QuoteFormData>({
    name: user?.user_metadata?.full_name || '',
    email: user?.email || '',
    phone: user?.user_metadata?.phone || '',
    location: '',
    state: '',
    budgetRange: '',
    propertyType: '',
    roofType: '',
    energyUsage: undefined,
    type: 'written'
  });

  const [electricityUsageType, setElectricityUsageType] = useState<'monthly' | 'quarterly'>('quarterly');
  const [electricityValue, setElectricityValue] = useState('');

  // Check if we have a quote type from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const quoteType = params.get('type');
    if (quoteType === 'written' || quoteType === 'call_visit') {
      setSelectedQuoteType(quoteType);
      setFormData(prev => ({ ...prev, type: quoteType }));
    }
  }, []);

  const handleInputChange = (field: keyof QuoteFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleElectricityUsageChange = (type: 'monthly' | 'quarterly', value: string) => {
    setElectricityUsageType(type);
    setElectricityValue(value);
    
    // Convert to monthly kWh for storage
    if (type === 'monthly') {
      setFormData(prev => ({ ...prev, energyUsage: parseInt(value) || undefined }));
    } else {
      // Convert quarterly bill to monthly kWh (rough estimate: $1 = 4kWh)
      const monthlyKwh = Math.round((parseInt(value) || 0) / 3 / 0.25);
      setFormData(prev => ({ ...prev, energyUsage: monthlyKwh || undefined }));
    }
  };

  const handleCalculateQuote = () => {
    // Validate required fields for instant quote
    if (!formData.location || !formData.state || !formData.propertyType || !formData.budgetRange || !formData.roofType || !electricityValue) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Calculate the quote (mock calculation for now)
      const systemSize = electricityUsageType === 'monthly' 
        ? Math.round((parseInt(electricityValue) / 120) * 10) / 10 
        : Math.round((parseInt(electricityValue) * 4 / 120) * 10) / 10;
      
      const budgetRanges = {
        '5000-10000': { min: 5000, max: 10000 },
        '10000-20000': { min: 10000, max: 20000 },
        '20000-30000': { min: 20000, max: 30000 },
        '30000+': { min: 30000, max: 50000 }
      };
      
      const budget = budgetRanges[formData.budgetRange as keyof typeof budgetRanges];
      const totalEstimate = budget ? (budget.min + budget.max) / 2 : systemSize * 1500;
      
      // Rebate calculations
      const federalRebate = Math.round(systemSize * 500);
      const stateRebates = {
        'NSW': 1200,
        'VIC': 1400,
        'QLD': 1000,
        'WA': 800,
        'SA': 1000,
        'TAS': 800,
        'ACT': 1200,
        'NT': 600
      };
      
      const stateRebate = stateRebates[formData.state as keyof typeof stateRebates] || 0;
      const outOfPocket = totalEstimate - federalRebate - stateRebate;
      
      const quoteResult = {
        system_recommendation: {
          size_kW: systemSize,
          panel_tier: totalEstimate > 15000 ? 'Premium' : totalEstimate > 10000 ? 'Standard' : 'Budget',
          battery: formData.budgetRange === '30000+' || totalEstimate > 25000
        },
        cost_breakdown: {
          total_estimate: totalEstimate,
          federal_rebate: federalRebate,
          state_rebate: stateRebate,
          out_of_pocket: Math.max(outOfPocket, 0)
        },
        disclaimers: [
          "STC value varies; final quote may differ by ±10%.",
          `${formData.state} rebates require owner-occupier status and income eligibility.`,
          "Battery rebates valid for installations after July 2025.",
          "Final pricing depends on roof complexity and installer selection.",
          "This is an estimate only - get detailed quotes from certified installers."
        ]
      };
      
      // Save the instant quote data
      setInstantQuoteData(quoteResult);
      
      // Move to instant quote result step
      setCurrentStep('instant_quote_result');
    } catch (err: any) {
      console.error('Quote calculation error:', err);
      setError(err.message || 'Failed to calculate quote. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectQuoteType = (type: 'written' | 'call_visit') => {
    setSelectedQuoteType(type);
    setFormData(prev => ({ ...prev, type }));
    setShowQuoteOptionsModal(false);
    setCurrentStep('personal_details');
  };

  const handleSubmit = async () => {
    // Validate required fields for personal details
    if (!formData.name || !formData.email || (selectedQuoteType === 'call_visit' && !formData.phone)) {
      setError('Please fill in all required fields');
      return;
    }

    // If user is not logged in, show auth modal
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Merge instant quote data with form data
      const completeFormData = {
        ...formData,
        // Add any calculated fields from instant quote
        systemSize: instantQuoteData?.system_recommendation?.size_kW,
        estimatedCost: instantQuoteData?.cost_breakdown?.total_estimate,
        estimatedSavings: instantQuoteData?.cost_breakdown?.federal_rebate + instantQuoteData?.cost_breakdown?.state_rebate,
        rebateAmount: instantQuoteData?.cost_breakdown?.federal_rebate + instantQuoteData?.cost_breakdown?.state_rebate
      };

      // Save to database
      await createSolarQuote(completeFormData, user?.id);

      setSuccess(true);
      setCurrentStep('success');
    } catch (err: any) {
      console.error('Quote submission error:', err);
      setError(err.message || 'Failed to submit quote. Please try again.');
    } finally {
      setLoading(false);
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

  const resetForm = () => {
    setCurrentStep('property_info');
    setSuccess(false);
    setError(null);
    setInstantQuoteData(null);
    setFormData({
      name: user?.user_metadata?.full_name || '',
      email: user?.email || '',
      phone: user?.user_metadata?.phone || '',
      location: '',
      state: '',
      budgetRange: '',
      propertyType: '',
      roofType: '',
      energyUsage: undefined,
      type: 'written'
    });
    setElectricityValue('');
  };

  return (
    <section className="bg-gradient-to-br from-black-500 to-night-500 py-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Request a Solar Quote
            </h1>
            <p className="text-xl text-battleship_gray-700">
              Get personalized quotes from verified local installers in under 2 minutes
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                currentStep === 'property_info' || currentStep === 'energy_budget' || currentStep === 'personal_details' || currentStep === 'instant_quote_result' || currentStep === 'success'
                  ? 'bg-giants_orange-500 text-white' 
                  : 'bg-onyx-600 text-battleship_gray-600'
              }`}>
                1
              </div>
              <div className={`w-12 h-1 ${
                currentStep === 'energy_budget' || currentStep === 'personal_details' || currentStep === 'instant_quote_result' || currentStep === 'success'
                  ? 'bg-giants_orange-500' 
                  : 'bg-onyx-600'
              }`}></div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                currentStep === 'energy_budget' || currentStep === 'personal_details' || currentStep === 'instant_quote_result' || currentStep === 'success'
                  ? 'bg-giants_orange-500 text-white' 
                  : 'bg-onyx-600 text-battleship_gray-600'
              }`}>
                2
              </div>
              <div className={`w-12 h-1 ${
                currentStep === 'personal_details' || currentStep === 'instant_quote_result' || currentStep === 'success'
                  ? 'bg-giants_orange-500' 
                  : 'bg-onyx-600'
              }`}></div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                currentStep === 'personal_details' || currentStep === 'instant_quote_result' || currentStep === 'success'
                  ? 'bg-giants_orange-500 text-white' 
                  : 'bg-onyx-600 text-battleship_gray-600'
              }`}>
                3
              </div>
              <div className={`w-12 h-1 ${
                currentStep === 'success'
                  ? 'bg-giants_orange-500' 
                  : 'bg-onyx-600'
              }`}></div>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                currentStep === 'success'
                  ? 'bg-giants_orange-500 text-white' 
                  : 'bg-onyx-600 text-battleship_gray-600'
              }`}>
                {currentStep === 'success' && success ? <CheckCircle className="h-5 w-5" /> : 4}
              </div>
            </div>
          </div>

          <div className="bg-onyx-500/30 backdrop-blur-sm p-8 lg:p-12 rounded-2xl border border-onyx-600/20">
            {/* Step 1: Property Information */}
            {currentStep === 'property_info' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Tell Us About Your Property</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">
                      <MapPin className="inline h-4 w-4 mr-1" />
                      Location (Suburb) *
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="e.g., Sydney, Melbourne"
                      className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 text-white placeholder-battleship_gray-600 focus:border-giants_orange-500 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">
                      State *
                    </label>
                    <select
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 text-white focus:border-giants_orange-500 focus:outline-none transition-colors"
                    >
                      <option value="">Select your state</option>
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

                  <div>
                    <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">
                      <Home className="inline h-4 w-4 mr-1" />
                      Property Type *
                    </label>
                    <select
                      value={formData.propertyType}
                      onChange={(e) => handleInputChange('propertyType', e.target.value)}
                      className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 text-white focus:border-giants_orange-500 focus:outline-none transition-colors"
                    >
                      <option value="">Select property type</option>
                      <option value="house">House</option>
                      <option value="townhouse">Townhouse</option>
                      <option value="apartment">Apartment</option>
                      <option value="commercial">Commercial</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end mt-8">
                  <button
                    onClick={() => setCurrentStep('energy_budget')}
                    disabled={!formData.location || !formData.state || !formData.propertyType}
                    className="bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
                  >
                    <span>Next Step</span>
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Energy & Budget Details */}
            {currentStep === 'energy_budget' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Energy Usage & Budget</h2>
                
                <div className="space-y-6">
                  {/* Electricity Usage */}
                  <div>
                    <label className="block text-battleship_gray-700 text-sm font-semibold mb-4">
                      <Zap className="inline h-4 w-4 mr-1" />
                      How would you like to tell us about your electricity usage? *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div 
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          electricityUsageType === 'monthly' 
                            ? 'border-giants_orange-500 bg-giants_orange-500/10' 
                            : 'border-onyx-600/30 bg-onyx-600/20 hover:border-onyx-600/50'
                        }`}
                        onClick={() => setElectricityUsageType('monthly')}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            electricityUsageType === 'monthly' 
                              ? 'border-giants_orange-500 bg-giants_orange-500' 
                              : 'border-onyx-600'
                          }`}></div>
                          <div>
                            <p className="text-white font-semibold">Monthly kWh</p>
                            <p className="text-battleship_gray-700 text-sm">From your electricity bill</p>
                          </div>
                        </div>
                        {electricityUsageType === 'monthly' && (
                          <input
                            type="number"
                            value={electricityValue}
                            onChange={(e) => handleElectricityUsageChange('monthly', e.target.value)}
                            placeholder="e.g., 800"
                            className="w-full mt-3 bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-lg px-3 py-2 text-white placeholder-battleship_gray-600 focus:border-giants_orange-500 focus:outline-none transition-colors"
                          />
                        )}
                      </div>

                      <div 
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          electricityUsageType === 'quarterly' 
                            ? 'border-giants_orange-500 bg-giants_orange-500/10' 
                            : 'border-onyx-600/30 bg-onyx-600/20 hover:border-onyx-600/50'
                        }`}
                        onClick={() => setElectricityUsageType('quarterly')}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            electricityUsageType === 'quarterly' 
                              ? 'border-giants_orange-500 bg-giants_orange-500' 
                              : 'border-onyx-600'
                          }`}></div>
                          <div>
                            <p className="text-white font-semibold">Quarterly Bill (AUD)</p>
                            <p className="text-battleship_gray-700 text-sm">Total amount you pay</p>
                          </div>
                        </div>
                        {electricityUsageType === 'quarterly' && (
                          <input
                            type="number"
                            value={electricityValue}
                            onChange={(e) => handleElectricityUsageChange('quarterly', e.target.value)}
                            placeholder="e.g., 600"
                            className="w-full mt-3 bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-lg px-3 py-2 text-white placeholder-battleship_gray-600 focus:border-giants_orange-500 focus:outline-none transition-colors"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Budget Range */}
                  <div>
                    <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">
                      <DollarSign className="inline h-4 w-4 mr-1" />
                      Budget Range *
                    </label>
                    <select
                      value={formData.budgetRange}
                      onChange={(e) => handleInputChange('budgetRange', e.target.value)}
                      className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 text-white focus:border-giants_orange-500 focus:outline-none transition-colors"
                    >
                      <option value="">Select budget range</option>
                      <option value="5000-10000">$5,000 - $10,000</option>
                      <option value="10000-20000">$10,000 - $20,000</option>
                      <option value="20000-30000">$20,000 - $30,000</option>
                      <option value="30000+">$30,000+</option>
                    </select>
                  </div>

                  {/* Roof Type */}
                  <div>
                    <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">
                      Roof Type *
                    </label>
                    <select
                      value={formData.roofType || ''}
                      onChange={(e) => handleInputChange('roofType', e.target.value)}
                      className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 text-white focus:border-giants_orange-500 focus:outline-none transition-colors"
                    >
                      <option value="">Select roof type</option>
                      <option value="tile">Tile</option>
                      <option value="tin">Tin/Metal</option>
                      <option value="flat">Flat</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  {/* Installation Timeframe */}
                  <div>
                    <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">
                      <Calendar className="inline h-4 w-4 mr-1" />
                      When are you looking to install?
                    </label>
                    <select
                      className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 text-white focus:border-giants_orange-500 focus:outline-none transition-colors"
                    >
                      <option value="asap">As soon as possible</option>
                      <option value="1-3months">1-3 months</option>
                      <option value="3-6months">3-6 months</option>
                      <option value="6-12months">6-12 months</option>
                      <option value="researching">Just researching</option>
                    </select>
                  </div>
                </div>

                {error && (
                  <div className="mt-6 bg-red-500/20 border border-red-500/30 rounded-xl p-4 flex items-center space-x-3">
                    <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <div className="flex justify-between mt-8">
                  <button
                    onClick={() => setCurrentStep('property_info')}
                    className="bg-onyx-600/50 text-battleship_gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-onyx-600/70 hover:text-white transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleCalculateQuote}
                    disabled={loading || !formData.budgetRange || !formData.roofType || !electricityValue}
                    className="bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Calculating...</span>
                      </>
                    ) : (
                      <>
                        <Calculator className="h-5 w-5" />
                        <span>Calculate My Quote</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Instant Quote Result */}
            {currentStep === 'instant_quote_result' && instantQuoteData && (
              <div>
                <div className="text-center mb-8">
                  <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">Your Instant Solar Quote</h3>
                  <p className="text-battleship_gray-700">Based on your property details and energy usage</p>
                </div>

                {/* System Recommendation */}
                <div className="bg-gradient-to-r from-giants_orange-500/20 to-giants_orange-600/20 rounded-xl p-6 border border-giants_orange-500/30 mb-6">
                  <h4 className="text-lg font-semibold text-white mb-4">Recommended System</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{instantQuoteData.system_recommendation.size_kW}kW</p>
                      <p className="text-battleship_gray-700 text-sm">System Size</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{instantQuoteData.system_recommendation.panel_tier}</p>
                      <p className="text-battleship_gray-700 text-sm">Panel Tier</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{instantQuoteData.system_recommendation.battery ? 'Yes' : 'No'}</p>
                      <p className="text-battleship_gray-700 text-sm">Battery Included</p>
                    </div>
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className="bg-onyx-600/30 rounded-xl p-6 mb-6">
                  <h4 className="text-lg font-semibold text-white mb-4">Cost Breakdown</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-battleship_gray-700">Total System Cost</span>
                      <span className="text-white font-semibold">{formatCurrency(instantQuoteData.cost_breakdown.total_estimate)}</span>
                    </div>
                    <div className="flex justify-between items-center text-green-400">
                      <span>Federal Rebate (STCs)</span>
                      <span className="font-semibold">-{formatCurrency(instantQuoteData.cost_breakdown.federal_rebate)}</span>
                    </div>
                    {instantQuoteData.cost_breakdown.state_rebate > 0 && (
                      <div className="flex justify-between items-center text-green-400">
                        <span>State Rebate</span>
                        <span className="font-semibold">-{formatCurrency(instantQuoteData.cost_breakdown.state_rebate)}</span>
                      </div>
                    )}
                    <div className="border-t border-onyx-600/30 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-white font-semibold text-lg">Your Out-of-Pocket Cost</span>
                        <span className="text-giants_orange-500 font-bold text-xl">{formatCurrency(instantQuoteData.cost_breakdown.out_of_pocket)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Disclaimers */}
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
                  <h5 className="text-yellow-400 font-semibold mb-2">Important Information</h5>
                  <ul className="text-yellow-200 text-sm space-y-1">
                    {instantQuoteData.disclaimers.slice(0, 3).map((disclaimer: string, index: number) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-yellow-400 mt-1">•</span>
                        <span>{disclaimer}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button 
                    onClick={() => setShowQuoteOptionsModal(true)}
                    className="bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
                  >
                    <span>Get Detailed Quotes from Installers</span>
                    <ArrowRight className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setCurrentStep('energy_budget')}
                    className="bg-onyx-600/50 text-battleship_gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-onyx-600/70 hover:text-white transition-all"
                  >
                    Back to Calculator
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Personal Details */}
            {currentStep === 'personal_details' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Tell Us About You</h2>
                
                {/* Quote Type Banner */}
                {selectedQuoteType === 'call_visit' ? (
                  <div className="mb-6 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <Phone className="h-5 w-5 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-blue-300 font-semibold">Call/Visit Quote Selected</p>
                        <p className="text-blue-200 text-sm mt-1">
                          With this option, installers will be able to call you directly or schedule a site visit. 
                          Your contact information will be shared with verified installers who purchase your lead.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-6 bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <FileText className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-green-300 font-semibold">Written Quote Selected</p>
                        <p className="text-green-200 text-sm mt-1">
                          With this option, you'll receive detailed written quotes through our platform. 
                          Your contact information will not be shared with installers, and all communication 
                          will happen through our secure messaging system.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">
                      <User className="inline h-4 w-4 mr-1" />
                      Your Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Enter your full name"
                      className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 text-white placeholder-battleship_gray-600 focus:border-giants_orange-500 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">
                      <Mail className="inline h-4 w-4 mr-1" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="your@email.com"
                      className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 text-white placeholder-battleship_gray-600 focus:border-giants_orange-500 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">
                      <Phone className="inline h-4 w-4 mr-1" />
                      Phone Number {selectedQuoteType === 'call_visit' ? '*' : '(Optional)'}
                    </label>
                    <input
                      type="tel"
                      value={formData.phone || ''}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="0400 000 000"
                      className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 text-white placeholder-battleship_gray-600 focus:border-giants_orange-500 focus:outline-none transition-colors"
                      required={selectedQuoteType === 'call_visit'}
                    />
                  </div>
                </div>

                {error && (
                  <div className="mt-6 bg-red-500/20 border border-red-500/30 rounded-xl p-4 flex items-center space-x-3">
                    <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <div className="flex justify-between mt-8">
                  <button
                    onClick={() => setCurrentStep('instant_quote_result')}
                    className="bg-onyx-600/50 text-battleship_gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-onyx-600/70 hover:text-white transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading || !formData.name || !formData.email || (selectedQuoteType === 'call_visit' && !formData.phone)}
                    className="bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
                  >
                   {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Quote Request</span>
                        <ArrowRight className="h-5 w-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Success */}
            {currentStep === 'success' && success && (
              <div className="text-center py-8">
                <CheckCircle className="h-20 w-20 text-green-400 mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-white mb-4">Quote Request Submitted!</h2>
                <p className="text-xl text-battleship_gray-700 mb-8">
                  Thank you for your request. Our verified installers will review your details and prepare personalized quotes.
                </p>
                
                <div className="bg-onyx-600/30 rounded-xl p-6 mb-8 max-w-lg mx-auto">
                  <h3 className="text-white font-semibold mb-4">What happens next?</h3>
                  <ul className="space-y-3 text-left">
                    {selectedQuoteType === 'written' ? (
                      <>
                        <li className="flex items-start space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                          <span className="text-battleship_gray-700">
                            You'll receive written quotes from verified installers within 24-48 hours
                          </span>
                        </li>
                        <li className="flex items-start space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                          <span className="text-battleship_gray-700">
                            Compare quotes and communicate with installers through our platform
                          </span>
                        </li>
                      </>
                    ) : (
                      <>
                        <li className="flex items-start space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                          <span className="text-battleship_gray-700">
                            Verified installers will contact you directly within 24-48 hours
                          </span>
                        </li>
                        <li className="flex items-start space-x-3">
                          <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                          <span className="text-battleship_gray-700">
                            Discuss your requirements and schedule site visits if needed
                          </span>
                        </li>
                      </>
                    )}
                    <li className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-battleship_gray-700">
                        Choose the best offer and proceed with your solar installation
                      </span>
                    </li>
                  </ul>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={resetForm}
                    className="bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all transform hover:scale-105"
                  >
                    Submit Another Request
                  </button>
                  <button
                    onClick={() => window.location.href = '/'}
                    className="bg-onyx-600/50 text-white px-6 py-3 rounded-xl font-semibold hover:bg-onyx-600/70 transition-all"
                  >
                    Return to Home
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Quote Options Modal */}
          <QuoteOptionsModal
            isOpen={showQuoteOptionsModal}
            onClose={() => setShowQuoteOptionsModal(false)}
            onSelectQuoteType={handleSelectQuoteType}
          />
          
          {/* Auth Modal */}
          <AuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            initialMode="signup"
          />
        </div>
      </div>
    </section>
  );
};

export default RequestQuote;