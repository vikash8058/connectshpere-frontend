export const fixCdnUrl = (url) => {
  if (!url) return '';

  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  if (url.includes('cdn.connectsphere.com')) {
    const filename = url.split('/').pop();
    return `${BASE_URL}/api/v1/media/cdn/${filename}`;
  }

  if (url.includes('localhost:8080')) {
    return url.replace('http://localhost:8080', BASE_URL);
  }

  return url;
};

export const fixMediaUrl = fixCdnUrl;