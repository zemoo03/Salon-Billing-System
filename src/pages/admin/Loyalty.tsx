import { useState } from "react";

interface LoyaltyAccount {
  id: string;
  name: string;
  phone: string;
  points: number;
  cashbackBalance: number;
  tier: "Silver" | "Gold" | "Platinum";
}

export function Loyalty() {
  const [search, setSearch] = useState("");
  const [rules] = useState([
    { id: "r1", action: "Every ₹100 spent", reward: "Earn 5 points", active: true },
    { id: "r2", action: "Refer a friend", reward: "Get ₹250 cashback", active: true },
    { id: "r3", action: "Birthday special booking", reward: "2x points tier bonus", active: false },
  ]);

  const [accounts] = useState<LoyaltyAccount[]>([
    { id: "l1", name: "Neha Sharma", phone: "9876543210", points: 850, cashbackBalance: 450, tier: "Platinum" },
    { id: "l2", name: "Priya Patel", phone: "9876543211", points: 340, cashbackBalance: 120, tier: "Gold" },
    { id: "l3", name: "Sunita Rao", phone: "9876543212", points: 1200, cashbackBalance: 900, tier: "Platinum" },
    { id: "l4", name: "Kavya Iyer", phone: "9444444444", points: 90, cashbackBalance: 0, tier: "Silver" },
  ]);

  const filtered = accounts.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.phone.includes(search)
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 className="page-title">Cashback & Loyalty</h2>
          <p className="page-subtitle">Configure customer reward programs and earn/redeem rules</p>
        </div>
        <button className="btn btn-primary">+ Edit Reward Rules</button>
      </div>

      <div className="grid grid-2 mb-4">
        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: "1rem" }}>Points Distribution & Rules</div>
          <div className="flex flex-col gap-2">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-center justify-between"
                style={{ padding: "0.75rem", background: "var(--surface-2)", borderRadius: "8px" }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: "0.85rem" }}>{rule.action}</div>
                  <div className="text-xs text-muted">{rule.reward}</div>
                </div>
                <span className={`badge ${rule.active ? "badge-green" : "badge-gray"}`}>
                  {rule.active ? "Active" : "Disabled"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div style={{ fontWeight: 700, marginBottom: "1rem" }}>Redemption Analytics</div>
          <div className="flex flex-col gap-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted">Total Points Distributed</span>
              <span className="font-bold">24,580 pts</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Total Cashback Awarded</span>
              <span className="font-bold">₹12,450</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Points Redeemed this Month</span>
              <span className="font-bold">4,120 pts (₹2,060 value)</span>
            </div>
            <div className="flex justify-between text-sm" style={{ borderTop: "1px dashed var(--border)", paddingTop: "0.5rem" }}>
              <span className="text-muted">Redemption rate</span>
              <span className="font-bold" style={{ color: "var(--brand-1)" }}>68.4% active</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-4">
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="input search-input"
            placeholder="Search customer account by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Phone Number</th>
                <th>Reward Tier</th>
                <th>Points Balance</th>
                <th>Cashback Wallet</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((acc) => (
                <tr key={acc.id}>
                  <td style={{ fontWeight: 600 }}>{acc.name}</td>
                  <td>{acc.phone}</td>
                  <td>
                    <span className={`badge ${acc.tier === "Platinum" ? "badge-purple" : acc.tier === "Gold" ? "badge-orange" : "badge-gray"}`}>
                      {acc.tier}
                    </span>
                  </td>
                  <td style={{ fontWeight: 700 }}>{acc.points} pts</td>
                  <td style={{ fontWeight: 700, color: "#059669" }}>₹{acc.cashbackBalance}</td>
                  <td>
                    <button className="btn btn-secondary btn-sm mr-2" style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}>Add Points</button>
                    <button className="btn btn-secondary btn-sm" style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}>Redeem</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-muted" style={{ padding: "3rem" }}>
                    No customer rewards records found matching search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
export default Loyalty;
