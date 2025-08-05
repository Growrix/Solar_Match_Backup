import React from 'react';
import { Calculator, TrendingUp, Target, Lightbulb, FileText, Users } from 'lucide-react';

interface QuickActionsProps {
  onActionClick: (action: string) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onActionClick }) => {
  const quickActions = [
    {
      icon: <Calculator className="h-4 w-4" />,
      label: 'Calculate Rebates',
      action: 'Calculate my potential solar rebates for my property',
      category: 'calculator'
    },
    {
      icon: <FileText className="h-4 w-4" />,
      label: 'Analyze My Quote',
      action: 'Can you analyze my latest solar quote and tell me if it\'s a good deal?',
      category: 'analysis'
    },
    {
      icon: <Target className="h-4 w-4" />,
      label: 'Bid Coaching',
      action: 'I have multiple bids for solar installation. Can you help me compare and negotiate?',
      category: 'coaching'
    },
    {
      icon: <TrendingUp className="h-4 w-4" />,
      label: 'System Recommendations',
      action: 'What size solar system would you recommend for my home and energy usage?',
      category: 'recommendations'
    },
    {
      icon: <Lightbulb className="h-4 w-4" />,
      label: 'Optimization Tips',
      action: 'How can I optimize my solar system for maximum savings and efficiency?',
      category: 'optimization'
    },
    {
      icon: <Users className="h-4 w-4" />,
      label: 'Find Installers',
      action: 'Help me find qualified solar installers in my area with good reviews',
      category: 'installers'
    }
  ];

  return (
    <div className="p-4 border-t border-onyx-600/30">
      <h4 className="text-sm font-medium text-white mb-3">💡 Quick Actions</h4>
      <div className="grid grid-cols-2 gap-2">
        {quickActions.map((action, index) => (
          <button
            key={index}
            onClick={() => onActionClick(action.action)}
            className="flex items-center space-x-2 p-3 bg-onyx-600/30 hover:bg-onyx-600/50 rounded-lg transition-colors text-left border border-onyx-600/20 hover:border-giants_orange-500/30"
            title={action.action}
          >
            <div className="text-giants_orange-500 flex-shrink-0">
              {action.icon}
            </div>
            <span className="text-sm text-white font-medium">
              {action.label}
            </span>
          </button>
        ))}
      </div>
      
      {/* Context-aware suggestions */}
      <div className="mt-4 p-3 bg-giants_orange-500/10 rounded-lg border border-giants_orange-500/20">
        <div className="flex items-center space-x-2 mb-2">
          <Lightbulb className="h-4 w-4 text-giants_orange-500" />
          <span className="text-sm font-medium text-giants_orange-500">Smart Suggestions</span>
        </div>
        <p className="text-xs text-white/80">
          I can provide personalized advice based on your location, energy usage, and budget. Just ask me anything about solar!
        </p>
      </div>
    </div>
  );
};

export default QuickActions;