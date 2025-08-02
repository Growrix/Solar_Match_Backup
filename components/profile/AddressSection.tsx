import React, { useState } from 'react';
import { MapPin, Plus, Edit, Trash2, Home, Building } from 'lucide-react';

interface Address {
  id: string;
  type: 'home' | 'work' | 'other';
  label: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

interface AddressSectionProps {
  onChange: () => void;
}

const AddressSection: React.FC<AddressSectionProps> = ({ onChange }) => {
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      type: 'home',
      label: 'Home',
      street: '123 Solar Street',
      city: 'Sydney',
      state: 'NSW',
      postalCode: '2000',
      country: 'Australia',
      isDefault: true
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: 'home' as 'home' | 'work' | 'other',
    label: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Australia'
  });

  const australianStates = [
    { code: 'NSW', name: 'New South Wales' },
    { code: 'VIC', name: 'Victoria' },
    { code: 'QLD', name: 'Queensland' },
    { code: 'WA', name: 'Western Australia' },
    { code: 'SA', name: 'South Australia' },
    { code: 'TAS', name: 'Tasmania' },
    { code: 'ACT', name: 'Australian Capital Territory' },
    { code: 'NT', name: 'Northern Territory' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    onChange();
  };

  const handleAddAddress = () => {
    const newAddress: Address = {
      id: Date.now().toString(),
      ...formData,
      isDefault: addresses.length === 0
    };

    setAddresses(prev => [...prev, newAddress]);
    setFormData({
      type: 'home',
      label: '',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Australia'
    });
    setShowAddForm(false);
    onChange();
  };

  const handleEditAddress = (id: string) => {
    const address = addresses.find(addr => addr.id === id);
    if (address) {
      setFormData({
        type: address.type,
        label: address.label,
        street: address.street,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country
      });
      setEditingAddress(id);
      setShowAddForm(true);
    }
  };

  const handleUpdateAddress = () => {
    if (!editingAddress) return;

    setAddresses(prev => prev.map(addr => 
      addr.id === editingAddress 
        ? { ...addr, ...formData }
        : addr
    ));
    
    setEditingAddress(null);
    setShowAddForm(false);
    setFormData({
      type: 'home',
      label: '',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Australia'
    });
    onChange();
  };

  const handleDeleteAddress = (id: string) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      setAddresses(prev => prev.filter(addr => addr.id !== id));
      onChange();
    }
  };

  const handleSetDefault = (id: string) => {
    setAddresses(prev => prev.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })));
    onChange();
  };

  const getAddressIcon = (type: string) => {
    switch (type) {
      case 'home': return Home;
      case 'work': return Building;
      default: return MapPin;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white">Address Information</h3>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all transform hover:scale-105 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Address</span>
          </button>
        </div>

        {/* Address List */}
        <div className="space-y-4">
          {addresses.map((address) => {
            const IconComponent = getAddressIcon(address.type);
            return (
              <div key={address.id} className="bg-onyx-600/30 rounded-xl p-6 border border-onyx-600/20">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="bg-gradient-to-br from-giants_orange-500 to-giants_orange-600 p-2 rounded-lg">
                      <IconComponent className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="text-white font-semibold">{address.label}</h4>
                        {address.isDefault && (
                          <span className="bg-giants_orange-500/20 text-giants_orange-500 px-2 py-1 rounded-full text-xs font-semibold">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-battleship_gray-700 text-sm">
                        {address.street}<br />
                        {address.city}, {address.state} {address.postalCode}<br />
                        {address.country}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {!address.isDefault && (
                      <button
                        onClick={() => handleSetDefault(address.id)}
                        className="text-battleship_gray-600 hover:text-giants_orange-500 transition-colors text-sm"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      onClick={() => handleEditAddress(address.id)}
                      className="text-battleship_gray-600 hover:text-white transition-colors p-2 rounded-lg hover:bg-onyx-500/50"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(address.id)}
                      className="text-battleship_gray-600 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-500/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add/Edit Address Form */}
      {showAddForm && (
        <div className="bg-onyx-500/30 backdrop-blur-sm rounded-2xl border border-onyx-600/30 p-8">
          <h3 className="text-xl font-bold text-white mb-6">
            {editingAddress ? 'Edit Address' : 'Add New Address'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Address Type */}
            <div>
              <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">
                Address Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 text-white focus:border-giants_orange-500 focus:outline-none transition-colors"
              >
                <option value="home" className="bg-onyx-600 text-white">Home</option>
                <option value="work" className="bg-onyx-600 text-white">Work</option>
                <option value="other" className="bg-onyx-600 text-white">Other</option>
              </select>
            </div>

            {/* Label */}
            <div>
              <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">
                Label
              </label>
              <input
                type="text"
                name="label"
                value={formData.label}
                onChange={handleInputChange}
                placeholder="e.g., Home, Office, etc."
                className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 text-white placeholder-battleship_gray-600 focus:border-giants_orange-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Street Address */}
            <div className="md:col-span-2">
              <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">
                Street Address
              </label>
              <input
                type="text"
                name="street"
                value={formData.street}
                onChange={handleInputChange}
                placeholder="Enter street address"
                className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 text-white placeholder-battleship_gray-600 focus:border-giants_orange-500 focus:outline-none transition-colors"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Enter city"
                className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 text-white placeholder-battleship_gray-600 focus:border-giants_orange-500 focus:outline-none transition-colors"
              />
            </div>

            {/* State */}
            <div>
              <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">
                State/Province
              </label>
              <select
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 text-white focus:border-giants_orange-500 focus:outline-none transition-colors"
              >
                <option value="" className="bg-onyx-600 text-white">Select state</option>
                {australianStates.map((state) => (
                  <option key={state.code} value={state.code} className="bg-onyx-600 text-white">
                    {state.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Postal Code */}
            <div>
              <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">
                Postal/ZIP Code
              </label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleInputChange}
                placeholder="Enter postal code"
                className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 text-white placeholder-battleship_gray-600 focus:border-giants_orange-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Country */}
            <div>
              <label className="block text-battleship_gray-700 text-sm font-semibold mb-2">
                Country
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full bg-onyx-600/50 backdrop-blur-sm border border-onyx-600/30 rounded-xl px-4 py-3 text-white placeholder-battleship_gray-600 focus:border-giants_orange-500 focus:outline-none transition-colors"
                readOnly
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingAddress(null);
                setFormData({
                  type: 'home',
                  label: '',
                  street: '',
                  city: '',
                  state: '',
                  postalCode: '',
                  country: 'Australia'
                });
              }}
              className="bg-onyx-600/50 text-battleship_gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-onyx-600/70 hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              onClick={editingAddress ? handleUpdateAddress : handleAddAddress}
              className="bg-gradient-to-r from-giants_orange-500 to-giants_orange-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-giants_orange-600 hover:to-giants_orange-700 transition-all transform hover:scale-105"
            >
              {editingAddress ? 'Update Address' : 'Add Address'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressSection;