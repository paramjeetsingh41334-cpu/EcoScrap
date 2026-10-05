import { useState } from "react";

const navigation = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "📊",
  },
  {
    id: "pickup",
    label: "Book Pickup",
    icon: "🚚",
  },
  {
    id: "my-pickups",
    label: "My Pickups",
    icon: "📦",
  },
  {
    id: "marketplace",
    label: "Marketplace",
    icon: "🏪",
  },
  {
    id: "traceability",
    label: "Traceability",
    icon: "🔗",
  },
  {
    id: "transactions",
    label: "Transactions",
    icon: "💰",
  },
  {
    id: "notifications",
    label: "Notifications",
    icon: "🔔",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: "📈",
  },
];

function getRoleName(role) {
  switch (role) {
    case "ADMIN":
      return "Administrator";
    case "COLLECTOR":
      return "Collector";
    case "RECYCLER":
      return "Recycler";
    default:
      return "User";
  }
}

function getInitials(user) {
  if (!user) return "U";

  const name =
    user.name ||
    user.fullName ||
    user.username ||
    user.email ||
    "User";

  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function DashboardLayout({
  user,
  onLogout,
  activePage = "dashboard",
  onNavigate,
  children,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleNavigation = (page) => {
    if (onNavigate) {
      onNavigate(page);
    }

    setSidebarOpen(false);
  };

  const handleLogout = () => {
    setSidebarOpen(false);

    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="dashboard-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`dashboard-sidebar ${
          sidebarOpen ? "dashboard-sidebar-open" : ""
        }`}
      >
        <div className="dashboard-sidebar-header">
          <div className="dashboard-brand">
            <div className="dashboard-brand-icon">♻️</div>

            <div>
              <div className="dashboard-brand-name">EcoScrap</div>
              <div className="dashboard-brand-subtitle">
                Smart Waste Management
              </div>
            </div>
          </div>

          <button
            type="button"
            className="dashboard-sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        {/* User profile */}
        <div className="dashboard-user-card">
          <div className="dashboard-user-avatar">
            {getInitials(user)}
          </div>

          <div className="dashboard-user-info">
            <strong>
              {user?.name || user?.fullName || user?.username || "EcoScrap User"}
            </strong>

            <span>{getRoleName(user?.role)}</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="dashboard-navigation">
          <div className="dashboard-navigation-title">
            MAIN MENU
          </div>

          {navigation.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`dashboard-nav-item ${
                activePage === item.id
                  ? "dashboard-nav-item-active"
                  : ""
              }`}
              onClick={() => handleNavigation(item.id)}
            >
              <span className="dashboard-nav-icon">{item.icon}</span>

              <span className="dashboard-nav-label">
                {item.label}
              </span>
            </button>
          ))}
        </nav>

        {/* Sidebar bottom */}
        <div className="dashboard-sidebar-bottom">
          <button
            type="button"
            className="dashboard-nav-item dashboard-logout-button"
            onClick={handleLogout}
          >
            <span className="dashboard-nav-icon">🚪</span>
            <span className="dashboard-nav-label">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="dashboard-main">
        {/* Top bar */}
        <header className="dashboard-topbar">
          <div className="dashboard-topbar-left">
            <button
              type="button"
              className="dashboard-menu-button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              ☰
            </button>

            <div>
              <h1>
                {navigation.find(
                  (item) => item.id === activePage
                )?.label || "Dashboard"}
              </h1>

              <p>
                Manage your EcoScrap activities
              </p>
            </div>
          </div>

          <div className="dashboard-topbar-right">
            <div className="dashboard-role-badge">
              {getRoleName(user?.role)}
            </div>

            <div className="dashboard-topbar-avatar">
              {getInitials(user)}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="dashboard-content">
          {children}
        </main>
      </div>
    </div>
  );
}