import create from 'zustand';
import { persist } from 'zustand/middleware';

export interface Organization {
  id: string;
  name: string;
  createdAt: string;
  ownerId: string;
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  organizationId: string;
  region?: string;
  description?: string;
}

interface OrganizationState {
  organizations: Organization[];
  projects: Project[];
  currentOrganizationId: string | null;
  currentProjectId: string | null;
  
  // Actions
  addOrganization: (organization: Organization) => void;
  updateOrganization: (id: string, data: Partial<Organization>) => void;
  deleteOrganization: (id: string) => void;
  
  addProject: (project: Project) => void;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  
  setCurrentOrganization: (organizationId: string | null) => void;
  setCurrentProject: (projectId: string | null) => void;
  
  // Selectors
  getOrganizationProjects: (organizationId: string) => Project[];
  getCurrentOrganization: () => Organization | undefined;
  getCurrentProject: () => Project | undefined;
}

export const useOrganizationStore = create<OrganizationState>()(
  persist(
    (set, get) => ({
      organizations: [],
      projects: [],
      currentOrganizationId: null,
      currentProjectId: null,
      
      addOrganization: (organization) => {
        set((state) => ({
          organizations: [...state.organizations, organization],
        }));
      },
      
      updateOrganization: (id, data) => {
        set((state) => ({
          organizations: state.organizations.map((org) =>
            org.id === id ? { ...org, ...data } : org
          ),
        }));
      },
      
      deleteOrganization: (id) => {
        const state = get();
        // Remove projects belonging to this organization
        const updatedProjects = state.projects.filter(
          (project) => project.organizationId !== id
        );
        
        // Reset current organization if it was deleted
        const updatedCurrentOrgId = state.currentOrganizationId === id
          ? (state.organizations.length > 1 
              ? state.organizations.find(org => org.id !== id)?.id ?? null 
              : null)
          : state.currentOrganizationId;
        
        // Reset current project if it belonged to the deleted organization
        const currentProject = state.projects.find(p => p.id === state.currentProjectId);
        const updatedCurrentProjectId = currentProject && currentProject.organizationId === id
          ? null
          : state.currentProjectId;
        
        set({
          organizations: state.organizations.filter((org) => org.id !== id),
          projects: updatedProjects,
          currentOrganizationId: updatedCurrentOrgId,
          currentProjectId: updatedCurrentProjectId
        });
      },
      
      addProject: (project) => {
        set((state) => ({
          projects: [...state.projects, project],
        }));
      },
      
      updateProject: (id, data) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id ? { ...project, ...data } : project
          ),
        }));
      },
      
      deleteProject: (id) => {
        const state = get();
        
        // Reset current project if it was deleted
        const updatedCurrentProjectId = state.currentProjectId === id
          ? (state.projects.length > 1 
              ? state.projects.find(p => p.id !== id)?.id ?? null 
              : null)
          : state.currentProjectId;
        
        set({
          projects: state.projects.filter((project) => project.id !== id),
          currentProjectId: updatedCurrentProjectId
        });
      },
      
      setCurrentOrganization: (organizationId) => {
        const state = get();
        
        // When changing organization, we need to change the selected project too
        const projectsInNewOrg = organizationId 
          ? state.projects.filter(p => p.organizationId === organizationId)
          : [];
        
        const newCurrentProjectId = projectsInNewOrg.length > 0
          ? projectsInNewOrg[0].id
          : null;
        
        set({
          currentOrganizationId: organizationId,
          currentProjectId: newCurrentProjectId
        });
      },
      
      setCurrentProject: (projectId) => {
        set({ currentProjectId: projectId });
      },
      
      getOrganizationProjects: (organizationId) => {
        return get().projects.filter(
          (project) => project.organizationId === organizationId
        );
      },
      
      getCurrentOrganization: () => {
        const state = get();
        return state.organizations.find(
          (org) => org.id === state.currentOrganizationId
        );
      },
      
      getCurrentProject: () => {
        const state = get();
        return state.projects.find(
          (project) => project.id === state.currentProjectId
        );
      },
    }),
    {
      name: 'hyperbase-organization-storage',
    }
  )
); 