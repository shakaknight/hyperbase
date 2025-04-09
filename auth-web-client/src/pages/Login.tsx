import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuthStore } from '../stores/authStore';

// Login form validation schema
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required')
});

const Login = () => {
  const { login, error, clearError } = useAuthStore();
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [tempCredentials, setTempCredentials] = useState({ email: '', password: '' });
  
  const handleLogin = async (values: { email: string; password: string }, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
    try {
      clearError();
      await login(values.email, values.password);
    } catch (error: any) {
      if (error.response?.data?.mfaRequired) {
        setMfaRequired(true);
        setTempCredentials(values);
      }
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleMfaSubmit = async () => {
    try {
      clearError();
      await login(tempCredentials.email, tempCredentials.password, mfaCode);
    } catch (error) {
      console.error('MFA login error:', error);
    }
  };
  
  if (mfaRequired) {
    return (
      <div className="w-full max-w-md mx-auto p-6">
        <div className="bg-[#212121] border border-[#303030] rounded-lg p-8 shadow-lg">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-white">Two-Factor Authentication</h2>
            <p className="text-[#ABABAB] mt-2 text-sm">
              Enter the verification code from your authenticator app
            </p>
          </div>
          
          {error && (
            <div className="bg-[#2D1A1A] border border-[#AA5A5A] text-[#FF9A9A] p-4 rounded-md mb-6 text-sm">
              <div className="flex items-center">
                <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            </div>
          )}
          
          <div className="mb-6">
            <label htmlFor="mfaCode" className="block text-sm font-medium text-[#ABABAB] mb-1">
              Verification Code
            </label>
            <input
              type="text"
              id="mfaCode"
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              className="w-full bg-[#181818] border border-[#303030] rounded-md py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-[#3ECF8E] focus:border-[#3ECF8E]"
              placeholder="Enter 6-digit code"
              autoComplete="one-time-code"
              maxLength={6}
            />
          </div>
          
          <div className="flex flex-col space-y-3">
            <button
              onClick={handleMfaSubmit}
              className="w-full py-2 px-4 bg-[#3ECF8E] text-[#1A1A1A] text-sm font-medium rounded hover:bg-[#30BA7D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#212121] focus:ring-[#3ECF8E]"
            >
              Verify
            </button>
            
            <button
              onClick={() => setMfaRequired(false)}
              className="w-full py-2 px-4 bg-transparent border border-[#303030] text-white text-sm font-medium rounded hover:bg-[#252525] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#212121] focus:ring-[#303030]"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="w-full max-w-md mx-auto p-6">
      <div className="bg-[#212121] border border-[#303030] rounded-lg p-8 shadow-lg">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-white">Welcome back</h2>
          <p className="text-[#ABABAB] mt-2 text-sm">
            Sign in to your HyperBase account
          </p>
        </div>
        
        {error && (
          <div className="bg-[#2D1A1A] border border-[#AA5A5A] text-[#FF9A9A] p-4 rounded-md mb-6 text-sm">
            <div className="flex items-center">
              <svg className="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}
        
        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={handleLogin}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-[#ABABAB] mb-1">
                  Email
                </label>
                <Field
                  type="email"
                  name="email"
                  id="email"
                  className="w-full bg-[#181818] border border-[#303030] rounded-md py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-[#3ECF8E] focus:border-[#3ECF8E]"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                <ErrorMessage 
                  name="email" 
                  component="div" 
                  className="mt-1 text-sm text-[#FF9A9A]" 
                />
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-[#ABABAB]">
                    Password
                  </label>
                  <div className="text-sm">
                    <a href="#" className="text-[#3ECF8E] hover:text-[#30BA7D]">
                      Forgot password?
                    </a>
                  </div>
                </div>
                <Field
                  type="password"
                  name="password"
                  id="password"
                  className="w-full bg-[#181818] border border-[#303030] rounded-md py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-[#3ECF8E] focus:border-[#3ECF8E]"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <ErrorMessage 
                  name="password" 
                  component="div" 
                  className="mt-1 text-sm text-[#FF9A9A]" 
                />
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2 px-4 bg-[#3ECF8E] text-[#1A1A1A] text-sm font-medium rounded hover:bg-[#30BA7D] flex justify-center items-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#212121] focus:ring-[#3ECF8E] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-[#1A1A1A]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </div>
            </Form>
          )}
        </Formik>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-[#8F8F8F]">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#3ECF8E] hover:text-[#30BA7D] font-medium">
              Sign up
            </Link>
          </p>
        </div>
        
        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#303030]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-[#212121] text-[#8F8F8F]">
                Or continue with
              </span>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-2 gap-4">
            <button
              type="button"
              className="w-full py-2 px-4 bg-[#252525] border border-[#303030] rounded-md text-white text-sm font-medium hover:bg-[#303030] flex items-center justify-center"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </button>
            <button
              type="button"
              className="w-full py-2 px-4 bg-[#252525] border border-[#303030] rounded-md text-white text-sm font-medium hover:bg-[#303030] flex items-center justify-center"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                <path d="M1 1h22v22H1z" fill="none"/>
              </svg>
              Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 