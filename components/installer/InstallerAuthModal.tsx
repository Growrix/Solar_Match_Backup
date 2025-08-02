import React, { useState } from 'react';
import { X, Mail, Lock, User, Eye, EyeOff, Building, CheckCircle, AlertCircle } from 'lucide-react';
import { signUpInstaller, signInInstaller } from '@/lib/utils/auth';

interface InstallerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

const InstallerAuthModal: React.FC<InstallerAuthModalProps> = ({ isOpen, onClose, initialMode = 'signin' }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    companyName: '',
    contactName: '',
    phone: ''
  });

  const [passwordStrength, setPasswordStrength] = useState({
    hasMinLength: false,
    hasNumber: false,
    hasSpecialChar: false,
    isValid: false
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setError(null);

    // Check password strength for signup
    if (name === 'password' && mode === 'signup') {
      const strength = {
        hasMinLength: value.length >= 8,
        hasNumber: /\d/.test(value),
        hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(value),
        isValid: false
      };
      strength.isValid = strength.hasMinLength && strength.hasNumber && strength.hasSpecialChar;
      setPasswordStrength(strength);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate Google OAuth for installers
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccess('Google sign-in successful! Redirecting to installer dashboard...');
      setTimeout(() => {
        window.location.href = '/installer/dashboard';
      }, 2000);
    } catch (err: any) {
      setError('Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validate password strength for signup
    if (mode === 'signup' && !passwordStrength.isValid) {
      setError('Password must be at least 8 characters with numbers and special characters');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'signup') {
        const { error } = await signUpInstaller({
          email: formData.email,
          password: formData.password,
          companyName: formData.companyName,
          contactName: formData.contactName,
          phone: formData.phone
        });

        if (error) throw error;

        setSuccess('Installer account created successfully! Redirecting to dashboard...');
        setTimeout(() => {
          window.location.href = '/installer/dashboard';
        }, 2000);
      } else {
        const { error } = await signInInstaller({
          email: formData.email,
          password: formData.password
        });

        if (error) throw error;

        // Set remember me preference
        if (rememberMe) {
          localStorage.setItem('installer_remember_me', 'true');
        }

        setSuccess('Signed in successfully! Redirecting to dashboard...');
        setTimeout(() => {
          window.location.href = '/installer/dashboard';
        }, 1500);
      }
    } catch (err: any) {
      // Handle specific error cases
      if (err.message?.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please check your credentials and try again.');
      } else if (err.message?.includes('Email not confirmed')) {
        setError('Please check your email and click the confirmation link before signing in.');
      } else if (err.message?.includes('User already registered') || err.message?.includes('user_already_exists')) {
        setError('This email is already registered. Please sign in or use a different email address.');
      } else if (err.message?.includes('not registered as an installer')) {
        setError('This account is not registered as an installer. Please use the regular sign-in or create an installer account.');
      } else {
        setError(err.message || 'An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    // Implement forgot password functionality
    alert('Password reset link will be sent to your email address');
  };

  const resetForm = () => {
    setFormData({ email: '', password: '', companyName: '', contactName: '', phone: '' });
    setError(null);
    setSuccess(null);
    setShowPassword(false);
    setRememberMe(false);
    setPasswordStrength({ hasMinLength: false, hasNumber: false, hasSpecialChar: false, isValid: false });
  };

  const switchMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-night-500 to-black-500 rounded-2xl max-w-md w-full p-8 relative border border-onyx-600/30 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-battleship_gray-600 hover:text-white transition-colors p-2 rounded-lg hover:bg-onyx-500/30"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-giants_orange-500 to-giants_orange-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg">
            <Building className="h-8 w-8 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">
            {mode === 'signin' ? 'Installer Sign In' : 'Create Installer Account'}
          </h2>
          <p className="text-battleship_gray-700 text-sm">
            {mode === 'signin' 
              ? 'Access your installer dashboard and manage leads' 
              : 'Join our network of verified solar installers'
            }
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6 flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0" />
            <p className="text-green-400 text-sm">{success}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full bg-onyx-500/50 hover:bg-onyx-500/70 border border-onyx-600/30 text-white font-medium py-3 px-4 rounded-xl transition-all flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed backdrop-blur-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-onyx-600/30"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-gradient-to-r from-night-500 to-black-500 text-battleship_gray-700">or</span>
            </div>
          </div>

          {/* Signup Fields */}
          {mode === 'signup' && (
            <>
              <div>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  placeholder="Company name"
                  className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 text-white placeholder-battleship_gray-600 focus:border-giants_orange-500 focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <input
                  type="text"
                  name="contactName"
                  value={formData.contactName}
                  onChange={handleInputChange}
                  placeholder="Contact person name"
                  className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 text-white placeholder-battleship_gray-600 focus:border-giants_orange-500 focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Phone number"
                  className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 text-white placeholder-battleship_gray-600 focus:border-giants_orange-500 focus:outline-none transition-colors"
                  required
                />
              </div>
            </>
          )}

          {/* Email */}
          <div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Business email address"
              className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 text-white placeholder-battleship_gray-600 focus:border-giants_orange-500 focus:outline-none transition-colors"
              required
            />
          </div>

          {/* Password */}
          <div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 pr-12 text-white placeholder-battleship_gray-600 focus:border-giants_orange-500 focus:outline-none transition-colors"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-battleship_gray-600 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {/* Password Strength Indicator for Signup */}
            {mode === 'signup' && formData.password && (
              <div className="mt-3 p-3 bg-onyx-600/30 rounded-lg">
                <p className="text-xs text-battleship_gray-700 mb-2">Password Requirements:</p>
                <div className="space-y-1">
                  <div className={`flex items-center space-x-2 text-xs ${passwordStrength.hasMinLength ? 'text-green-400' : 'text-battleship_gray-600'}`}>
                    <CheckCircle className={`h-3 w-3 ${passwordStrength.hasMinLength ? 'text-green-400' : 'text-battleship_gray-600'}`} />
                    <span>At least 8 characters</span>
                  </div>
                  <div className={`flex items-center space-x-2 text-xs ${passwordStrength.hasNumber ? 'text-green-400' : 'text-battleship_gray-600'}`}>
                    <CheckCircle className={`h-3 w-3 ${passwordStrength.hasNumber ? 'text-green-400' : 'text-battleship_gray-600'}`} />
                    <span>Contains numbers</span>
                  </div>
                  <div className={`flex items-center space-x-2 text-xs ${passwordStrength.hasSpecialChar ? 'text-green-400' : 'text-battleship_gray-600'}`}>
                    <CheckCircle className={`h-3 w-3 ${passwordStrength.hasSpecialChar ? 'text-green-400' : 'text-battleship_gray-600'}`} />
                    <span>Contains special characters</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Remember Me & Forgot Password for Sign In */}
          {mode === 'signin' && (
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-giants_orange-500 bg-onyx-600/50 border-onyx-600/30 rounded focus:ring-giants_orange-500 focus:ring-2"
                />
                <span className="text-sm text-battleship_gray-700">Remember me</span>
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-giants_orange-500 hover:text-giants_orange-400 transition-colors"
              >
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (mode === 'signup' && !passwordStrength.isValid)}
            className="w-full bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 hover:from-giants_orange-600 hover:to-giants_orange-700 text-white font-semibold py-3 px-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Please wait...</span>
              </div>
            ) : (
              mode === 'signin' ? 'Sign In to Dashboard' : 'Create Installer Account'
            )}
          </button>
        </form>

        {/* Terms for Signup */}
        {mode === 'signup' && (
          <div className="mt-6 text-center">
            <p className="text-xs text-battleship_gray-700">
              By creating an account, you agree to our{' '}
              <a href="#" className="text-giants_orange-500 hover:text-giants_orange-400 underline transition-colors">
                Installer Terms
              </a>{' '}
              and{' '}
              <a href="#" className="text-giants_orange-500 hover:text-giants_orange-400 underline transition-colors">
                Privacy Policy
              </a>
            </p>
          </div>
        )}

        {/* Switch Mode */}
        <div className="mt-8 text-center">
          <p className="text-battleship_gray-700 text-sm">
            {mode === 'signin' ? "Don't have an installer account?" : "Already have an installer account?"}
            <button
              onClick={switchMode}
              className="text-giants_orange-500 hover:text-giants_orange-400 font-medium ml-1 transition-colors underline"
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        {/* Homeowner Link */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl text-center">
          <p className="text-blue-300 text-sm">
            Looking for solar quotes as a homeowner?{' '}
            <button
              onClick={() => {
                onClose();
                // Trigger homeowner auth modal
                setTimeout(() => {
                  const event = new CustomEvent('open-homeowner-auth');
                  window.dispatchEvent(event);
                }, 100);
              }}
              className="text-blue-400 hover:text-blue-300 underline font-medium"
            >
              Get your free quote
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default InstallerAuthModal;