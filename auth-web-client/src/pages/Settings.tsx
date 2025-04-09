import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';

const Settings = () => {
  const { user, updateUser } = useAuthStore();
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Example implementation - replace with actual API call
      // await updateUser({ fullName: formData.fullName });
      
      setMessage({ text: 'Profile updated successfully', type: 'success' });
    } catch (error) {
      setMessage({ text: 'Failed to update profile', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ text: 'New passwords do not match', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Example implementation - replace with actual API call
      // await updatePassword(formData.currentPassword, formData.newPassword);
      
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      
      setMessage({ text: 'Password changed successfully', type: 'success' });
    } catch (error) {
      setMessage({ text: 'Failed to change password', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {message.text && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-800 text-green-100' : 'bg-red-800 text-red-100'}`}>
          {message.text}
        </div>
      )}
      
      <div className="bg-slate-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-white">Profile Information</h3>
          <div className="mt-2 max-w-xl text-sm text-gray-300">
            <p>Update your account's profile information.</p>
          </div>
          <form onSubmit={handleProfileUpdate} className="mt-5 sm:flex sm:items-end">
            <div className="w-full space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-300">
                  Full Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="fullName"
                    id="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-700 bg-slate-700 text-white rounded-md"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                  Email
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-700 bg-slate-700 text-white rounded-md"
                    disabled
                  />
                </div>
                <p className="mt-1 text-sm text-gray-400">
                  You cannot change your email address
                </p>
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
      
      <div className="bg-slate-800 shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-white">Change Password</h3>
          <div className="mt-2 max-w-xl text-sm text-gray-300">
            <p>Ensure your account is using a secure password.</p>
          </div>
          <form onSubmit={handlePasswordChange} className="mt-5 space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-300">
                Current Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  name="currentPassword"
                  id="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-700 bg-slate-700 text-white rounded-md"
                  required
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300">
                New Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  name="newPassword"
                  id="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-700 bg-slate-700 text-white rounded-md"
                  required
                  minLength={8}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300">
                Confirm Password
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-700 bg-slate-700 text-white rounded-md"
                  required
                />
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings; 