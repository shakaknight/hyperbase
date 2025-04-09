import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import Logo from './Logo';
import OrganizationSelector from './OrganizationSelector';

const Layout = () => {
  const { isAuthenticated, logout, user } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  
  // Handle screen size changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Set initial state based on screen size
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen flex bg-[#1A1A1A]">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-[#181818] border-r border-[#303030] flex-shrink-0 transition-all duration-300 fixed h-full z-20 flex flex-col`}>
        <div className="h-16 border-b border-[#303030] flex items-center justify-center px-4">
          <Link to={isAuthenticated ? "/organizations" : "/"} className="flex items-center">
            <Logo compact={!isSidebarOpen} />
          </Link>
        </div>
        
        {isAuthenticated && (
          <div className="mt-6 flex-shrink-0">
            <nav className="px-4 space-y-1">
              <Link 
                to="/dashboard" 
                className={`flex items-center px-3 py-2 rounded-md ${
                  location.pathname === '/dashboard' 
                    ? 'bg-[#303030] text-white' 
                    : 'text-[#ABABAB] hover:bg-[#252525] hover:text-white'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                {isSidebarOpen && <span className="text-sm">Dashboard</span>}
              </Link>
              
              <Link 
                to="/explorer" 
                className={`flex items-center px-3 py-2 rounded-md ${
                  location.pathname === '/explorer' 
                    ? 'bg-[#303030] text-white' 
                    : 'text-[#ABABAB] hover:bg-[#252525] hover:text-white'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
                {isSidebarOpen && <span className="text-sm">Explorer</span>}
              </Link>
              
              <Link 
                to="/sql-manager" 
                className={`flex items-center px-3 py-2 rounded-md ${
                  location.pathname === '/sql-manager' || location.pathname === '/query'
                    ? 'bg-[#303030] text-white' 
                    : 'text-[#ABABAB] hover:bg-[#252525] hover:text-white'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                {isSidebarOpen && <span className="text-sm">SQL Workbench</span>}
              </Link>
              
              <Link 
                to="/analytics" 
                className={`flex items-center px-3 py-2 rounded-md ${
                  location.pathname === '/analytics' 
                    ? 'bg-[#303030] text-white' 
                    : 'text-[#ABABAB] hover:bg-[#252525] hover:text-white'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                {isSidebarOpen && <span className="text-sm">Analytics</span>}
              </Link>
              
              <Link 
                to="/settings" 
                className={`flex items-center px-3 py-2 rounded-md ${
                  location.pathname === '/settings' 
                    ? 'bg-[#303030] text-white' 
                    : 'text-[#ABABAB] hover:bg-[#252525] hover:text-white'
                }`}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {isSidebarOpen && <span className="text-sm">Settings</span>}
              </Link>
            </nav>
          </div>
        )}
        
        {isAuthenticated && (
          <div className="mt-auto pb-6 px-4">
            <button 
              onClick={() => logout()} 
              className="w-full flex items-center px-3 py-2 rounded-md text-[#ABABAB] hover:bg-[#252525] hover:text-white"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {isSidebarOpen && <span className="text-sm">Logout</span>}
            </button>
          </div>
        )}
        
        {!isAuthenticated && (
          <div className="mt-6 px-4 space-y-1">
            <Link 
              to="/login" 
              className={`flex items-center px-3 py-2 rounded-md ${
                location.pathname === '/login' 
                  ? 'bg-[#303030] text-white' 
                  : 'text-[#ABABAB] hover:bg-[#252525] hover:text-white'
              }`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              {isSidebarOpen && <span className="text-sm">Login</span>}
            </Link>
            
            <Link 
              to="/register" 
              className={`flex items-center px-3 py-2 rounded-md ${
                location.pathname === '/register' 
                  ? 'bg-[#303030] text-white' 
                  : 'text-[#ABABAB] hover:bg-[#252525] hover:text-white'
              }`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              {isSidebarOpen && <span className="text-sm">Register</span>}
            </Link>
          </div>
        )}
        
        {/* Sidebar toggle button */}
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-20 bg-[#303030] rounded-full p-1 border border-[#404040] text-[#ABABAB] hover:text-white"
        >
          {isSidebarOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </div>
      
      {/* Main content */}
      <div className={`flex-1 flex flex-col ${isSidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        {/* Header */}
        <header className="bg-[#181818] border-b border-[#303030] h-16 flex items-center px-6 sticky top-0 z-10">
          <div className="flex items-center justify-between w-full">
            {/* Organization and Project Selectors in the topbar */}
            {isAuthenticated && (
              <div className="flex-1 max-w-lg">
                <OrganizationSelector />
              </div>
            )}
            <div className="ml-auto">
              {isAuthenticated && user && (
                <div className="text-sm text-[#8F8F8F]">
                  Logged in as <span className="text-[#ABABAB]">{user.email}</span>
                </div>
              )}
            </div>
          </div>
        </header>
        
        {/* Page content */}
        <main className="flex-grow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            {isAuthenticated && location.pathname === '/explorer' && (
              <div className="mb-1">
                <h1 className="text-2xl font-bold text-white">
                  Database Explorer
                </h1>
              </div>
            )}
            {isAuthenticated && location.pathname === '/analytics' && (
              <div className="mb-1">
                <h1 className="text-2xl font-bold text-white">
                  Analytics
                </h1>
              </div>
            )}
            <Outlet />
          </div>
        </main>
        
        {/* Footer */}
        <footer className="bg-[#181818] border-t border-[#303030]">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p className="text-sm text-[#8F8F8F]">
                  &copy; {new Date().getFullYear()} HyperBase. All rights reserved.
                </p>
              </div>
              <div className="flex space-x-6">
                <a href="https://github.com" className="text-[#8F8F8F] hover:text-white" target="_blank" rel="noopener noreferrer">
                  <span className="sr-only">GitHub</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </a>
                <a href="https://twitter.com" className="text-[#8F8F8F] hover:text-white" target="_blank" rel="noopener noreferrer">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Layout; 