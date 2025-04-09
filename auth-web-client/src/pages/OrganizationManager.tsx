import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useOrganizationStore, Organization, Project } from '../stores/organizationStore';
import { useAuthStore } from '../stores/authStore';
import Logo from '../components/Logo';

const OrganizationManager = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { 
    organizations, 
    projects, 
    currentOrganizationId, 
    addOrganization, 
    addProject,
    setCurrentOrganization, 
    setCurrentProject,
    getOrganizationProjects
  } = useOrganizationStore();
  
  const [newOrgName, setNewOrgName] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [showNewOrgForm, setShowNewOrgForm] = useState(false);
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState<string | null>(
    currentOrganizationId || (organizations.length > 0 ? organizations[0].id : null)
  );
  const [showAllProjects, setShowAllProjects] = useState(false);

  // If there are no organizations, show creation UI
  if (organizations.length === 0) {
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
              <form onSubmit={(e) => {
                e.preventDefault();
                
                // Create organization with a unique ID
                const newOrg = {
                  id: `org-${Date.now()}`,
                  name: newOrgName,
                  createdAt: new Date().toISOString(),
                  ownerId: user?.id ? String(user.id) : 'current-user'
                };
                
                // Add the organization to the store
                addOrganization(newOrg);
                
                // Set as current organization
                setCurrentOrganization(newOrg.id);
                
                // Navigate to project creation
                navigate('/project-setup');
              }} className="space-y-6">
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
                      value={newOrgName}
                      onChange={(e) => setNewOrgName(e.target.value)}
                      className="block w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <button
                    type="submit"
                    disabled={!newOrgName.trim()}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    Create Organization
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Handler for creating a new organization
  const handleCreateOrg = () => {
    if (!newOrgName.trim()) return;
    
    const newOrg: Organization = {
      id: `org-${Date.now()}`,
      name: newOrgName,
      createdAt: new Date().toISOString(),
      ownerId: user?.id ? String(user.id) : 'current-user'
    };
    
    addOrganization(newOrg);
    setNewOrgName('');
    setShowNewOrgForm(false);
  };

  // Handler for creating a new project
  const handleCreateProject = () => {
    if (!newProjectName.trim() || !selectedOrgId) return;
    
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: newProjectName,
      createdAt: new Date().toISOString(),
      organizationId: selectedOrgId
    };
    
    addProject(newProject);
    setCurrentProject(newProject.id);
    setNewProjectName('');
    setShowNewProjectForm(false);
    navigate('/dashboard');
  };

  // Handler for selecting a project and navigating to it
  const handleSelectProject = (projectId: string) => {
    setCurrentProject(projectId);
    navigate('/dashboard');
  };

  const selectedOrg = organizations.find(org => org.id === selectedOrgId);
  const orgProjects = showAllProjects 
    ? projects 
    : (selectedOrgId ? getOrganizationProjects(selectedOrgId) : []);

  const handleShowAllProjects = () => {
    setShowAllProjects(true);
    setSelectedOrgId(null);
  };

  return (
    <div className="min-h-screen flex bg-[#1A1A1A]">
      {/* Left sidebar */}
      <div className="w-64 bg-[#181818] border-r border-[#303030] flex-shrink-0 fixed h-full overflow-y-auto">
        <div className="h-16 border-b border-[#303030] flex items-center px-4">
          <Link to="/" className="flex items-center">
            <Logo compact={false} />
          </Link>
        </div>
        
        <div className="p-5">
          <h2 className="text-xs font-semibold text-[#8F8F8F] uppercase tracking-wider mb-3">Projects</h2>
          <button 
            onClick={handleShowAllProjects}
            className={`w-full text-left flex items-center px-3 py-2 rounded-md ${
              showAllProjects ? 'bg-[#303030] text-white' : 'text-[#ABABAB] hover:bg-[#252525] hover:text-white'
            } mb-1 text-sm`}
          >
            All projects
          </button>
          
          <h2 className="text-xs font-semibold text-[#8F8F8F] uppercase tracking-wider mb-3 mt-7">Organizations</h2>
          {organizations.map(org => (
            <button
              key={org.id}
              onClick={() => {
                setSelectedOrgId(org.id);
                setShowAllProjects(false);
              }}
              className={`w-full text-left flex items-center px-3 py-2 rounded-md ${
                selectedOrgId === org.id && !showAllProjects ? 'bg-[#303030] text-white' : 'text-[#ABABAB] hover:bg-[#252525] hover:text-white'
              } mb-1 text-sm`}
            >
              {org.name}
            </button>
          ))}
          
          <div className="mt-7 border-t border-[#303030] pt-6">
            <Link 
              to="/account"
              className="flex items-center px-3 py-2 rounded-md text-[#ABABAB] hover:bg-[#252525] hover:text-white mb-1 text-sm"
            >
              Account
            </Link>
            <Link 
              to="/settings"
              className="flex items-center px-3 py-2 rounded-md text-[#ABABAB] hover:bg-[#252525] hover:text-white mb-1 text-sm"
            >
              Preferences
            </Link>
            <Link 
              to="/settings/tokens"
              className="flex items-center px-3 py-2 rounded-md text-[#ABABAB] hover:bg-[#252525] hover:text-white mb-1 text-sm"
            >
              Access Tokens
            </Link>
            <Link 
              to="/settings/security"
              className="flex items-center px-3 py-2 rounded-md text-[#ABABAB] hover:bg-[#252525] hover:text-white mb-1 text-sm"
            >
              Security
            </Link>
            <Link 
              to="/settings/logs"
              className="flex items-center px-3 py-2 rounded-md text-[#ABABAB] hover:bg-[#252525] hover:text-white mb-1 text-sm"
            >
              Audit Logs
            </Link>
          </div>
          
          <div className="mt-7 border-t border-[#303030] pt-6">
            <Link 
              to="/docs"
              className="flex items-center px-3 py-2 rounded-md text-[#ABABAB] hover:bg-[#252525] hover:text-white mb-1 text-sm"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Documentation
            </Link>
            <Link 
              to="/guides"
              className="flex items-center px-3 py-2 rounded-md text-[#ABABAB] hover:bg-[#252525] hover:text-white mb-1 text-sm"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Guides
            </Link>
            <Link 
              to="/api"
              className="flex items-center px-3 py-2 rounded-md text-[#ABABAB] hover:bg-[#252525] hover:text-white mb-1 text-sm"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              API Reference
            </Link>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="ml-64 flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Top bar */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center">
              <button
                onClick={() => setShowNewProjectForm(true)}
                className="px-4 py-2 bg-[#3ECF8E] text-[#1A1A1A] font-medium text-sm rounded hover:bg-[#30BA7D] mr-3"
              >
                New project
              </button>
              <button
                onClick={() => setShowNewOrgForm(true)}
                className="px-4 py-2 border border-[#3C3C3C] bg-transparent text-white text-sm font-medium rounded hover:bg-[#252525]"
              >
                New organization
              </button>
            </div>
            <div className="relative w-72">
              <input
                type="text"
                placeholder="Search for a project"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#212121] border border-[#303030] rounded-md py-2 pl-10 pr-4 text-sm text-white placeholder-[#707070] focus:outline-none focus:ring-1 focus:ring-[#3ECF8E] focus:border-[#3ECF8E]"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-[#707070]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              <button className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <svg className="h-5 w-5 text-[#707070]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
                </svg>
              </button>
            </div>
          </div>
          
          {/* New organization form */}
          {showNewOrgForm && (
            <div className="bg-[#212121] border border-[#303030] rounded-lg p-5 mb-8">
              <h2 className="text-base font-medium text-white mb-4">Create new organization</h2>
              <div className="flex items-end space-x-4">
                <div className="flex-grow">
                  <label htmlFor="newOrgName" className="block text-sm font-medium text-[#ABABAB] mb-1">
                    Name
                  </label>
                  <input
                    id="newOrgName"
                    value={newOrgName}
                    onChange={(e) => setNewOrgName(e.target.value)}
                    placeholder="Organization name"
                    className="w-full bg-[#181818] border border-[#303030] rounded-md py-2 px-3 text-white"
                  />
                </div>
                <button
                  onClick={handleCreateOrg}
                  disabled={!newOrgName.trim()}
                  className="px-4 py-2 bg-[#3ECF8E] text-[#1A1A1A] font-medium text-sm rounded hover:bg-[#30BA7D] disabled:opacity-50"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowNewOrgForm(false)}
                  className="px-4 py-2 bg-[#252525] text-white text-sm font-medium rounded hover:bg-[#303030]"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          
          {/* New project form */}
          {showNewProjectForm && (
            <div className="bg-[#212121] border border-[#303030] rounded-lg p-5 mb-8">
              <h2 className="text-base font-medium text-white mb-4">Create new project</h2>
              <div className="flex items-end space-x-4">
                <div className="flex-grow">
                  <label htmlFor="newProjectName" className="block text-sm font-medium text-[#ABABAB] mb-1">
                    Name
                  </label>
                  <input
                    id="newProjectName"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    placeholder="Project name"
                    className="w-full bg-[#181818] border border-[#303030] rounded-md py-2 px-3 text-white"
                  />
                </div>
                <button
                  onClick={handleCreateProject}
                  disabled={!newProjectName.trim()}
                  className="px-4 py-2 bg-[#3ECF8E] text-[#1A1A1A] font-medium text-sm rounded hover:bg-[#30BA7D] disabled:opacity-50"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowNewProjectForm(false)}
                  className="px-4 py-2 bg-[#252525] text-white text-sm font-medium rounded hover:bg-[#303030]"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
          
          {/* Organization header and projects */}
          <div>
            <h2 className="text-xl font-bold text-white mb-6">{showAllProjects ? 'All Projects' : selectedOrg?.name || 'Select an Organization'}</h2>
            
            {orgProjects.length === 0 ? (
              <div className="bg-[#212121] border border-[#303030] rounded-lg p-20 flex flex-col items-center justify-center">
                <svg className="h-12 w-12 text-[#505050] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                <p className="text-[#ABABAB] mb-6">No projects yet</p>
                <button
                  onClick={() => setShowNewProjectForm(true)}
                  className="px-4 py-2 bg-[#3ECF8E] text-[#1A1A1A] font-medium text-sm rounded hover:bg-[#30BA7D]"
                >
                  Create a new project
                </button>
              </div>
            ) : (
              <div>
                {orgProjects.map((project) => (
                  <div 
                    key={project.id}
                    onClick={() => handleSelectProject(project.id)}
                    className="bg-[#212121] border border-[#303030] rounded-lg p-4 mb-3 cursor-pointer hover:border-[#505050] transition-colors"
                  >
                    <div className="flex items-center">
                      <div>
                        <h3 className="font-medium text-white text-base">{project.name}</h3>
                        <div className="text-[#8F8F8F] text-xs mt-1">aws | {project.region || 'us-east-1'}</div>
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#252525] text-[#ABABAB]">
                            NANO
                          </span>
                        </div>
                      </div>
                      <svg className="h-5 w-5 text-[#707070] ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Pagination (simplified) */}
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-[#8F8F8F]">
              Projects per page: 
              <select className="ml-2 bg-[#212121] border border-[#303030] rounded px-2 py-1 text-white">
                <option>6</option>
                <option>12</option>
                <option>24</option>
              </select>
              <span className="ml-4">Total results: {orgProjects.length}</span>
            </div>
            <div className="flex space-x-1">
              <button className="px-3 py-1 rounded bg-[#212121] border border-[#303030] text-[#8F8F8F]">
                Prev
              </button>
              <button className="px-3 py-1 rounded bg-[#303030] border border-[#404040] text-white">
                1
              </button>
              <button className="px-3 py-1 rounded bg-[#212121] border border-[#303030] text-[#8F8F8F]">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationManager; 