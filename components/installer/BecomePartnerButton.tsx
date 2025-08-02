import React from 'react';
import { Building, ArrowRight } from 'lucide-react';

interface BecomePartnerButtonProps {
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const BecomePartnerButton: React.FC<BecomePartnerButtonProps> = ({ 
  onClick, 
  variant = 'primary', 
  size = 'md',
  className = '' 
}) => {
  const baseClasses = "font-semibold transition-all transform hover:scale-105 flex items-center space-x-2 rounded-xl";
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 hover:from-giants_orange-600 hover:to-giants_orange-700 text-white shadow-lg",
    secondary: "bg-transparent border-2 border-giants_orange-500 text-giants_orange-500 hover:bg-giants_orange-500 hover:text-white"
  };

  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg"
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      <Building className={`${size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'}`} />
      <span>Become a Partner</span>
      <ArrowRight className={`${size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'}`} />
    </button>
  );
};

export default BecomePartnerButton;