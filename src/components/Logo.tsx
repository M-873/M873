const Logo = ({ className = "w-10 h-10" }: { className?: string }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      className={`${className} animate-logo-flash`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: "hsl(var(--primary))", stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: "hsl(var(--accent))", stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      
      {/* Outer hexagon frame */}
      <path
        d="M50 5 L85 27.5 L85 72.5 L50 95 L15 72.5 L15 27.5 Z"
        fill="none"
        stroke="url(#logoGradient)"
        strokeWidth="3"
      />
      
      {/* M letter with geometric design */}
      <path
        d="M30 65 L30 35 L40 48 L50 35 L60 48 L70 35 L70 65"
        fill="none"
        stroke="url(#logoGradient)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Number 8 integrated into design */}
      <circle
        cx="50"
        cy="55"
        r="8"
        fill="none"
        stroke="url(#logoGradient)"
        strokeWidth="2.5"
        opacity="0.7"
      />
      
      {/* Accent dots representing 7 and 3 */}
      <circle cx="78" cy="20" r="3" fill="url(#logoGradient)" />
      <circle cx="82" cy="28" r="2.5" fill="url(#logoGradient)" opacity="0.8" />
      <circle cx="86" cy="36" r="2" fill="url(#logoGradient)" opacity="0.6" />
    </svg>
  );
};

export default Logo;
