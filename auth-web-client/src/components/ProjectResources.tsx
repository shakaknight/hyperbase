import React from 'react';
import { useOrganizationStore } from '../stores/organizationStore';
import { Link } from 'react-router-dom';

const ProjectResources: React.FC = () => {
  const { currentProjectId } = useOrganizationStore();
  const currentProject = useOrganizationStore.getState().getCurrentProject();
  
  if (!currentProject) {
    return (
      <div className="p-4 text-center text-gray-400">
        Select a project to view resources
      </div>
    );
  }
  
  return (
    <div className="px-2">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-white">
          {currentProject.name}
        </h3>
        {currentProject.description && (
          <p className="text-sm text-gray-400">{currentProject.description}</p>
        )}
      </div>
      
      <div className="space-y-2">
        <Link to="/sql-manager" className="flex items-center justify-between p-2 text-gray-300 hover:bg-slate-700 hover:text-white rounded-md">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"></path>
            </svg>
            <span>SQL Tables</span>
          </div>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </Link>
        
        <Link to="/explorer" className="flex items-center justify-between p-2 text-gray-300 hover:bg-slate-700 hover:text-white rounded-md">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
            </svg>
            <span>Collections</span>
          </div>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </Link>

        <Link to="/analytics" className="flex items-center justify-between p-2 text-gray-300 hover:bg-slate-700 hover:text-white rounded-md">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
            </svg>
            <span>Analytics</span>
          </div>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default ProjectResources; 