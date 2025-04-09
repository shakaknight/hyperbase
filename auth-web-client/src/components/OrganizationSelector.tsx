import React, { useState } from 'react';
import { Organization, Project, useOrganizationStore } from '../stores/organizationStore';

const OrganizationSelector: React.FC = () => {
  const {
    organizations,
    projects,
    currentOrganizationId,
    currentProjectId,
    setCurrentOrganization,
    setCurrentProject,
    getOrganizationProjects
  } = useOrganizationStore();

  const [showNewOrgForm, setShowNewOrgForm] = useState(false);
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [newOrgName, setNewOrgName] = useState('');
  const [newProjectName, setNewProjectName] = useState('');

  const currentOrg = organizations.find(org => org.id === currentOrganizationId);
  const orgProjects = currentOrganizationId 
    ? getOrganizationProjects(currentOrganizationId)
    : [];

  const handleAddOrg = () => {
    if (!newOrgName.trim()) return;
    
    const newOrg: Organization = {
      id: `org-${Date.now()}`,
      name: newOrgName,
      createdAt: new Date().toISOString(),
      ownerId: 'current-user'
    };
    
    useOrganizationStore.getState().addOrganization(newOrg);
    setCurrentOrganization(newOrg.id);
    setNewOrgName('');
    setShowNewOrgForm(false);
  };

  const handleAddProject = () => {
    if (!newProjectName.trim() || !currentOrganizationId) return;
    
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      name: newProjectName,
      createdAt: new Date().toISOString(),
      organizationId: currentOrganizationId
    };
    
    useOrganizationStore.getState().addProject(newProject);
    setCurrentProject(newProject.id);
    setNewProjectName('');
    setShowNewProjectForm(false);
  };

  return (
    <div className="flex items-center space-x-4">
      {/* Organization selector */}
      {showNewOrgForm ? (
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newOrgName}
            onChange={(e) => setNewOrgName(e.target.value)}
            placeholder="Organization name"
            className="bg-slate-700 text-white text-sm rounded border border-slate-600 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            onClick={handleAddOrg}
            disabled={!newOrgName.trim()}
            className="text-xs bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-2 py-1 rounded"
          >
            Create
          </button>
          <button
            onClick={() => setShowNewOrgForm(false)}
            className="text-xs text-gray-400 hover:text-gray-300"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex items-center">
          <div className="flex items-center text-xs text-gray-400 mr-2">Org:</div>
          <div className="relative">
            <select
              value={currentOrganizationId || ''}
              onChange={(e) => setCurrentOrganization(e.target.value)}
              className="block bg-slate-700 text-white rounded border border-slate-600 px-2 py-1 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {organizations.map(org => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <button
            onClick={() => setShowNewOrgForm(true)}
            className="ml-1 text-xs text-indigo-400 hover:text-indigo-300"
          >
            +
          </button>
        </div>
      )}

      {/* Project selector */}
      {showNewProjectForm ? (
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="Project name"
            className="bg-slate-700 text-white text-sm rounded border border-slate-600 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            onClick={handleAddProject}
            disabled={!newProjectName.trim()}
            className="text-xs bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-2 py-1 rounded"
          >
            Create
          </button>
          <button
            onClick={() => setShowNewProjectForm(false)}
            className="text-xs text-gray-400 hover:text-gray-300"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex items-center">
          <div className="flex items-center text-xs text-gray-400 mr-2">Project:</div>
          <div className="relative">
            <select
              value={currentProjectId || ''}
              onChange={(e) => setCurrentProject(e.target.value)}
              disabled={!currentOrganizationId || orgProjects.length === 0}
              className="block bg-slate-700 text-white rounded border border-slate-600 px-2 py-1 pr-8 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
            >
              {orgProjects.length === 0 ? (
                <option value="">No projects</option>
              ) : (
                orgProjects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))
              )}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          {currentOrganizationId && (
            <button
              onClick={() => setShowNewProjectForm(true)}
              className="ml-1 text-xs text-indigo-400 hover:text-indigo-300"
            >
              +
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default OrganizationSelector; 