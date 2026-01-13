import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

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
  }
};

// Setup GitHub Pages router fix before rendering
setupGitHubPagesRouter();

createRoot(document.getElementById("root")!).render(<App />);
