import { useState } from "react";

interface Template {
  id: string;
  name: string;
  type: "SMS" | "Email" | "Invoice";
  content: string;
  variables: string[];
}

export function Templates() {
  const [search, setSearch] = useState("");
  const [templates] = useState<Template[]>([
    { id: "t1", name: "Appointment Confirmation", type: "SMS", content: "Hi {{clientName}}, your appointment for {{serviceName}} with {{staffName}} is confirmed on {{date}} at {{time}}. See you!", variables: ["clientName", "serviceName", "staffName", "date", "time"] },
    { id: "t2", name: "Invoice Receipt Copy", type: "Invoice", content: "Thank you for visiting EVES! Bill {{billNumber}}. Total: ₹{{grandTotal}}. Staff served: {{staffNames}}.", variables: ["billNumber", "grandTotal", "staffNames"] },
    { id: "t3", name: "Loyalty Points Balance Alert", type: "SMS", content: "Dear {{clientName}}, you have earned {{pointsEarned}} points on your visit today. Your total balance is {{pointsBalance}} points.", variables: ["clientName", "pointsEarned", "pointsBalance"] },
    { id: "t4", name: "Membership Expiry Reminder", type: "SMS", content: "Dear {{clientName}}, your VIP plan {{planName}} is expiring on {{expiryDate}}. Renew now to keep enjoying 15% off spa services!", variables: ["clientName", "planName", "expiryDate"] },
  ]);

  const filtered = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Sms & Invoice Templates</h2>
          <p className="page-subtitle">Configure message alerts, customer notification triggers, and invoices</p>
        </div>
        <button className="btn btn-primary">+ Create Template</button>
      </div>

      <div className="card mb-4">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="input search-input"
            placeholder="Search templates by title or type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-2">
        {filtered.map((t) => (
          <div key={t.id} className="card flex flex-col justify-between" style={{ minHeight: "180px" }}>
            <div>
              <div className="flex justify-between items-start mb-2">
                <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{t.name}</div>
                <span className={`badge ${t.type === "SMS" ? "badge-blue" : t.type === "Invoice" ? "badge-purple" : "badge-orange"}`}>
                  {t.type}
                </span>
              </div>
              <div
                style={{
                  padding: "0.75rem",
                  background: "var(--surface-2)",
                  borderRadius: "6px",
                  fontSize: "0.82rem",
                  fontFamily: "monospace",
                  color: "var(--text-2)",
                  lineHeight: "1.4",
                  marginBottom: "1rem",
                }}
              >
                {t.content}
              </div>
            </div>
            <div>
              <div className="text-xs text-muted mb-3">
                <strong>Placeholders:</strong> {t.variables.map(v => `{{${v}}}`).join(", ")}
              </div>
              <div className="flex gap-2 justify-end">
                <button className="btn btn-secondary btn-sm" style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}>Edit</button>
                <button className="btn btn-secondary btn-sm" style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}>Test SMS</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default Templates;
