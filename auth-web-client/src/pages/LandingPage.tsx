import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div className="bg-slate-900 min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 to-slate-900/90"></div>
          <div className="absolute inset-y-0 right-0 w-1/2 bg-slate-900/90"></div>
        </div>
        
        <div className="relative">
          <header className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                  HyperBase
                </span>
              </div>
              <nav className="hidden md:flex space-x-10 items-center">
                <a href="#features" className="text-gray-300 hover:text-white transition-colors">
                  Features
                </a>
                <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">
                  Pricing
                </a>
                <a href="#docs" className="text-gray-300 hover:text-white transition-colors">
                  Documentation
                </a>
                <Link to="/login" className="text-gray-300 hover:text-white transition-colors">
                  Sign in
                </Link>
                <Link to="/register" className="btn-primary">
                  Get Started
                </Link>
              </nav>
              {/* Mobile menu button */}
              <div className="md:hidden">
                <button className="text-gray-400 hover:text-white">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </header>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-6">
                <h1 className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl">
                  <span className="block">Modern database</span>
                  <span className="block text-indigo-400">for modern applications</span>
                </h1>
                <p className="mt-6 text-xl text-gray-300">
                  Build scalable applications with our powerful, easy-to-use database platform.
                  HyperBase provides everything you need to create, deploy, and scale your data layer.
                </p>
                <div className="mt-10 flex items-center gap-x-6">
                  <Link to="/register" className="btn-primary px-8 py-3 text-base">
                    Start for free
                  </Link>
                  <a href="#docs" className="text-base font-medium text-white hover:text-indigo-400">
                    Learn more <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>
              <div className="mt-12 lg:mt-0 lg:col-span-6">
                <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-700">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="text-xs text-gray-400">HyperBase Console</div>
                    <div className="w-4"></div>
                  </div>
                  <div className="p-4 font-mono text-sm text-green-400 bg-slate-900">
                    <p>$ hyperbase init my-project</p>
                    <p className="opacity-80">Initializing project...</p>
                    <p className="opacity-80">Creating database...</p>
                    <p className="opacity-80">Setting up authentication...</p>
                    <p>✓ Project ready!</p>
                    <p>$ </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Features Section */}
      <div id="features" className="py-24 bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Everything you need to build powerful applications
            </h2>
            <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
              HyperBase provides a complete set of tools to help you build, deploy, and scale your applications quickly and efficiently.
            </p>
          </div>
          
          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
              <div className="w-12 h-12 bg-indigo-900/50 flex items-center justify-center rounded-md mb-4">
                <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Real-time Database</h3>
              <p className="mt-2 text-gray-400">
                Get instant updates across all connected clients with our powerful real-time database engine.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
              <div className="w-12 h-12 bg-indigo-900/50 flex items-center justify-center rounded-md mb-4">
                <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Authentication</h3>
              <p className="mt-2 text-gray-400">
                Secure your application with our built-in authentication system. Support for email, social logins, and 2FA.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
              <div className="w-12 h-12 bg-indigo-900/50 flex items-center justify-center rounded-md mb-4">
                <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Serverless Functions</h3>
              <p className="mt-2 text-gray-400">
                Write and deploy backend functions without managing servers, directly integrated with your database.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Pricing Section */}
      <div id="pricing" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              Simple pricing for everyone
            </h2>
            <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
              Start for free, upgrade as you grow. No hidden fees or surprises.
            </p>
          </div>
          
          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {/* Free Tier */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-medium text-white">Free</h3>
                <p className="mt-2 text-sm text-gray-400">
                  Perfect for side projects and small applications
                </p>
                <p className="mt-6">
                  <span className="text-4xl font-extrabold text-white">$0</span>
                  <span className="text-gray-400">/month</span>
                </p>
                <ul className="mt-6 space-y-4">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">Up to 10,000 records</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">100 concurrent connections</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">Basic authentication</span>
                  </li>
                </ul>
                <div className="mt-10">
                  <Link to="/register" className="w-full flex justify-center py-2 px-4 border border-indigo-600 rounded-md text-indigo-400 hover:bg-indigo-900/20 transition-colors">
                    Get started
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Pro Tier */}
            <div className="bg-slate-800 border-2 border-indigo-500 rounded-lg overflow-hidden shadow-xl shadow-indigo-500/20 lg:scale-105 z-10">
              <div className="bg-indigo-500 py-1 text-center text-sm font-medium text-white">
                Most Popular
              </div>
              <div className="p-6">
                <h3 className="text-lg font-medium text-white">Pro</h3>
                <p className="mt-2 text-sm text-gray-400">
                  For growing applications and businesses
                </p>
                <p className="mt-6">
                  <span className="text-4xl font-extrabold text-white">$29</span>
                  <span className="text-gray-400">/month</span>
                </p>
                <ul className="mt-6 space-y-4">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">Unlimited records</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">1,000 concurrent connections</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">Advanced authentication</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">Priority support</span>
                  </li>
                </ul>
                <div className="mt-10">
                  <Link to="/register" className="w-full flex justify-center py-2 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white transition-colors">
                    Start free trial
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Enterprise Tier */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-medium text-white">Enterprise</h3>
                <p className="mt-2 text-sm text-gray-400">
                  Custom solutions for large organizations
                </p>
                <p className="mt-6">
                  <span className="text-4xl font-extrabold text-white">Custom</span>
                </p>
                <ul className="mt-6 space-y-4">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">Dedicated infrastructure</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">SLA guarantees</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">24/7 premium support</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-300">Custom integrations</span>
                  </li>
                </ul>
                <div className="mt-10">
                  <a href="#contact" className="w-full flex justify-center py-2 px-4 border border-indigo-600 rounded-md text-indigo-400 hover:bg-indigo-900/20 transition-colors">
                    Contact sales
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* CTA Section */}
      <div className="py-24 bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-indigo-700 rounded-2xl overflow-hidden shadow-xl">
            <div className="px-6 py-12 sm:px-12 lg:py-16 lg:px-16 flex flex-col lg:flex-row justify-between items-center">
              <div className="max-w-2xl">
                <h2 className="text-3xl font-extrabold text-white">
                  Ready to get started?
                </h2>
                <p className="mt-4 text-lg text-indigo-100">
                  Create your free account now and build your next big thing with HyperBase.
                </p>
              </div>
              <div className="mt-8 lg:mt-0 lg:ml-8">
                <Link to="/register" className="inline-flex items-center justify-center whitespace-nowrap px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-indigo-700 bg-white hover:bg-indigo-50 transition-colors">
                  Get started for free
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Product</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="#features" className="text-base text-gray-500 hover:text-white">Features</a></li>
                <li><a href="#pricing" className="text-base text-gray-500 hover:text-white">Pricing</a></li>
                <li><a href="#" className="text-base text-gray-500 hover:text-white">Security</a></li>
                <li><a href="#" className="text-base text-gray-500 hover:text-white">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Resources</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="#" className="text-base text-gray-500 hover:text-white">Documentation</a></li>
                <li><a href="#" className="text-base text-gray-500 hover:text-white">Guides</a></li>
                <li><a href="#" className="text-base text-gray-500 hover:text-white">API Reference</a></li>
                <li><a href="#" className="text-base text-gray-500 hover:text-white">Community</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Company</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="#" className="text-base text-gray-500 hover:text-white">About</a></li>
                <li><a href="#" className="text-base text-gray-500 hover:text-white">Blog</a></li>
                <li><a href="#" className="text-base text-gray-500 hover:text-white">Careers</a></li>
                <li><a href="#" className="text-base text-gray-500 hover:text-white">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-400 tracking-wider uppercase">Legal</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="#" className="text-base text-gray-500 hover:text-white">Privacy</a></li>
                <li><a href="#" className="text-base text-gray-500 hover:text-white">Terms</a></li>
                <li><a href="#" className="text-base text-gray-500 hover:text-white">Cookie Policy</a></li>
                <li><a href="#" className="text-base text-gray-500 hover:text-white">Licenses</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center">
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                HyperBase
              </span>
            </div>
            <p className="mt-4 md:mt-0 text-base text-gray-500">
              &copy; {new Date().getFullYear()} HyperBase, Inc. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <a href="#" className="text-gray-500 hover:text-white">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-500 hover:text-white">
                <span className="sr-only">GitHub</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-500 hover:text-white">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 