import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getBills, saveBills, type Bill } from "../../store/dataStore";

export function BillsList() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all"|"paid"|"draft"|"cancelled">("all");
  const [dateFilter, setDateFilter] = useState<"all"|"today"|"week"|"month">("all");

  const bills = useMemo(() => getBills().sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), []);

  const filtered = useMemo(() => {
    const now = new Date();
    return bills.filter(b => {
      const matchSearch = !search || b.customerName.toLowerCase().includes(search.toLowerCase()) || b.billNumber.toLowerCase().includes(search.toLowerCase()) || b.customerPhone?.includes(search);
      const matchStatus = statusFilter === "all" || b.status === statusFilter;
      const bd = new Date(b.date);
      let matchDate = true;
      if (dateFilter === "today") matchDate = bd.toDateString() === now.toDateString();
      else if (dateFilter === "week") { const w = new Date(now); w.setDate(w.getDate()-7); matchDate = bd >= w; }
      else if (dateFilter === "month") { const m = new Date(now); m.setDate(1); m.setHours(0,0,0,0); matchDate = bd >= m; }
      return matchSearch && matchStatus && matchDate;
    });
  }, [bills, search, statusFilter, dateFilter]);

  const totalFiltered = filtered.reduce((s, b) => s + b.grandTotal, 0);

  const cancelBill = (id: string) => {
    const updated = bills.map(b => b.id === id ? { ...b, status: "cancelled" as Bill["status"] } : b);
    saveBills(updated);
    window.location.reload();
  };

  const exportCSV = () => {
    const header = ["Bill No", "Customer", "Phone", "Date", "Services", "Total", "Discount", "Grand Total", "Status"];
    const rows = filtered.map(b => [
      b.billNumber, b.customerName, b.customerPhone,
      new Date(b.date).toLocaleDateString("en-IN"),
      b.lineItems.map(l => l.serviceName).join("; "),
      b.total, b.discount, b.grandTotal, b.status,
    ]);
    const csv = [header, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "bills_export.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Bills & Invoices</div>
          <div className="page-subtitle">{filtered.length} records · Total ₹{totalFiltered.toLocaleString("en-IN")}</div>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary btn-sm" onClick={exportCSV}>📥 Export CSV</button>
          <button className="btn btn-primary" onClick={() => navigate("/billing/new")}>+ New Bill</button>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-3">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="search-wrap flex-1" style={{ minWidth: 200 }}>
            <span className="search-icon">🔍</span>
            <input className="input search-input" placeholder="Search by customer, phone, or bill no..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="select" style={{ width: "auto" }} value={statusFilter} onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}>
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="draft">Draft</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select className="select" style={{ width: "auto" }} value={dateFilter} onChange={e => setDateFilter(e.target.value as typeof dateFilter)}>
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Bill No.</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Date & Time</th>
                <th>Services</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <div className="empty-state-icon">📋</div>
                      <h3>No bills found</h3>
                      <p>Try adjusting search or filters</p>
                    </div>
                  </td>
                </tr>
              )}
              {filtered.map(bill => (
                <tr key={bill.id} style={{ cursor: "pointer" }} onClick={() => navigate(`/billing/${bill.id}`)}>
                  <td style={{ fontWeight: 700, color: "var(--brand-1)" }}>{bill.billNumber}</td>
                  <td style={{ fontWeight: 600 }}>{bill.customerName}</td>
                  <td className="text-muted">{bill.customerPhone || "—"}</td>
                  <td className="text-muted">{new Date(bill.date).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })}<br /><span style={{ fontSize: "0.72rem" }}>{new Date(bill.date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span></td>
                  <td>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                      {bill.lineItems.slice(0,2).map(l => (
                        <span key={l.id} className="badge badge-gray">{l.serviceName}</span>
                      ))}
                      {bill.lineItems.length > 2 && <span className="badge badge-gray">+{bill.lineItems.length - 2}</span>}
                    </div>
                  </td>
                  <td style={{ fontWeight: 700 }}>₹{bill.grandTotal.toLocaleString("en-IN")}</td>
                  <td onClick={e => e.stopPropagation()}>
                    <span className={`badge ${bill.status === "paid" ? "badge-green" : bill.status === "cancelled" ? "badge-red" : "badge-orange"}`}>
                      {bill.status}
                    </span>
                  </td>
                  <td onClick={e => e.stopPropagation()}>
                    <div className="flex gap-2">
                      <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/billing/${bill.id}`)}>View</button>
                      {bill.status !== "cancelled" && (
                        <button className="btn btn-danger btn-sm" onClick={() => { if(confirm("Cancel this bill?")) cancelBill(bill.id); }}>Cancel</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
