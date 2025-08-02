'use client'

import React from 'react'
import { ArrowRight, Calculator } from 'lucide-react'
import Link from 'next/link'

const HeroSection = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      // Dynamic header height calculation based on scroll position
      const scrollTop = window.scrollY
      const headerHeight = scrollTop > 100 ? 80 : 120 // Adjust based on top bar visibility
      const elementPosition = element.offsetTop - headerHeight
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      })
    }
  }

  return (
    <section id="hero" className="bg-night-500 relative overflow-hidden min-h-screen flex items-center pt-32">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-night-400 via-night-500 to-black-500"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-onyx-500/20 via-transparent to-night-300/30"></div>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Floating Geometric Shapes - Parallax Background */}
        <div className="absolute top-20 left-10 w-16 h-16 border border-giants_orange-500/20 rotate-45 animate-float-slow"></div>
        <div className="absolute top-40 right-20 w-8 h-8 bg-giants_orange-500/10 rounded-full animate-float-medium"></div>
        <div className="absolute bottom-40 left-20 w-12 h-12 border-2 border-battleship_gray-500/20 rounded-full animate-float-fast"></div>
        <div className="absolute top-60 left-1/3 w-6 h-6 bg-giants_orange-500/15 transform rotate-45 animate-float-slow"></div>
        <div className="absolute bottom-60 right-1/3 w-10 h-10 border border-onyx-600/30 animate-float-medium"></div>
        
        {/* Pulsating Sun Element */}
        <div className="absolute top-32 right-32 sun-container">
          <div className="sun-core w-24 h-24 bg-gradient-to-br from-giants_orange-400 to-giants_orange-600 rounded-full relative animate-pulse-sun">
            {/* Sun Rays */}
            <div className="absolute inset-0 sun-rays">
              <div className="ray ray-1"></div>
              <div className="ray ray-2"></div>
              <div className="ray ray-3"></div>
              <div className="ray ray-4"></div>
              <div className="ray ray-5"></div>
              <div className="ray ray-6"></div>
              <div className="ray ray-7"></div>
              <div className="ray ray-8"></div>
            </div>
            
            {/* Energy Particles */}
            <div className="energy-particles">
              <div className="particle particle-1"></div>
              <div className="particle particle-2"></div>
              <div className="particle particle-3"></div>
              <div className="particle particle-4"></div>
              <div className="particle particle-5"></div>
            </div>
          </div>
        </div>
        
        {/* Solar Panels */}
        <div className="absolute bottom-20 left-20 solar-panel-group">
          <div className="solar-panel panel-1">
            <div className="panel-surface"></div>
            <div className="panel-glow"></div>
          </div>
          <div className="solar-panel panel-2">
            <div className="panel-surface"></div>
            <div className="panel-glow"></div>
          </div>
          <div className="solar-panel panel-3">
            <div className="panel-surface"></div>
            <div className="panel-glow"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white mb-6 leading-tight animate-fade-in-up">
            Smarter Solar
            <span className="bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 bg-clip-text text-transparent"> Starts Here</span>
          </h1>
          
          <p className="text-xl lg:text-2xl text-battleship_gray-700 mb-10 leading-relaxed max-w-3xl mx-auto animate-fade-in-up-delay">
            No jargon, no sales — just real numbers, real rebates, and real local installers.
          </p>

          {/* Two Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-fade-in-up-delay-2">
            <button 
              onClick={() => scrollToSection('quote-preview')}
              className="bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all transform hover:scale-105 inline-flex items-center space-x-2 shadow-2xl w-full sm:w-auto"
            >
              <span>Get Your Instant Quote</span>
              <ArrowRight className="h-5 w-5" />
            </button>
            
            <button 
              onClick={() => scrollToSection('rebate-calculator')}
              className="bg-transparent border-2 border-giants_orange-500 text-giants_orange-500 hover:bg-giants_orange-500 hover:text-white px-8 py-4 rounded-full text-lg font-semibold transition-all transform hover:scale-105 inline-flex items-center space-x-2 shadow-2xl w-full sm:w-auto"
            >
              <Calculator className="h-5 w-5" />
              <span>Rebate Calculator</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center bg-onyx-500/30 backdrop-blur-sm rounded-2xl p-6 border border-onyx-600/20 animate-fade-in-up-delay-3">
              <div className="text-3xl font-bold text-white mb-2">2 min</div>
              <div className="text-battleship_gray-700">Quick Assessment</div>
            </div>
            <div className="text-center bg-onyx-500/30 backdrop-blur-sm rounded-2xl p-6 border border-onyx-600/20 animate-fade-in-up-delay-4">
              <div className="text-3xl font-bold text-white mb-2">100%</div>
              <div className="text-battleship_gray-700">Free Service</div>
            </div>
            <div className="text-center bg-onyx-500/30 backdrop-blur-sm rounded-2xl p-6 border border-onyx-600/20 animate-fade-in-up-delay-5">
              <div className="text-3xl font-bold text-white mb-2">5★</div>
              <div className="text-battleship_gray-700">Rated Installers</div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        /* Floating Animations */
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes float-medium {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-15px) scale(1.1); }
        }
        
        @keyframes float-fast {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(360deg); }
        }
        
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-float-medium { animation: float-medium 6s ease-in-out infinite; }
        .animate-float-fast { animation: float-fast 4s ease-in-out infinite; }
        
        /* Sun Animations */
        @keyframes pulse-sun {
          0%, 100% { transform: scale(1); box-shadow: 0 0 30px rgba(250, 98, 35, 0.3); }
          50% { transform: scale(1.05); box-shadow: 0 0 50px rgba(250, 98, 35, 0.5); }
        }
        
        .animate-pulse-sun { animation: pulse-sun 3s ease-in-out infinite; }
        
        /* Sun Rays */
        .ray {
          position: absolute;
          width: 2px;
          height: 20px;
          background: linear-gradient(to bottom, rgba(250, 98, 35, 0.8), transparent);
          border-radius: 1px;
          transform-origin: bottom center;
        }
        
        .ray-1 { top: -25px; left: 50%; transform: translateX(-50%) rotate(0deg); animation: ray-glow 2s ease-in-out infinite; }
        .ray-2 { top: -18px; right: -18px; transform: rotate(45deg); animation: ray-glow 2s ease-in-out infinite 0.25s; }
        .ray-3 { top: 50%; right: -25px; transform: translateY(-50%) rotate(90deg); animation: ray-glow 2s ease-in-out infinite 0.5s; }
        .ray-4 { bottom: -18px; right: -18px; transform: rotate(135deg); animation: ray-glow 2s ease-in-out infinite 0.75s; }
        .ray-5 { bottom: -25px; left: 50%; transform: translateX(-50%) rotate(180deg); animation: ray-glow 2s ease-in-out infinite 1s; }
        .ray-6 { bottom: -18px; left: -18px; transform: rotate(225deg); animation: ray-glow 2s ease-in-out infinite 1.25s; }
        .ray-7 { top: 50%; left: -25px; transform: translateY(-50%) rotate(270deg); animation: ray-glow 2s ease-in-out infinite 1.5s; }
        .ray-8 { top: -18px; left: -18px; transform: rotate(315deg); animation: ray-glow 2s ease-in-out infinite 1.75s; }
        
        @keyframes ray-glow {
          0%, 100% { opacity: 0.4; height: 20px; }
          50% { opacity: 1; height: 30px; }
        }
        
        /* Energy Particles */
        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: #FA6223;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(250, 98, 35, 0.8);
        }
        
        .particle-1 { animation: particle-flow-1 4s linear infinite; }
        .particle-2 { animation: particle-flow-2 4s linear infinite 0.8s; }
        .particle-3 { animation: particle-flow-3 4s linear infinite 1.6s; }
        .particle-4 { animation: particle-flow-4 4s linear infinite 2.4s; }
        .particle-5 { animation: particle-flow-5 4s linear infinite 3.2s; }
        
        @keyframes particle-flow-1 {
          0% { transform: translate(0, 0); opacity: 1; }
          100% { transform: translate(-300px, 200px); opacity: 0; }
        }
        
        @keyframes particle-flow-2 {
          0% { transform: translate(0, 0); opacity: 1; }
          100% { transform: translate(-250px, 180px); opacity: 0; }
        }
        
        @keyframes particle-flow-3 {
          0% { transform: translate(0, 0); opacity: 1; }
          100% { transform: translate(-280px, 220px); opacity: 0; }
        }
        
        @keyframes particle-flow-4 {
          0% { transform: translate(0, 0); opacity: 1; }
          100% { transform: translate(-320px, 160px); opacity: 0; }
        }
        
        @keyframes particle-flow-5 {
          0% { transform: translate(0, 0); opacity: 1; }
          100% { transform: translate(-260px, 240px); opacity: 0; }
        }
        
        /* Solar Panels */
        .solar-panel {
          position: relative;
          width: 60px;
          height: 40px;
          margin: 5px;
          display: inline-block;
          transform-origin: bottom center;
        }
        
        .panel-1 { animation: panel-track 6s ease-in-out infinite; }
        .panel-2 { animation: panel-track 6s ease-in-out infinite 0.5s; }
        .panel-3 { animation: panel-track 6s ease-in-out infinite 1s; }
        
        @keyframes panel-track {
          0%, 100% { transform: rotateY(-10deg) rotateX(5deg); }
          50% { transform: rotateY(10deg) rotateX(-5deg); }
        }
        
        .panel-surface {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
          border: 1px solid rgba(250, 98, 35, 0.2);
          border-radius: 4px;
          position: relative;
          overflow: hidden;
        }
        
        .panel-surface::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, transparent 30%, rgba(250, 98, 35, 0.1) 50%, transparent 70%);
          animation: panel-shine 3s ease-in-out infinite;
        }
        
        @keyframes panel-shine {
          0%, 100% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
        }
        
        .panel-glow {
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: rgba(250, 98, 35, 0.3);
          border-radius: 6px;
          opacity: 0;
          animation: panel-glow 4s ease-in-out infinite;
        }
        
        @keyframes panel-glow {
          0%, 70%, 100% { opacity: 0; }
          80%, 90% { opacity: 1; }
        }
        
        /* Content Animations */
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out; }
        .animate-fade-in-up-delay { animation: fade-in-up 0.8s ease-out 0.2s both; }
        .animate-fade-in-up-delay-2 { animation: fade-in-up 0.8s ease-out 0.4s both; }
        .animate-fade-in-up-delay-3 { animation: fade-in-up 0.8s ease-out 0.6s both; }
        .animate-fade-in-up-delay-4 { animation: fade-in-up 0.8s ease-out 0.8s both; }
        .animate-fade-in-up-delay-5 { animation: fade-in-up 0.8s ease-out 1s both; }
      `}</style>
    </section>
  )
}

export default HeroSection