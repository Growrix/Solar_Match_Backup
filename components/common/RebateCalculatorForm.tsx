'use client'

import React, { useState } from 'react'
import { Calculator, MapPin, Home, DollarSign, Zap, Battery, Info, CheckCircle, AlertTriangle } from 'lucide-react'

const RebateCalculatorForm = () => {
  const [inputs, setInputs] = useState({
    systemSizeKw: 6.6,
    postcode: '',
    installationYear: new Date().getFullYear(),
    ownerOccupier: true,
    householdIncome: 80000,
    propertyValue: 600000,
    includeBattery: false
  })

  const [result, setResult] = useState<any>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleInputChange = (field: string, value: any) => {
    setInputs(prev => ({ ...prev, [field]: value }))
  }

  const handleCalculate = async () => {
    if (!inputs.postcode || inputs.postcode.length < 4) {
      alert('Please enter a valid postcode')
      return
    }

    setIsCalculating(true)
    
    // Simulate calculation delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800))
    
    try {
      // Mock calculation
      const federalRebate = Math.round(inputs.systemSizeKw * 500)
      const stateRebate = inputs.ownerOccupier && inputs.householdIncome < 180000 ? 1400 : 0
      const batteryRebate = inputs.includeBattery ? 3000 : 0
      const totalRebate = federalRebate + stateRebate + batteryRebate

      const calculationResult = {
        total_rebate: totalRebate,
        breakdown: {
          federal: {
            stc_amount: federalRebate,
            battery_rebate: inputs.includeBattery ? 3300 : 0
          },
          state: inputs.postcode.startsWith('3') ? { VIC: stateRebate } : {}
        },
        disclaimers: [
          "STC value fluctuates based on market conditions; final quote may vary.",
          "All rebates require CEC-approved installers and compliant equipment.",
          "State rebates are subject to funding availability and may close without notice.",
          "Eligibility criteria must be met at time of installation.",
          "This is an estimate only - consult with your installer for accurate rebate calculations."
        ]
      }
      
      setResult(calculationResult)
    } catch (error) {
      console.error('Calculation error:', error)
      alert('Error calculating rebates. Please check your inputs and try again.')
    } finally {
      setIsCalculating(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const getSystemSizeRecommendation = () => {
    if (inputs.householdIncome < 50000) return "Consider a 5kW system for basic needs"
    if (inputs.householdIncome < 100000) return "A 6.6kW system is ideal for most homes"
    return "Consider a 10kW+ system for larger homes or high usage"
  }

  return (
    <section className="bg-gradient-to-br from-black-500 to-night-500 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
            Australian Solar Rebate Calculator
          </h2>
          <p className="text-xl text-battleship_gray-700 max-w-3xl mx-auto">
            Get accurate rebate calculations based on current government programs and your specific location
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Input Form */}
          <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-8">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
              <Calculator className="h-6 w-6 text-giants_orange-500" />
              <span>Calculate Your Rebates</span>
            </h3>

            <div className="space-y-6">
              {/* Basic Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    Postcode
                  </label>
                  <input
                    type="text"
                    value={inputs.postcode}
                    onChange={(e) => handleInputChange('postcode', e.target.value)}
                    placeholder="e.g., 2000"
                    className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 text-white placeholder-battleship_gray-600 focus:border-giants_orange-500 focus:outline-none transition-colors"
                    maxLength={4}
                  />
                </div>

                <div>
                  <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">
                    <Zap className="inline h-4 w-4 mr-1" />
                    System Size (kW)
                  </label>
                  <select
                    value={inputs.systemSizeKw}
                    onChange={(e) => handleInputChange('systemSizeKw', parseFloat(e.target.value))}
                    className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 text-white focus:border-giants_orange-500 focus:outline-none transition-colors"
                  >
                    <option value={3}>3kW</option>
                    <option value={5}>5kW</option>
                    <option value={6.6}>6.6kW (Most Popular)</option>
                    <option value={10}>10kW</option>
                    <option value={13}>13kW</option>
                    <option value={15}>15kW</option>
                    <option value={20}>20kW</option>
                  </select>
                  <p className="text-xs text-battleship_gray-600 mt-1">
                    {getSystemSizeRecommendation()}
                  </p>
                </div>
              </div>

              {/* Battery Option */}
              <div className="flex items-center justify-between p-4 bg-onyx-600/30 rounded-xl border border-onyx-600/20">
                <div className="flex items-center space-x-3">
                  <Battery className="h-5 w-5 text-giants_orange-500" />
                  <div>
                    <p className="text-white font-semibold">Include Battery Storage</p>
                    <p className="text-battleship_gray-700 text-sm">Additional rebates may apply</p>
                  </div>
                </div>
                <button
                  onClick={() => handleInputChange('includeBattery', !inputs.includeBattery)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    inputs.includeBattery ? 'bg-giants_orange-500' : 'bg-onyx-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      inputs.includeBattery ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Advanced Options Toggle */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full text-left text-giants_orange-500 hover:text-giants_orange-400 transition-colors font-semibold"
              >
                {showAdvanced ? '▼' : '▶'} Advanced Options (for accurate state rebates)
              </button>

              {/* Advanced Inputs */}
              {showAdvanced && (
                <div className="space-y-4 p-4 bg-onyx-600/20 rounded-xl border border-onyx-600/20">
                  <div>
                    <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">
                      <Home className="inline h-4 w-4 mr-1" />
                      Property Status
                    </label>
                    <select
                      value={inputs.ownerOccupier ? 'owner' : 'renter'}
                      onChange={(e) => handleInputChange('ownerOccupier', e.target.value === 'owner')}
                      className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 text-white focus:border-giants_orange-500 focus:outline-none transition-colors"
                    >
                      <option value="owner">Owner Occupier</option>
                      <option value="renter">Renter/Investor</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">
                        <DollarSign className="inline h-4 w-4 mr-1" />
                        Household Income
                      </label>
                      <select
                        value={inputs.householdIncome}
                        onChange={(e) => handleInputChange('householdIncome', parseInt(e.target.value))}
                        className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 text-white focus:border-giants_orange-500 focus:outline-none transition-colors"
                      >
                        <option value={40000}>Under $50,000</option>
                        <option value={75000}>$50,000 - $100,000</option>
                        <option value={125000}>$100,000 - $150,000</option>
                        <option value={165000}>$150,000 - $180,000</option>
                        <option value={200000}>Over $180,000</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">
                        Property Value
                      </label>
                      <select
                        value={inputs.propertyValue}
                        onChange={(e) => handleInputChange('propertyValue', parseInt(e.target.value))}
                        className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 text-white focus:border-giants_orange-500 focus:outline-none transition-colors"
                      >
                        <option value={400000}>Under $500,000</option>
                        <option value={750000}>$500,000 - $1,000,000</option>
                        <option value={1250000}>$1,000,000 - $1,500,000</option>
                        <option value={2000000}>$1,500,000 - $3,000,000</option>
                        <option value={3500000}>Over $3,000,000</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Calculate Button */}
              <button
                onClick={handleCalculate}
                disabled={isCalculating || !inputs.postcode}
                className="w-full bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white px-6 py-4 rounded-xl text-lg font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
              >
                {isCalculating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Calculating...</span>
                  </>
                ) : (
                  <>
                    <Calculator className="h-5 w-5" />
                    <span>Calculate My Rebates</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-8">
            {result ? (
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">Your Rebate Breakdown</h3>
                
                {/* Total Rebate */}
                <div className="bg-gradient-to-r from-giants_orange-500/20 to-giants_orange-600/20 rounded-xl p-6 border border-giants_orange-500/30 mb-6">
                  <div className="text-center">
                    <p className="text-battleship_gray-700 text-sm mb-2">Total Estimated Rebates</p>
                    <p className="text-4xl font-bold text-white">{formatCurrency(result.total_rebate)}</p>
                    <p className="text-giants_orange-500 text-sm mt-2">
                      Potential savings on your solar installation
                    </p>
                  </div>
                </div>

                {/* Federal Rebates */}
                {(result.breakdown.federal.stc_amount || result.breakdown.federal.battery_rebate) && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span>Federal Rebates</span>
                    </h4>
                    <div className="space-y-2">
                      {result.breakdown.federal.stc_amount && (
                        <div className="flex justify-between items-center p-3 bg-onyx-600/30 rounded-lg">
                          <span className="text-battleship_gray-700">Small-scale Technology Certificates</span>
                          <span className="text-white font-semibold">{formatCurrency(result.breakdown.federal.stc_amount)}</span>
                        </div>
                      )}
                      {result.breakdown.federal.battery_rebate && (
                        <div className="flex justify-between items-center p-3 bg-onyx-600/30 rounded-lg">
                          <span className="text-battleship_gray-700">Federal Battery Rebate</span>
                          <span className="text-white font-semibold">{formatCurrency(result.breakdown.federal.battery_rebate)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* State Rebates */}
                {Object.keys(result.breakdown.state).length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span>State Rebates</span>
                    </h4>
                    <div className="space-y-2">
                      {Object.entries(result.breakdown.state).map(([state, amount]) => (
                        <div key={state} className="flex justify-between items-center p-3 bg-onyx-600/30 rounded-lg">
                          <span className="text-battleship_gray-700">{state} State Rebate</span>
                          <span className="text-white font-semibold">{formatCurrency(amount as number)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Disclaimers */}
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mb-4">
                  <h5 className="text-yellow-400 font-semibold mb-2 flex items-center space-x-2">
                    <Info className="h-4 w-4" />
                    <span>Important Information</span>
                  </h5>
                  <ul className="text-yellow-200 text-sm space-y-1">
                    {result.disclaimers.slice(0, 3).map((disclaimer: string, index: number) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-yellow-400 mt-1">•</span>
                        <span>{disclaimer}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Next Steps */}
                <div className="text-center">
                  <button className="bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all transform hover:scale-105">
                    Get Quotes from Verified Installers
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Calculator className="h-16 w-16 text-battleship_gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Ready to Calculate?</h3>
                <p className="text-battleship_gray-700">
                  Enter your details on the left to see your personalized rebate breakdown
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default RebateCalculatorForm