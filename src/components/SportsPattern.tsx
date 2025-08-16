import React from 'react';

interface SportsPatternProps {
  className?: string;
  opacity?: number;
}

const SportsPattern: React.FC<SportsPatternProps> = ({ 
  className = '', 
  opacity = 0.1 
}) => {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      <svg
        className="w-full h-full"
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ opacity }}
      >
        {/* Football Field Pattern */}
        <defs>
          <pattern
            id="footballField"
            x="0"
            y="0"
            width="100"
            height="100"
            patternUnits="userSpaceOnUse"
          >
            {/* Field Lines */}
            <rect width="100" height="100" fill="none" stroke="hsl(142 71% 45%)" strokeWidth="0.5" />
            <circle cx="50" cy="50" r="20" fill="none" stroke="hsl(142 71% 45%)" strokeWidth="0.5" />
            <line x1="50" y1="0" x2="50" y2="100" stroke="hsl(142 71% 45%)" strokeWidth="0.5" />
            <line x1="0" y1="50" x2="100" y2="50" stroke="hsl(142 71% 45%)" strokeWidth="0.5" />
          </pattern>
          
          <pattern
            id="soccerBalls"
            x="0"
            y="0"
            width="80"
            height="80"
            patternUnits="userSpaceOnUse"
          >
            {/* Soccer Ball */}
            <circle cx="40" cy="40" r="8" fill="none" stroke="hsl(24 100% 50%)" strokeWidth="0.8" />
            <path d="M32 40 L40 32 L48 40 L40 48 Z" fill="none" stroke="hsl(24 100% 50%)" strokeWidth="0.5" />
            <path d="M40 32 L40 48 M32 40 L48 40" stroke="hsl(24 100% 50%)" strokeWidth="0.3" />
          </pattern>
          
          <pattern
            id="trophies"
            x="0"
            y="0"
            width="120"
            height="120"
            patternUnits="userSpaceOnUse"
          >
            {/* Trophy */}
            <g transform="translate(60, 60)">
              <path d="M-8 -15 L8 -15 L6 -5 L-6 -5 Z" fill="none" stroke="hsl(45 93% 58%)" strokeWidth="0.8" />
              <circle cx="0" cy="-10" r="3" fill="none" stroke="hsl(45 93% 58%)" strokeWidth="0.6" />
              <rect x="-2" y="-5" width="4" height="8" fill="none" stroke="hsl(45 93% 58%)" strokeWidth="0.6" />
              <rect x="-6" y="3" width="12" height="3" fill="none" stroke="hsl(45 93% 58%)" strokeWidth="0.6" />
            </g>
          </pattern>
        </defs>
        
        {/* Apply Patterns */}
        <rect width="100%" height="100%" fill="url(#footballField)" />
        <rect width="100%" height="100%" fill="url(#soccerBalls)" opacity="0.3" />
        <rect width="100%" height="100%" fill="url(#trophies)" opacity="0.2" />
        
        {/* Gradient Overlay */}
        <defs>
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(24 100% 50%)" stopOpacity="0.1" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#centerGlow)" />
      </svg>
    </div>
  );
};

export default SportsPattern;