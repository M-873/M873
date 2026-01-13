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
  // Method 1: Intercept and mock the fetch request
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    if (url && typeof url === 'string' && url.includes('_private/browser/stats')) {
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
    return originalFetch.apply(this, args);
  };

  // Method 2: Suppress console errors for this specific endpoint
  const originalError = console.error;
  console.error = function(...args) {
    const errorString = args[0]?.toString() || '';
    if (errorString.includes('api.github.com/_private/browser/stats') || 
        errorString.includes('_private/browser/stats')) {
      console.log('🛡️ GitHub stats error suppressed');
      return; // Suppress this specific error
    }
    originalError.apply(console, args);
  };

  // Method 3: Add CORS headers for GitHub domains
  const originalXHROpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, ...args) {
    if (url && url.includes('_private/browser/stats')) {
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
    return originalXHROpen.apply(this, [method, url, ...args]);
  };

  console.log('✅ GitHub stats error suppression system activated');
};

// Advanced method to handle all GitHub-related tracking errors
export const suppressAllGitHubTrackingErrors = () => {
  suppressGitHubStatsError();
  
  // Suppress other common GitHub tracking endpoints
  const trackingEndpoints = [
    '_private/browser/stats',
    '_private/browser/events',
    'api.github.com/_private'
  ];

  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = args[0];
    if (url && typeof url === 'string') {
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