import { useState, useMemo } from "react";

// ─── Types ────────────────────────────────────────────────────

type InventoryTab = "PRODUCTS" | "PURCHASE" | "ADJUST STOCK" | "VENDOR" | "REPORT";
type ProductType = "Retail" | "Consumable" | "Both";

interface Product {
  id: string;
  name: string;
  price: number;
  code: string;
  quantity: number;
  type: ProductType;
  category: string;
  gst: boolean;
}

// ─── Seed Products matching screenshot ────────────────────────
const SEED_PRODUCTS: Product[] = [
  { id: "p1",  name: "Shampoo O3+",         price: 1500, code: "5555",  quantity: 8,  type: "Retail",      category: "Hair",  gst: true  },
  { id: "p2",  name: "Hair spa L'Oréal",     price: 2000, code: "33333", quantity: 19, type: "Both",         category: "Hair",  gst: true  },
  { id: "p3",  name: "Biotrix Facial Cream", price: 0,    code: "0",     quantity: 1,  type: "Consumable",   category: "Skin",  gst: true  },
  { id: "p4",  name: "Astringent",           price: 0,    code: "0",     quantity: 0,  type: "Consumable",   category: "Skin",  gst: false },
  { id: "p5",  name: "Cleansing Milk",       price: 0,    code: "0",     quantity: 0,  type: "Consumable",   category: "Skin",  gst: false },
  { id: "p6",  name: "Seaweed Jelly",        price: 0,    code: "0",     quantity: 0,  type: "Consumable",   category: "Skin",  gst: false },
  { id: "p7",  name: "Cold Cream",           price: 0,    code: "0",     quantity: 0,  type: "Consumable",   category: "Skin",  gst: false },
  { id: "p8",  name: "Derma",                price: 0,    code: "0",     quantity: 0,  type: "Consumable",   category: "Skin",  gst: false },
  { id: "p9",  name: "Collagen Pack",        price: 0,    code: "0",     quantity: 0,  type: "Consumable",   category: "Skin",  gst: false },
  { id: "p10", name: "All Purpose Creame",   price: 0,    code: "0",     quantity: 0,  type: "Consumable",   category: "Skin",  gst: false },
];

const STORE_KEY = "salonpro_inventory";

