class Sidebar extends HTMLElement {
  connectedCallback() {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      window.location.href = 'login.html';
      return;
    }
    
    const user = JSON.parse(userStr);
    const initial = user.name.charAt(0).toUpperCase();
    const currentPage = window.location.pathname.split('/').pop();

    this.innerHTML = `
      <aside class="sidebar">
        <div class="sidebar-header">
          <h2>🧺 KiloWash</h2>
        </div>
        <div class="sidebar-nav">
          <a href="dashboard.html" class="nav-item ${currentPage === 'dashboard.html' ? 'active' : ''}">📊 Dashboard</a>
          <a href="orders.html" class="nav-item ${currentPage === 'orders.html' ? 'active' : ''}">📋 Daftar Order</a>
          ${['admin', 'petugas'].includes(user.role) ? `<a href="queue.html" class="nav-item ${currentPage === 'queue.html' ? 'active' : ''}">🔄 Antrian Produksi</a>` : ''}
          ${['admin', 'kasir'].includes(user.role) ? `<a href="payments.html" class="nav-item ${currentPage === 'payments.html' ? 'active' : ''}">💳 Pembayaran</a>` : ''}
          ${['admin', 'owner'].includes(user.role) ? `<a href="reports.html" class="nav-item ${currentPage === 'reports.html' ? 'active' : ''}">📈 Laporan</a>` : ''}
          ${['admin', 'owner'].includes(user.role) ? `<a href="master.html" class="nav-item ${currentPage === 'master.html' ? 'active' : ''}">⚙️ Data Master</a>` : ''}
        </div>
        <div class="sidebar-footer">
          <div class="user-profile">
            <div class="user-avatar">${initial}</div>
            <div class="user-info">
              <h4>${user.name}</h4>
              <span>${user.role}</span>
            </div>
          </div>
          <button class="logout-btn" id="logoutBtn">Keluar</button>
        </div>
      </aside>
    `;

    document.getElementById('logoutBtn').addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = 'login.html';
    });
  }
}

customElements.define('app-sidebar', Sidebar);
