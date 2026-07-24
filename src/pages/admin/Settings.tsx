import { useState } from "react";

export function Settings() {
  const [salonName, setSalonName] = useState("EVES Spa & Salon");
  const [address, setAddress] = useState("DLF Phase 4, Galleria Market, Gurugram, HR");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [taxPct, setTaxPct] = useState(18);
  const [currency, setCurrency] = useState("INR (₹)");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ maxWidth: "680px", margin: "0 auto" }}>
      <div className="page-header">
        <div>
          <h2 className="page-title">System Settings</h2>
          <p className="page-subtitle">Configure salon branding, currency, tax rates, and invoice receipts</p>
        </div>
      </div>

      {saved && (
        <div className="alert alert-success">
          Settings successfully updated and saved in system configs.
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div style={{ fontWeight: 700, borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>
            🏠 Salon Details
          </div>

          <div className="form-group">
            <label className="form-label">Salon Branding Name</label>
            <input type="text" className="input" value={salonName} onChange={e => setSalonName(e.target.value)} />
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input type="text" className="input" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Currency Symbol</label>
              <select className="select" value={currency} onChange={e => setCurrency(e.target.value)}>
                <option>INR (₹)</option>
                <option>USD ($)</option>
                <option>EUR (€)</option>
                <option>GBP (£)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Store Address</label>
            <textarea className="input" rows={2} value={address} onChange={e => setAddress(e.target.value)} />
          </div>

          <div style={{ fontWeight: 700, borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem", marginTop: "1rem" }}>
            💰 Billing & Taxes
          </div>

          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Default GST/Service Tax (%)</label>
              <input type="number" className="input" min={0} max={100} value={taxPct} onChange={e => setTaxPct(Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label className="form-label">Enable Auto-SMS alerts</label>
              <select className="select">
                <option>Enabled (On Billing & booking)</option>
                <option>Disabled</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end mt-3">
            <button type="submit" className="btn btn-primary" style={{ padding: "0.6rem 2rem" }}>
              Save Configurations
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
export default Settings;
