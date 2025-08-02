import React from 'react'
import { ClipboardList, Calculator, Users } from 'lucide-react'

const HowItWorks = () => {
  const steps = [
    {
      icon: ClipboardList,
      title: "Take a Quick Quiz",
      description: "Answer a few simple questions about your home and energy needs in under 2 minutes."
    },
    {
      icon: Calculator,
      title: "See Your Rebate + Quote",
      description: "Get instant calculations of government rebates and potential savings tailored to your location."
    },
    {
      icon: Users,
      title: "Match with Top Installers",
      description: "We connect you with verified, highly-rated solar installers in your local area."
    }
  ]

  return (
    <section className="bg-gradient-to-br from-onyx-200 to-night-300 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
            How It Works
          </h2>
          <p className="text-xl text-battleship_gray-700 max-w-2xl mx-auto">
            Three simple steps to start your solar journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-onyx-500/50 backdrop-blur-sm p-8 rounded-2xl border border-onyx-600/30 hover:border-giants_orange-500/50 transition-all group shadow-lg hover:shadow-xl">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-giants_orange-500 to-giants_orange-600 rounded-2xl mb-6 mx-auto group-hover:scale-110 transition-transform shadow-lg">
                  <step.icon className="h-8 w-8 text-white" />
                </div>
                
                <div className="text-center">
                  <div className="text-sm font-semibold text-giants_orange-500 mb-2">
                    STEP {index + 1}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">
                    {step.title}
                  </h3>
                  <p className="text-battleship_gray-700 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Connector line for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-20 left-full w-full h-0.5 bg-gradient-to-r from-giants_orange-500 to-transparent z-10 transform -translate-x-6"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks