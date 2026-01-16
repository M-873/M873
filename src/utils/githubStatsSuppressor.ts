/**
 * 🛡️ GitHub Stats Error Suppressor
 * 
 * This utility suppresses the harmless GitHub stats API error that occurs
 * when GitHub's internal tracking tries to access a non-existent endpoint.
 * 
 * The error: net::ERR_ABORTED https://api.github.com/_private/browser/stats
 * is completely harmless and doesn't affect your application functionality.
 */

export const suppressGitHubStatsError = () => {
  // Skip suppression in development mode to avoid interfering with Vite
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🛡️ GitHub stats suppression disabled in development mode');
    return;
  }

  // Method 1: Intercept and mock the fetch request
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    try {
      const url = args[0];
      // Only intercept GitHub stats requests, allow all others including Supabase and Vite
      if (url && typeof url === 'string' && url.includes('api.github.com/_private/browser/stats')) {
        console.log('🛡️ GitHub stats request intercepted and mocked (harmless internal tracking)');
        return Promise.resolve(new Response('{}', {
          status: 200,
          statusText: 'OK',
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        }));
      }
    } catch (error) {
      console.error('Error in fetch interceptor:', error);
    }
    return originalFetch.apply(this, args);
  };

  // Method 2: Suppress console errors for this specific endpoint
  const originalError = console.error;
  console.error = function(...args) {
    try {
      // Skip suppression in development mode
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        originalError.apply(console, args);
        return;
      }
      
      const errorString = args[0]?.toString() || '';
      // Only suppress GitHub-specific errors, not general network errors
      if (errorString.includes('api.github.com/_private/browser/stats') || 
          (errorString.includes('_private/browser/stats') && errorString.includes('github'))) {
        console.log('🛡️ GitHub stats error suppressed');
        return; // Suppress this specific error
      }
    } catch (error) {
      // If there's an error in our error handler, just pass through
      console.log('Error in console.error interceptor:', error);
    }
    originalError.apply(console, args);
  };

  // Method 3: Add CORS headers for GitHub domains
  const originalXHROpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, ...args) {
    try {
      // Skip suppression in development mode
      if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return originalXHROpen.apply(this, [method, url, ...args]);
      }
      if (url && typeof url === 'string' && url.includes('api.github.com/_private/browser/stats')) {
        console.log('🛡️ GitHub stats XHR request intercepted');
        // Mock the response
        setTimeout(() => {
          if (this.readyState === 1) { // OPENED
            Object.defineProperty(this, 'status', { value: 200 });
            Object.defineProperty(this, 'responseText', { value: '{}' });
            Object.defineProperty(this, 'readyState', { value: 4 }); // DONE
            if (this.onreadystatechange) this.onreadystatechange();
            if (this.onload) this.onload();
          }
        }, 0);
        return;
      }
    } catch (error) {
      console.error('Error in XHR interceptor:', error);
    }
    return originalXHROpen.apply(this, [method, url, ...args]);
  };

  console.log('✅ GitHub stats error suppression system activated');
};

// Advanced method to handle all GitHub-related tracking errors
export const suppressAllGitHubTrackingErrors = () => {
  // Skip suppression in development mode to avoid interfering with Vite
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🛡️ All GitHub tracking suppression disabled in development mode');
    return;
  }

  suppressGitHubStatsError();
  
  // Suppress other common GitHub tracking endpoints
  const trackingEndpoints = [
    'api.github.com/_private/browser/stats',
    'api.github.com/_private/browser/events',
    'api.github.com/_private'
  ];

  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    // Only intercept if it's a GitHub API request
    if (url && typeof url === 'string' && url.includes('api.github.com')) {
      for (const endpoint of trackingEndpoints) {
        if (url.includes(endpoint)) {
          console.log(`🛡️ GitHub tracking request suppressed: ${endpoint}`);
          return Promise.resolve(new Response('{}', {
            status: 200,
            statusText: 'OK',
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          }));
        }
      }
    }
    return originalFetch.apply(this, args);
  };

  console.log('✅ All GitHub tracking error suppression activated');
};

// Browser console helper function for manual testing
export const testGitHubStatsSuppression = () => {
  // Skip testing in development mode
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🧪 GitHub stats suppression testing disabled in development mode');
    return;
  }
  
  console.log('🧪 Testing GitHub stats error suppression...');
  
  // Test fetch
  fetch('https://api.github.com/_private/browser/stats')
    .then(response => {
      console.log('✅ Fetch suppressed successfully:', response.status);
    })
    .catch(error => {
      console.log('❌ Fetch not suppressed:', error);
    });

  // Test XHR
  const xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://api.github.com/_private/browser/stats');
  xhr.onload = () => {
    console.log('✅ XHR suppressed successfully');
  };
  xhr.onerror = () => {
    console.log('❌ XHR not suppressed');
  };
  xhr.send();
};

// Export default function for easy import
export default suppressGitHubStatsError;