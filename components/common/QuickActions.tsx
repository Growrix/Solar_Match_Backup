import React from 'react';
import { Calculator, Zap, Home, DollarSign, HelpCircle, FileText } from 'lucide-react';

interface QuickActionsProps {
  onActionClick: (action: string) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ onActionClick }) => {
  const quickActions = [
    {
      icon: Calculator,
      label: 'Calculate Rebates',
      action: 'Help me calculate solar rebates for my location'
    },
    {
      icon: Zap,
      label: 'System Sizing',
      action: 'What size solar system do I need for my home?'
    },
    {
      icon: DollarSign,
      label: 'Cost Estimate',
      action: 'How much does a solar system cost in Australia?'
    },
    {
      icon: Home,
      label: 'Installation Process',
      action: 'What is the solar installation process like?'
    },
    {
      icon: FileText,
      label: 'Get Quote',
      action: 'I want to get a solar quote for my property'
    },
    {
      icon: HelpCircle,
      label: 'General Help',
      action: 'I have questions about solar energy'
    }
  ];

  return (
    <div className="px-4 pb-4">
      <div className="mb-3">
        <h4 className="text-sm font-semibold text-white mb-3 text-center">Quick Actions</h4>
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map((action, index) => (
            <button
              key={index}
              onClick={() => onActionClick(action.action)}
              className="flex flex-col items-center space-y-1 p-2 text-center bg-onyx-600/30 hover:bg-onyx-600/50 rounded-lg transition-colors text-xs border border-onyx-600/20 hover:border-giants_orange-500/30"
            >
              <action.icon className="h-4 w-4 text-giants_orange-500 flex-shrink-0" />
              <span className="text-white text-xs leading-tight">{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickActions;