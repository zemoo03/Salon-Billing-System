import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";
import {
  getBills, getStaff, getServices,
  getStaffPerformance, getServiceStats, getWeeklyRevenue,
} from "../../store/dataStore";

const COLORS = ["#f97316", "#fb7185", "#a78bfa", "#34d399", "#60a5fa", "#fbbf24"];

export function AdminDashboard() {
  const navigate = useNavigate();
  const [chartTab, setChartTab] = useState<"weekly"|"staff"|"services">("weekly");

  const bills    = useMemo(() => getBills(), []);
  const staff    = useMemo(() => getStaff(), []);
  const services = useMemo(() => getServices(), []);

  const todayStr = new Date().toDateString();
  const today = bills.filter(b => b.status === "paid" && new Date(b.date).toDateString() === todayStr);
  const paid  = bills.filter(b => b.status === "paid");

  const todayRevenue   = today.reduce((s, b) => s + b.grandTotal, 0);
  const totalRevenue   = paid.reduce((s, b) => s + b.grandTotal, 0);
  const todayCustomers = today.length;
  const totalCustomers = paid.length;

  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0);
  const monthRevenue = paid.filter(b => new Date(b.date) >= monthStart).reduce((s, b) => s + b.grandTotal, 0);

  const perf = useMemo(() => getStaffPerformance(paid), [paid]);
  const svcStats = useMemo(() => getServiceStats(paid), [paid]);
  const weeklyData = useMemo(() => getWeeklyRevenue(bills), [bills]);

  const topStaff = perf[0]?.staffName ?? "—";
  const totalServices = paid.reduce((s, b) => s + b.lineItems.length, 0);

  return (
    <div>
      {/* Stat cards */}
      <div className="grid grid-4 mb-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        {[
          { icon: "💰", label: "Today's Revenue",  value: `₹${todayRevenue.toLocaleString("en-IN")}`,  sub: `${todayCustomers} customers today`,   ic: "stat-icon-green"  },
          { icon: "📅", label: "Month Revenue",    value: `₹${monthRevenue.toLocaleString("en-IN")}`,  sub: "This calendar month",                   ic: "stat-icon-orange" },
          { icon: "👥", label: "Total Customers",  value: totalCustomers,                               sub: `${totalServices} services done`,        ic: "stat-icon-blue"   },
          { icon: "⭐", label: "Top Performer",    value: topStaff,                                    sub: `₹${perf[0]?.revenue?.toLocaleString("en-IN") ?? 0} revenue`, ic: "stat-icon-purple" },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className={`card-icon ${s.ic}`}>{s.icon}</div>
            <div>
              <div className="card-title">{s.label}</div>
              <div className="card-value" style={{ fontSize: "1.4rem" }}>{s.value}</div>
              <div className="card-sub">{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-2 mb-4" style={{ gridTemplateColumns: "2fr 1fr" }}>
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="card-title" style={{ fontSize: "0.9rem", textTransform: "none", letterSpacing: 0, margin: 0, color: "var(--text)", fontWeight: 700 }}>Revenue Overview</div>
            <div className="tabs" style={{ margin: 0, borderBottom: "none" }}>
              {(["weekly","staff","services"] as const).map(t => (
                <button key={t} className={`tab-btn ${chartTab === t ? "active" : ""}`} style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem" }} onClick={() => setChartTab(t)}>
                  {t === "weekly" ? "This Week" : t === "staff" ? "By Staff" : "Services"}
                </button>
              ))}
            </div>
          </div>

          {chartTab === "weekly" && (
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData} barCategoryGap="35%">
                  <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]} />
                  <Bar dataKey="revenue" fill="#f97316" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {chartTab === "staff" && (
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={perf.slice(0,6)} barCategoryGap="35%">
                  <XAxis dataKey="staffName" tick={{ fontSize: 11 }} tickFormatter={n => n.split(" ")[0]} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Revenue"]} />
                  <Bar dataKey="revenue" radius={[6,6,0,0]}>
                    {perf.slice(0,6).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {chartTab === "services" && (
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={svcStats.slice(0,6)} barCategoryGap="35%">
                  <XAxis dataKey="serviceName" tick={{ fontSize: 11 }} tickFormatter={n => n.length > 10 ? n.slice(0,10)+"…" : n} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#fb7185" radius={[6,6,0,0]} name="Times booked" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-title" style={{ fontSize: "0.9rem", textTransform: "none", letterSpacing: 0, color: "var(--text)", fontWeight: 700, marginBottom: "0.75rem" }}>
            Top Services (Revenue)
          </div>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={svcStats.slice(0,5)} dataKey="revenue" nameKey="serviceName" cx="50%" cy="50%" outerRadius={75} innerRadius={35}>
                  {svcStats.slice(0,5).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend iconSize={8} formatter={(value) => <span style={{ fontSize: "0.73rem" }}>{value}</span>} />
                <Tooltip formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom row: staff table + quick actions */}
      <div className="grid grid-2" style={{ gridTemplateColumns: "1.5fr 1fr" }}>
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div style={{ fontWeight: 700 }}>Staff Performance</div>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate("/reports")}>View All →</button>
          </div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Staff</th>
                  <th>Services</th>
                  <th>Revenue</th>
                  <th>Commission</th>
                </tr>
              </thead>
              <tbody>
                {perf.slice(0,5).map(p => (
                  <tr key={p.staffId}>
                    <td style={{ fontWeight: 600 }}>{p.staffName.split(" ")[0]}</td>
                    <td>{p.services}</td>
                    <td>₹{p.revenue.toLocaleString("en-IN")}</td>
                    <td style={{ color: "#10b981", fontWeight: 600 }}>₹{Math.round(p.commission).toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: "1rem" }}>Quick Actions</div>
          <div className="flex flex-col gap-2">
            {[
              { icon: "🧾", label: "Create New Bill",    action: () => navigate("/billing/new") },
              { icon: "👥", label: "Manage Staff",       action: () => navigate("/staff") },
              { icon: "✨", label: "Manage Services",    action: () => navigate("/services") },
              { icon: "📈", label: "View Analytics",     action: () => navigate("/reports") },
              { icon: "📋", label: "All Bills",          action: () => navigate("/billing") },
            ].map(item => (
              <button key={item.label} className="btn btn-secondary" style={{ justifyContent: "flex-start", borderRadius: "8px" }} onClick={item.action}>
                <span>{item.icon}</span> {item.label}
              </button>
            ))}
          </div>

          <div style={{ marginTop: "1rem", padding: "0.75rem", background: "var(--surface-2)", borderRadius: "8px" }}>
            <div className="text-sm font-semibold mb-1">Total Business</div>
            <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "var(--brand-1)" }}>₹{totalRevenue.toLocaleString("en-IN")}</div>
            <div className="text-xs text-muted">{services.length} services · {staff.filter(s => s.active).length} active staff</div>
          </div>
        </div>
      </div>
    </div>
  );
}
