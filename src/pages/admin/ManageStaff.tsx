import { useState, useMemo } from "react";
import { getStaff, saveStaff, type StaffMember, type UserRole } from "../../store/dataStore";

export function ManageStaff() {
  const [staff, setStaff] = useState<StaffMember[]>(() => getStaff());
  
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<UserRole>("staff");
  const [commissionPct, setCommissionPct] = useState(15);
  
  const resetForm = () => {
    setIsEditing(false); setEditId(""); setName(""); setEmail(""); setPhone(""); setRole("staff"); setCommissionPct(15);
  };
  
  const handleSave = () => {
    if (!name.trim() || !email.trim()) return;
    
    let updated: StaffMember[];
    if (isEditing) {
      updated = staff.map(s => s.id === editId ? {
        ...s, name, email, phone, role, commissionPct
      } : s);
    } else {
      updated = [...staff, {
        id: crypto.randomUUID(),
        name, email, phone, role, commissionPct,
        joinDate: new Date().toISOString(),
        active: true
      }];
    }
    
    saveStaff(updated);
    setStaff(updated);
    resetForm();
  };
  
  const handleEdit = (s: StaffMember) => {
    setIsEditing(true);
    setEditId(s.id);
    setName(s.name);
    setEmail(s.email);
    setPhone(s.phone);
    setRole(s.role);
    setCommissionPct(s.commissionPct);
  };
  
  const toggleStatus = (id: string) => {
    const updated = staff.map(s => s.id === id ? { ...s, active: !s.active } : s);
    saveStaff(updated);
    setStaff(updated);
  };

  return (
    <div className="grid grid-2" style={{ gridTemplateColumns: "1fr 2fr", gap: "1.5rem" }}>
      {/* Left Column: Add / Edit Form */}
      <div>
        <div className="card" style={{ position: "sticky", top: "80px" }}>
          <div style={{ fontWeight: 700, marginBottom: "1rem" }}>
            {isEditing ? "✏️ Edit Team Member" : "➕ Add Team Member"}
          </div>
          
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Riya Singh" />
          </div>
          
          <div className="form-group">
            <label className="form-label">Email Address (for login)</label>
            <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="riya@evessalon.com" />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input className="input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 9876543210" />
          </div>
          
          <div className="form-row">
            <div className="form-group mb-0">
              <label className="form-label">System Role</label>
              <select className="select" value={role} onChange={e => setRole(e.target.value as UserRole)}>
                <option value="staff">Staff (Provider)</option>
                <option value="admin">Admin</option>
                <option value="owner">Owner</option>
              </select>
            </div>
            
            <div className="form-group mb-0">
              <label className="form-label">Commission %</label>
              <input className="input" type="number" min={0} max={100} value={commissionPct} onChange={e => setCommissionPct(Number(e.target.value))} />
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <button className="btn btn-primary flex-1" onClick={handleSave} disabled={!name || !email} style={{ justifyContent: "center" }}>
              {isEditing ? "Update Details" : "Save Next Member"}
            </button>
            {isEditing && <button className="btn btn-secondary" onClick={resetForm}>Cancel</button>}
          </div>
        </div>
      </div>
      
      {/* Right Column: Staff List */}
      <div>
        <div className="card">
          <div className="flex justify-between items-center mb-3">
            <div style={{ fontWeight: 700 }}>Team Directory</div>
            <div className="badge badge-gray">{staff.length} registered</div>
          </div>
          
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Name & Contact</th>
                  <th>Role</th>
                  <th>Commission</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map(s => (
                  <tr key={s.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{s.name}</div>
                      <div className="text-xs text-muted">{s.email}</div>
                    </td>
                    <td>
                      <span className={`chip chip-${s.role}`}>{s.role}</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{s.commissionPct}%</td>
                    <td>
                      <span className={`badge ${s.active ? "badge-green" : "badge-gray"}`}>
                        {s.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-1">
                        <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(s)}>Edit</button>
                        <button className={`btn btn-sm ${s.active ? "btn-danger" : "btn-primary"}`} onClick={() => toggleStatus(s.id)}>
                          {s.active ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
