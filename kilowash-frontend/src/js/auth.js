document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const errorMsg = document.getElementById('errorMsg');
  const loginBtn = document.getElementById('loginBtn');
  const togglePasswordBtn = document.getElementById('togglePassword');

  // Check if already logged in
  if (localStorage.getItem('token')) {
    window.location.href = 'dashboard.html';
  }

  // Toggle Password Visibility
  togglePasswordBtn.addEventListener('click', () => {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    togglePasswordBtn.textContent = type === 'password' ? 'Show' : 'Hide';
  });

  // Handle Login Submit
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Reset error & set loading
    errorMsg.style.display = 'none';
    loginBtn.textContent = 'Memeriksa...';
    loginBtn.disabled = true;

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    const { status, data } = await apiCall('/auth/login', 'POST', { email, password });

    if (status === 200 && data.success) {
      // Simpan ke localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Redirect ke dashboard
      window.location.href = 'dashboard.html';
    } else {
      // Tampilkan error
      errorMsg.textContent = data.message || 'Login gagal. Periksa kembali email dan password Anda.';
      errorMsg.style.display = 'block';
      loginBtn.textContent = 'Masuk';
      loginBtn.disabled = false;
    }
  });
});
