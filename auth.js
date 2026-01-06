// auth.js - use this in pages that call protected APIs
async function authFetch(url, opts = {}) {
    const token = localStorage.getItem('jwtToken'); // must match what you set after login
    if (!token) {
        alert("You are not logged in or session expired. Please login again.");
        window.location.href = "index.html"; // redirect to login page
        return;
    }

    // Ensure headers exist
    opts.headers = opts.headers || {};
    opts.headers['Authorization'] = 'Bearer ' + token;

    return fetch(url, opts);
}
