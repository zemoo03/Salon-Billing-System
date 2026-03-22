import { useMemo, useState } from "react";
import { getBills, getStaffPerformance, getMonthlyRevenue, getServiceStats } from "../../store/dataStore";
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, CartesianGrid } from "recharts";

const COLORS = ["#f97316", "#fb7185", "#8b5cf6", "#10b981", "#3b82f6", "#f59e0b", "#14b8a6", "#ec4899", "#6366f1"];

export function Reports() {
  const bills = useMemo(() => getBills(), []);
  const [reportType, setReportType] = useState<"revenue"|"staff"|"services">("revenue");
  
  const monthlyRevenue = useMemo(() => getMonthlyRevenue(bills), [bills]);
  const staffPerf = useMemo(() => getStaffPerformance(bills), [bills]);
  const servicePerf = useMemo(() => getServiceStats(bills), [bills]);
  
  const totalRev = staffPerf.reduce((s, p) => s + p.revenue, 0);
  const totalCommission = staffPerf.reduce((s, p) => s + p.commission, 0);
  const totalCustomers = bills.filter(b => b.status === "paid").length;
  
  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Analytics & Incentives Report</div>
          <div className="page-subtitle">Detailed breakdown of salon performance</div>
        </div>
        <div className="tabs" style={{ borderBottom: "none", margin: 0 }}>
          <button className={`tab-btn ${reportType === "revenue" ? "active" : ""}`} onClick={() => setReportType("revenue")}>📈 Revenue</button>
          <button className={`tab-btn ${reportType === "staff" ? "active" : ""}`} onClick={() => setReportType("staff")}>🧑‍🤝‍🧑 Staff & Salaries</button>
          <button className={`tab-btn ${reportType === "services" ? "active" : ""}`} onClick={() => setReportType("services")}>✨ Services</button>
        </div>
      </div>
      
      {/* ── REVENUE REPORT ── */}
      {reportType === "revenue" && (
        <div className="grid">
          <div className="grid grid-3">
            <div className="card text-center">
              <div className="card-title text-muted">All-Time Revenue</div>
              <div className="card-value" style={{ color: "var(--brand-1)" }}>₹{totalRev.toLocaleString("en-IN")}</div>
            </div>
            <div className="card text-center">
              <div className="card-title text-muted">Paid Customers</div>
              <div className="card-value" style={{ color: "#3b82f6" }}>{totalCustomers}</div>
            </div>
            <div className="card text-center">
              <div className="card-title text-muted">Avg. Bill Value</div>
              <div className="card-value" style={{ color: "#10b981" }}>₹{totalCustomers ? Math.round(totalRev/totalCustomers).toLocaleString("en-IN") : 0}</div>
            </div>
          </div>
          
          <div className="card flex-1 min-h-[400px]" style={{ minHeight: 400 }}>
            <div style={{ fontWeight: 700, marginBottom: "1.5rem" }}>Monthly Revenue Trend (This Year)</div>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={monthlyRevenue} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => `₹${value.toLocaleString("en-IN")}`} />
                <Line type="monotone" dataKey="revenue" stroke="var(--brand-1)" strokeWidth={3} dot={{ strokeWidth: 2, r: 4, fill: "var(--surface)" }} activeDot={{ r: 6, fill: "var(--brand-1)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      
      {/* ── STAFF REPORT ── */}
      {reportType === "staff" && (
        <div className="grid grid-2" style={{ gridTemplateColumns: "1fr 1.5fr" }}>
          <div className="card flex-col gap-4">
            <div style={{ fontWeight: 700 }}>Salary & Incentive Overview</div>
            <div className="text-center" style={{ padding: "1.5rem", background: "#ecfeff", borderRadius: "12px", border: "1px solid #cffafe" }}>
              <div className="text-sm text-cyan-800 font-semibold mb-1">Total Incentives Payout</div>
              <div style={{ fontSize: "2rem", fontWeight: 800, color: "#0891b2" }}>₹{Math.round(totalCommission).toLocaleString("en-IN")}</div>
              <div className="text-xs text-cyan-700 mt-2">
                This is ~{totalRev ? Math.round((totalCommission/totalRev)*100) : 0}% of your total revenue.
              </div>
            </div>
            
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={staffPerf} dataKey="commission" nameKey="staffName" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
                    {staffPerf.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: number) => `₹${Math.round(v).toLocaleString("en-IN")}`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="text-center text-xs text-muted">Incentives Share by Staff</div>
            </div>
          </div>
          
          <div className="card">
            <div style={{ fontWeight: 700, marginBottom: "1rem" }}>Staff Performance Table</div>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Staff Name</th>
                    <th>Services Done</th>
                    <th>Revenue Brought</th>
                    <th>Commission Earned</th>
                  </tr>
                </thead>
                <tbody>
                  {staffPerf.map((s, i) => (
                    <tr key={s.staffId}>
                      <td style={{ fontWeight: 600 }}>
                        <div className="flex items-center gap-2">
                          <div style={{ width: 12, height: 12, borderRadius: 3, background: COLORS[i % COLORS.length] }}></div>
                          {s.staffName}
                        </div>
                      </td>
                      <td>{s.services}</td>
                      <td>₹{s.revenue.toLocaleString("en-IN")}</td>
                      <td style={{ fontWeight: 700, color: "#10b981" }}>₹{Math.round(s.commission).toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                  <tr style={{ background: "var(--surface-2)" }}>
                    <td style={{ fontWeight: 800 }}>TOTAL</td>
                    <td style={{ fontWeight: 700 }}>{staffPerf.reduce((a, b) => a + b.services, 0)}</td>
                    <td style={{ fontWeight: 800 }}>₹{totalRev.toLocaleString("en-IN")}</td>
                    <td style={{ fontWeight: 800, color: "#10b981" }}>₹{Math.round(totalCommission).toLocaleString("en-IN")}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      
      {/* ── SERVICES REPORT ── */}
      {reportType === "services" && (
        <div className="grid grid-2" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div className="card" style={{ minHeight: 400 }}>
            <div style={{ fontWeight: 700, marginBottom: "1rem" }}>Top Services by Revenue</div>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart layout="vertical" data={servicePerf.slice(0, 8)} margin={{ top: 0, right: 30, left: 60, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="serviceName" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#475569" }} width={80} />
                <Tooltip formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`} />
                <Bar dataKey="revenue" fill="#8b5cf6" radius={[0,4,4,0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="card">
            <div style={{ fontWeight: 700, marginBottom: "1rem" }}>Service Demand (Bookings count)</div>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Service</th>
                    <th style={{ textAlign: "right" }}>Times Booked</th>
                    <th style={{ textAlign: "right" }}>Total Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {[...servicePerf].sort((a,b) => b.count - a.count).map(s => (
                    <tr key={s.serviceId}>
                      <td style={{ fontWeight: 600 }}>{s.serviceName}</td>
                      <td style={{ textAlign: "right" }}>
                        <span className="badge badge-purple">{s.count}</span>
                      </td>
                      <td style={{ textAlign: "right", color: "var(--text-2)" }}>₹{s.revenue.toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
