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

    const active = (page) => currentPage === page ? 'active' : '';

    // Normalize role to lowercase to handle any casing inconsistencies
    const role = (user.role || '').toLowerCase().replace(' ', '_');

    const isOwner       = role === 'owner';
    const isAdmin       = role === 'admin';
    const isBranchAdmin = role === 'branch_admin';
    const isKasir       = role === 'kasir';
    const isPetugas     = role === 'petugas';

    const canSeeReports     = isOwner || isAdmin || isBranchAdmin;
    const canSeeMaster      = isOwner || isAdmin;
    const canSeeBranches    = isOwner;
    const canSeeRatings     = isOwner || isAdmin || isBranchAdmin || isKasir;
    const canSeePayments    = isAdmin || isKasir;
    const canSeeQueue       = isAdmin || isPetugas || isBranchAdmin || isKasir;

    this.innerHTML = `
      <div class="sidebar-overlay"></div>
      <aside class="sidebar">
        <div class="sidebar-header">
          <h2>🧺 KiloWash</h2>
          <div style="font-size:10px;color:var(--color-text-muted);margin-top:2px;font-weight:700;letter-spacing:0.05em;">v2.0</div>
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
              <span>${user.role.replace('_', ' ')}</span>
            </div>
          </div>
          <button class="logout-btn" id="logoutBtn">🚪 Keluar</button>
        </div>
      </aside>
    `;

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = 'login.html';
    });

    // Mobile Menu Toggle Logic
    setTimeout(() => {
      const topbar = document.querySelector('.topbar');
      if (topbar && !document.querySelector('.menu-toggle')) {
        const btn = document.createElement('button');
        btn.className = 'menu-toggle';
        btn.innerHTML = '☰';
        
        // Find topbar-title to insert before it
        const title = topbar.querySelector('.topbar-title');
        if (title) {
          const wrapper = document.createElement('div');
          wrapper.className = 'topbar-header-row';
          topbar.insertBefore(wrapper, title);
          wrapper.appendChild(btn);
          wrapper.appendChild(title);
        } else {
          topbar.insertBefore(btn, topbar.firstChild);
        }

        const sidebar = this.querySelector('.sidebar');
        const overlay = this.querySelector('.sidebar-overlay');

        btn.addEventListener('click', () => {
          sidebar.classList.add('active');
          overlay.classList.add('active');
        });

        overlay.addEventListener('click', () => {
          sidebar.classList.remove('active');
          overlay.classList.remove('active');
        });
      }
    }, 100);
  }
}

customElements.define('app-sidebar', Sidebar);
