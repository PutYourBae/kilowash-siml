// Global Configuration
const CONFIG = {
  // Ganti URL ini jika backend dipindahkan ke domain lain
  API_BASE: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://' + window.location.hostname + ':3000/api' 
    : 'https://kilowash-siml.vercel.app/api'
};
