import React from 'react';
import { Link } from 'react-router-dom';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-[#212121] border border-[#303030] rounded-lg shadow-lg overflow-hidden ${className}`}>
      {children}
    </div>
  );
};

interface CardHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ title, description, actions }) => {
  return (
    <div className="px-6 py-4 border-b border-[#303030] flex justify-between items-center">
      <div>
        <h3 className="text-white font-medium">{title}</h3>
        {description && <p className="text-[#8F8F8F] text-sm mt-1">{description}</p>}
      </div>
      {actions && <div>{actions}</div>}
    </div>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => {
  return <div className={`p-6 ${className}`}>{children}</div>;
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'text';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md', 
  icon, 
  children, 
  className = '',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 ease-in-out focus:outline-none';
  
  const variantClasses = {
    primary: 'bg-[#3ECF8E] hover:bg-[#30BA7D] text-[#1A1A1A] focus:ring-2 focus:ring-[#3ECF8E] focus:ring-offset-2 focus:ring-offset-[#212121]',
    secondary: 'bg-transparent border border-[#303030] text-white hover:bg-[#252525] focus:ring-2 focus:ring-[#303030] focus:ring-offset-2 focus:ring-offset-[#212121]',
    danger: 'bg-[#AA5A5A] hover:bg-[#994D4D] text-white focus:ring-2 focus:ring-[#AA5A5A] focus:ring-offset-2 focus:ring-offset-[#212121]',
    text: 'bg-transparent text-[#3ECF8E] hover:text-[#30BA7D] hover:bg-[#252525]'
  };
  
  const sizeClasses = {
    sm: 'text-xs py-1 px-2 rounded',
    md: 'text-sm py-2 px-4 rounded',
    lg: 'text-base py-2.5 px-5 rounded-md'
  };
  
  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  
  return (
    <button className={buttonClasses} {...props}>
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({ 
  label, 
  error, 
  helperText, 
  className = '', 
  id,
  ...props 
}) => {
  const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
  
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-[#ABABAB] mb-1">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full bg-[#181818] border ${error ? 'border-[#AA5A5A]' : 'border-[#303030]'} rounded-md py-2 px-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#3ECF8E] focus:border-[#3ECF8E] ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-[#FF9A9A]">{error}</p>}
      {helperText && !error && <p className="mt-1 text-sm text-[#8F8F8F]">{helperText}</p>}
    </div>
  );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: Array<{ value: string; label: string }>;
}

export const Select: React.FC<SelectProps> = ({ 
  label, 
  error, 
  helperText, 
  options,
  className = '', 
  id,
  ...props 
}) => {
  const selectId = id || `select-${Math.random().toString(36).substring(2, 9)}`;
  
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-[#ABABAB] mb-1">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full bg-[#181818] border ${error ? 'border-[#AA5A5A]' : 'border-[#303030]'} rounded-md py-2 px-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#3ECF8E] focus:border-[#3ECF8E] ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-[#FF9A9A]">{error}</p>}
      {helperText && !error && <p className="mt-1 text-sm text-[#8F8F8F]">{helperText}</p>}
    </div>
  );
};

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  error?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ 
  label, 
  error, 
  className = '', 
  id,
  ...props 
}) => {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substring(2, 9)}`;
  
  return (
    <div className="flex items-start mb-4">
      <div className="flex items-center h-5">
        <input
          id={checkboxId}
          type="checkbox"
          className={`w-4 h-4 bg-[#181818] border border-[#303030] rounded focus:ring-[#3ECF8E] focus:border-[#3ECF8E] ${className}`}
          {...props}
        />
      </div>
      <div className="ml-3">
        <label htmlFor={checkboxId} className="text-sm font-medium text-[#ABABAB]">
          {label}
        </label>
        {error && <p className="mt-1 text-sm text-[#FF9A9A]">{error}</p>}
      </div>
    </div>
  );
};

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className = '' }) => {
  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full divide-y divide-[#303030] ${className}`}>
        {children}
      </table>
    </div>
  );
};

