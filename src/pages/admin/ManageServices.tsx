import { useState, useMemo } from "react";
import { getServices, saveServices, type Service } from "../../store/dataStore";

export function ManageServices() {
  const [services, setServices] = useState<Service[]>(() => getServices());
  
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Face");
  const [basePrice, setBasePrice] = useState(500);
  const [durationMins, setDurationMins] = useState(30);
  
  const resetForm = () => {
    setIsEditing(false); setEditId(""); setName(""); setCategory("Face"); setBasePrice(500); setDurationMins(30);
  };
  
  const handleSave = () => {
    if (!name.trim()) return;
    
    let updated: Service[];
    if (isEditing) {
      updated = services.map(s => s.id === editId ? {
        ...s, name, category, basePrice, durationMins
      } : s);
    } else {
      updated = [...services, {
        id: crypto.randomUUID(),
        name, category, basePrice, durationMins
      }];
    }
    
    saveServices(updated);
    setServices(updated);
    resetForm();
  };
  
  const handleEdit = (s: Service) => {
    setIsEditing(true); setEditId(s.id); setName(s.name); setCategory(s.category); setBasePrice(s.basePrice); setDurationMins(s.durationMins);
  };
  
  const handleDelete = (id: string) => {
    if (!confirm("Remove this service from the catalogue?")) return;
    const updated = services.filter(s => s.id !== id);
    saveServices(updated);
    setServices(updated);
  };

  const categories = useMemo(() => Array.from(new Set(services.map(s => s.category))).sort(), [services]);

  return (
    <div className="grid grid-2" style={{ gridTemplateColumns: "1fr 2fr", gap: "1.5rem" }}>
      {/* Left Column: Form */}
      <div>
        <div className="card" style={{ position: "sticky", top: "80px" }}>
          <div style={{ fontWeight: 700, marginBottom: "1rem" }}>
            {isEditing ? "✏️ Edit Service" : "✨ Add New Service"}
          </div>
          
          <div className="form-group">
            <label className="form-label">Service Name</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Bridal Makeup" />
          </div>
          
          <div className="form-group">
            <label className="form-label">Category</label>
            <input className="input" value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Hair, Skin, Body" list="categories" />
            <datalist id="categories">
              {categories.map(c => <option key={c} value={c} />)}
            </datalist>
          </div>

          <div className="form-row">
            <div className="form-group mb-0">
              <label className="form-label">Min. Price (₹)</label>
              <input className="input" type="number" min={0} value={basePrice} onChange={e => setBasePrice(Number(e.target.value))} />
            </div>
            
            <div className="form-group mb-0">
              <label className="form-label">Est. Duration (m)</label>
              <input className="input" type="number" min={5} step={5} value={durationMins} onChange={e => setDurationMins(Number(e.target.value))} />
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <button className="btn btn-primary flex-1" onClick={handleSave} disabled={!name} style={{ justifyContent: "center" }}>
              {isEditing ? "Update Service" : "Add Service"}
            </button>
            {isEditing && <button className="btn btn-secondary" onClick={resetForm}>Cancel</button>}
          </div>
        </div>
      </div>
      
      {/* Right Column: Catalogue */}
      <div>
        <div className="card">
          <div className="flex justify-between items-center mb-3">
            <div style={{ fontWeight: 700 }}>Service Catalogue</div>
            <div className="badge badge-gray">{services.length} services</div>
          </div>
          
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Duration</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {services.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td><span className="badge badge-blue">{s.category}</span></td>
                    <td style={{ fontWeight: 600 }}>₹{s.basePrice.toLocaleString("en-IN")} +</td>
                    <td className="text-muted">{s.durationMins}m</td>
                    <td>
                      <div className="flex gap-1">
                        <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(s)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)}>Remove</button>
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
