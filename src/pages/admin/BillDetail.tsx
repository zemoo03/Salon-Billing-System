import { useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBills } from "../../store/dataStore";

export function BillDetail() {
  const { billId } = useParams();
  const navigate   = useNavigate();
  const printRef   = useRef<HTMLDivElement>(null);

  const bill = useMemo(() => getBills().find(b => b.id === billId), [billId]);

  const handlePrint = () => window.print();

  const exportBillCSV = () => {
    if (!bill) return;
    const header = ["Service", "Staff", "Commission %", "Commission ₹", "Price"];
    const rows = bill.lineItems.map(l => [
      l.serviceName, l.staffName, l.commissionPct,
      Math.round(l.price * l.commissionPct / 100), l.price,
    ]);
    const footer = [["", "", "", "Grand Total", bill.grandTotal]];
    const csv = [header, ...rows, ...footer].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `${bill.billNumber}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  if (!bill) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📋</div>
        <h3>Bill not found</h3>
        <button className="btn btn-secondary mt-3" onClick={() => navigate("/billing")}>← Back to Bills</button>
      </div>
    );
  }

  const commissionsByStaff = bill.lineItems.reduce((acc, item) => {
    const key = item.staffId;
    if (!acc[key]) acc[key] = { name: item.staffName, revenue: 0, commission: 0, count: 0 };
    acc[key].revenue += item.price;
    acc[key].commission += Math.round(item.price * item.commissionPct / 100);
    acc[key].count++;
    return acc;
  }, {} as Record<string, { name: string; revenue: number; commission: number; count: number }>);

  return (
    <div>
      <div className="page-header no-print">
        <div>
          <button className="btn btn-ghost btn-sm mb-2" onClick={() => navigate("/billing")}>← Back to Bills</button>
          <div className="page-title">{bill.billNumber}</div>
          <div className="page-subtitle">{bill.customerName} · {new Date(bill.date).toLocaleDateString("en-IN", { dateStyle: "full" })}</div>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary btn-sm" onClick={exportBillCSV}>📥 CSV</button>
          <button className="btn btn-primary" onClick={handlePrint}>🖨️ Print / PDF</button>
        </div>
      </div>

      <div ref={printRef} style={{ maxWidth: 700, margin: "0 auto" }}>
        {/* Bill header */}
        <div className="card mb-3">
          <div className="flex justify-between items-start" style={{ flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: "1.3rem", color: "var(--brand-1)" }}>✨ EVES Spa &amp; Salon</div>
              <div className="text-sm text-muted">Premium Spa &amp; Salon Services</div>
              <div className="text-sm text-muted mt-1">Invoice #{bill.billNumber}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 700, fontSize: "1.05rem" }}>{bill.customerName}</div>
              {bill.customerPhone && <div className="text-sm text-muted">📞 {bill.customerPhone}</div>}
              <div className="text-sm text-muted">{new Date(bill.date).toLocaleDateString("en-IN", { dateStyle: "long" })}</div>
              <div className="text-sm text-muted">{new Date(bill.date).toLocaleTimeString("en-IN", { timeStyle: "short" })}</div>
              <span className={`badge mt-1 ${bill.status === "paid" ? "badge-green" : bill.status === "cancelled" ? "badge-red" : "badge-orange"}`}>
                {bill.status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Line items */}
        <div className="card mb-3">
          <div style={{ fontWeight: 700, marginBottom: "1rem" }}>Service Details</div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Service</th>
                  <th>Performed By</th>
                  <th>Commission</th>
                  <th style={{ textAlign: "right" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {bill.lineItems.map((item, i) => (
                  <tr key={item.id}>
                    <td className="text-muted">{i + 1}</td>
                    <td style={{ fontWeight: 600 }}>{item.serviceName}</td>
                    <td>{item.staffName}</td>
                    <td className="text-muted">{item.commissionPct}% = ₹{Math.round(item.price * item.commissionPct / 100)}</td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>₹{item.price.toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4} style={{ textAlign: "right", color: "var(--text-2)", fontWeight: 600 }}>Subtotal</td>
                  <td style={{ textAlign: "right" }}>₹{bill.total.toLocaleString("en-IN")}</td>
                </tr>
                {bill.discount > 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "right", color: "#10b981", fontWeight: 600 }}>Discount</td>
                    <td style={{ textAlign: "right", color: "#10b981" }}>- ₹{bill.discount.toLocaleString("en-IN")}</td>
                  </tr>
                )}
                <tr>
                  <td colSpan={4} style={{ textAlign: "right", fontWeight: 800, fontSize: "1rem" }}>GRAND TOTAL</td>
                  <td style={{ textAlign: "right", fontWeight: 800, fontSize: "1.1rem", color: "var(--brand-1)" }}>
                    ₹{bill.grandTotal.toLocaleString("en-IN")}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          {bill.notes && (
            <div className="alert alert-info mt-3" style={{ marginBottom: 0 }}>📝 {bill.notes}</div>
          )}
        </div>

        {/* Staff earnings breakdown */}
        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: "1rem" }}>Staff Earnings Breakdown</div>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Staff</th>
                  <th>Services</th>
                  <th>Revenue Generated</th>
                  <th style={{ color: "#10b981" }}>Commission Earned</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(commissionsByStaff).map(s => (
                  <tr key={s.name}>
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td>{s.count}</td>
                    <td>₹{s.revenue.toLocaleString("en-IN")}</td>
                    <td style={{ color: "#10b981", fontWeight: 700 }}>₹{s.commission.toLocaleString("en-IN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-xs text-muted mt-2">
            ✅ This bill has been linked to each staff member's performance record.
          </div>
        </div>
      </div>
    </div>
  );
}
