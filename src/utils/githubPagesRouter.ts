/**
 * GitHub Pages SPA Router Fix
 * 
 * This utility handles the redirect from 404.html and updates the browser history
 * to allow React Router to work correctly on GitHub Pages.
 * 
 * When GitHub Pages serves a 404, it redirects to 404.html which then redirects
 * back to the app with the original path as a query parameter. This utility
 * parses that query parameter and updates the browser history.
 */

export const setupGitHubPagesRouter = () => {
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
      const newUrl = l.pathname + originalPath + l.hash;
      window.history.replaceState(null, '', newUrl);
    }
  }
};