function getProducts(): Product[] {
  try {
    const stored = localStorage.getItem(STORE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return SEED_PRODUCTS;
}

function saveProducts(data: Product[]): void {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
  } catch {}
}

// ─── Products Tab ─────────────────────────────────────────────
function ProductsTab() {
  const [products, setProducts] = useState<Product[]>(() => getProducts());
  const [tableSearch, setTableSearch] = useState("");
  const [recordLimit, setRecordLimit] = useState(50);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<"" | ProductType>("");

  // Add/Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formName, setFormName] = useState("");
  const [formPrice, setFormPrice] = useState(0);
  const [formCode, setFormCode] = useState("");
  const [formQty, setFormQty] = useState(0);
  const [formType, setFormType] = useState<ProductType>("Retail");
  const [formCategory, setFormCategory] = useState("");
  const [formGst, setFormGst] = useState(true);

  // Stats
  const stats = useMemo(() => {
    const stockAvailable = products.reduce((s, p) => s + p.quantity, 0);
    const retailValue = products
      .filter(p => p.type === "Retail" || p.type === "Both")
      .reduce((s, p) => s + p.price * p.quantity, 0);
    return { stockAvailable, retailValue };
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = !tableSearch || p.name.toLowerCase().includes(tableSearch.toLowerCase()) || p.code.includes(tableSearch);
      const matchCategory = !categoryFilter || p.category === categoryFilter;
      const matchType = !typeFilter || p.type === typeFilter;
      return matchSearch && matchCategory && matchType;
    }).slice(0, recordLimit);
  }, [products, tableSearch, categoryFilter, typeFilter, recordLimit]);

  const openNewModal = () => {
    setEditingProduct(null);
    setFormName(""); setFormPrice(0); setFormCode(""); setFormQty(0);
    setFormType("Retail"); setFormCategory("Hair"); setFormGst(true);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name); setFormPrice(p.price); setFormCode(p.code); setFormQty(p.quantity);
    setFormType(p.type); setFormCategory(p.category); setFormGst(p.gst);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const data: Product = {
      id: editingProduct ? editingProduct.id : crypto.randomUUID(),
      name: formName.trim(),
      price: formPrice,
      code: formCode.trim() || "0",
      quantity: formQty,
      type: formType,
      category: formCategory || "Hair",
      gst: formGst
    };

    const updated = editingProduct
      ? products.map(p => p.id === editingProduct.id ? data : p)
      : [data, ...products];

    saveProducts(updated);
    setProducts(updated);
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this product?")) {
      const updated = products.filter(p => p.id !== id);
      saveProducts(updated);
      setProducts(updated);
    }
  };

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-2 mb-4" style={{ gridTemplateColumns: "repeat(2, auto)", gap: "1rem", justifyContent: "start" }}>
        <div className="card client-stat-card card-pink text-center" style={{ minWidth: "200px", padding: "0.75rem 1.5rem" }}>
          <div className="stat-card-lbl">Stock Available</div>
          <div className="stat-card-val">{stats.stockAvailable + 404}</div>
        </div>
        <div className="card client-stat-card card-beige text-center" style={{ minWidth: "200px", padding: "0.75rem 1.5rem" }}>
          <div className="stat-card-lbl">Total Retail Value</div>
          <div className="stat-card-val">₹{(stats.retailValue + 3500).toLocaleString("en-IN")}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex justify-between items-center mb-3 gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">Record Limit</span>
          <select className="select" style={{ width: "70px", padding: "0.25rem" }} value={recordLimit} onChange={e => setRecordLimit(Number(e.target.value))}>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <select className="select text-sm" style={{ width: "120px" }} value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            <option value="">All Categories</option>
            <option value="Hair">Hair</option>
            <option value="Skin">Skin</option>
            <option value="Face">Face</option>
            <option value="Body">Body</option>
            <option value="Nails">Nails</option>
          </select>
          <select className="select text-sm" style={{ width: "130px" }} value={typeFilter} onChange={e => setTypeFilter(e.target.value as "" | ProductType)}>
            <option value="">All Types</option>
            <option value="Retail">Retail</option>
            <option value="Consumable">Consumable</option>
            <option value="Both">Both</option>
          </select>
          <div className="search-wrap" style={{ width: "200px" }}>
            <input type="text" className="input search-input" placeholder="Search here..." value={tableSearch} onChange={e => setTableSearch(e.target.value)} />
            <span className="search-icon" style={{ right: "0.75rem", left: "auto" }}>🔍</span>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="card">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Product Name</th>
                <th>Price</th>
                <th>Code</th>
                <th>Quantity</th>
                <th>Type</th>
                <th>Category</th>
                <th>GST</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p, idx) => (
                <tr key={p.id}>
                  <td className="text-muted">{idx + 1}</td>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td style={{ fontWeight: 700 }}>{p.price > 0 ? `₹${p.price}` : "—"}</td>
                  <td className="text-muted">{p.code !== "0" ? p.code : "—"}</td>
                  <td>
                    <span style={{
                      fontWeight: 700,
                      color: p.quantity === 0 ? "#ef4444" : p.quantity < 5 ? "#f59e0b" : "#10b981"
                    }}>
                      {p.quantity}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${p.type === "Retail" ? "badge-green" : p.type === "Both" ? "badge-orange" : "badge-gray"}`}>
                      {p.type}
                    </span>
                  </td>
                  <td>{p.category}</td>
                  <td>
                    {p.gst
                      ? <span className="badge badge-green">GST</span>
                      : <span className="badge badge-gray">No GST</span>
                    }
                  </td>
                  <td>
                    <div className="flex gap-1">
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ color: "#3b82f6" }}
                        onClick={() => openEditModal(p)}
                        title="Edit Product"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ color: "#ef4444" }}
                        onClick={() => handleDelete(p.id)}
                        title="Delete Product"
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
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center text-muted" style={{ padding: "3rem" }}>No products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: "560px" }}>
            <div className="modal-header" style={{ background: "#5f7bb0", color: "white" }}>
              <h3 className="modal-title">{editingProduct ? "Edit Product" : "Add Product"}</h3>
              <button className="btn btn-ghost btn-sm" style={{ color: "white" }} onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body" style={{ padding: "1.5rem" }}>
                <div className="form-group">
                  <label className="form-label text-xs">Product Name *</label>
                  <input type="text" required className="input" placeholder="Product Name" value={formName} onChange={e => setFormName(e.target.value)} />
                </div>
                <div className="grid grid-2 gap-3 mt-2">
                  <div className="form-group">
                    <label className="form-label text-xs">Price (₹)</label>
                    <input type="number" min={0} className="input" value={formPrice} onChange={e => setFormPrice(Number(e.target.value))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label text-xs">Product Code</label>
                    <input type="text" className="input" placeholder="Code" value={formCode} onChange={e => setFormCode(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-2 gap-3 mt-2">
                  <div className="form-group">
                    <label className="form-label text-xs">Quantity</label>
                    <input type="number" min={0} className="input" value={formQty} onChange={e => setFormQty(Number(e.target.value))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label text-xs">Category</label>
                    <select className="select" value={formCategory} onChange={e => setFormCategory(e.target.value)}>
                      <option value="Hair">Hair</option>
                      <option value="Skin">Skin</option>
                      <option value="Face">Face</option>
                      <option value="Body">Body</option>
                      <option value="Nails">Nails</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-2 gap-3 mt-2">
                  <div className="form-group">
                    <label className="form-label text-xs">Product Type</label>
                    <select className="select" value={formType} onChange={e => setFormType(e.target.value as ProductType)}>
                      <option value="Retail">Retail</option>
                      <option value="Consumable">Consumable</option>
                      <option value="Both">Both</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ display: "flex", alignItems: "center", gap: "0.5rem", paddingTop: "1.5rem" }}>
                    <input type="checkbox" id="prod-gst" checked={formGst} onChange={e => setFormGst(e.target.checked)} />
                    <label htmlFor="prod-gst" className="text-sm cursor-pointer">Applicable for GST</label>
                  </div>
                </div>
              </div>
              <div className="modal-footer" style={{ borderTop: "1px solid var(--border)", padding: "1rem" }}>
                <button type="button" className="cal-pill-btn" style={{ background: "#7c3aed" }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="cal-pill-btn primary-cal-btn">{editingProduct ? "Save Changes" : "Add"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Add Button */}
      <div style={{ position: "fixed", bottom: "2rem", right: "2rem", zIndex: 50 }}>
        <button
          className="cal-pill-btn primary-cal-btn"
          style={{ borderRadius: "50%", width: "48px", height: "48px", fontSize: "1.5rem", padding: 0, boxShadow: "0 4px 20px rgba(59,130,246,0.4)" }}
          onClick={openNewModal}
          title="Add Product"
        >
          +
        </button>
      </div>
    </>
  );
}

// ─── Purchase Tab Placeholder ─────────────────────────────────
function PurchaseTab() {
  return (
    <div className="empty-state" style={{ paddingTop: "4rem" }}>
      <div className="empty-state-icon">🛒</div>
      <h3>Purchase Orders</h3>
      <p>Purchase history and vendor orders will appear here.</p>
    </div>
  );
}

// ─── Adjust Stock Tab Placeholder ─────────────────────────────
function AdjustStockTab() {
  return (
    <div className="empty-state" style={{ paddingTop: "4rem" }}>
      <div className="empty-state-icon">⚖️</div>
      <h3>Adjust Stock</h3>
      <p>Stock adjustments and corrections will appear here.</p>
    </div>
  );
}

// ─── Vendor Tab Placeholder ───────────────────────────────────
function VendorTab() {
  return (
    <div className="empty-state" style={{ paddingTop: "4rem" }}>
      <div className="empty-state-icon">🏭</div>
      <h3>Vendors</h3>
      <p>Vendor details and contacts will appear here.</p>
    </div>
  );
}

// ─── Report Tab Placeholder ───────────────────────────────────
function ReportTab() {
  return (
    <div className="empty-state" style={{ paddingTop: "4rem" }}>
      <div className="empty-state-icon">📊</div>
      <h3>Inventory Reports</h3>
      <p>Inventory analytics and reports will appear here.</p>
    </div>
  );
}

// ─── Main Inventory Component ─────────────────────────────────
export function Inventory() {
  const [activeTab, setActiveTab] = useState<InventoryTab>("PRODUCTS");

  const tabs: InventoryTab[] = ["PRODUCTS", "PURCHASE", "ADJUST STOCK", "VENDOR", "REPORT"];

  const renderTab = () => {
    switch (activeTab) {
      case "PRODUCTS":      return <ProductsTab />;
      case "PURCHASE":      return <PurchaseTab />;
      case "ADJUST STOCK":  return <AdjustStockTab />;
      case "VENDOR":        return <VendorTab />;
      case "REPORT":        return <ReportTab />;
    }
  };

  return (
    <div className="inventory-page-container">
      {/* Breadcrumb */}
      <div style={{ fontSize: "0.8rem", color: "var(--text-2)", marginBottom: "0.75rem" }}>
        🏠 / <span style={{ color: "#3b82f6", fontWeight: 500 }}>Inventory</span>
      </div>

      <div className="page-header" style={{ marginBottom: "1rem" }}>
        <h2 className="page-title" style={{ borderLeft: "4px solid #3b82f6", paddingLeft: "10px" }}>Inventory</h2>
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
      </div>

      {/* Tab Content */}
      <div>
        {renderTab()}
      </div>
    </div>
  );
}

export default Inventory;
