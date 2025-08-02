import React, { useState, useEffect } from 'react';
import { X, User, Settings, MapPin, Shield, Camera, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import ProfilePictureUpload from '@/components/profile/ProfilePictureUpload';
import PersonalInfoSection from '@/components/profile/PersonalInfoSection';
import AddressSection from '@/components/profile/AddressSection';
import AccountSettingsSection from '@/components/profile/AccountSettingsSection';

interface ProfileDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onSignOut: () => void;
}

type TabType = 'profile' | 'address' | 'settings';

const ProfileDashboard: React.FC<ProfileDashboardProps> = ({ isOpen, onClose, onSignOut }) => {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const { user } = useAuth();

  const tabs = [
    { id: 'profile' as TabType, label: 'Profile', icon: User },
    { id: 'address' as TabType, label: 'Address', icon: MapPin },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings }
  ];

  // Handle unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleClose = () => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to close?')) {
        setHasUnsavedChanges(false);
        onClose();
      }
    } else {
      onClose();
    }
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      // Simulate save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveStatus('saved');
      setHasUnsavedChanges(false);
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-night-500 rounded-2xl border border-onyx-600/30 max-w-4xl w-full shadow-2xl my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-onyx-600/30">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-giants_orange-500 to-giants_orange-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {user?.user_metadata?.full_name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Profile Dashboard</h2>
              <p className="text-battleship_gray-700">Manage your account and preferences</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Save Status Indicator */}
            {saveStatus === 'saving' && (
              <div className="flex items-center space-x-2 text-giants_orange-500">
                <div className="w-4 h-4 border-2 border-giants_orange-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">Saving...</span>
              </div>
            )}
            {saveStatus === 'saved' && (
              <div className="flex items-center space-x-2 text-green-500">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Saved</span>
              </div>
            )}
            {saveStatus === 'error' && (
              <div className="flex items-center space-x-2 text-red-500">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">Error saving</span>
              </div>
            )}
            
            {/* Save Button */}
            {hasUnsavedChanges && (
              <button
                onClick={handleSave}
                disabled={saveStatus === 'saving'}
                className="bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </button>
            )}
            
            <button
              onClick={handleClose}
              className="text-battleship_gray-600 hover:text-white transition-colors p-2 rounded-lg hover:bg-onyx-500/50"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 bg-onyx-500/30 md:border-r border-b md:border-b-0 border-onyx-600/30 p-6">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white shadow-lg'
                      : 'text-battleship_gray-700 hover:text-white hover:bg-onyx-500/50'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>

            {/* Sign Out Button */}
            <div className="mt-8 pt-6 border-t border-onyx-600/30">
              <button
                onClick={onSignOut}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
              >
                <Shield className="h-5 w-5" />
                <span className="font-medium">Sign Out</span>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="p-8">
              {activeTab === 'profile' && (
                <div className="space-y-8">
                  <ProfilePictureUpload 
                    onUpload={() => setHasUnsavedChanges(true)}
                  />
                  <PersonalInfoSection 
                    onChange={() => setHasUnsavedChanges(true)}
                  />
                </div>
              )}
              
              {activeTab === 'address' && (
                <AddressSection 
                  onChange={() => setHasUnsavedChanges(true)}
                />
              )}
              
              {activeTab === 'settings' && (
                <AccountSettingsSection 
                  onChange={() => setHasUnsavedChanges(true)}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileDashboard;