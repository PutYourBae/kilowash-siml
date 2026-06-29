// ============================================================
// API HELPER
// ============================================================
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://' + window.location.hostname + ':3000/api' : 'https://kilowash-siml.vercel.app/api';

const api = async (endpoint, method = 'GET', body = null) => {
  const token = localStorage.getItem('kw_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, opts);
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    return { ok: false, status: 0, data: { success: false, message: 'Tidak dapat terhubung ke server.' } };
  }
};

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================
const createToastContainer = () => {
  if (document.getElementById('toast-container')) return;
  const el = document.createElement('div');
  el.id = 'toast-container';
  el.className = 'toast-container';
  document.body.appendChild(el);
};

const toast = (message, type = 'success', duration = 3500) => {
  createToastContainer();
  const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `<span style="font-size:16px;font-weight:700;">${icons[type] || '•'}</span><span>${message}</span>`;
  document.getElementById('toast-container').appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(100%)';
    el.style.transition = 'all .3s';
    setTimeout(() => el.remove(), 300);
  }, duration);
};

// ============================================================
// MODAL HELPERS
// ============================================================
const openModal = (id) => document.getElementById(id)?.classList.add('open');
const closeModal = (id) => document.getElementById(id)?.classList.remove('open');
const closeAllModals = () => document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));

// Close on backdrop click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) closeAllModals();
});

// ============================================================
// AUTH HELPERS
// ============================================================
const getUser = () => {
  const u = localStorage.getItem('kw_user');
  return u ? JSON.parse(u) : null;
};

// Redirect ke halaman pertama sesuai role
const getHomePageForRole = (role) => {
  if (role === 'owner') return 'dashboard.html';
  if (role === 'admin') return 'orders.html';
  if (role === 'kasir') return 'payments.html';
  if (role === 'petugas') return 'queue.html';
  return 'login.html';
};

const requireAuth = (allowedRoles = null) => {
  const token = localStorage.getItem('kw_token');
  const user = getUser();
  if (!token || !user) {
    window.location.href = 'login.html';
    return null;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect ke halaman home sesuai role, bukan dashboard (untuk hindari infinite loop)
    window.location.href = getHomePageForRole(user.role);
    return null;
  }
  return user;
};

// ============================================================
// FORMATTERS
// ============================================================
const formatRp = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);
const formatDate = (d) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
const formatDateTime = (d) => new Date(d).toLocaleString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const statusLabel = {
  diterima: 'Diterima', proses: 'Proses', selesai: 'Selesai', diambil: 'Diambil', dibatalkan: 'Dibatalkan'
};

// ============================================================
// SIDEBAR WEB COMPONENT
// ============================================================
class AppSidebar extends HTMLElement {
  connectedCallback() {
    const user = getUser();
    if (!user) return;

    const pg = window.location.pathname.split('/').pop();
    const nav = (href, icon, label, roles = null) => {
      if (roles && !roles.includes(user.role)) return '';
      return `<a href="${href}" class="nav-item ${pg === href ? 'active' : ''}"><span class="nav-icon">${icon}</span>${label}</a>`;
    };

    this.innerHTML = `
      <aside class="sidebar">
        <div class="sidebar-brand">
          <div class="brand-icon">🧺</div>
          <div class="brand-text">
            <h2>KiloWash</h2>
            <p>Manajemen Laundry</p>
          </div>
        </div>

        <div class="sidebar-section">
          <div class="sidebar-section-label">Menu Utama</div>
          ${nav('dashboard.html', '📊', 'Dashboard', ['owner'])}
          ${nav('orders.html', '📋', 'Daftar Order', ['owner', 'admin', 'kasir'])}
          ${nav('queue.html', '🔄', 'Antrian Laundry', ['owner', 'admin', 'petugas'])}
          ${nav('payments.html', '💳', 'Kasir & Pembayaran', ['owner', 'admin', 'kasir'])}
        </div>

        ${user.role === 'owner' ? `
        <div class="sidebar-section">
          <div class="sidebar-section-label">Laporan & Master</div>
          ${nav('reports.html', '📈', 'Laporan', ['owner'])}
          ${nav('master.html', '⚙️', 'Data Master', ['owner'])}
        </div>
        ` : ''}

        <div class="sidebar-footer">
          <div class="user-card">
            <div class="user-avatar">${user.name.charAt(0).toUpperCase()}</div>
            <div class="user-info">
              <div class="u-name">${user.name}</div>
              <div class="u-role">${user.role}</div>
            </div>
          </div>
          <button class="btn-logout" id="logoutBtn">
            <span>↩</span> Keluar
          </button>
        </div>
      </aside>
    `;

    document.getElementById('logoutBtn').addEventListener('click', () => {
      localStorage.removeItem('kw_token');
      localStorage.removeItem('kw_user');
      window.location.href = 'login.html';
    });
  }
}
customElements.define('app-sidebar', AppSidebar);
