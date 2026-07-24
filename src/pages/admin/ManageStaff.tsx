import { useState } from "react";
import { getStaff, saveStaff, type StaffMember, type UserRole } from "../../store/dataStore";

type StaffTab = "MANAGE STAFF" | "SALARY" | "SCHEDULE" | "ATTENDANCE";

// Extended seed staff to match screenshots
const SCREENSHOT_STAFF_SEEDS: StaffMember[] = [
  { id: "e1", name: "Eves Spa & Salon", role: "owner", email: "eves@salon.com", phone: "9000000001", commissionPct: 0, joinDate: "2022-01-01", active: true },
  { id: "e2", name: "PT", role: "staff", email: "pt@salon.com", phone: "9000000002", commissionPct: 20, joinDate: "2022-01-01", active: true },
  { id: "e3", name: "PG", role: "staff", email: "pg@salon.com", phone: "9000000003", commissionPct: 20, joinDate: "2022-01-01", active: true },
  { id: "e4", name: "RA", role: "staff", email: "ra@salon.com", phone: "9000000004", commissionPct: 20, joinDate: "2022-01-01", active: true },
  { id: "e5", name: "Nanda", role: "staff", email: "nanda@salon.com", phone: "9000000005", commissionPct: 20, joinDate: "2022-01-01", active: true },
  { id: "e6", name: "RV", role: "staff", email: "rv@salon.com", phone: "9000000006", commissionPct: 20, joinDate: "2022-01-01", active: true },
  { id: "e7", name: "AL", role: "staff", email: "al@salon.com", phone: "9000000007", commissionPct: 20, joinDate: "2022-01-01", active: true },
  { id: "e8", name: "NC", role: "staff", email: "nc@salon.com", phone: "9000000008", commissionPct: 20, joinDate: "2022-01-01", active: true },
  { id: "e9", name: "DM", role: "staff", email: "dm@salon.com", phone: "9000000009", commissionPct: 20, joinDate: "2022-01-01", active: true },
  { id: "e10", name: "PG2", role: "staff", email: "pg2@salon.com", phone: "9000000010", commissionPct: 20, joinDate: "2022-01-01", active: true },
];

function mergeWithSeeds(existing: StaffMember[]): StaffMember[] {
  const ids = new Set(existing.map(s => s.id));
  const extras = SCREENSHOT_STAFF_SEEDS.filter(s => !ids.has(s.id));
  return [...extras, ...existing];
}

