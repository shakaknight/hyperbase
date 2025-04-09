import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';
import { useOrganizationStore } from '../stores/organizationStore';
import { Link } from 'react-router-dom';

interface Session {
  id: string;
  ip_address: string;
  user_agent: string;
  created_at: string;
  expires_at: string;
}

interface DatabaseStats {
  collections: number;
  documents: number;
  storage: number;
  queries: number;
}

interface ActivityItem {
  id: string;
  action: string;
  details: string;
  timestamp: string;
}

const Dashboard = () => {
  const { user, token } = useAuthStore();
  const { organizations, projects, currentOrganizationId, currentProjectId } = useOrganizationStore();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaSetupData, setMfaSetupData] = useState<{ secret: string; otpauth: string } | null>(null);
  const [mfaCode, setMfaCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Added stats for the enhanced dashboard
  const [dbStats, setDbStats] = useState<DatabaseStats>({
    collections: 0,
    documents: 0,
    storage: 0,
    queries: 0
  });
  
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Onboarding state
  const [showCreateOrgModal, setShowCreateOrgModal] = useState(false);
  const [showCreateProjectModal, setShowCreateProjectModal] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  
  useEffect(() => {
    fetchSessions();
    checkMfaStatus();
    // Simulated data for the demo
    fetchDatabaseStats();
    fetchRecentActivity();
  }, []);
  
  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/auth/sessions', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSessions(response.data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const checkMfaStatus = async () => {
    try {
      const response = await axios.get('/api/auth/mfa/status', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setMfaEnabled(response.data.enabled);
    } catch (error) {
      console.error('Error checking MFA status:', error);
    }
  };
  
  const terminateSession = async (sessionId: string) => {
    try {
      await axios.delete(`/api/auth/sessions/${sessionId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Refresh the sessions list
      fetchSessions();
    } catch (error) {
      console.error('Error terminating session:', error);
    }
  };
  
  const setupMfa = async () => {
    try {
      setError(null);
      const response = await axios.post('/api/auth/mfa/enable', {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setMfaSetupData(response.data);
    } catch (error) {
      console.error('Error setting up MFA:', error);
      setError('Failed to setup MFA.');
    }
  };
  
  const verifyMfa = async () => {
    try {
      setError(null);
      await axios.post('/api/auth/mfa/verify', { code: mfaCode }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setMfaEnabled(true);
      setMfaSetupData(null);
      setMfaCode('');
    } catch (error) {
      console.error('Error verifying MFA code:', error);
      setError('Invalid verification code.');
    }
  };
  
  const disableMfa = async () => {
    try {
      setError(null);
      await axios.post('/api/auth/mfa/disable', {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setMfaEnabled(false);
    } catch (error) {
      console.error('Error disabling MFA:', error);
      setError('Failed to disable MFA.');
    }
  };
  
  // Simulated database stats
  const fetchDatabaseStats = () => {
    // This would be a real API call in a production app
    setDbStats({
      collections: 7,
      documents: 1243,
      storage: 28.4,
      queries: 8432
    });
  };
  
  // Simulated activity data
  const fetchRecentActivity = () => {
    // This would be a real API call in a production app
    setActivities([
      {
        id: '1',
        action: 'Document Created',
        details: 'Added new document to users collection',
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString()
      },
      {
        id: '2',
        action: 'Query Executed',
        details: 'SELECT * FROM products WHERE category = "electronics"',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString()
      },
      {
        id: '3',
        action: 'Collection Created',
        details: 'Created new collection: orders',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString()
      },
      {
        id: '4',
        action: 'Document Updated',
        details: 'Updated document in products collection',
        timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString()
      }
    ]);
  };
  
  const formatTimeAgo = (timestamp: string) => {
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    
    return Math.floor(seconds) + ' seconds ago';
  };

  // Organization and project creation handlers
  const handleCreateOrg = () => {
    if (!newOrgName.trim()) return;
    
    const newOrg = {
      id: `org-${Date.now()}`,
      name: newOrgName,
      createdAt: new Date().toISOString(),
      ownerId: 'current-user' // In a real app, this would be the user ID
    };
    
    useOrganizationStore.getState().addOrganization(newOrg);
    useOrganizationStore.getState().setCurrentOrganization(newOrg.id);
    setNewOrgName('');
    setShowCreateOrgModal(false);
    setShowCreateProjectModal(true);
  };

  const handleCreateProject = () => {
    if (!newProjectName.trim() || !currentOrganizationId) return;
    
    const newProject = {
      id: `proj-${Date.now()}`,
      name: newProjectName,
      createdAt: new Date().toISOString(),
      organizationId: currentOrganizationId
    };
    
    useOrganizationStore.getState().addProject(newProject);
    useOrganizationStore.getState().setCurrentProject(newProject.id);
    setNewProjectName('');
    setShowCreateProjectModal(false);
  };

  // Render empty state when no organization or project is selected
  const renderEmptyState = () => {
    if (organizations.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full py-20">
          <div className="bg-[#212121] border border-[#303030] rounded-lg p-12 max-w-md w-full text-center">
            <svg className="w-16 h-16 mx-auto text-[#505050] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h2 className="text-xl font-bold text-white mb-2">Create your first organization</h2>
            <p className="text-[#ABABAB] mb-6">Get started by creating an organization to manage your projects and resources.</p>
            <button
              onClick={() => setShowCreateOrgModal(true)}
              className="px-4 py-2 bg-[#3ECF8E] text-[#1A1A1A] text-sm font-medium rounded hover:bg-[#30BA7D]"
            >
              Create Organization
            </button>
          </div>
        </div>
      );
    }
    
    if (currentOrganizationId && projects.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full py-20">
          <div className="bg-[#212121] border border-[#303030] rounded-lg p-12 max-w-md w-full text-center">
            <svg className="w-16 h-16 mx-auto text-[#505050] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h2 className="text-xl font-bold text-white mb-2">Create your first project</h2>
            <p className="text-[#ABABAB] mb-6">Start by creating a project to organize your database tables and collections.</p>
            <button
              onClick={() => setShowCreateProjectModal(true)}
              className="px-4 py-2 bg-[#3ECF8E] text-[#1A1A1A] text-sm font-medium rounded hover:bg-[#30BA7D]"
            >
              Create Project
            </button>
          </div>
        </div>
      );
    }
    
    if (!currentProjectId) {
      return (
        <div className="flex flex-col items-center justify-center h-full py-20">
          <div className="bg-[#212121] border border-[#303030] rounded-lg p-12 max-w-md w-full text-center">
            <svg className="w-16 h-16 mx-auto text-[#505050] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
            </svg>
            <h2 className="text-xl font-bold text-white mb-2">Select a project</h2>
            <p className="text-[#ABABAB] mb-6">Please select a project from the navigation to view its dashboard.</p>
            <Link to="/organizations" className="px-4 py-2 bg-[#303030] text-white text-sm font-medium rounded hover:bg-[#404040]">
              Go to Projects
            </Link>
          </div>
        </div>
      );
    }
    
    return null;
  };

  // Modal for creating new organization
  const renderCreateOrgModal = () => {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60">
        <div className="bg-[#212121] border border-[#303030] rounded-lg p-6 w-full max-w-md">
          <h3 className="text-xl font-bold text-white mb-4">Create New Organization</h3>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleCreateOrg();
          }}>
            <div className="mb-4">
              <label htmlFor="org-name" className="block text-sm font-medium text-[#ABABAB] mb-1">
                Organization Name
              </label>
              <input
                id="org-name"
                type="text"
                value={newOrgName}
                onChange={(e) => setNewOrgName(e.target.value)}
                className="w-full bg-[#181818] border border-[#303030] rounded-md py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-[#3ECF8E] focus:border-[#3ECF8E]"
                placeholder="Enter organization name"
                required
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowCreateOrgModal(false)}
                className="px-4 py-2 bg-transparent border border-[#303030] text-white text-sm font-medium rounded hover:bg-[#252525]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#3ECF8E] text-[#1A1A1A] text-sm font-medium rounded hover:bg-[#30BA7D]"
                disabled={!newOrgName.trim()}
              >
                Create
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Modal for creating new project
  const renderCreateProjectModal = () => {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-60">
        <div className="bg-[#212121] border border-[#303030] rounded-lg p-6 w-full max-w-md">
          <h3 className="text-xl font-bold text-white mb-4">Create New Project</h3>
          <form onSubmit={(e) => {
            e.preventDefault();
            handleCreateProject();
          }}>
            <div className="mb-4">
              <label htmlFor="project-name" className="block text-sm font-medium text-[#ABABAB] mb-1">
                Project Name
              </label>
              <input
                id="project-name"
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="w-full bg-[#181818] border border-[#303030] rounded-md py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-[#3ECF8E] focus:border-[#3ECF8E]"
                placeholder="Enter project name"
                required
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowCreateProjectModal(false)}
                className="px-4 py-2 bg-transparent border border-[#303030] text-white text-sm font-medium rounded hover:bg-[#252525]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#3ECF8E] text-[#1A1A1A] text-sm font-medium rounded hover:bg-[#30BA7D]"
                disabled={!newProjectName.trim()}
              >
                Create
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Render overview tab
  const renderOverviewTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#212121] border border-[#303030] rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[#ABABAB] text-sm font-medium">Collections</h3>
            <svg className="w-5 h-5 text-[#3ECF8E]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
          </div>
          <div className="text-2xl font-bold text-white">{dbStats.collections}</div>
        </div>
        
        <div className="bg-[#212121] border border-[#303030] rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[#ABABAB] text-sm font-medium">Documents</h3>
            <svg className="w-5 h-5 text-[#3ECF8E]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="text-2xl font-bold text-white">{dbStats.documents}</div>
        </div>
        
        <div className="bg-[#212121] border border-[#303030] rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[#ABABAB] text-sm font-medium">Storage Used</h3>
            <svg className="w-5 h-5 text-[#3ECF8E]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
          </div>
          <div className="text-2xl font-bold text-white">{dbStats.storage} MB</div>
        </div>
        
        <div className="bg-[#212121] border border-[#303030] rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[#ABABAB] text-sm font-medium">Queries</h3>
            <svg className="w-5 h-5 text-[#3ECF8E]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="text-2xl font-bold text-white">{dbStats.queries}</div>
        </div>
      </div>
      
      <div className="bg-[#212121] border border-[#303030] rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-[#303030]">
          <h3 className="text-white font-medium">Recent Activity</h3>
        </div>
        <div className="divide-y divide-[#303030]">
          {activities.length > 0 ? (
            activities.map(activity => (
              <div key={activity.id} className="px-6 py-4">
                <div className="flex justify-between">
                  <div>
                    <h4 className="text-white font-medium">{activity.action}</h4>
                    <p className="text-[#8F8F8F] text-sm mt-1">{activity.details}</p>
                  </div>
                  <div className="text-[#707070] text-sm">
                    {formatTimeAgo(activity.timestamp)}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-4 text-center text-[#8F8F8F]">
              No recent activity
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#212121] border border-[#303030] rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-[#303030] flex justify-between items-center">
            <h3 className="text-white font-medium">Quick Actions</h3>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4">
            <Link 
              to="/explorer" 
              className="flex flex-col items-center p-4 bg-[#252525] rounded-lg hover:bg-[#303030] transition-colors"
            >
              <svg className="w-6 h-6 text-[#3ECF8E] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
              <span className="text-white text-sm">Explorer</span>
            </Link>
            <Link 
              to="/sql-manager" 
              className="flex flex-col items-center p-4 bg-[#252525] rounded-lg hover:bg-[#303030] transition-colors"
            >
              <svg className="w-6 h-6 text-[#3ECF8E] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              <span className="text-white text-sm">SQL Workbench</span>
            </Link>
            <Link 
              to="/analytics" 
              className="flex flex-col items-center p-4 bg-[#252525] rounded-lg hover:bg-[#303030] transition-colors"
            >
              <svg className="w-6 h-6 text-[#3ECF8E] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-white text-sm">Analytics</span>
            </Link>
            <Link 
              to="/settings" 
              className="flex flex-col items-center p-4 bg-[#252525] rounded-lg hover:bg-[#303030] transition-colors"
            >
              <svg className="w-6 h-6 text-[#3ECF8E] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-white text-sm">Settings</span>
            </Link>
          </div>
        </div>
        
        <div className="bg-[#212121] border border-[#303030] rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-[#303030]">
            <h3 className="text-white font-medium">Account Sessions</h3>
          </div>
          <div className="divide-y divide-[#303030]">
            {sessions.length > 0 ? (
              sessions.map(session => (
                <div key={session.id} className="px-6 py-4 flex justify-between items-center">
                  <div>
                    <div className="text-white text-sm">{session.user_agent}</div>
                    <div className="flex items-center mt-1">
                      <span className="text-[#8F8F8F] text-xs">IP: {session.ip_address}</span>
                      <span className="mx-2 text-[#505050]">•</span>
                      <span className="text-[#8F8F8F] text-xs">Created: {new Date(session.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => terminateSession(session.id)}
                    className="px-3 py-1 bg-transparent border border-[#404040] text-[#ABABAB] text-xs rounded hover:bg-[#303030] hover:text-white"
                  >
                    Terminate
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-[#8F8F8F]">
                No active sessions found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Render security tab
  const renderSecurityTab = () => (
    <div className="bg-[#212121] border border-[#303030] rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-[#303030]">
        <h3 className="text-white font-medium">Security Settings</h3>
      </div>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-white font-medium">Multi-Factor Authentication</h4>
            <p className="text-[#8F8F8F] text-sm mt-1">Add an extra layer of security to your account</p>
          </div>
          {mfaEnabled ? (
            <button 
              onClick={disableMfa}
              className="px-4 py-2 bg-transparent border border-[#303030] text-white text-sm font-medium rounded hover:bg-[#252525]"
            >
              Disable
            </button>
          ) : (
            <button 
              onClick={setupMfa}
              className="px-4 py-2 bg-[#3ECF8E] text-[#1A1A1A] text-sm font-medium rounded hover:bg-[#30BA7D]"
            >
              Enable
            </button>
          )}
        </div>
        
        {error && (
          <div className="bg-[#2D1A1A] border border-[#AA5A5A] text-[#FF9A9A] p-4 rounded-md text-sm">
            {error}
          </div>
        )}
        
        {mfaSetupData && (
          <div className="bg-[#1A1A2D] border border-[#5A5AAA] p-6 rounded-md">
            <h4 className="text-white font-medium mb-4">Setup MFA</h4>
            <div className="mb-4 flex justify-center">
              <img 
                src={mfaSetupData.otpauth} 
                alt="QR Code for MFA" 
                className="bg-white p-2 rounded-md"
              />
            </div>
            <p className="text-[#ABABAB] text-sm mb-4 text-center">
              Scan this QR code with your authenticator app, or manually enter the secret key:
            </p>
            <div className="bg-[#252525] p-2 rounded mb-4 text-center text-white font-mono">
              {mfaSetupData.secret}
            </div>
            <div className="mb-4">
              <label htmlFor="mfa-code" className="block text-sm font-medium text-[#ABABAB] mb-1">
                Verification Code
              </label>
              <input
                id="mfa-code"
                type="text"
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value)}
                className="w-full bg-[#181818] border border-[#303030] rounded-md py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-[#3ECF8E] focus:border-[#3ECF8E]"
                placeholder="Enter the 6-digit code"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setMfaSetupData(null)}
                className="px-4 py-2 bg-transparent border border-[#303030] text-white text-sm font-medium rounded hover:bg-[#252525]"
              >
                Cancel
              </button>
              <button
                onClick={verifyMfa}
                className="px-4 py-2 bg-[#3ECF8E] text-[#1A1A1A] text-sm font-medium rounded hover:bg-[#30BA7D]"
                disabled={mfaCode.length !== 6}
              >
                Verify
              </button>
            </div>
          </div>
        )}
        
        <div className="border-t border-[#303030] pt-6">
          <h4 className="text-white font-medium mb-4">Active Sessions</h4>
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3ECF8E] mx-auto"></div>
              </div>
            ) : sessions.length > 0 ? (
              sessions.map(session => (
                <div key={session.id} className="flex justify-between items-center p-4 bg-[#252525] rounded-md">
                  <div>
                    <div className="text-white text-sm">{session.user_agent}</div>
                    <div className="flex items-center mt-1">
                      <span className="text-[#8F8F8F] text-xs">IP: {session.ip_address}</span>
                      <span className="mx-2 text-[#505050]">•</span>
                      <span className="text-[#8F8F8F] text-xs">Created: {new Date(session.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => terminateSession(session.id)}
                    className="px-3 py-1 bg-transparent border border-[#404040] text-[#ABABAB] text-xs rounded hover:bg-[#303030] hover:text-white"
                  >
                    Terminate
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-[#8F8F8F]">
                No active sessions found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* If no org or project, show empty state */}
      {renderEmptyState()}
      
      {/* Dashboard content */}
      {currentProjectId && (
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-1">Dashboard</h1>
            <p className="text-[#8F8F8F]">Overview and metrics for your project</p>
          </div>
          
          <div className="mb-6">
            <div className="border-b border-[#303030]">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-3 border-b-2 text-sm font-medium ${
                    activeTab === 'overview'
                      ? 'border-[#3ECF8E] text-[#3ECF8E]'
                      : 'border-transparent text-[#8F8F8F] hover:text-[#ABABAB] hover:border-[#505050]'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('security')}
                  className={`py-3 border-b-2 text-sm font-medium ${
                    activeTab === 'security'
                      ? 'border-[#3ECF8E] text-[#3ECF8E]'
                      : 'border-transparent text-[#8F8F8F] hover:text-[#ABABAB] hover:border-[#505050]'
                  }`}
                >
                  Security
                </button>
              </nav>
            </div>
          </div>
          
          <div>
            {activeTab === 'overview' && renderOverviewTab()}
            {activeTab === 'security' && renderSecurityTab()}
          </div>
        </>
      )}
      
      {/* Modals */}
      {showCreateOrgModal && renderCreateOrgModal()}
      {showCreateProjectModal && renderCreateProjectModal()}
    </div>
  );
};

export default Dashboard; 