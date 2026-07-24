import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getBills, saveBills, getServices, getStaff, nextBillNumber,
  type Bill, type BillLineItem
} from "../../store/dataStore";

type InvoiceTab = "INVOICE" | "PREVIOUS INVOICES" | "BALANCE AMOUNT" | "ADVANCE AMOUNT" | "CANCELLED INVOICES";

// ─── Previous Invoices Sub-Component ───────────────────────────
function PreviousInvoices() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "draft" | "cancelled">("paid");

  const [bills, setBills] = useState(() => getBills());
  const sortedBills = useMemo(() =>
    [...bills].sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
  , [bills]);

  const searchableBills = useMemo(() => sortedBills.map(bill => ({
    bill,
    customerName: bill.customerName.toLowerCase(),
    billNumber: bill.billNumber.toLowerCase(),
    customerPhone: bill.customerPhone ?? ""
  })), [sortedBills]);

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return searchableBills
      .filter(({ bill, customerName, billNumber, customerPhone }) => {
        const matchSearch = !normalizedSearch || customerName.includes(normalizedSearch)
          || billNumber.includes(normalizedSearch)
          || customerPhone.includes(normalizedSearch);
        return matchSearch && (statusFilter === "all" || bill.status === statusFilter);
      })
      .map(({ bill }) => bill);
  }, [searchableBills, search, statusFilter]);

  const cancelBill = (id: string) => {
    const updated = bills.map(b => b.id === id ? { ...b, status: "cancelled" as Bill["status"] } : b);
    saveBills(updated);
    setBills(updated);
  };

  return (
    <div>
      <div className="flex gap-3 items-center mb-4">
        <div className="search-wrap flex-1">
          <span className="search-icon">🔍</span>
          <input className="input search-input" placeholder="Search by customer, phone, or bill no..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="select" style={{ width: "auto" }} value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}>
          <option value="all">All Status</option>
          <option value="paid">Paid</option>
          <option value="draft">Draft</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Bill No.</th>
              <th>Customer</th>
              <th>Phone</th>
              <th>Date & Time</th>
              <th>Services</th>
              <th>Grand Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={8} className="text-center text-muted" style={{ padding: "3rem" }}>No invoices found.</td></tr>
            )}
            {filtered.map(bill => (
              <tr key={bill.id} style={{ cursor: "pointer" }} onClick={() => navigate(`/billing/${bill.id}`)}>
                <td style={{ fontWeight: 700, color: "#3b82f6" }}>{bill.billNumber}</td>
                <td style={{ fontWeight: 600 }}>{bill.customerName}</td>
                <td className="text-muted">{bill.customerPhone || "—"}</td>
                <td className="text-muted">{new Date(bill.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td>
                <td>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                    {bill.lineItems.slice(0, 2).map(l => (
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
                  <div className="flex gap-1">
                    <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/billing/${bill.id}`)}>View</button>
                    {bill.status !== "cancelled" && (
                      <button className="btn btn-danger btn-sm" onClick={() => { if (confirm("Cancel this bill?")) cancelBill(bill.id); }}>Cancel</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── New Invoice Creator Sub-Component ────────────────────────
function NewInvoiceCreator() {
  const navigate = useNavigate();
  const allServices = useMemo(() => getServices(), []);
  const allStaff = useMemo(() => getStaff().filter(s => s.active && s.role === "staff"), []);
  const servicesById = useMemo(() => new Map(allServices.map(service => [service.id, service])), [allServices]);
  const staffById = useMemo(() => new Map(allStaff.map(staff => [staff.id, staff])), [allStaff]);

  // Invoice header
  const [invoiceNumber] = useState(() => nextBillNumber());
  const today = new Date().toISOString().split("T")[0];

  // Left panel - service search
  const [serviceCategory, setServiceCategory] = useState("Service");
  const [selectedStaffId, setSelectedStaffId] = useState(allStaff[0]?.id ?? "");
  const [serviceSearch, setServiceSearch] = useState("");

  // Selected line items
  const [lineItems, setLineItems] = useState<BillLineItem[]>([]);

  // Discount
  const [discountType, setDiscountType] = useState<"Percent" | "Flat">("Percent");
  const [billDiscountValue, setBillDiscountValue] = useState(0);
  const [offerDiscount, setOfferDiscount] = useState(0);

  // Customer details (bottom section)
  const [cMobile, setCMobile] = useState("");
  const [cGst, setCGst] = useState("");
  const [cFirstName, setCFirstName] = useState("");
  const [cLastName, setCLastName] = useState("");
  const [cEmail, setCEmail] = useState("");
  const [cGender, setCGender] = useState("");
  const [cDob, setCDob] = useState("");
  const [cAnniversary, setCAniversary] = useState("");
  const [cAddress, setCAddress] = useState("");
  const [cComments, setCComments] = useState("");

  // Payment
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [payableAmount, setPayableAmount] = useState(0);
  const [sendSms, setSendSms] = useState(false);

  const [saved, setSaved] = useState(false);

  // Service filter
  const filteredServices = useMemo(() => {
    const normalizedSearch = serviceSearch.trim().toLowerCase();
    return allServices.filter(s => {
      const matchSearch = !normalizedSearch || s.name.toLowerCase().includes(normalizedSearch);
      const matchCategory = serviceCategory === "Service" || s.category === serviceCategory;
      return matchSearch && matchCategory;
    });
  }, [allServices, serviceSearch, serviceCategory]);

  const addService = (svcId: string) => {
    const svc = servicesById.get(svcId);
    const staff = staffById.get(selectedStaffId);
    if (!svc || !staff) return;
    const newLine: BillLineItem = {
      id: crypto.randomUUID(),
      serviceId: svc.id,
      serviceName: svc.name,
      staffId: staff.id,
      staffName: staff.name,
      price: svc.basePrice,
      commissionPct: staff.commissionPct
    };
    setLineItems(prev => [...prev, newLine]);
  };

  const removeService = (id: string) => setLineItems(prev => prev.filter(l => l.id !== id));

  const subtotal = useMemo(() => lineItems.reduce((sum, item) => sum + item.price, 0), [lineItems]);
  const discountAmount = useMemo(() => discountType === "Percent"
    ? Math.round(subtotal * (billDiscountValue / 100))
    : billDiscountValue
  , [discountType, subtotal, billDiscountValue]);
  const grandTotal = useMemo(
    () => Math.max(0, subtotal - discountAmount - offerDiscount),
    [subtotal, discountAmount, offerDiscount]
  );

  const handleProceed = () => {
    if (!cFirstName.trim() || lineItems.length === 0) return;
    const bills = getBills();
    const bill: Bill = {
      id: crypto.randomUUID(),
      billNumber: invoiceNumber,
      customerName: `${cFirstName.trim()} ${cLastName.trim()}`.trim(),
      customerPhone: cMobile.trim(),
      date: new Date().toISOString(),
      lineItems,
      total: subtotal,
      discount: discountAmount + offerDiscount,
      grandTotal,
      status: "paid",
      notes: cComments.trim()
    };
    saveBills([...bills, bill]);
    setSaved(true);
  };

  if (saved) {
    return (
      <div className="card text-center" style={{ maxWidth: 480, margin: "4rem auto", padding: "2.5rem" }}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
        <h2 style={{ fontWeight: 700, marginBottom: "0.5rem" }}>Invoice Saved!</h2>
        <p className="text-muted mb-4">The invoice has been recorded.</p>
        <div className="flex gap-3 justify-center">
          <button className="cal-pill-btn primary-cal-btn" onClick={() => navigate("/billing")}>View All Invoices</button>
        </div>
      </div>
    );
  }

  return (
    <div className="invoice-creator">
      {/* Invoice Number & Date Row */}
      <div className="grid grid-2 mb-3" style={{ gridTemplateColumns: "1fr 1fr", maxWidth: "500px" }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label text-xs">Invoice Number</label>
          <input type="text" className="input" value={invoiceNumber} readOnly style={{ background: "var(--surface-2)" }} placeholder="Invoice Number" />
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label text-xs">Date</label>
          <input type="date" className="input" defaultValue={today} />
        </div>
      </div>

      {/* Main 2-column layout */}
      <div className="invoice-main-grid">
        {/* Left: Service selector + items */}
        <div className="invoice-left-panel">
          {/* Service/Staff selector controls */}
          <div className="invoice-selector-bar">
            <select className="select text-xs" value={serviceCategory} onChange={e => setServiceCategory(e.target.value)} style={{ flex: "1" }}>
              <option value="Service">Service</option>
              <option value="Hair">Hair</option>
              <option value="Skin">Skin</option>
              <option value="Face">Face</option>
              <option value="Body">Body</option>
              <option value="Nails">Nails</option>
            </select>
            <select className="select text-xs" value={selectedStaffId} onChange={e => setSelectedStaffId(e.target.value)} style={{ flex: "1" }}>
              {allStaff.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <input type="text" className="input text-xs" placeholder="Search here" value={serviceSearch} onChange={e => setServiceSearch(e.target.value)} style={{ flex: "1.5" }} />
          </div>

          {/* Scrollable services list */}
          <div className="services-scroll-list">
            {filteredServices.map(svc => (
              <div
                key={svc.id}
                className="service-row-item"
                onClick={() => addService(svc.id)}
              >
                <span className="service-row-name">{svc.name}</span>
                <span className="service-row-price">₹{svc.basePrice}</span>
              </div>
            ))}
          </div>

          {/* Selected Line Items display */}
          {lineItems.length > 0 && (
            <div className="selected-lines-panel">
              <div className="font-semibold text-xs mb-2" style={{ color: "var(--text-2)" }}>SELECTED SERVICES</div>
              {lineItems.map(l => (
                <div key={l.id} className="selected-line-row">
                  <span className="truncate flex-1">{l.serviceName}</span>
                  <span style={{ color: "#3b82f6", fontWeight: 700, marginRight: "0.5rem" }}>₹{l.price}</span>
                  <button onClick={() => removeService(l.id)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontWeight: 700 }}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Discount + Totals */}
        <div className="invoice-right-panel">
          {/* Bill Discount */}
          <div className="card mb-3" style={{ padding: "0.75rem" }}>
            <div className="font-semibold text-xs mb-2">Bill Discount</div>
            <div className="flex items-center gap-4 mb-2 text-xs">
              <label className="flex items-center gap-1 cursor-pointer">
                <input type="radio" name="discType" value="Percent" checked={discountType === "Percent"} onChange={() => setDiscountType("Percent")} />
                Percent
              </label>
              <label className="flex items-center gap-1 cursor-pointer">
                <input type="radio" name="discType" value="Flat" checked={discountType === "Flat"} onChange={() => setDiscountType("Flat")} />
                Flat
              </label>
              <input
                type="number" min={0} className="input text-xs" style={{ maxWidth: "80px", padding: "0.2rem 0.4rem" }}
                value={billDiscountValue} onChange={e => setBillDiscountValue(Number(e.target.value))}
              />
            </div>
            <div className="font-semibold text-xs mb-1">Offer Discount</div>
            <input
              type="number" min={0} className="input text-xs" style={{ padding: "0.25rem 0.5rem" }}
              value={offerDiscount} onChange={e => setOfferDiscount(Number(e.target.value))}
            />
          </div>

          {/* TOTAL breakdown */}
          <div className="card mb-3" style={{ padding: "0.75rem" }}>
            <div className="font-semibold text-xs mb-2 text-muted">TOTAL</div>
            <div className="flex justify-between text-xs mb-1">
              <span>SubTotal</span>
              <span>{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs mb-1">
              <span>Discount</span>
              <span>{(discountAmount + offerDiscount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs mb-2">
              <span>IGST</span>
              <span>0.00</span>
            </div>
            <div className="flex justify-between text-xs font-bold" style={{ borderTop: "2px solid var(--border)", paddingTop: "6px", color: "#ef4444", fontSize: "0.95rem" }}>
              <span>Grand Total</span>
              <span>{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom 3-column layout: Customer Details / Loyalty / Payment */}
      <div className="invoice-bottom-grid mt-4">
        {/* Customer Details */}
        <div className="invoice-customer-panel">
          <div className="grid grid-2 gap-2">
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label text-xs">Mobile Number</label>
              <input type="text" className="input text-xs" placeholder="Enter Mobile number" value={cMobile} onChange={e => setCMobile(e.target.value)} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label text-xs">GST Number</label>
              <input type="text" className="input text-xs" placeholder="GST Number" value={cGst} onChange={e => setCGst(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-2 gap-2 mt-2">
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label text-xs">First Name</label>
              <input type="text" className="input text-xs" placeholder="First Name" value={cFirstName} onChange={e => setCFirstName(e.target.value)} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label text-xs">Last Name</label>
              <input type="text" className="input text-xs" placeholder="lastname" value={cLastName} onChange={e => setCLastName(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-2 gap-2 mt-2">
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label text-xs">Email</label>
              <input type="email" className="input text-xs" placeholder="Email" value={cEmail} onChange={e => setCEmail(e.target.value)} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label text-xs">Gender</label>
              <select className="select text-xs" value={cGender} onChange={e => setCGender(e.target.value)}>
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div className="grid grid-2 gap-2 mt-2">
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label text-xs">Date Of Birth</label>
              <input type="date" className="input text-xs" value={cDob} onChange={e => setCDob(e.target.value)} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label text-xs">Date of Anniversary</label>
              <input type="date" className="input text-xs" value={cAnniversary} onChange={e => setCAniversary(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-2 gap-2 mt-2">
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label text-xs">Address</label>
              <input type="text" className="input text-xs" placeholder="Address" value={cAddress} onChange={e => setCAddress(e.target.value)} />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label text-xs">Comments</label>
              <input type="text" className="input text-xs" placeholder="Comments" value={cComments} onChange={e => setCComments(e.target.value)} />
            </div>
          </div>
        </div>

        {/* Loyalty Info Panel */}
        <div className="invoice-loyalty-panel">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-muted">Total Cashback</span>
            <span className="font-bold">₹0</span>
          </div>
          <div className="flex justify-between text-xs mb-2">
            <span className="text-muted">Redeemable Cashback</span>
            <span className="font-bold">₹0</span>
          </div>
          <div className="flex justify-between text-xs mb-2">
            <span className="text-muted">Membership</span>
            <span></span>
          </div>
          <div className="flex justify-between text-xs mb-2">
            <span className="text-muted">Wallet</span>
            <span>₹0</span>
          </div>
          <div className="flex justify-between text-xs mb-4" style={{ borderBottom: "1px dashed var(--border)", paddingBottom: "8px" }}>
            <span className="text-muted">Prev. Due</span>
            <span style={{ color: "#3b82f6", fontSize: "0.7rem" }}>No balance amount</span>
          </div>

          <div className="font-semibold text-xs mb-2">Payment Method</div>
          <div className="flex items-center gap-2 mb-3">
            <select className="select text-xs" style={{ flex: 1 }} value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
              <option>Cash</option>
              <option>Card</option>
              <option>Online</option>
              <option>Voucher</option>
            </select>
            <input type="number" className="input text-xs" style={{ flex: 1 }} value={0} readOnly />
            <button style={{ background: "#14b8a6", color: "white", border: "none", borderRadius: "50%", width: "24px", height: "24px", cursor: "pointer", fontWeight: 700 }}>+</button>
          </div>

          <div className="font-semibold text-xs mb-1">Payable Amount</div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-bold" style={{ padding: "0 6px", border: "1px solid var(--border)", borderRadius: "4px" }}>₹</span>
            <input
              type="number"
              className="input text-xs"
              value={payableAmount}
              onChange={e => setPayableAmount(Number(e.target.value))}
            />
          </div>

          <label className="flex items-center gap-2 text-xs cursor-pointer mb-4">
            <input type="checkbox" checked={sendSms} onChange={e => setSendSms(e.target.checked)} />
            Send Invoice SMS
          </label>

          <button
            className="cal-pill-btn primary-cal-btn w-full"
            style={{ justifyContent: "center", padding: "0.6rem", width: "100%", borderRadius: "6px" }}
            onClick={handleProceed}
            disabled={!cFirstName.trim() || lineItems.length === 0}
          >
            Proceed
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main BillsList with Tab Navigation ───────────────────────
export function BillsList() {
  const [activeTab, setActiveTab] = useState<InvoiceTab>("INVOICE");

  const tabs: InvoiceTab[] = ["INVOICE", "PREVIOUS INVOICES", "BALANCE AMOUNT", "ADVANCE AMOUNT", "CANCELLED INVOICES"];

  const renderTabContent = () => {
    switch (activeTab) {
      case "INVOICE":
        return <NewInvoiceCreator />;
      case "PREVIOUS INVOICES":
        return <PreviousInvoices />;
      case "BALANCE AMOUNT":
        return (
          <div className="empty-state">
            <div className="empty-state-icon">💰</div>
            <h3>Balance Amounts</h3>
            <p>Client balance amount records will appear here.</p>
          </div>
        );
      case "ADVANCE AMOUNT":
        return (
          <div className="empty-state">
            <div className="empty-state-icon">📤</div>
            <h3>Advance Amounts</h3>
            <p>Pre-paid / advance booking records will appear here.</p>
          </div>
        );
      case "CANCELLED INVOICES":
        return <PreviousInvoices />;
    }
  };

  return (
    <div className="invoice-page-container">
      {/* Top Tab Navigation Bar */}
      <div className="invoice-tabs-bar">
        {tabs.map(tab => (
          <button
            key={tab}
            className={`invoice-tab-btn ${activeTab === tab ? "invoice-tab-active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
        <div style={{ marginLeft: "auto" }}>
          <button className="cal-pill-btn primary-cal-btn">Save</button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="invoice-tab-content">
        {renderTabContent()}
      </div>
    </div>
  );
}