// ─── Salary Sub-Tab ──────────────────────────────────────────
function SalaryTab({ staff }: { staff: StaffMember[] }) {
  return (
    <div className="card">
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Commission %</th>
              <th>Salary Structure</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {staff.map(s => (
              <tr key={s.id}>
                <td style={{ fontWeight: 600 }}>{s.name}</td>
                <td><span className={`badge ${s.role === "admin" ? "badge-red" : s.role === "owner" ? "badge-orange" : "badge-green"}`}>{s.role}</span></td>
                <td>{s.commissionPct}%</td>
                <td className="text-muted">Base + Commission</td>
                <td><button className="btn btn-secondary btn-sm">Edit Salary</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Schedule Sub-Tab ─────────────────────────────────────────
function ScheduleTab({ staff }: { staff: StaffMember[] }) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return (
    <div className="card">
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              {days.map(d => <th key={d}>{d}</th>)}
            </tr>
          </thead>
          <tbody>
            {staff.map(s => (
              <tr key={s.id}>
                <td style={{ fontWeight: 600 }}>{s.name}</td>
                {days.map(d => (
                  <td key={d}>
                    <label className="flex items-center justify-center cursor-pointer">
                      <input type="checkbox" defaultChecked={d !== "Sun"} />
                    </label>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Attendance Sub-Tab ───────────────────────────────────────
function AttendanceTab({ staff }: { staff: StaffMember[] }) {
  const today = new Date().toLocaleDateString("en-IN");
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 style={{ fontWeight: 700 }}>Attendance – {today}</h3>
        <button className="cal-pill-btn primary-cal-btn">Mark All Present</button>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Present</th>
              <th>Absent</th>
              <th>Leave</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {staff.map(s => (
              <tr key={s.id}>
                <td style={{ fontWeight: 600 }}>{s.name}</td>
                <td><input type="radio" name={`att-${s.id}`} defaultChecked /></td>
                <td><input type="radio" name={`att-${s.id}`} /></td>
                <td><input type="radio" name={`att-${s.id}`} /></td>
                <td><span className="badge badge-green">Present</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main ManageStaff Component ────────────────────────────────
export function ManageStaff() {
  const [staff, setStaff] = useState<StaffMember[]>(() => mergeWithSeeds(getStaff()));
  const [activeTab, setActiveTab] = useState<StaffTab>("MANAGE STAFF");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  // Form fields
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formRole, setFormRole] = useState<UserRole>("staff");
  const [formCommission, setFormCommission] = useState(15);
  const [formActive, setFormActive] = useState(true);

  // Search / Filters
  const [tableSearch, setTableSearch] = useState("");
  const [recordLimit, setRecordLimit] = useState(50);

  const tabs: StaffTab[] = ["MANAGE STAFF", "SALARY", "SCHEDULE", "ATTENDANCE"];

  const openNewModal = () => {
    setEditingStaff(null);
    setFormName(""); setFormEmail(""); setFormPhone("");
    setFormRole("staff"); setFormCommission(15); setFormActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (s: StaffMember) => {
    setEditingStaff(s);
    setFormName(s.name); setFormEmail(s.email); setFormPhone(s.phone);
    setFormRole(s.role); setFormCommission(s.commissionPct); setFormActive(s.active);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) return;

    let updated: StaffMember[];
    if (editingStaff) {
      updated = staff.map(s => s.id === editingStaff.id
        ? { ...s, name: formName, email: formEmail, phone: formPhone, role: formRole, commissionPct: formCommission, active: formActive }
        : s
      );
    } else {
      updated = [...staff, {
        id: crypto.randomUUID(),
        name: formName, email: formEmail, phone: formPhone,
        role: formRole, commissionPct: formCommission,
        joinDate: new Date().toISOString(),
        active: formActive
      }];
    }

    saveStaff(updated);
    setStaff(updated);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Remove this staff member?")) {
      const updated = staff.filter(s => s.id !== id);
      saveStaff(updated);
      setStaff(updated);
    }
  };

  const toggleStatus = (id: string) => {
    const updated = staff.map(s => s.id === id ? { ...s, active: !s.active } : s);
    saveStaff(updated);
    setStaff(updated);
  };

  const filteredStaff = staff.filter(s => {
    if (!tableSearch) return true;
    const lower = tableSearch.toLowerCase();
    return s.name.toLowerCase().includes(lower) || s.email.toLowerCase().includes(lower);
  }).slice(0, recordLimit);

  return (
    <div className="staff-page-container">
      {/* Breadcrumb */}
      <div style={{ fontSize: "0.8rem", color: "var(--text-2)", marginBottom: "0.75rem" }}>
        🏠 / <span style={{ color: "#3b82f6", fontWeight: 500 }}>Staff</span>
      </div>

      <div className="page-header" style={{ marginBottom: "1rem" }}>
        <h2 className="page-title" style={{ borderLeft: "4px solid #3b82f6", paddingLeft: "10px" }}>Staff Management</h2>
      </div>

      {/* Tab Navigation */}
      <div className="invoice-tabs-bar mb-4">
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
          <button className="cal-pill-btn primary-cal-btn" onClick={openNewModal}>Add Staff</button>
        </div>
      </div>

      {/* MANAGE STAFF Tab Content */}
      {activeTab === "MANAGE STAFF" && (
        <>
          {/* Record Limit and Search */}
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <span>Record Limit</span>
              <select className="select" style={{ width: "70px", padding: "0.25rem" }} value={recordLimit} onChange={e => setRecordLimit(Number(e.target.value))}>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            <div className="search-wrap" style={{ width: "240px" }}>
              <input type="text" className="input search-input" placeholder="Search here..." value={tableSearch} onChange={e => setTableSearch(e.target.value)} />
              <span className="search-icon" style={{ right: "0.75rem", left: "auto" }}>🔍</span>
            </div>
          </div>

          <div className="card">
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Commission</th>
                    <th>Join Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.map((s, idx) => (
                    <tr key={s.id}>
                      <td className="text-muted">{idx + 1}</td>
                      <td style={{ fontWeight: 600 }}>{s.name}</td>
                      <td>
                        <span className={`badge ${s.role === "admin" ? "badge-red" : s.role === "owner" ? "badge-orange" : "badge-gray"}`}>
                          {s.role}
                        </span>
                      </td>
                      <td>{s.phone}</td>
                      <td className="text-muted">{s.email}</td>
                      <td style={{ fontWeight: 700 }}>{s.commissionPct}%</td>
                      <td>{new Date(s.joinDate).toLocaleDateString("en-IN")}</td>
                      <td>
                        <label className="flex items-center gap-1 cursor-pointer" onClick={() => toggleStatus(s.id)}>
                          <span style={{
                            display: "inline-block", width: "36px", height: "18px",
                            background: s.active ? "#10b981" : "#cbd5e1",
                            borderRadius: "10px", position: "relative", transition: "0.2s"
                          }}>
                            <span style={{
                              position: "absolute", width: "12px", height: "12px",
                              background: "white", borderRadius: "50%",
                              top: "3px", left: s.active ? "21px" : "3px", transition: "0.2s"
                            }} />
                          </span>
                          <span className="text-xs" style={{ color: s.active ? "#10b981" : "#9ca3af" }}>
                            {s.active ? "Active" : "Inactive"}
                          </span>
                        </label>
                      </td>
                      <td>
                        <div className="flex gap-1">
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ color: "#3b82f6" }}
                            onClick={() => openEditModal(s)}
                            title="Edit"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ color: "#ef4444" }}
                            onClick={() => handleDelete(s.id)}
                            title="Delete"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredStaff.length === 0 && (
                    <tr>
                      <td colSpan={9} className="text-center text-muted" style={{ padding: "3rem" }}>No staff found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === "SALARY" && <SalaryTab staff={filteredStaff} />}
      {activeTab === "SCHEDULE" && <ScheduleTab staff={filteredStaff} />}
      {activeTab === "ATTENDANCE" && <AttendanceTab staff={filteredStaff} />}

      {/* Add / Edit Staff Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: "550px" }}>
            <div className="modal-header" style={{ background: "#5f7bb0", color: "white" }}>
              <h3 className="modal-title">{editingStaff ? "Edit Staff" : "Add Staff"}</h3>
              <button className="btn btn-ghost btn-sm" style={{ color: "white" }} onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body" style={{ padding: "1.5rem" }}>
                <div className="grid grid-2 gap-3">
                  <div className="form-group">
                    <label className="form-label text-xs">Name *</label>
                    <input type="text" required className="input" placeholder="Staff Name" value={formName} onChange={e => setFormName(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label text-xs">Email *</label>
                    <input type="email" required className="input" placeholder="Email" value={formEmail} onChange={e => setFormEmail(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-2 gap-3 mt-2">
                  <div className="form-group">
                    <label className="form-label text-xs">Phone</label>
                    <input type="text" className="input" placeholder="Phone" value={formPhone} onChange={e => setFormPhone(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label className="form-label text-xs">Role</label>
                    <select className="select" value={formRole} onChange={e => setFormRole(e.target.value as UserRole)}>
                      <option value="staff">Staff</option>
                      <option value="owner">Owner</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-2 gap-3 mt-2">
                  <div className="form-group">
                    <label className="form-label text-xs">Commission %</label>
                    <input type="number" min={0} max={100} className="input" value={formCommission} onChange={e => setFormCommission(Number(e.target.value))} />
                  </div>
                  <div className="form-group" style={{ display: "flex", alignItems: "center", gap: "0.5rem", paddingTop: "1.5rem" }}>
                    <input type="checkbox" id="staff-active" checked={formActive} onChange={e => setFormActive(e.target.checked)} />
                    <label htmlFor="staff-active" className="text-sm cursor-pointer">Active Staff Member</label>
                  </div>
                </div>
              </div>
              <div className="modal-footer" style={{ borderTop: "1px solid var(--border)", padding: "1rem" }}>
                <button type="button" className="cal-pill-btn" style={{ background: "#7c3aed" }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="cal-pill-btn primary-cal-btn">{editingStaff ? "Save Changes" : "Add"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageStaff;
