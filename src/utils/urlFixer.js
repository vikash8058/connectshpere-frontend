/**
 * Utility to fix legacy or broken CDN URLs.
 * Replaces cdn.connectsphere.com with the local API gateway URL.
 */
export const fixCdnUrl = (url) => {
  if (!url) return '';
  
  // If it's a legacy placeholder or uses the wrong domain
  if (url.includes('cdn.connectsphere.com')) {
    const filename = url.split('/').pop();
    // Redirect to local media endpoint via API Gateway
    return `http://localhost:8080/api/v1/media/cdn/${filename}`;
  }
  
  return url;
};

// Alias for convenience
export const fixMediaUrl = fixCdnUrl;
