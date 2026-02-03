export const Logo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg
    viewBox="0 0 100 100"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#3B82F6', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#1D4ED8', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    
    {/* Calculator/Document shape */}
    <rect x="20" y="15" width="60" height="70" rx="6" fill="url(#grad)" />
    
    {/* Screen/Display area */}
    <rect x="28" y="23" width="44" height="16" rx="2" fill="white" opacity="0.9" />
    
    {/* Currency symbols */}
    <text x="35" y="35" fontSize="12" fontWeight="bold" fill="#1D4ED8">€$</text>
    
    {/* Grid of buttons/numbers */}
    <circle cx="35" cy="52" r="4" fill="white" opacity="0.7" />
    <circle cx="50" cy="52" r="4" fill="white" opacity="0.7" />
    <circle cx="65" cy="52" r="4" fill="white" opacity="0.7" />
    
    <circle cx="35" cy="63" r="4" fill="white" opacity="0.7" />
    <circle cx="50" cy="63" r="4" fill="white" opacity="0.7" />
    <circle cx="65" cy="63" r="4" fill="white" opacity="0.7" />
    
    <circle cx="35" cy="74" r="4" fill="white" opacity="0.7" />
    <circle cx="50" cy="74" r="4" fill="white" opacity="0.7" />
    <circle cx="65" cy="74" r="4" fill="white" opacity="0.7" />
  </svg>
);
