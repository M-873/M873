const Logo = ({ className = "w-10 h-10", colorMode = "gradient", blink = false }: { className?: string, colorMode?: "gradient" | "rainbow" | "blue" | "red" | "green" | "purple" | "gold" | "silver" | "neon" | "fire" | "ocean" | "animated-gold" | "animated-silver" | "animated-neon" | "animated-fire" | "animated-ocean" | "google", blink?: boolean }) => {
  const getGradientStops = () => {
    switch (colorMode) {
      case "rainbow":
      case "animated-gold":
      case "animated-silver":
      case "animated-neon":
      case "animated-fire":
      case "animated-ocean":
        return (
          <>
            <stop offset="0%" className="logo-stop-1" />
            <stop offset="100%" className="logo-stop-2" />
          </>
        );
      case "blue":
        return (
          <>
            <stop offset="0%" style={{ stopColor: "#3b82f6", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "#1d4ed8", stopOpacity: 1 }} />
          </>
        );
      case "red":
        return (
          <>
            <stop offset="0%" style={{ stopColor: "#ef4444", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "#dc2626", stopOpacity: 1 }} />
          </>
        );
      case "green":
        return (
          <>
            <stop offset="0%" style={{ stopColor: "#10b981", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "#059669", stopOpacity: 1 }} />
          </>
        );
      case "purple":
        return (
          <>
            <stop offset="0%" style={{ stopColor: "#8b5cf6", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "#7c3aed", stopOpacity: 1 }} />
          </>
        );
      case "gold":
        return (
          <>
            <stop offset="0%" style={{ stopColor: "#ffd700", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "#ffb347", stopOpacity: 1 }} />
          </>
        );
      case "silver":
        return (
          <>
            <stop offset="0%" style={{ stopColor: "#c0c0c0", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "#808080", stopOpacity: 1 }} />
          </>
        );
      case "neon":
        return (
          <>
            <stop offset="0%" style={{ stopColor: "#00ff00", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "#00ffff", stopOpacity: 1 }} />
          </>
        );
      case "fire":
        return (
          <>
            <stop offset="0%" style={{ stopColor: "#ff4500", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "#ff8c00", stopOpacity: 1 }} />
          </>
        );
      case "ocean":
        return (
          <>
            <stop offset="0%" style={{ stopColor: "#1e90ff", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "#00bfff", stopOpacity: 1 }} />
          </>
        );
      case "google":
        return (
          <>
            <stop offset="0%" style={{ stopColor: "#4285f4", stopOpacity: 1 }} />
            <stop offset="25%" style={{ stopColor: "#34a853", stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: "#fbbc04", stopOpacity: 1 }} />
            <stop offset="75%" style={{ stopColor: "#ea4335", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "#4285f4", stopOpacity: 1 }} />
          </>
        );
      default:
        return (
          <>
            <stop offset="0%" style={{ stopColor: "#ffd700", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "#ffb347", stopOpacity: 1 }} />
          </>
        );
    }
  };

  const getStrokeColor = () => {
    switch (colorMode) {
      case "rainbow":
        return "url(#logoGradient)";
      case "blue":
        return "#3b82f6";
      case "red":
        return "#ef4444";
      case "green":
        return "#10b981";
      case "purple":
        return "#8b5cf6";
      case "google":
        return "url(#logoGradient)";
      default:
        return "#ffd700";
    }
  };

  const getFillColor = () => {
    switch (colorMode) {
      case "rainbow":
        return "url(#logoGradient)";
      case "blue":
        return "#3b82f6";
      case "red":
        return "#ef4444";
      case "green":
        return "#10b981";
      case "purple":
        return "#8b5cf6";
      case "google":
        return "url(#logoGradient)";
      default:
        return "#ffd700";
    }
  };

  return (
    <svg
      viewBox="0 0 100 100"
      className={`${className} animate-logo-flash ${
         colorMode === "rainbow" ? "logo-color-cycle" :
         colorMode === "google" ? "logo-google" :
         colorMode === "animated-gold" ? "logo-animated-gold" :
         colorMode === "animated-silver" ? "logo-animated-silver" :
         colorMode === "animated-neon" ? "logo-animated-neon" :
         colorMode === "animated-fire" ? "logo-animated-fire" :
         colorMode === "animated-ocean" ? "logo-animated-ocean" :
         colorMode === "neon" ? "logo-neon" : ""
       } ${blink ? "logo-blink" : ""}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          {getGradientStops()}
        </linearGradient>
      </defs>
      
      {/* Outer hexagon frame */}
      <path
        d="M50 5 L85 27.5 L85 72.5 L50 95 L15 72.5 L15 27.5 Z"
        fill="none"
        stroke={getStrokeColor()}
        strokeWidth="3"
      />
      
      {/* M letter with geometric design */}
      <path
        d="M30 65 L30 35 L40 48 L50 35 L60 48 L70 35 L70 65"
        fill="none"
        stroke={getStrokeColor()}
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
        stroke={getStrokeColor()}
        strokeWidth="2.5"
        opacity="0.7"
      />
      
      {/* Accent dots representing 7 and 3 */}
      <circle cx="78" cy="20" r="3" fill={getFillColor()} />
      <circle cx="82" cy="28" r="2.5" fill={getFillColor()} opacity="0.8" />
      <circle cx="86" cy="36" r="2" fill={getFillColor()} opacity="0.6" />
    </svg>
  );
};

export default Logo;
