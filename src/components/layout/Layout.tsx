import { useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

interface NavItem { to: string; icon: string; label: string; roles?: ("admin"|"owner"|"staff")[] }

const NAV_ITEMS: NavItem[] = [
  { to: "/dashboard",       icon: "📊", label: "Dashboard",          roles: ["admin","owner"] },
  { to: "/staff-dashboard", icon: "📊", label: "My Dashboard",       roles: ["staff"] },
  { to: "/clients",         icon: "👥", label: "Clients",            roles: ["admin","owner","staff"] },
  { to: "/billing",         icon: "🧾", label: "Invoice",            roles: ["admin","owner","staff"] },
  { to: "/staff",           icon: "👤", label: "Staff",              roles: ["admin","owner"] },
  { to: "/inventory",       icon: "📦", label: "Inventory",          roles: ["admin","owner"] },
  { to: "/members",         icon: "💳", label: "Members",            roles: ["admin","owner"] },
  { to: "/loyalty",         icon: "🏷️", label: "Cashback & Loyalty",  roles: ["admin","owner"] },
  { to: "/templates",       icon: "📝", label: "Templates",          roles: ["admin","owner"] },
  { to: "/reports",         icon: "📈", label: "Reports",            roles: ["admin","owner"] },
  { to: "/settings",        icon: "⚙️", label: "Settings",           roles: ["admin","owner"] },
];

function getNavIcon(label: string) {
  const size = 16;
  const stroke = "currentColor";
  const strokeWidth = 2;
  const fill = "none";
  
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill,
    stroke,
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (label) {
    case "Dashboard":
    case "My Dashboard":
      return (
        <svg {...props}>
          <rect x="3" y="3" width="7" height="9" rx="1" />
          <rect x="14" y="3" width="7" height="5" rx="1" />
          <rect x="14" y="12" width="7" height="9" rx="1" />
          <rect x="3" y="16" width="7" height="5" rx="1" />
        </svg>
      );
    case "Clients":
      return (
        <svg {...props}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "Invoice":
      return (
        <svg {...props}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      );
    case "Staff":
      return (
        <svg {...props}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <polyline points="16 11 18 13 22 9" />
        </svg>
      );
    case "Inventory":
      return (
        <svg {...props}>
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      );
    case "Members":
      return (
        <svg {...props}>
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      );
    case "Cashback & Loyalty":
      return (
        <svg {...props}>
          <line x1="19" y1="5" x2="5" y2="19" />
          <circle cx="6.5" cy="6.5" r="2.5" />
          <circle cx="17.5" cy="17.5" r="2.5" />
        </svg>
      );
    case "Templates":
      return (
        <svg {...props}>
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      );
    case "Reports":
      return (
        <svg {...props}>
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      );
    case "Settings":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    default:
      return <span>❓</span>;
  }
}

function getPageTitle(pathname: string): { title: string; sub: string } {
  if (pathname.includes("/billing/new")) return { title: "New Invoice", sub: "Create a combined customer bill" };
  if (pathname.includes("/billing"))     return { title: "Invoice Management", sub: "Manage client receipts & records" };
  if (pathname.includes("/staff-dashboard")) return { title: "My Dashboard", sub: "Your performance & earnings" };
  if (pathname.includes("/dashboard"))   return { title: "Salon Dashboard", sub: "Performance overview & appointment grid" };
  if (pathname.includes("/staff"))       return { title: "Staff Management", sub: "Manage team & set commissions" };
  if (pathname.includes("/services"))    return { title: "Service Catalogue", sub: "Manage services & pricing" };
  if (pathname.includes("/reports"))     return { title: "Business Reports", sub: "Performance insights" };
  if (pathname.includes("/clients"))     return { title: "Clients Database", sub: "Manage salon client profiles" };
  if (pathname.includes("/inventory"))   return { title: "Inventory List", sub: "Monitor stock levels & alerts" };
  if (pathname.includes("/members"))     return { title: "Membership Plans", sub: "Manage premium spa subscriptions" };
  if (pathname.includes("/loyalty"))     return { title: "Cashback & Loyalty Points", sub: "Configure custom salon rewards" };
  if (pathname.includes("/templates"))   return { title: "Sms & Invoice Templates", sub: "Manage outbound communications" };
  if (pathname.includes("/settings"))    return { title: "System Settings", sub: "Salon branding & configurations" };
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
              <span className="nav-icon">{getNavIcon(item.label)}</span>
              <span className="nav-label">{item.label}</span>
              {item.label === "Settings" && (
                <span style={{ marginLeft: "auto", fontSize: "0.75rem", opacity: 0.6 }}>&gt;</span>
              )}
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
