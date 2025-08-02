import React from 'react';
import { BookOpen, Play, FileText, ArrowRight } from 'lucide-react';

const DIYTips = () => {
  const tips = [
    {
      icon: BookOpen,
      title: "Solar Panel Basics: What You Need to Know",
      description: "Understanding different panel types, efficiency ratings, and what size system is right for your home.",
      readTime: "5 min read",
      type: "Guide"
    },
    {
      icon: Play,
      title: "How to Calculate Your Energy Needs",
      description: "Step-by-step video guide to determine your household's energy consumption and solar requirements.",
      readTime: "8 min watch",
      type: "Video"
    },
    {
      icon: FileText,
      title: "Questions to Ask Your Solar Installer",
      description: "A comprehensive checklist to ensure you're getting the best deal and quality installation.",
      readTime: "3 min read",
      type: "Checklist"
    }
  ];

  return (
    <section className="bg-gradient-to-br from-onyx-200 to-night-300 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
            Learn Before You Buy
          </h2>
          <p className="text-xl text-battleship_gray-700 max-w-3xl mx-auto">
            Get educated with our free resources designed to help you make informed solar decisions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {tips.map((tip, index) => (
            <div key={index} className="bg-onyx-500/50 backdrop-blur-sm rounded-2xl border border-onyx-600/30 overflow-hidden hover:border-giants_orange-500/50 transition-all group hover:transform hover:scale-105 shadow-lg hover:shadow-xl">
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="bg-gradient-to-br from-giants_orange-500 to-giants_orange-600 p-3 rounded-2xl group-hover:scale-110 transition-transform shadow-lg">
                    <tip.icon className="h-6 w-6 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-giants_orange-500 bg-giants_orange-500/20 px-3 py-1 rounded-full">
                    {tip.type}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-4 leading-snug">
                  {tip.title}
                </h3>
                <p className="text-battleship_gray-700 mb-6 leading-relaxed">
                  {tip.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-battleship_gray-600">
                    {tip.readTime}
                  </span>
                  <button className="text-giants_orange-500 hover:text-giants_orange-600 transition-colors inline-flex items-center space-x-1">
                    <span className="text-sm font-semibold">Read More</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button className="bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all transform hover:scale-105 inline-flex items-center space-x-2 shadow-lg">
            <span>Explore All Tips</span>
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default DIYTips;