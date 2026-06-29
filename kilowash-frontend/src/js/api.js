// Konfigurasi API
const API_BASE_URL = 'http://' + window.location.hostname + ':3000/api';

// Wrapper fetch untuk mempermudah panggil backend
const apiCall = async (endpoint, method = 'GET', body = null) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    console.error('API Call Error:', error);
    return { status: 500, data: { success: false, message: 'Tidak dapat terhubung ke server.' } };
  }
};
