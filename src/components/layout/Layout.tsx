import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

interface NavItem { to: string; icon: string; label: string; roles?: ("admin"|"owner"|"staff")[] }

const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard",       icon: "📊", label: "Dashboard",   roles: ["admin","owner"] },
  { to: "/staff-dashboard", icon: "📊", label: "My Dashboard",roles: ["staff"] },
  { to: "/billing/new",     icon: "🧾", label: "New Bill",     roles: ["admin","owner","staff"] },
  { to: "/billing",         icon: "📋", label: "Bills",        roles: ["admin","owner"] },
  { to: "/staff",           icon: "👥", label: "Staff",        roles: ["admin","owner"] },
  { to: "/services",        icon: "✨", label: "Services",     roles: ["admin","owner"] },
  { to: "/reports",         icon: "📈", label: "Analytics",    roles: ["admin","owner"] },
];

function getPageTitle(pathname: string): { title: string; sub: string } {
  if (pathname.includes("/billing/new")) return { title: "New Bill", sub: "Create a combined customer bill" };
  if (pathname.includes("/billing"))     return { title: "Bills & Invoices", sub: "All customer transactions" };
  if (pathname.includes("/staff-dashboard")) return { title: "My Dashboard", sub: "Your performance & earnings" };
  if (pathname.includes("/dashboard"))   return { title: "Salon Command Centre", sub: "Overview of your salon today" };
  if (pathname.includes("/staff"))       return { title: "Staff Management", sub: "Manage team & set commissions" };
  if (pathname.includes("/services"))    return { title: "Service Catalogue", sub: "Manage services & pricing" };
  if (pathname.includes("/reports"))     return { title: "Analytics & Reports", sub: "Performance insights" };
  return { title: "EVES Spa & Salon", sub: "" };
}

export function Layout() {
  const { user, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => document.body.classList.contains("dark-mode"));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.body.classList.toggle("dark-mode", next);
  };

  const visibleItems = NAV_ITEMS.filter(item =>
    !item.roles || (role && item.roles.includes(role))
  );

  const { title, sub } = getPageTitle(location.pathname);
  const initials = (user?.name ?? user?.email ?? "U").slice(0, 2).toUpperCase();

  return (
    <div className="app-shell">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 99 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon" style={{ fontSize: "0.8rem", padding: "4px" }}>✨</div>
            <span style={{ fontSize: "1.2rem" }}>EVES</span>
          </div>
          <div className="sidebar-tagline">Spa &amp; Salon Management</div>
        </div>

        <div className="sidebar-section">Menu</div>
        <nav className="sidebar-nav">
          {visibleItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/billing"}
              className={({ isActive }) =>
                "sidebar-link" + (isActive ? " sidebar-link-active" : "")
              }
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-avatar">{initials}</div>
          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{user?.name ?? user?.email}</div>
            <div className="sidebar-user-role">{role?.toUpperCase()}</div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="main">
        <header className="topbar">
          <div className="flex items-center gap-3">
            <button
              className="btn btn-ghost btn-sm"
              style={{ display: "none", fontSize: "1.2rem" }}
              id="sidebar-toggle"
              onClick={() => setSidebarOpen(s => !s)}
            >☰</button>
            <div className="topbar-left">
              <h2>{title}</h2>
              {sub && <p>{sub}</p>}
            </div>
          </div>

          <div className="topbar-right">
            <button className="btn btn-ghost btn-sm" onClick={toggleDark} title="Toggle dark mode">
              {darkMode ? "☀️" : "🌙"}
            </button>
            <div className="topbar-user">
              <span style={{ fontSize: "1rem" }}>👤</span>
              <span>{user?.name ?? user?.email}</span>
              <span className={`badge badge-${role === "admin" ? "orange" : role === "owner" ? "purple" : "blue"}`}>
                {role}
              </span>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={async () => { await logout(); navigate("/login"); }}
            >
              Logout
            </button>
          </div>
        </header>

        <div className="content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
