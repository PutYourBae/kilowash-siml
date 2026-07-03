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

    // Helper untuk menentukan apakah link aktif
    const active = (page) => currentPage === page ? 'active' : '';

    // Menentukan akses berdasarkan role
    const isOwner       = user.role === 'owner';
    const isAdmin       = user.role === 'admin';
    const isBranchAdmin = user.role === 'branch_admin';
    const isKasir       = user.role === 'kasir';
    const isPetugas     = user.role === 'petugas';

    const canSeeReports     = isOwner || isAdmin || isBranchAdmin;
    const canSeeMaster      = isOwner || isAdmin;
    const canSeeBranches    = isOwner;
    const canSeeRatings     = isOwner || isAdmin || isBranchAdmin;
    const canSeePayments    = isAdmin || isKasir;
    const canSeeQueue       = isAdmin || isPetugas || isBranchAdmin;

    this.innerHTML = `
      <aside class="sidebar">
        <div class="sidebar-header">
          <h2>🧺 KiloWash</h2>
          <div style="font-size:10px;color:rgba(255,255,255,0.4);margin-top:2px;font-weight:500;letter-spacing:0.05em;">v2.0</div>
        </div>
        <div class="sidebar-nav">
          <a href="dashboard.html" class="nav-item ${active('dashboard.html')}">📊 Dashboard</a>
          <a href="orders.html"    class="nav-item ${active('orders.html')}">📋 Daftar Order</a>
          ${canSeeQueue    ? `<a href="queue.html"    class="nav-item ${active('queue.html')}">🔄 Antrian Produksi</a>` : ''}
          ${canSeePayments ? `<a href="payments.html" class="nav-item ${active('payments.html')}">💳 Pembayaran</a>` : ''}
          ${canSeeReports  ? `<a href="reports.html"  class="nav-item ${active('reports.html')}">📈 Laporan</a>` : ''}
          ${canSeeRatings  ? `<a href="ratings.html"  class="nav-item ${active('ratings.html')}">⭐ Feedback Pelanggan</a>` : ''}
          ${canSeeMaster   ? `<a href="master.html"   class="nav-item ${active('master.html')}">⚙️ Data Master</a>` : ''}
          ${canSeeBranches ? `<a href="branches.html" class="nav-item ${active('branches.html')}">🏪 Manajemen Cabang</a>` : ''}
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
