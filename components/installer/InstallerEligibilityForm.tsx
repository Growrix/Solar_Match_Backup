import React, { useState } from 'react';
import { CheckCircle, XCircle, Building, FileText, MapPin, User, ArrowRight, AlertCircle } from 'lucide-react';

interface EligibilityFormProps {
  isOpen: boolean;
  onClose: () => void;
  onEligible: () => void;
}

interface FormData {
  cecAccredited: string;
  hasABN: string;
  providesInstallation: string;
  companyName: string;
  contactPerson: string;
  phoneNumber: string;
  email: string;
}

const InstallerEligibilityForm: React.FC<EligibilityFormProps> = ({ isOpen, onClose, onEligible }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    cecAccredited: '',
    hasABN: '',
    providesInstallation: '',
    companyName: '',
    contactPerson: '',
    phoneNumber: '',
    email: ''
  });
  const [isEligible, setIsEligible] = useState<boolean | null>(null);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const checkEligibility = () => {
    const eligible = formData.cecAccredited === 'yes' && 
                    formData.hasABN === 'yes' && 
                    formData.providesInstallation === 'yes';
    setIsEligible(eligible);
    setCurrentStep(3);
  };

  const handleContinueToSignup = () => {
    onEligible();
    onClose();
  };

  const resetForm = () => {
    setCurrentStep(1);
    setFormData({
      cecAccredited: '',
      hasABN: '',
      providesInstallation: '',
      companyName: '',
      contactPerson: '',
      phoneNumber: '',
      email: ''
    });
    setIsEligible(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-night-500 to-black-500 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-onyx-600/30 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-onyx-600/30">
          <div>
            <h2 className="text-2xl font-bold text-white">Become a Partner</h2>
            <p className="text-battleship_gray-700">Join our network of verified solar installers</p>
          </div>
          <button
            onClick={handleClose}
            className="text-battleship_gray-600 hover:text-white transition-colors p-2 rounded-lg hover:bg-onyx-500/30"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center p-6">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  currentStep >= step 
                    ? 'bg-giants_orange-500 text-white' 
                    : 'bg-onyx-600 text-battleship_gray-600'
                }`}>
                  {step === 3 && isEligible !== null ? (
                    isEligible ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />
                  ) : step}
                </div>
                {step < 3 && (
                  <div className={`w-12 h-1 ${
                    currentStep > step ? 'bg-giants_orange-500' : 'bg-onyx-600'
                  }`}></div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Step 1: Eligibility Questions */}
          {currentStep === 1 && (
            <div>
              <h3 className="text-xl font-bold text-white mb-6">Eligibility Requirements</h3>
              
              <div className="space-y-6">
                {/* CEC Accredited */}
                <div>
                  <label className="block text-battleship_gray-700 text-sm font-semibold mb-3">
                    <FileText className="inline h-4 w-4 mr-2" />
                    Are you a CEC-accredited installer? *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleInputChange('cecAccredited', 'yes')}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        formData.cecAccredited === 'yes'
                          ? 'border-green-500 bg-green-500/10 text-green-400'
                          : 'border-onyx-600/30 bg-onyx-600/20 text-battleship_gray-700 hover:border-onyx-600/50'
                      }`}
                    >
                      <CheckCircle className="h-5 w-5 mx-auto mb-1" />
                      <span className="text-sm font-semibold">Yes</span>
                    </button>
                    <button
                      onClick={() => handleInputChange('cecAccredited', 'no')}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        formData.cecAccredited === 'no'
                          ? 'border-red-500 bg-red-500/10 text-red-400'
                          : 'border-onyx-600/30 bg-onyx-600/20 text-battleship_gray-700 hover:border-onyx-600/50'
                      }`}
                    >
                      <XCircle className="h-5 w-5 mx-auto mb-1" />
                      <span className="text-sm font-semibold">No</span>
                    </button>
                  </div>
                </div>

                {/* ABN */}
                <div>
                  <label className="block text-battleship_gray-700 text-sm font-semibold mb-3">
                    <Building className="inline h-4 w-4 mr-2" />
                    Do you have an ABN (Australian Business Number)? *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleInputChange('hasABN', 'yes')}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        formData.hasABN === 'yes'
                          ? 'border-green-500 bg-green-500/10 text-green-400'
                          : 'border-onyx-600/30 bg-onyx-600/20 text-battleship_gray-700 hover:border-onyx-600/50'
                      }`}
                    >
                      <CheckCircle className="h-5 w-5 mx-auto mb-1" />
                      <span className="text-sm font-semibold">Yes</span>
                    </button>
                    <button
                      onClick={() => handleInputChange('hasABN', 'no')}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        formData.hasABN === 'no'
                          ? 'border-red-500 bg-red-500/10 text-red-400'
                          : 'border-onyx-600/30 bg-onyx-600/20 text-battleship_gray-700 hover:border-onyx-600/50'
                      }`}
                    >
                      <XCircle className="h-5 w-5 mx-auto mb-1" />
                      <span className="text-sm font-semibold">No</span>
                    </button>
                  </div>
                </div>

                {/* Installation Services */}
                <div>
                  <label className="block text-battleship_gray-700 text-sm font-semibold mb-3">
                    <MapPin className="inline h-4 w-4 mr-2" />
                    Do you provide installation services in Australia? *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleInputChange('providesInstallation', 'yes')}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        formData.providesInstallation === 'yes'
                          ? 'border-green-500 bg-green-500/10 text-green-400'
                          : 'border-onyx-600/30 bg-onyx-600/20 text-battleship_gray-700 hover:border-onyx-600/50'
                      }`}
                    >
                      <CheckCircle className="h-5 w-5 mx-auto mb-1" />
                      <span className="text-sm font-semibold">Yes</span>
                    </button>
                    <button
                      onClick={() => handleInputChange('providesInstallation', 'no')}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        formData.providesInstallation === 'no'
                          ? 'border-red-500 bg-red-500/10 text-red-400'
                          : 'border-onyx-600/30 bg-onyx-600/20 text-battleship_gray-700 hover:border-onyx-600/50'
                      }`}
                    >
                      <XCircle className="h-5 w-5 mx-auto mb-1" />
                      <span className="text-sm font-semibold">No</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <button
                  onClick={() => setCurrentStep(2)}
                  disabled={!formData.cecAccredited || !formData.hasABN || !formData.providesInstallation}
                  className="bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
                >
                  <span>Next</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Company Details */}
          {currentStep === 2 && (
            <div>
              <h3 className="text-xl font-bold text-white mb-6">Company Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    placeholder="Enter your company name"
                    className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 text-white placeholder-battleship_gray-600 focus:border-giants_orange-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">
                    Contact Person *
                  </label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                    placeholder="Your full name"
                    className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 text-white placeholder-battleship_gray-600 focus:border-giants_orange-500 focus:outline-none transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    placeholder="0400 000 000"
                    className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 text-white placeholder-battleship_gray-600 focus:border-giants_orange-500 focus:outline-none transition-colors"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="contact@yourcompany.com.au"
                    className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 text-white placeholder-battleship_gray-600 focus:border-giants_orange-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="bg-onyx-600/50 text-battleship_gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-onyx-600/70 hover:text-white transition-all"
                >
                  Back
                </button>
                <button
                  onClick={checkEligibility}
                  disabled={!formData.companyName || !formData.contactPerson || !formData.phoneNumber || !formData.email}
                  className="bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
                >
                  <span>Check Eligibility</span>
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Results */}
          {currentStep === 3 && (
            <div className="text-center">
              {isEligible ? (
                <div>
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="h-12 w-12 text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Congratulations!</h3>
                  <p className="text-battleship_gray-700 mb-8 leading-relaxed">
                    Your company meets our eligibility requirements. You can now proceed to create your installer account and start receiving qualified solar leads.
                  </p>
                  
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 mb-8">
                    <h4 className="text-green-400 font-semibold mb-3">What's Next?</h4>
                    <ul className="text-green-300 text-sm space-y-2 text-left">
                      <li>• Create your installer account</li>
                      <li>• Complete your company profile</li>
                      <li>• Set up your service areas</li>
                      <li>• Receive your first free lead credit</li>
                      <li>• Start receiving qualified leads</li>
                    </ul>
                  </div>

                  <button
                    onClick={handleContinueToSignup}
                    className="bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all transform hover:scale-105 shadow-lg"
                  >
                    Continue to Sign Up
                  </button>
                </div>
              ) : (
                <div>
                  <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <XCircle className="h-12 w-12 text-red-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Not Eligible</h3>
                  <p className="text-battleship_gray-700 mb-8 leading-relaxed">
                    Unfortunately, your company doesn't meet our current eligibility requirements. To join our partner network, you must be a CEC-accredited installer with an ABN providing services in Australia.
                  </p>
                  
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-8">
                    <h4 className="text-red-400 font-semibold mb-3 flex items-center justify-center space-x-2">
                      <AlertCircle className="h-5 w-5" />
                      <span>Requirements Not Met</span>
                    </h4>
                    <ul className="text-red-300 text-sm space-y-2 text-left">
                      {formData.cecAccredited !== 'yes' && <li>• CEC accreditation required</li>}
                      {formData.hasABN !== 'yes' && <li>• Valid ABN required</li>}
                      {formData.providesInstallation !== 'yes' && <li>• Must provide installation services in Australia</li>}
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="bg-onyx-600/50 text-battleship_gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-onyx-600/70 hover:text-white transition-all"
                    >
                      Try Again
                    </button>
                    <div>
                      <p className="text-sm text-battleship_gray-600">
                        Need help getting CEC accredited?{' '}
                        <a 
                          href="https://www.cleanenergycouncil.org.au" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-giants_orange-500 hover:text-giants_orange-400 underline"
                        >
                          Visit Clean Energy Council
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstallerEligibilityForm;