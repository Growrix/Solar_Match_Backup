import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Crop, RotateCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface ProfilePictureUploadProps {
  onUpload: () => void;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({ onUpload }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentProfilePicture, setCurrentProfilePicture] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG)');
      return;
    }

    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      setError('File size must be less than 2MB');
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedImage) return;

    setUploading(true);
    setError(null);
    
    try {
      // Simulate upload process - in a real app, you'd upload to Supabase Storage
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Set the uploaded image as the current profile picture
      setCurrentProfilePicture(selectedImage);
      
      // Store in localStorage for persistence (in a real app, this would be in the database)
      if (user?.id) {
        localStorage.setItem(`profile_picture_${user.id}`, selectedImage);
      }
      
      setShowCropModal(false);
      setSelectedImage(null);
      setSuccess('Profile picture updated successfully!');
      onUpload();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleUseDefault = () => {
    setCurrentProfilePicture(null);
    if (user?.id) {
      localStorage.removeItem(`profile_picture_${user.id}`);
    }
    setSuccess('Profile picture reset to default!');
    onUpload();
    setTimeout(() => setSuccess(null), 3000);
  };

  const getUserInitials = () => {
    if (!user?.user_metadata?.full_name) return 'U';
    const names = user.user_metadata.full_name.split(' ');
    return names.length > 1 
      ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
      : names[0][0].toUpperCase();
  };

  // Load saved profile picture on component mount
  React.useEffect(() => {
    if (user?.id) {
      const savedPicture = localStorage.getItem(`profile_picture_${user.id}`);
      if (savedPicture) {
        setCurrentProfilePicture(savedPicture);
      }
    }
  }, [user?.id]);

  return (
    <>
      <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-8">
        <h3 className="text-xl font-bold text-white mb-6">Profile Picture</h3>
        
        <div className="flex items-center space-x-8">
          {/* Current Avatar */}
          <div className="relative">
            {currentProfilePicture ? (
              <img
                src={currentProfilePicture}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover shadow-lg border-2 border-giants_orange-500/20"
              />
            ) : (
              <div className="w-24 h-24 bg-gradient-to-br from-giants_orange-500 to-giants_orange-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                {getUserInitials()}
              </div>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-giants_orange-500 rounded-full flex items-center justify-center text-white hover:bg-giants_orange-600 transition-colors shadow-lg"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>

          {/* Upload Options */}
          <div className="flex-1">
            <div className="space-y-4">
              <div>
                <h4 className="text-white font-semibold mb-2">Upload New Picture</h4>
                <p className="text-battleship_gray-700 text-sm mb-4">
                  Choose a photo that represents you well. JPG or PNG format, max 2MB.
                </p>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all transform hover:scale-105 flex items-center space-x-2"
                >
                  <Upload className="h-4 w-4" />
                  <span>Choose File</span>
                </button>
                
                <button 
                  onClick={handleUseDefault}
                  className="bg-onyx-600/50 text-battleship_gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-onyx-600/70 hover:text-white transition-all"
                >
                  Use Default
                </button>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
                  <p className="text-green-400 text-sm">{success}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* Crop Modal */}
      {showCropModal && selectedImage && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-night-500 rounded-2xl border border-onyx-600/30 max-w-2xl w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Crop Your Photo</h3>
              <button
                onClick={() => {
                  setShowCropModal(false);
                  setSelectedImage(null);
                }}
                className="text-battleship_gray-600 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Image Preview */}
            <div className="bg-onyx-500/30 rounded-xl p-6 mb-6">
              <div className="flex justify-center">
                <div className="relative">
                  <img
                    src={selectedImage}
                    alt="Preview"
                    className="max-w-sm max-h-64 rounded-lg object-cover"
                  />
                  {/* Crop overlay */}
                  <div className="absolute inset-0 border-2 border-dashed border-giants_orange-500 rounded-lg pointer-events-none"></div>
                </div>
              </div>
            </div>

            {/* Crop Controls */}
            <div className="flex items-center justify-between">
              <div className="flex space-x-3">
                <button className="bg-onyx-600/50 text-battleship_gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-onyx-600/70 hover:text-white transition-all flex items-center space-x-2">
                  <Crop className="h-4 w-4" />
                  <span>Crop</span>
                </button>
                <button className="bg-onyx-600/50 text-battleship_gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-onyx-600/70 hover:text-white transition-all flex items-center space-x-2">
                  <RotateCw className="h-4 w-4" />
                  <span>Rotate</span>
                </button>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowCropModal(false);
                    setSelectedImage(null);
                  }}
                  className="bg-onyx-600/50 text-battleship_gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-onyx-600/70 hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <span>Save Photo</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfilePictureUpload;