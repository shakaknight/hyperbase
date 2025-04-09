import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrganizationStore } from '../stores/organizationStore';
import { useAuthStore } from '../stores/authStore';
import Logo from '../components/Logo';

const ProjectSetup = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { 
    organizations, 
    projects, 
    currentOrganizationId, 
    addProject, 
    setCurrentProject 
  } = useOrganizationStore();
  
  const [projectName, setProjectName] = useState('');
  const [region, setRegion] = useState('us-east');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // If no organization is selected, redirect to organization setup
    if (!currentOrganizationId) {
      navigate('/organization-setup');
      return;
    }
    
    // If user already has projects, redirect to dashboard
    if (projects.length > 0) {
      navigate('/dashboard');
    }
  }, [currentOrganizationId, projects, navigate]);

  const currentOrganization = organizations.find(org => org.id === currentOrganizationId);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectName.trim()) {
      setErrorMessage('Project name is required');
      return;
    }
    
    if (!currentOrganizationId) {
      setErrorMessage('No organization selected');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setErrorMessage('');
      
      // Create project with a unique ID
      const newProject = {
        id: `proj-${Date.now()}`,
        name: projectName,
        region,
        createdAt: new Date().toISOString(),
        organizationId: currentOrganizationId
      };
      
      // Add the project to the store
      addProject(newProject);
      
      // Set as current project
      setCurrentProject(newProject.id);
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating project:', error);
      setErrorMessage('Failed to create project. Please try again.');
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
              Create a new project
            </h2>
            <p className="mt-2 text-gray-400">
              {currentOrganization ? `in ${currentOrganization.name}` : ''}
            </p>
          </div>
          
          <div className="bg-slate-800 rounded-lg p-8 shadow-lg">
            <form onSubmit={handleCreateProject} className="space-y-6">
              <div>
                <label htmlFor="project-name" className="block text-sm font-medium text-gray-300">
                  Name
                </label>
                <div className="mt-1">
                  <input
                    id="project-name"
                    name="project-name"
                    type="text"
                    placeholder="Project name"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    className="block w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="region" className="block text-sm font-medium text-gray-300">
                  Region
                </label>
                <p className="text-xs text-gray-400 mb-2">Choose a deployment region for your project</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div 
                    className={`flex flex-col items-center border ${region === 'us-east' ? 'border-indigo-500 bg-slate-700' : 'border-slate-600 bg-slate-750'} rounded-lg p-3 cursor-pointer hover:bg-slate-700`}
                    onClick={() => setRegion('us-east')}
                  >
                    <div className="w-10 h-10 flex items-center justify-center mb-2">
                      <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                      </svg>
                    </div>
                    <div className="text-sm text-center text-gray-300">US East</div>
                    <div className="text-xs text-gray-500">New York</div>
                  </div>
                  
                  <div 
                    className={`flex flex-col items-center border ${region === 'eu-central' ? 'border-indigo-500 bg-slate-700' : 'border-slate-600 bg-slate-750'} rounded-lg p-3 cursor-pointer hover:bg-slate-700`}
                    onClick={() => setRegion('eu-central')}
                  >
                    <div className="w-10 h-10 flex items-center justify-center mb-2">
                      <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                      </svg>
                    </div>
                    <div className="text-sm text-center text-gray-300">EU Central</div>
                    <div className="text-xs text-gray-500">Frankfurt</div>
                  </div>
                </div>
              </div>
              
              {errorMessage && (
                <div className="text-red-500 text-sm">
                  {errorMessage}
                </div>
              )}
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => navigate('/organization-setup')}
                  className="flex-1 py-2 px-4 border border-slate-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !projectName.trim()}
                  className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create'}
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

export default ProjectSetup; 