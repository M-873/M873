import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { suppressAllGitHubTrackingErrors } from "./utils/githubStatsSuppressor.ts";

// 🛠️ GitHub Stats Error Suppression - Auto-fix for harmless API error
suppressAllGitHubTrackingErrors();

// GitHub Pages SPA Router Fix
// This handles the redirect from 404.html and updates the browser history
const setupGitHubPagesRouter = () => {
  // Only run on GitHub Pages
  const isGitHubPages = window.location.hostname.includes('github.io');
  
  if (isGitHubPages) {
    const l = window.location;
    
    // Check if we've been redirected from 404.html
    if (l.search.includes('?/')) {
      // Parse the original path from the query parameter
      const originalPath = l.search
        .slice(2) // Remove '?/'
        .split('&')
        .map((segment) => segment.replace(/~and~/g, '&'))
        .join('&');
      
      // Update the browser history without reloading the page
      // For GitHub Pages, we need to handle the base path correctly
      const basePath = '/M873/';
      const newUrl = basePath + originalPath + l.hash;
      window.history.replaceState(null, '', newUrl);
    }
    
    // Also handle the case where we're at the root path
    if (l.pathname === '/M873/' && !l.search) {
      // We're at the correct root path, no redirect needed
      return;
    }
  }
};

// Setup GitHub Pages router fix before rendering
setupGitHubPagesRouter();

createRoot(document.getElementById("root")!).render(<App />);
