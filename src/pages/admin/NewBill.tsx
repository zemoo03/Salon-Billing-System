import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  getBills, getStaff, getServices, saveBills, nextBillNumber,
  type Bill, type BillLineItem,
} from "../../store/dataStore";
import { useAuth } from "../../auth/AuthContext";

export function NewBill() {
  const { role, user } = useAuth();
  const navigate = useNavigate();

  const allStaff    = useMemo(() => getStaff().filter(s => s.active && s.role === "staff"), []);
  const allServices = useMemo(() => getServices(), []);

  // Staff can only add themselves
  const staffList = role === "staff"
    ? allStaff.filter(s => s.id === user?.staffId)
    : allStaff;

  const [customerName,  setCustomerName]  = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes,         setNotes]         = useState("");
  const [discount,      setDiscount]      = useState(0);
  const [lines,         setLines]         = useState<BillLineItem[]>([]);
  const [saved,         setSaved]         = useState(false);
  const [savedBillId,   setSavedBillId]   = useState<string | null>(null);

  // Line item editor
  const [selServiceId, setSelServiceId] = useState(allServices[0]?.id ?? "");
  const [selStaffId,   setSelStaffId]   = useState(staffList[0]?.id ?? "");
  const [customPrice,  setCustomPrice]  = useState<number>(0);

  const selService = allServices.find(s => s.id === selServiceId);
  const selStaff   = staffList.find(s => s.id === selStaffId);

  const handleServiceChange = (id: string) => {
    setSelServiceId(id);
    const svc = allServices.find(s => s.id === id);
    if (svc) setCustomPrice(svc.basePrice);
  };

  const addLine = () => {
    if (!selService || !selStaff) return;
    const newLine: BillLineItem = {
      id:           crypto.randomUUID(),
      serviceId:    selService.id,
      serviceName:  selService.name,
      staffId:      selStaff.id,
      staffName:    selStaff.name,
      price:        customPrice || selService.basePrice,
      commissionPct: selStaff.commissionPct,
    };
    setLines(prev => [...prev, newLine]);
    // reset selector but keep customer
    const next = allServices.find(s => s.id !== selServiceId) ?? allServices[0];
    if (next) { setSelServiceId(next.id); setCustomPrice(next.basePrice); }
  };

  const removeLine = (id: string) => setLines(prev => prev.filter(l => l.id !== id));

  const subtotal   = lines.reduce((s, l) => s + l.price, 0);
  const grandTotal = Math.max(0, subtotal - discount);

  const saveBill = () => {
    if (!customerName.trim() || lines.length === 0) return;
    const bills = getBills();
    const bill: Bill = {
      id:           crypto.randomUUID(),
      billNumber:   nextBillNumber(),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      date:         new Date().toISOString(),
      lineItems:    lines,
      total:        subtotal,
      discount,
      grandTotal,
      status:       "paid",
      notes:        notes.trim(),
    };
    saveBills([...bills, bill]);
    setSavedBillId(bill.id);
    setSaved(true);
  };

  if (saved && savedBillId) {
    return (
      <div className="card text-center" style={{ maxWidth: 480, margin: "4rem auto", padding: "2.5rem" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
        <h2 style={{ fontWeight: 700, marginBottom: "0.5rem" }}>Bill Saved!</h2>
        <p className="text-muted mb-4">The bill has been saved and linked to all staff members.</p>
        <div className="flex gap-3 justify-center">
          <button className="btn btn-primary" onClick={() => navigate(`/billing/${savedBillId}`)}>View Bill</button>
          <button className="btn btn-secondary" onClick={() => { setSaved(false); setSavedBillId(null); setCustomerName(""); setCustomerPhone(""); setLines([]); setDiscount(0); setNotes(""); }}>
            New Bill
          </button>
          <button className="btn btn-ghost" onClick={() => navigate("/billing")}>All Bills</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">New Bill</div>
          <div className="page-subtitle">Create a combined customer bill across multiple staff</div>
        </div>
      </div>

      <div className="grid" style={{ gridTemplateColumns: "1fr 340px", gap: "1.25rem", alignItems: "start" }}>
        {/* Left: form */}
        <div>
          {/* Customer details */}
          <div className="card mb-3">
            <div style={{ fontWeight: 700, marginBottom: "1rem", fontSize: "0.95rem" }}>👤 Customer Details</div>
            <div className="form-row">
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Customer Name *</label>
                <input className="input" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="e.g. Neha Sharma" />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Phone Number</label>
                <input className="input" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="e.g. 9876543210" />
              </div>
            </div>
          </div>

          {/* Add service line */}
          <div className="card mb-3">
            <div style={{ fontWeight: 700, marginBottom: "1rem", fontSize: "0.95rem" }}>✨ Add Service</div>
            <div className="form-row" style={{ gridTemplateColumns: "1.5fr 1.2fr 0.8fr auto" }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Service</label>
                <select className="select" value={selServiceId} onChange={e => handleServiceChange(e.target.value)}>
                  {allServices.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Staff Member</label>
                <select className="select" value={selStaffId} onChange={e => setSelStaffId(e.target.value)}>
                  {staffList.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.commissionPct}%)</option>
                  ))}
                </select>
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Price (₹)</label>
                <input className="input" type="number" min={0} value={customPrice} onChange={e => setCustomPrice(Number(e.target.value))} />
              </div>
              <div style={{ paddingTop: "1.5rem" }}>
                <button className="btn btn-primary" onClick={addLine} disabled={!customerName.trim()}>+ Add</button>
              </div>
            </div>
            {selService && (
              <div className="text-xs text-muted">
                Default price: ₹{selService.basePrice.toLocaleString("en-IN")} · Duration: {selService.durationMins} min
                {selStaff && ` · Commission: ${selStaff.commissionPct}% → ₹${Math.round((customPrice||selService.basePrice) * selStaff.commissionPct / 100)}`}
              </div>
            )}
            {!customerName.trim() && (
              <div className="alert alert-warning mt-2" style={{ marginBottom: 0 }}>⚠️ Enter customer name first before adding services.</div>
            )}
          </div>

          {/* Service lines table */}
          {lines.length > 0 && (
            <div className="card">
              <div style={{ fontWeight: 700, marginBottom: "1rem", fontSize: "0.95rem" }}>📋 Service Lines</div>
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Service</th>
                      <th>Staff</th>
                      <th>Commission</th>
                      <th>Price</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((line, i) => (
                      <tr key={line.id}>
                        <td className="text-muted">{i + 1}</td>
                        <td style={{ fontWeight: 600 }}>{line.serviceName}</td>
                        <td>{line.staffName}</td>
                        <td className="text-muted">{line.commissionPct}% = ₹{Math.round(line.price * line.commissionPct / 100)}</td>
                        <td style={{ fontWeight: 700 }}>₹{line.price.toLocaleString("en-IN")}</td>
                        <td>
                          <button className="btn btn-danger btn-sm" onClick={() => removeLine(line.id)}>✕</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right: summary */}
        <div>
          <div className="card" style={{ position: "sticky", top: "80px" }}>
            <div style={{ fontWeight: 700, marginBottom: "1rem", fontSize: "0.95rem" }}>🧾 Bill Summary</div>

            {lines.length === 0 ? (
              <div className="empty-state" style={{ padding: "2rem 1rem" }}>
                <div className="empty-state-icon">📋</div>
                <p>Add services to see the summary</p>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: "1rem" }}>
                  <div style={{ fontWeight: 600, marginBottom: "0.5rem" }}>{customerName || "Customer"}</div>
                  {customerPhone && <div className="text-sm text-muted">{customerPhone}</div>}
                </div>

                {lines.map(line => (
                  <div key={line.id} className="flex justify-between text-sm" style={{ padding: "0.3rem 0", borderBottom: "1px dashed var(--border)" }}>
                    <div>
                      <div>{line.serviceName}</div>
                      <div className="text-xs text-muted">{line.staffName}</div>
                    </div>
                    <div style={{ fontWeight: 600 }}>₹{line.price.toLocaleString("en-IN")}</div>
                  </div>
                ))}

                <div className="flex justify-between mt-3 text-sm text-muted">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString("en-IN")}</span>
                </div>

                <div className="form-group mt-2" style={{ marginBottom: "0.5rem" }}>
                  <label className="form-label">Discount (₹)</label>
                  <input className="input" type="number" min={0} max={subtotal} value={discount} onChange={e => setDiscount(Number(e.target.value))} />
                </div>

                <div className="flex justify-between" style={{ padding: "0.75rem 0", borderTop: "2px solid var(--border)", fontWeight: 800, fontSize: "1.1rem" }}>
                  <span>Grand Total</span>
                  <span style={{ color: "var(--brand-1)" }}>₹{grandTotal.toLocaleString("en-IN")}</span>
                </div>

                <div className="form-group mt-2">
                  <label className="form-label">Notes</label>
                  <textarea className="input" rows={2} value={notes} onChange={e => setNotes(e.target.value)} placeholder="Any remarks..." />
                </div>

                <button
                  className="btn btn-primary w-full"
                  style={{ width: "100%", justifyContent: "center", padding: "0.75rem" }}
                  onClick={saveBill}
                  disabled={!customerName.trim() || lines.length === 0}
                >
                  💾 Save Bill
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
