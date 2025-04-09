import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrganizationStore } from '../stores/organizationStore';
import { useAuthStore } from '../stores/authStore';
import Logo from '../components/Logo';

const OrganizationSetup = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { organizations, addOrganization, setCurrentOrganization } = useOrganizationStore();
  const [orgName, setOrgName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // If user already has organizations, redirect to dashboard
    if (organizations.length > 0) {
      navigate('/dashboard');
    }
  }, [organizations, navigate]);

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orgName.trim()) {
      setErrorMessage('Organization name is required');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setErrorMessage('');
      
      // Create organization with a unique ID
      const newOrg = {
        id: `org-${Date.now()}`,
        name: orgName,
        createdAt: new Date().toISOString(),
        ownerId: user?.id ? String(user.id) : 'current-user' // Convert number to string
      };
      
      // Add the organization to the store
      addOrganization(newOrg);
      
      // Set as current organization
      setCurrentOrganization(newOrg.id);
      
      // Navigate to project creation
      navigate('/project-setup');
    } catch (error) {
      console.error('Error creating organization:', error);
      setErrorMessage('Failed to create organization. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <header className="bg-slate-800 border-b border-slate-700 h-16 flex items-center px-6">
        <div className="flex items-center">
          <Logo compact={false} />
        </div>
        <div className="ml-auto">
          {user && (
            <div className="text-sm text-gray-400">
              <span className="text-gray-300">{user.email}</span>
            </div>
          )}
        </div>
      </header>
      
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white">
              Welcome to HyperBase
            </h2>
            <p className="mt-2 text-gray-400">
              Create a new organization to get started
            </p>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-8 shadow-lg">
            <form onSubmit={handleCreateOrganization} className="space-y-6">
              <div>
                <label htmlFor="organization-name" className="block text-sm font-medium text-gray-300">
                  Name
                </label>
                <div className="mt-1">
                  <input
                    id="organization-name"
                    name="organization-name"
                    type="text"
                    placeholder="Organization name"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="block w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="plan" className="block text-sm font-medium text-gray-300">
                  Plan
                </label>
                <div className="mt-1">
                  <select
                    id="plan"
                    name="plan"
                    className="block w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="free">Free</option>
                    <option value="startup">Startup</option>
                    <option value="business">Business</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>
                <p className="mt-2 text-sm text-gray-400">
                  For more details on our plans, visit our <a href="#" className="text-indigo-400 hover:text-indigo-300">pricing page</a>.
                </p>
              </div>
              
              {errorMessage && (
                <div className="text-red-500 text-sm">
                  {errorMessage}
                </div>
              )}
              
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting || !orgName.trim()}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Get started'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      
      <footer className="bg-slate-800 border-t border-slate-700">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm text-gray-400">
                &copy; {new Date().getFullYear()} HyperBase. All rights reserved.
              </p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-gray-300">
                <span className="sr-only">GitHub</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-300">
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default OrganizationSetup; 