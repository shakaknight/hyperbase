import React from 'react';

interface LogoProps {
  compact?: boolean;
}

const Logo: React.FC<LogoProps> = ({ compact = false }) => {
  return (
    <div className="flex items-center">
      <div className="relative">
        <svg 
          width={compact ? "32" : "40"} 
          height={compact ? "32" : "40"} 
          viewBox="0 0 40 40" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Database cylinders with gradient */}
          <g className="transform rotate-12">
            {/* Main cylinder */}
            <ellipse cx="20" cy="10" rx="14" ry="6" fill="url(#dbGradient)" />
            <path d="M34 10v16c0 3.314-6.268 6-14 6s-14-2.686-14-6V10" stroke="url(#outlineGradient)" strokeWidth="2" />
            
            {/* Middle ring */}
            <path d="M34 18c0 3.314-6.268 6-14 6s-14-2.686-14-6" stroke="url(#outlineGradient)" strokeWidth="1.5" opacity="0.7" />
            
            {/* Top line highlights */}
            <path d="M12 8.5c0 0.828 3.582 1.5 8 1.5s8-0.672 8-1.5" stroke="url(#highlightGradient)" strokeWidth="1" opacity="0.7" />
          </g>
          
          {/* Lightning bolt overlay */}
          <path d="M24 6l-8 12h6l-2 10 8-14h-6l2-8z" fill="url(#boltGradient)" />
          
          {/* Gradients */}
          <defs>
            <linearGradient id="dbGradient" x1="10" y1="4" x2="30" y2="16" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6366F1" />
              <stop offset="1" stopColor="#9333EA" />
            </linearGradient>
            <linearGradient id="outlineGradient" x1="10" y1="4" x2="30" y2="30" gradientUnits="userSpaceOnUse">
              <stop stopColor="#8B5CF6" />
              <stop offset="1" stopColor="#6366F1" />
            </linearGradient>
            <linearGradient id="highlightGradient" x1="12" y1="8" x2="28" y2="10" gradientUnits="userSpaceOnUse">
              <stop stopColor="#C4B5FD" />
              <stop offset="1" stopColor="#818CF8" />
            </linearGradient>
            <linearGradient id="boltGradient" x1="18" y1="6" x2="24" y2="28" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffffff" />
              <stop offset="1" stopColor="#E0E7FF" stopOpacity="0.8" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      {!compact && (
        <div className="ml-2.5">
          <span className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
            HyperBase
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo; 