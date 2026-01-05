// (include this script in pages that call protected APIs)
async function authFetch(url, opts = {}) {
  const token = localStorage.getItem('jwtToken');
  opts.headers = opts.headers || {};
  if (token) opts.headers['Authorization'] = 'Bearer ' + token;
  else console.warn('authFetch: no jwtToken found in localStorage');
  return fetch(url, opts);
}

// usage example:
// const res = await authFetch('http://localhost:8080/api/protected', { method: 'GET' });