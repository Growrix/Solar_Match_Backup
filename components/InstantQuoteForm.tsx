import React, { useState } from 'react';
import { MapPin, DollarSign, ArrowRight, Home, Zap, Calculator, CheckCircle, AlertCircle, Battery, ArrowLeft } from 'lucide-react';
import { calculateSolarQuote, type QuoteCalculationInputs, type QuoteCalculationResult } from '@/lib/services/quoteSettingsService';
import QuoteOptionsModal from './QuoteOptionsModal';

interface InstantQuoteFormProps {
  onProceedToDetailedQuote: (quoteType: 'call_visit' | 'written') => void;
}

const InstantQuoteForm: React.FC<InstantQuoteFormProps> = ({ onProceedToDetailedQuote }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showQuoteOptionsModal, setShowQuoteOptionsModal] = useState(false);
  
  // Form data state
  const [formData, setFormData] = useState<QuoteCalculationInputs>({
    postcode: '',
    location: '',
    state: '',
    roofType: '',
    budgetRange: '',
    batteryIncluded: false,
  });
  
  // Energy usage input state
  const [electricityUsageType, setElectricityUsageType] = useState<'monthly' | 'quarterly'>('monthly');
  const [electricityValue, setElectricityValue] = useState('');
  
  // Quote result state
  const [quoteResult, setQuoteResult] = useState<QuoteCalculationResult | null>(null);

  const handleInputChange = (field: keyof QuoteCalculationInputs, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleElectricityUsageChange = (type: 'monthly' | 'quarterly', value: string) => {
    setElectricityUsageType(type);
    setElectricityValue(value);
    
    // Update form data based on electricity usage type
    if (type === 'monthly') {
      setFormData(prev => ({ 
        ...prev, 
        monthlyKwh: value ? parseInt(value) : undefined,
        billAmount: undefined
      }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        billAmount: value ? parseInt(value) : undefined,
        monthlyKwh: undefined
      }));
    }
  };

  const handleNextStep = () => {
    // Validate first step
    if (currentStep === 1) {
      if (!formData.postcode || !formData.location || !formData.state) {
        setError('Please fill in all required fields');
        return;
      }
      
      // Validate Australian postcode format (4 digits)
      if (!/^\d{4}$/.test(formData.postcode)) {
        setError('Please enter a valid 4-digit Australian postcode');
        return;
      }
    }
    
    setCurrentStep(2);
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
  };

  const handleCalculateQuote = async () => {
    // Validate second step
    if (!formData.budgetRange || !formData.roofType || !electricityValue) {
      setError('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await calculateSolarQuote(formData);
      setQuoteResult(result);
      setCurrentStep(3);
    } catch (err) {
      console.error('Error calculating quote:', err);
      setError('Failed to calculate quote. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGetDetailedQuotes = () => {
    setShowQuoteOptionsModal(true);
  };

  const handleSelectQuoteType = (type: 'call_visit' | 'written') => {
    setShowQuoteOptionsModal(false);
    
    // Store the selected quote type in localStorage so it persists across page navigation
    localStorage.setItem('selected_quote_type', type);
    
    // Dispatch event to navigate to the request quote page
    const event = new CustomEvent('navigate-to-request-quote');
    window.dispatchEvent(event);
    
    // This function is provided by the parent component
    onProceedToDetailedQuote(type);
  };

  const handleStartOver = () => {
    setCurrentStep(1);
    setQuoteResult(null);
    setFormData({
      postcode: '',
      location: '',
      state: '',
      roofType: '',
      budgetRange: '',
      batteryIncluded: false,
    });
    setElectricityValue('');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          {[1, 2, 3].map((step) => (
            <React.Fragment key={step}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                currentStep >= step 
                  ? 'bg-giants_orange-500 text-white' 
                  : 'bg-onyx-600 text-battleship_gray-600'
              }`}>
                {step === 3 && quoteResult ? <CheckCircle className="h-5 w-5" /> : step}
              </div>
              {step < 3 && (
                <div className={`w-12 h-1 ${
                  currentStep > step ? 'bg-giants_orange-500' : 'bg-onyx-600'
                }`}></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="bg-onyx-500/30 backdrop-blur-sm p-8 lg:p-12 rounded-2xl border border-onyx-600/20">
        {/* Step 1: Property Information */}
        {currentStep === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Tell Us About Your Property</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">
                  <MapPin className="inline h-4 w-4 mr-1" />
                  Postcode *
                </label>
                <input
                  type="text"
                  value={formData.postcode}
                  onChange={(e) => handleInputChange('postcode', e.target.value)}
                  placeholder="e.g., 2000"
                  className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 text-white placeholder-battleship_gray-600 focus:border-giants_orange-500 focus:outline-none transition-colors"
                  maxLength={4}
                />
              </div>

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

            {/* Error Message */}
            {error && (
              <div className="mt-6 bg-red-500/20 border border-red-500/30 rounded-xl p-4 flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="flex justify-end mt-8">
              <button
                onClick={handleNextStep}
                className="bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all transform hover:scale-105 flex items-center space-x-2"
              >
                <span>Next Step</span>
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Energy Usage & Budget */}
        {currentStep === 2 && (
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
                  value={formData.roofType}
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
              
              {/* Battery Option */}
              <div className="flex items-center justify-between p-4 bg-onyx-600/30 rounded-xl">
                <div className="flex items-center space-x-3">
                  <Battery className="h-5 w-5 text-giants_orange-500" />
                  <div>
                    <p className="text-white font-semibold">Include Battery Storage</p>
                    <p className="text-battleship_gray-700 text-sm">Additional rebates may apply</p>
                  </div>
                </div>
                <button
                  onClick={() => handleInputChange('batteryIncluded', !formData.batteryIncluded)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.batteryIncluded ? 'bg-giants_orange-500' : 'bg-onyx-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.batteryIncluded ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-6 bg-red-500/20 border border-red-500/30 rounded-xl p-4 flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="flex justify-between mt-8">
              <button
                onClick={handlePrevStep}
                className="bg-onyx-600/50 text-battleship_gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-onyx-600/70 hover:text-white transition-all flex items-center space-x-2"
              >
                <ArrowLeft className="h-5 w-5" />
                <span>Back</span>
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
                    <span>Get My Instant Quote</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Quote Results */}
        {currentStep === 3 && quoteResult && (
          <div>
            <div className="text-center mb-8">
              <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Your Instant Solar Quote</h2>
              <p className="text-battleship_gray-700">Based on your property details and energy usage</p>
            </div>

            {/* System Recommendation */}
            <div className="bg-gradient-to-r from-giants_orange-500/20 to-giants_orange-600/20 rounded-xl p-6 border border-giants_orange-500/30 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Recommended System</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{quoteResult.systemSize}kW</p>
                  <p className="text-battleship_gray-700 text-sm">System Size</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{quoteResult.budgetRange}</p>
                  <p className="text-battleship_gray-700 text-sm">Budget Range</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">{quoteResult.batteryIncluded ? 'Yes' : 'No'}</p>
                  <p className="text-battleship_gray-700 text-sm">Battery Included</p>
                </div>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="bg-onyx-600/30 rounded-xl p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Cost Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-battleship_gray-700">Total System Cost</span>
                  <span className="text-white font-semibold">{formatCurrency(quoteResult.totalCost)}</span>
                </div>
                <div className="flex justify-between items-center text-green-400">
                  <span>Federal Rebate (STCs)</span>
                  <span className="font-semibold">-{formatCurrency(quoteResult.federalRebate)}</span>
                </div>
                {quoteResult.stateRebate > 0 && (
                  <div className="flex justify-between items-center text-green-400">
                    <span>State Rebate</span>
                    <span className="font-semibold">-{formatCurrency(quoteResult.stateRebate)}</span>
                  </div>
                )}
                <div className="border-t border-onyx-600/30 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold text-lg">Your Out-of-Pocket Cost</span>
                    <span className="text-giants_orange-500 font-bold text-xl">{formatCurrency(quoteResult.finalPrice)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Disclaimers */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-6">
              <h4 className="text-yellow-400 font-semibold mb-2">Important Information</h4>
              <ul className="text-yellow-200 text-sm space-y-1">
                {quoteResult.disclaimers.map((disclaimer, index) => (
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
                onClick={handleGetDetailedQuotes}
                className="bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white px-8 py-3 rounded-xl font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all transform hover:scale-105 flex items-center justify-center space-x-2"
              >
                <span>Get Detailed Quotes from Installers</span>
                <ArrowRight className="h-5 w-5" />
              </button>
              
              <button
                onClick={handleStartOver}
                className="bg-onyx-600/50 text-battleship_gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-onyx-600/70 hover:text-white transition-all"
              >
                Get Another Quote
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quote Options Modal */}
      <QuoteOptionsModal 
        isOpen={showQuoteOptionsModal}
        onClose={() => setShowQuoteOptionsModal(false)}
        onSelectOption={handleSelectQuoteType}
      />
    </div>
  );
};

export default InstantQuoteForm;