interface TabsProps {
  tabs: Array<{ id: string; label: string }>;
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ 
  tabs, 
  activeTab, 
  onChange, 
  className = '' 
}) => {
  return (
    <div className={`border-b border-[#303030] ${className}`}>
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`py-3 border-b-2 text-sm font-medium ${
              activeTab === tab.id
                ? 'border-[#3ECF8E] text-[#3ECF8E]'
                : 'border-transparent text-[#8F8F8F] hover:text-[#ABABAB] hover:border-[#505050]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'default', 
  className = '' 
}) => {
  const variantClasses = {
    default: 'bg-[#303030] text-[#ABABAB]',
    success: 'bg-[#1A2D1A] text-[#3ECF8E]',
    danger: 'bg-[#2D1A1A] text-[#FF9A9A]',
    warning: 'bg-[#2D261A] text-[#FFD700]',
    info: 'bg-[#1A1A2D] text-[#5A5AAA]'
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};

interface AlertProps {
  children: React.ReactNode;
  variant: 'success' | 'error' | 'warning' | 'info';
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({ 
  children, 
  variant, 
  className = '' 
}) => {
  const variantClasses = {
    success: 'bg-[#1A2D1A] border-[#5AAA5A] text-[#9AFF9A]',
    error: 'bg-[#2D1A1A] border-[#AA5A5A] text-[#FF9A9A]',
    warning: 'bg-[#2D261A] border-[#AA9A5A] text-[#FFDA9A]',
    info: 'bg-[#1A1A2D] border-[#5A5AAA] text-[#9A9AFF]'
  };
  
  return (
    <div className={`p-4 rounded-md border ${variantClasses[variant]} text-sm ${className}`}>
      {children}
    </div>
  );
};

export const CodeBlock: React.FC<{ children: string; className?: string }> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <pre className={`bg-[#181818] border border-[#303030] rounded-md p-4 overflow-x-auto font-mono text-sm text-white ${className}`}>
      <code>{children}</code>
    </pre>
  );
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  size = 'md'
}) => {
  if (!isOpen) return null;
  
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-black bg-opacity-75" onClick={onClose}></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className={`inline-block align-bottom bg-[#212121] rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle ${sizeClasses[size]} w-full`}>
          <div className="px-6 py-4 border-b border-[#303030] flex justify-between items-center">
            <h3 className="text-lg font-medium text-white">{title}</h3>
            <button
              type="button"
              className="text-[#ABABAB] hover:text-white"
              onClick={onClose}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="p-6">{children}</div>
          {footer && (
            <div className="px-6 py-4 border-t border-[#303030] flex justify-end space-x-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const JsonHighlight: React.FC<{ json: any }> = ({ json }) => {
  // Convert the JSON to a string with proper formatting
  const jsonString = JSON.stringify(json, null, 2);
  
  // Create the highlighted HTML with Supabase-like colors
  const highlighted = jsonString.replace(
    /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
    (match) => {
      let cls = 'text-[#FFD700]'; // number
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'text-[#3ECF8E]'; // key
        } else {
          cls = 'text-[#9A9AFF]'; // string
        }
      } else if (/true|false/.test(match)) {
        cls = 'text-[#FF9A9A]'; // boolean
      } else if (/null/.test(match)) {
        cls = 'text-[#FF9A9A]'; // null
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
  
  return (
    <div 
      className="bg-[#181818] text-white p-4 font-mono text-sm rounded-lg overflow-auto border border-[#303030]" 
      dangerouslySetInnerHTML={{ __html: highlighted }}
    />
  );
};

export const EmptyState: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}> = ({ icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="text-[#505050] mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-[#ABABAB] mb-6 max-w-md">{description}</p>
      {action}
    </div>
  );
};

export default {
  Card,
  CardHeader,
  CardContent,
  Button,
  Input,
  Select,
  Checkbox,
  Table,
  Tabs,
  Badge,
  Alert,
  CodeBlock,
  Modal,
  JsonHighlight,
  EmptyState
}; 