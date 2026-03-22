import { useMemo, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { getBills, getStaff, getStaffPerformance } from "../../store/dataStore";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

export function StaffDashboard() {
  const { user } = useAuth();
  
  const [dateFilter, setDateFilter] = useState<"week"|"month">("week");
  
  const bills = useMemo(() => getBills(), []);
  const staff = useMemo(() => getStaff().find(s => s.id === user?.staffId), [user]);
  
  const myPerformance = useMemo(() => {
    if (!staff) return null;
    return getStaffPerformance(bills).find(p => p.staffId === staff.id);
  }, [bills, staff]);
  
  const recentServices = useMemo(() => {
    if (!staff) return [];
    return bills.filter(b => b.status === "paid" && b.lineItems.some(l => l.staffId === staff.id))
      .flatMap(b => b.lineItems.filter(l => l.staffId === staff.id).map(l => ({ ...l, date: b.date, billNumber: b.billNumber, customerName: b.customerName })))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  }, [bills, staff]);
  
  const chartData = useMemo(() => {
    if (!staff) return [];
    const limitDays = dateFilter === "week" ? 7 : 30;
    const res = [];
    for (let i = limitDays - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = d.toDateString();
      let dayRev = 0; let dayCom = 0;
      bills.filter(b => b.status === "paid" && new Date(b.date).toDateString() === ds).forEach(b => {
        b.lineItems.forEach(l => {
          if (l.staffId === staff.id) {
            dayRev += l.price;
            dayCom += l.price * (l.commissionPct / 100);
          }
        });
      });
      res.push({
        day: d.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
        revenue: dayRev,
        earnings: Math.round(dayCom)
      });
    }
    return res;
  }, [bills, staff, dateFilter]);

  if (!staff) {
    return <div className="alert alert-error">Error: Staff profile not linked to this account. Contact your admin.</div>;
  }

  const todayRev = chartData.find(c => c.day === new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric" }))?.revenue ?? 0;
  const todayEarn = chartData.find(c => c.day === new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric" }))?.earnings ?? 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Welcome back, {staff.name.split(" ")[0]}!</div>
          <div className="page-subtitle">Your target commission is {staff.commissionPct}% per service.</div>
        </div>
      </div>
      
      <div className="grid grid-3 mb-4">
        <div className="card">
          <div className="card-title text-muted">Today's Earnings</div>
          <div className="card-value" style={{ color: "#10b981" }}>₹{todayEarn.toLocaleString("en-IN")}</div>
          <div className="text-sm mt-1">From ₹{todayRev.toLocaleString("en-IN")} generated revenue</div>
        </div>
        
        <div className="card">
          <div className="card-title text-muted">Total Services</div>
          <div className="card-value">{myPerformance?.services ?? 0}</div>
          <div className="text-sm mt-1">Across all-time bills</div>
        </div>
        
        <div className="card">
          <div className="card-title text-muted">All-Time Commission Earnings</div>
          <div className="card-value" style={{ color: "var(--brand-1)" }}>₹{Math.round(myPerformance?.commission ?? 0).toLocaleString("en-IN")}</div>
          <div className="text-sm mt-1">From ₹{(myPerformance?.revenue ?? 0).toLocaleString("en-IN")} total revenue</div>
        </div>
      </div>
      
      <div className="grid grid-2" style={{ gridTemplateColumns: "1.5fr 1fr", gap: "1.5rem" }}>
        <div className="card">
          <div className="flex justify-between items-center mb-3">
            <div style={{ fontWeight: 700 }}>My Earnings Overview</div>
            <select className="select" style={{ width: "auto", padding: "0.25rem 0.6rem", fontSize: "0.8rem" }} value={dateFilter} onChange={e => setDateFilter(e.target.value as "week"|"month")}>
              <option value="week">Past 7 Days</option>
              <option value="month">Past 30 Days</option>
            </select>
          </div>
          
          <div style={{ height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₹${v}`} />
                <Tooltip formatter={(value: any, name: any) => [`₹${value.toLocaleString("en-IN")}`, name === "earnings" ? "Commission Earned" : "Revenue Generated"]} />
                <Line type="step" dataKey="revenue"  stroke="#94a3b8" strokeWidth={2} name="revenue" dot={false} />
                <Line type="monotone" dataKey="earnings" stroke="#10b981" strokeWidth={3} name="earnings" dot={{ r: 3, fill: "#10b981" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: "1rem" }}>My Recent Services</div>
          {recentServices.length === 0 ? (
            <div className="empty-state" style={{ padding: "2rem 1rem" }}>
              <div className="empty-state-icon text-muted" style={{ fontSize: "2rem" }}>✂️</div>
              <p>No services recorded yet.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {recentServices.map((svc, i) => (
                <div key={`${svc.id}-${i}`} className="flex justify-between items-center" style={{ paddingBottom: "0.5rem", borderBottom: "1px solid var(--border)" }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>{svc.serviceName}</div>
                    <div className="text-xs text-muted">
                      {new Date(svc.date).toLocaleDateString("en-IN", { day:"numeric", month:"short" })} · {svc.customerName}
                    </div>
                  </div>
                  <div className="text-right">
                    <div style={{ fontSize: "0.85rem", fontWeight: 700 }}>₹{svc.price}</div>
                    <div className="text-xs" style={{ color: "#10b981", fontWeight: 600 }}>Earned ₹{Math.round(svc.price * svc.commissionPct / 100)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
