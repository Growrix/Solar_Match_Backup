import React from 'react';
import { Shield, Users, Clock, Eye, DollarSign, Lock } from 'lucide-react';

const WhyChooseUs = () => {
  const features = [
    {
      icon: Shield,
      title: "No Pushy Salespeople",
      description: "We provide information and connect you with installers. No pressure, just honest advice."
    },
    {
      icon: Users,
      title: "Verified Local Installers",
      description: "All installers are fully licensed, insured, and rated by real customers."
    },
    {
      icon: Clock,
      title: "Real-Time Rebates",
      description: "Get up-to-date rebate calculations based on current government incentives."
    },
    {
      icon: Eye,
      title: "Fully Free to Use",
      description: "No hidden fees, no charges. Our service is completely free for homeowners."
    },
    {
      icon: DollarSign,
      title: "Transparent Pricing",
      description: "Clear, upfront quotes with no surprises. Compare multiple installers easily."
    },
    {
      icon: Lock,
      title: "100% Data Privacy",
      description: "Your information is secure and never sold to third parties. Your privacy matters."
    }
  ];

  return (
    <section className="bg-gradient-to-br from-black-500 to-night-500 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
            Why Choose SolarMatch?
          </h2>
          <p className="text-xl text-battleship_gray-700 max-w-3xl mx-auto">
            We're committed to making solar simple, transparent, and accessible for every Australian homeowner
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-onyx-500/30 backdrop-blur-sm p-8 rounded-2xl border border-onyx-600/20 hover:border-giants_orange-500/50 transition-all group hover:transform hover:scale-105">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-giants_orange-500 to-giants_orange-600 rounded-2xl mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <feature.icon className="h-8 w-8 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-4">
                {feature.title}
              </h3>
              <p className="text-battleship_gray-700 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-r from-giants_orange-500/20 to-giants_orange-600/20 p-8 lg:p-12 rounded-2xl border border-giants_orange-500/30">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-white mb-2">50,000+</div>
              <div className="text-battleship_gray-700">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">500+</div>
              <div className="text-battleship_gray-700">Verified Installers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">$50M+</div>
              <div className="text-battleship_gray-700">In Rebates Claimed</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;