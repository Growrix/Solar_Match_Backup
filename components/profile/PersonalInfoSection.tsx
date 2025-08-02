import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Calendar, Globe } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface PersonalInfoSectionProps {
  onChange: () => void;
}

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({ onChange }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    preferredLanguage: 'en'
  });

  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.user_metadata?.full_name || '',
        email: user.email || '',
        phone: user.user_metadata?.phone || '',
        dateOfBirth: user.user_metadata?.date_of_birth || '',
        preferredLanguage: user.user_metadata?.preferred_language || 'en'
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    onChange();

    // Auto-save functionality
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }
    
    const timeout = setTimeout(() => {
      // Auto-save logic would go here
      console.log('Auto-saving:', { [name]: value });
    }, 2000);
    
    setAutoSaveTimeout(timeout);
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' }
  ];

  return (
    <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-8">
      <h3 className="text-xl font-bold text-white mb-6">Personal Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Full Name */}
        <div>
          <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">
            <User className="inline h-4 w-4 mr-1" />
            Full Name
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            placeholder="Enter your full name"
            className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 text-white placeholder-battleship_gray-600 focus:border-giants_orange-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Email (Read-only) */}
        <div>
          <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">
            <Mail className="inline h-4 w-4 mr-1" />
            Email Address
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            readOnly
            className="w-full bg-onyx-600/30 backdrop-blur-sm border border-onyx-600/20 rounded-xl px-4 py-3 text-battleship_gray-600 cursor-not-allowed"
          />
          <p className="text-xs text-battleship_gray-600 mt-1">
            Email cannot be changed. Contact support if needed.
          </p>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">
            <Phone className="inline h-4 w-4 mr-1" />
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Enter your phone number"
            className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 text-white placeholder-battleship_gray-600 focus:border-giants_orange-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">
            <Calendar className="inline h-4 w-4 mr-1" />
            Date of Birth
          </label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleInputChange}
            className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 text-white focus:border-giants_orange-500 focus:outline-none transition-colors"
          />
        </div>

        {/* Preferred Language */}
        <div className="md:col-span-2">
          <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">
            <Globe className="inline h-4 w-4 mr-1" />
            Preferred Language
          </label>
          <select
            name="preferredLanguage"
            value={formData.preferredLanguage}
            onChange={handleInputChange}
            className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 text-white focus:border-giants_orange-500 focus:outline-none transition-colors"
          >
            {languages.map((lang) => (
              <option key={lang.code} value={lang.code} className="bg-onyx-600 text-white">
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="mt-6 p-4 bg-onyx-600/30 rounded-xl border border-onyx-600/20">
        <p className="text-sm text-battleship_gray-700">
          <strong className="text-white">Privacy Notice:</strong> Your personal information is kept private and secure. 
          We only use this data to improve your experience and will never share it with third parties without your consent.
        </p>
      </div>
    </div>
  );
};

export default PersonalInfoSection;