import { useMemo, useState } from "react";

const navigationByRole = {
  USER: [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "pickup", label: "Book Pickup", icon: "🚚" },
    { id: "my-pickups", label: "My Pickups", icon: "📦" },
    { id: "marketplace", label: "Marketplace", icon: "🏪" },
    { id: "traceability", label: "Traceability", icon: "🔗" },
    { id: "transactions", label: "Transactions", icon: "💰" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "analytics", label: "Analytics", icon: "📈" },
  ],

  COLLECTOR: [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "pickup-requests", label: "Pickup Requests", icon: "🚚" },
    { id: "my-pickups", label: "My Pickups", icon: "📦" },
    { id: "scrap-lots", label: "My Scrap Lots", icon: "♻️" },
    { id: "smart-route", label: "Smart Route", icon: "🗺️" },
    { id: "marketplace", label: "Marketplace & Auctions", icon: "🏪" },
    { id: "traceability", label: "Traceability", icon: "🔗" },
    { id: "transactions", label: "Transactions", icon: "💰" },
    { id: "analytics", label: "Analytics & Certificates", icon: "📈" },
    { id: "pricing", label: "Pricing Calculator", icon: "🧮" },
  ],

  RECYCLER: [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "scrap-lots", label: "Available Scrap Lots", icon: "♻️" },
    { id: "auctions", label: "Live Auctions", icon: "🔨" },
    { id: "marketplace", label: "Marketplace", icon: "🏪" },
    { id: "purchase-requests", label: "Purchase Requests", icon: "📋" },
    { id: "traceability", label: "Traceability", icon: "🔗" },
    { id: "transactions", label: "Transactions", icon: "💰" },
    { id: "certificates", label: "Certificates", icon: "📜" },
    { id: "analytics", label: "Analytics", icon: "📈" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
  ],

  ADMIN: [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "sellers", label: "Manage Sellers", icon: "👥" },
    { id: "recyclers", label: "Manage Recyclers", icon: "♻️" },
    { id: "verification", label: "Verification", icon: "✅" },
  ],
};

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
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const role = String(user?.role || "USER").toUpperCase();

  const navigation =
  navigationByRole[role] || navigationByRole.USER;
  const filteredPages = useMemo(() => {
  const query = search.trim().toLowerCase();

    if (!query) return [];

    return navigation.filter((item) =>
      `${item.label} ${item.id} ${item.icon}`
        .toLowerCase()
        .includes(query)
    );
  }, [search]);
  

  const handleNavigation = (page) => {
    onNavigate?.(page);
    setSidebarOpen(false);
    setSearch("");
    setSearchOpen(false);
  };

  const handleLogout = () => {
    setSidebarOpen(false);
    onLogout?.();
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();

    if (filteredPages.length > 0) {
      handleNavigation(filteredPages[0].id);
    }
  };

  const currentPage =
    navigation.find((item) => item.id === activePage)?.label ||
    "Dashboard";

  return (
    <div className="dashboard-layout">
      {sidebarOpen && (
        <div
          className="dashboard-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`dashboard-sidebar ${
          sidebarOpen ? "dashboard-sidebar-open" : ""
        }`}
      >
        <div className="dashboard-sidebar-header">
          <div className="dashboard-brand">
            <div className="dashboard-brand-icon">♻️</div>

            <div>
              <div className="dashboard-brand-name">EcoNexus</div>
              <div className="dashboard-brand-subtitle">
                Smart Waste Management
              </div>
            </div>
          </div>

        <button
          type="button"
          className="dashboard-sidebar-close"
          onClick={() => {
              setSidebarOpen(false);
           }}
           aria-label="Close menu"
           >
           ✕
           </button>
        </div>

        <div className="dashboard-user-card">
          <div className="dashboard-user-avatar">
            {getInitials(user)}
          </div>

          <div className="dashboard-user-info">
            <strong>
              {user?.name ||
                user?.fullName ||
                user?.username ||
                "Scrap wala User"}
            </strong>

            <span>{getRoleName(user?.role)}</span>
          </div>
        </div>

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
              <span className="dashboard-nav-icon">
                {item.icon}
              </span>

              <span className="dashboard-nav-label">
                {item.label}
              </span>
            </button>
          ))}
        </nav>

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

      <div className="dashboard-main">
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

    <div className="dashboard-page-heading">
      <h1>{currentPage}</h1>
      <p>Manage your ScarpWala activities</p>
    </div>
  </div>

  <div className="dashboard-topbar-right">
    <form
      className="dashboard-search"
      role="search"
      onSubmit={handleSearchSubmit}
    >
      <span aria-hidden="true">🔍</span>

      <input
        type="search"
        value={search}
        placeholder="Search features..."
        aria-label="Search dashboard features"
        aria-expanded={searchOpen && search.trim().length > 0}
        onFocus={() => setSearchOpen(true)}
        onChange={(event) => {
          setSearch(event.target.value);
          setSearchOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setSearchOpen(false);
          }
        }}
      />

      {search && (
        <button
          type="button"
          className="dashboard-search-clear"
          aria-label="Clear search"
          onClick={() => {
            setSearch("");
            setSearchOpen(false);
          }}
        >
          ✕
        </button>
      )}

      {searchOpen && search.trim() && (
        <div className="dashboard-search-results">
          {filteredPages.length > 0 ? (
            filteredPages.map((item) => (
              <button
                key={item.id}
                type="button"
                className="dashboard-search-result"
                onClick={() => handleNavigation(item.id)}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
                <span aria-hidden="true">→</span>
              </button>
            ))
          ) : (
            <div className="dashboard-search-empty">
              No matching features found.
            </div>
          )}
        </div>
      )}
    </form>

    <div className="dashboard-role-badge">
      {getRoleName(user?.role)}
    </div>

    <div className="dashboard-topbar-avatar">
      {getInitials(user)}
    </div>
  </div>
</header>

        <main
          className="dashboard-content"
          onClick={() => setSearchOpen(false)}
        >
          {children}
        </main>
      </div>
    </div>
  );
}