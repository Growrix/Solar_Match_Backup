import React from 'react';
import { Calculator, TrendingUp, ArrowRight } from 'lucide-react';

const RebateCalculator = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = 80; // Account for fixed header
      const elementPosition = element.offsetTop - headerHeight;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="bg-gradient-to-br from-onyx-200 to-night-300 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
              Don't Miss Out on Rebates You Deserve
            </h2>
            <p className="text-xl text-battleship_gray-700 mb-8 leading-relaxed">
              The Australian government offers substantial solar rebates that can save you thousands. 
              Our calculator shows exactly what you're eligible for based on your location and system size.
            </p>

            <div className="space-y-6 mb-8">
              <div className="flex items-start space-x-4">
                <div className="bg-gradient-to-br from-giants_orange-500 to-giants_orange-600 p-2 rounded-xl shadow-lg">
                  <Calculator className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">
                    Small-scale Technology Certificates (STCs)
                  </h4>
                  <p className="text-battleship_gray-700">
                    Get upfront discounts worth thousands of dollars on your solar installation
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-gradient-to-br from-giants_orange-500 to-giants_orange-600 p-2 rounded-xl shadow-lg">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-white mb-2">
                    State-based Rebates
                  </h4>
                  <p className="text-battleship_gray-700">
                    Additional incentives available in many Australian states and territories
                  </p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => scrollToSection('rebate-calculator')}
              className="bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all transform hover:scale-105 inline-flex items-center space-x-2 shadow-lg"
            >
              <span>Calculate My Rebate</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>

          <div className="bg-onyx-500/50 backdrop-blur-sm p-8 rounded-2xl border border-onyx-600/30 shadow-lg">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">
              Potential Rebate Examples
            </h3>

            <div className="space-y-6">
              <div className="bg-gradient-to-r from-onyx-600/50 to-night-500/50 p-6 rounded-xl border border-onyx-600/30">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-battleship_gray-700 font-semibold">6.6kW System</span>
                  <span className="text-giants_orange-500 font-bold">Sydney, NSW</span>
                </div>
                <div className="text-3xl font-bold text-white mb-2">$3,200</div>
                <div className="text-sm text-battleship_gray-600">Average STC rebate value</div>
              </div>

              <div className="bg-gradient-to-r from-onyx-600/50 to-night-500/50 p-6 rounded-xl border border-onyx-600/30">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-battleship_gray-700 font-semibold">10kW System</span>
                  <span className="text-giants_orange-500 font-bold">Melbourne, VIC</span>
                </div>
                <div className="text-3xl font-bold text-white mb-2">$4,800</div>
                <div className="text-sm text-battleship_gray-600">Average STC rebate value</div>
              </div>

              <div className="bg-gradient-to-r from-onyx-600/50 to-night-500/50 p-6 rounded-xl border border-onyx-600/30">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-battleship_gray-700 font-semibold">13kW System</span>
                  <span className="text-giants_orange-500 font-bold">Brisbane, QLD</span>
                </div>
                <div className="text-3xl font-bold text-white mb-2">$6,200</div>
                <div className="text-sm text-battleship_gray-600">Average STC rebate value</div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-giants_orange-500/20 to-giants_orange-600/20 rounded-xl border border-giants_orange-500/30">
              <p className="text-sm text-battleship_gray-700 text-center">
                *Rebate amounts vary based on location, system size, and current certificate prices
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RebateCalculator;