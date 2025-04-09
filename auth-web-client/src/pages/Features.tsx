import React from 'react';

interface FeatureProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  comingSoon?: boolean;
}

const Feature: React.FC<FeatureProps> = ({ title, description, icon, comingSoon = false }) => {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:bg-slate-700 transition duration-300">
      <div className="mb-4 text-indigo-400">{icon}</div>
      <h3 className="text-lg font-medium text-white mb-2 flex items-center">
        {title}
        {comingSoon && (
          <span className="ml-2 text-xs bg-indigo-900 text-indigo-300 px-2 py-1 rounded-full">
            Coming Soon
          </span>
        )}
      </h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
};

const Features: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto pb-20">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-white mb-4">HyperBase Features</h1>
        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          Powerful data management features to help you build better applications
        </p>
      </div>

      <div className="mb-16">
        <h2 className="text-2xl font-bold text-white mb-6 border-b border-slate-700 pb-2">
          Core Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Feature
            title="Collections Management"
            description="Create, organize, and manage collections of documents with intuitive tools."
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
            </svg>}
          />
          
          <Feature
            title="Schema Validation"
            description="Define and enforce schemas to maintain data quality and consistency."
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>}
          />
          
          <Feature
            title="Document CRUD"
            description="Easily create, read, update, and delete documents with our intuitive interface."
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
              <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
            </svg>}
          />
          
          <Feature
            title="Role-Based Permissions"
            description="Control access to your data with customizable role-based permissions."
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>}
          />
          
          <Feature
            title="Realtime Sync"
            description="Keep your data in sync across clients with realtime updates."
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>}
          />
          
          <Feature
            title="Query Builder"
            description="Build complex queries with our intuitive visual query builder."
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
            </svg>}
          />
        </div>
      </div>

      <div className="mb-16">
        <h2 className="text-2xl font-bold text-white mb-6 border-b border-slate-700 pb-2">
          Coming Soon
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Feature
            title="Data Relationships"
            description="Define and enforce relationships between collections with support for joins and cascading operations."
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>}
            comingSoon={true}
          />
          
          <Feature
            title="Analytics Dashboard"
            description="Gain insights into your data with visualizations, metrics, and performance statistics."
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>}
            comingSoon={true}
          />
          
          <Feature
            title="Backup & Recovery"
            description="Schedule automated backups and restore to any point in time with ease."
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>}
            comingSoon={true}
          />
          
          <Feature
            title="Webhooks"
            description="Integrate with external services using customizable event-based webhooks."
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
              <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
            </svg>}
            comingSoon={true}
          />
          
          <Feature
            title="Offline Capabilities"
            description="Work offline with local data caching and seamless sync when connection is restored."
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 3.636a1 1 0 010 1.414 7 7 0 000 9.9 1 1 0 11-1.414 1.414 9 9 0 010-12.728 1 1 0 011.414 0zm9.9 0a1 1 0 011.414 0 9 9 0 010 12.728 1 1 0 11-1.414-1.414 7 7 0 000-9.9 1 1 0 010-1.414zM7.879 6.464a1 1 0 010 1.414 3 3 0 000 4.243 1 1 0 11-1.415 1.414 5 5 0 010-7.07 1 1 0 011.415 0zm4.242 0a1 1 0 011.415 0 5 5 0 010 7.072 1 1 0 01-1.415-1.415 3 3 0 000-4.242 1 1 0 010-1.415zM10 9a1 1 0 011 1v.01a1 1 0 11-2 0V10a1 1 0 011-1z" clipRule="evenodd" />
            </svg>}
            comingSoon={true}
          />
          
          <Feature
            title="AI-Powered Insights"
            description="Leverage artificial intelligence for data enrichment, anomaly detection, and predictive analytics."
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
            </svg>}
            comingSoon={true}
          />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-white mb-6 border-b border-slate-700 pb-2">
          Enterprise Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Feature
            title="Advanced Access Control"
            description="Field-level permissions, time-based access, and API key management for enterprise security needs."
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>}
            comingSoon={true}
          />
          
          <Feature
            title="Audit Logging"
            description="Comprehensive audit trails of all operations for compliance and security monitoring."
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>}
            comingSoon={true}
          />
          
          <Feature
            title="Performance Optimizations"
            description="Collection indexing, query optimization, and advanced caching strategies for enterprise-scale applications."
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>}
            comingSoon={true}
          />
        </div>
      </div>

      <div className="mt-16 bg-slate-800 border border-slate-700 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Ready to get started?</h2>
        <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
          Start building with HyperBase today and experience the power of a modern database platform
          designed for developers.
        </p>
        <div className="flex justify-center space-x-4">
          <button className="btn-primary text-lg px-8 py-3">Sign Up Free</button>
          <button className="btn-secondary text-lg px-8 py-3">View Documentation</button>
        </div>
      </div>
    </div>
  );
};

export default Features; 