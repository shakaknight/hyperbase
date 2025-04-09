import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './stores/authStore';
import { useOrganizationStore } from './stores/organizationStore';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import Explorer from './pages/Explorer';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Features from './pages/Features';
import SqlWorkbench from './pages/SqlWorkbench';
import OrganizationSetup from './pages/OrganizationSetup';
import ProjectSetup from './pages/ProjectSetup';
import OrganizationManager from './pages/OrganizationManager';

function App() {
  const { checkAuth, isAuthenticated, loading } = useAuthStore();
  const { organizations, projects } = useOrganizationStore();
  
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  
  // Helper to determine where to redirect a newly authenticated user
  const getAuthenticatedRedirect = () => {
    if (organizations.length === 0) {
      return <Navigate to="/organization-setup" />;
    } else if (projects.length === 0) {
      return <Navigate to="/project-setup" />;
    } else {
      return <Navigate to="/dashboard" />;
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <Routes>
      {/* Landing page as the root route - redirect to organization setup if authenticated */}
      <Route index element={!isAuthenticated ? <LandingPage /> : getAuthenticatedRedirect()} />
      
      {/* Features page - publicly accessible */}
      <Route path="features" element={<Features />} />
      
      {/* Organization Manager - accessible when logged in */}
      <Route 
        path="organizations" 
        element={
          <ProtectedRoute>
            <OrganizationManager />
          </ProtectedRoute>
        } 
      />
      
      {/* Onboarding routes - standalone without layout */}
      <Route 
        path="organization-setup" 
        element={
          <ProtectedRoute>
            {organizations.length === 0 ? <OrganizationSetup /> : <Navigate to="/organizations" />}
          </ProtectedRoute>
        } 
      />
      <Route 
        path="project-setup" 
        element={
          <ProtectedRoute>
            {organizations.length > 0 && projects.length === 0 ? <ProjectSetup /> : <Navigate to="/dashboard" />}
          </ProtectedRoute>
        } 
      />
      
      {/* Auth and app routes under Layout */}
      <Route element={<Layout />}>
        <Route path="login" element={isAuthenticated ? getAuthenticatedRedirect() : <Login />} />
        <Route path="register" element={isAuthenticated ? getAuthenticatedRedirect() : <Register />} />
        <Route 
          path="dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="explorer" 
          element={
            <ProtectedRoute>
              {organizations.length === 0 ? <Navigate to="/organization-setup" /> : 
               projects.length === 0 ? <Navigate to="/project-setup" /> : <Explorer />}
            </ProtectedRoute>
          } 
        />
        <Route 
          path="query" 
          element={
            <ProtectedRoute>
              {organizations.length === 0 ? <Navigate to="/organization-setup" /> : 
               projects.length === 0 ? <Navigate to="/project-setup" /> : <SqlWorkbench />}
            </ProtectedRoute>
          } 
        />
        <Route 
          path="analytics" 
          element={
            <ProtectedRoute>
              {organizations.length === 0 ? <Navigate to="/organization-setup" /> : 
               projects.length === 0 ? <Navigate to="/project-setup" /> : <Analytics />}
            </ProtectedRoute>
          } 
        />
        <Route 
          path="sql-manager" 
          element={
            <ProtectedRoute>
              {organizations.length === 0 ? <Navigate to="/organization-setup" /> : 
               projects.length === 0 ? <Navigate to="/project-setup" /> : <SqlWorkbench />}
            </ProtectedRoute>
          } 
        />
        <Route 
          path="settings" 
          element={
            <ProtectedRoute>
              {organizations.length === 0 ? <Navigate to="/organization-setup" /> : 
               projects.length === 0 ? <Navigate to="/project-setup" /> : <Settings />}
            </ProtectedRoute>
          } 
        />
      </Route>
      
      {/* Fallback route */}
      <Route path="*" element={isAuthenticated ? getAuthenticatedRedirect() : <Navigate to="/" />} />
    </Routes>
  );
}

export default App; 