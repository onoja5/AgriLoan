import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ChangePasswordForm from '../components/ChangePasswordForm';

const ProfilePage: React.FC = () => {
  const { currentUser, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    emailOrPhone: currentUser?.emailOrPhone || '',
    role: currentUser?.role || '',
    farmLocation: currentUser?.farmLocation || '',
    bankName: currentUser?.bankName || '',
    accountNumber: currentUser?.accountNumber || ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const success = await updateProfile(formData);
      if (success) {
        setSuccessMessage('Profile updated successfully!');
        setErrorMessage('');
        setIsEditing(false);
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setErrorMessage('Failed to update profile');
      }
    } catch (error) {
      setErrorMessage('An error occurred while updating your profile');
    }
  };

  if (!currentUser) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-lg mt-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-green-700">Your Profile</h2>
        <button 
          onClick={() => setIsEditing(!isEditing)}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          {isEditing ? 'Cancel Editing' : 'Edit Profile'}
        </button>
      </div>

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}
      
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Full Name</label>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            ) : (
              <p className="text-gray-900 py-2">{currentUser.name}</p>
            )}
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Email/Phone</label>
            {isEditing ? (
              <input
                type="text"
                name="emailOrPhone"
                value={formData.emailOrPhone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            ) : (
              <p className="text-gray-900 py-2">{currentUser.emailOrPhone}</p>
            )}
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Role</label>
            {isEditing ? (
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              >
                <option value="FARMER">Farmer</option>
                <option value="BANK_OFFICER">Bank Officer</option>
                <option value="BUYER">Buyer</option>
                <option value="ADMIN">Admin</option>
              </select>
            ) : (
              <p className="text-gray-900 py-2">{currentUser.role}</p>
            )}
          </div>
        </div>
        
        {currentUser.role === 'FARMER' && (
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Farm Location</label>
            {isEditing ? (
              <input
                type="text"
                name="farmLocation"
                value={formData.farmLocation}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            ) : (
              <p className="text-gray-900 py-2">{currentUser.farmLocation || 'Not specified'}</p>
            )}
          </div>
        )}
        
        {currentUser.role === 'BANK_OFFICER' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Bank Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              ) : (
                <p className="text-gray-900 py-2">{currentUser.bankName || 'Not specified'}</p>
              )}
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Account Number</label>
              {isEditing ? (
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              ) : (
                <p className="text-gray-900 py-2">{currentUser.accountNumber || 'Not specified'}</p>
              )}
            </div>
          </div>
        )}
        
        {isEditing && (
          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition duration-300"
            >
              Save Changes
            </button>
          </div>
        )}
      </form>
      
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-800">Account Security</h3>
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="text-green-600 hover:text-green-800 font-medium"
          >
            {showPasswordForm ? 'Cancel' : 'Change Password'}
          </button>
        </div>
        
        {showPasswordForm && (
          <ChangePasswordForm />
        )}
      </div>
    </div>
  );
};

export default ProfilePage;