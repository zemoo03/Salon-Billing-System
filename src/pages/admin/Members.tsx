import { useMemo, useState } from "react";

type MembersTab = "memberships" | "packages" | "vouchers" | "giftcards";
type MemberStatus = "active" | "expired" | "suspended";

interface Member {
  id: string;
  name: string;
  plan: "Gold VIP" | "Silver Elite" | "Platinum Spa" | "Basic Pass";
  status: MemberStatus;
  saleDate: string;
  expiryDate: string;
  phone: string;
  value: number;
}

const TABS: { id: MembersTab; label: string }[] = [
  { id: "memberships", label: "MEMBERSHIPS" },
  { id: "packages", label: "PACKAGES" },
  { id: "vouchers", label: "VOUCHERS" },
  { id: "giftcards", label: "GIFTCARDS" },
];

const MEMBERS: Member[] = [
  { id: "m1", name: "Neha Sharma", plan: "Platinum Spa", status: "active", saleDate: "2026-07-13", expiryDate: "2027-04-12", phone: "9876543210", value: 5000 },
  { id: "m2", name: "Priya Patel", plan: "Gold VIP", status: "active", saleDate: "2026-07-19", expiryDate: "2026-11-20", phone: "9822222222", value: 2500 },
  { id: "m3", name: "Sunita Rao", plan: "Silver Elite", status: "active", saleDate: "2026-07-20", expiryDate: "2026-09-05", phone: "9333333333", value: 1500 },
  { id: "m4", name: "Kavya Iyer", plan: "Basic Pass", status: "expired", saleDate: "2026-06-15", expiryDate: "2026-06-15", phone: "9444444444", value: 500 },
];

const formatDate = (date: string) => new Date(`${date}T00:00:00`).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

export function Members() {
  const [activeTab, setActiveTab] = useState<MembersTab>("memberships");
  const [search, setSearch] = useState("");
  const [membershipType, setMembershipType] = useState("all");
  const [membershipStatus, setMembershipStatus] = useState<"all" | MemberStatus>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [recordLimit, setRecordLimit] = useState(10);
  const [page, setPage] = useState(1);

  const isMembershipTab = activeTab === "memberships";
  const filteredMembers = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return MEMBERS.filter(member => {
      const matchesSearch = !normalizedSearch || member.name.toLowerCase().includes(normalizedSearch) || member.plan.toLowerCase().includes(normalizedSearch) || member.phone.includes(normalizedSearch);
      const matchesType = membershipType === "all" || member.plan === membershipType;
      const matchesStatus = membershipStatus === "all" || member.status === membershipStatus;
      const matchesStart = !startDate || member.saleDate >= startDate;
      const matchesEnd = !endDate || member.saleDate <= endDate;
      return matchesSearch && matchesType && matchesStatus && matchesStart && matchesEnd;
    });
  }, [search, membershipType, membershipStatus, startDate, endDate]);

  const visibleMembers = filteredMembers.slice((page - 1) * recordLimit, page * recordLimit);
  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / recordLimit));
  const activeMembers = MEMBERS.filter(member => member.status === "active").length;
  const totalValue = MEMBERS.reduce((sum, member) => sum + member.value, 0);

  const clearFilters = () => {
    setMembershipType("all"); setMembershipStatus("all"); setStartDate(""); setEndDate(""); setSearch(""); setPage(1);
  };

  const selectTab = (tab: MembersTab) => { setActiveTab(tab); setPage(1); setSearch(""); };

  return (
    <div className="members-screen">
      <div className="members-tabs" role="tablist" aria-label="Member records">
        {TABS.map(tab => <button key={tab.id} type="button" role="tab" aria-selected={activeTab === tab.id} className={`members-tab ${activeTab === tab.id ? "members-tab-active" : ""}`} onClick={() => selectTab(tab.id)}>{tab.label}</button>)}
      </div>

      {isMembershipTab ? <>
        <section className="members-filter-panel">
          <label className="members-filter-field"><span>Membership type</span><select className="select" value={membershipType} onChange={event => { setMembershipType(event.target.value); setPage(1); }}><option value="all">All</option><option value="Platinum Spa">Platinum Spa</option><option value="Gold VIP">Gold VIP</option><option value="Silver Elite">Silver Elite</option><option value="Basic Pass">Basic Pass</option></select></label>
          <label className="members-filter-field"><span>Membership status</span><select className="select" value={membershipStatus} onChange={event => { setMembershipStatus(event.target.value as "all" | MemberStatus); setPage(1); }}><option value="all">All</option><option value="active">Active</option><option value="expired">Expired</option><option value="suspended">Suspended</option></select></label>
          <label className="members-filter-field"><span>Sale duration</span><input className="input" type="date" value={startDate} onChange={event => { setStartDate(event.target.value); setPage(1); }} aria-label="Sale start date" /></label>
          <label className="members-filter-field members-filter-end-date"><span>&nbsp;</span><input className="input" type="date" value={endDate} onChange={event => { setEndDate(event.target.value); setPage(1); }} aria-label="Sale end date" /></label>
          <button type="button" className="btn btn-secondary members-clear-btn" onClick={clearFilters}>Clear</button>
        </section>

        <section className="members-summary" aria-label="Membership summary"><div className="members-summary-card members-summary-blue"><span>Total Members</span><strong>{activeMembers}</strong></div><div className="members-summary-card members-summary-lilac"><span>Total Value</span><strong>₹{totalValue.toLocaleString("en-IN")}</strong></div></section>

        <section className="members-table-card">
          <div className="members-table-toolbar"><label className="record-limit"><span>Record Limit</span><select className="select" value={recordLimit} onChange={event => { setRecordLimit(Number(event.target.value)); setPage(1); }}><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option></select></label><div className="search-wrap members-search"><span className="search-icon">⌕</span><input className="input search-input" placeholder="Search here" value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} /></div></div>
          <div className="table-wrap"><table className="table members-table"><thead><tr><th>Name</th><th>Customer</th><th>Mobile</th><th>Sale Date</th><th>Amount</th><th>Expiry Date</th><th>Status</th></tr></thead><tbody>
            {visibleMembers.map(member => <tr key={member.id}><td><span className="members-plan-name">{member.plan}</span></td><td>{member.name}</td><td>{member.phone}</td><td>{formatDate(member.saleDate)}</td><td>₹ {member.value.toLocaleString("en-IN")}</td><td>{formatDate(member.expiryDate)}</td><td><span className={`members-status members-status-${member.status}`}>{member.status}</span></td></tr>)}
            {visibleMembers.length === 0 && <tr><td colSpan={7} className="text-center text-muted members-empty">No membership records found.</td></tr>}
          </tbody></table></div>
          <div className="members-pagination"><button type="button" className="members-page-btn" disabled={page === 1} onClick={() => setPage(current => current - 1)}>‹ Prev</button>{Array.from({ length: totalPages }, (_, index) => index + 1).slice(0, 5).map(pageNumber => <button type="button" key={pageNumber} className={`members-page-btn ${page === pageNumber ? "members-page-active" : ""}`} onClick={() => setPage(pageNumber)}>{pageNumber}</button>)}<button type="button" className="members-page-btn" disabled={page === totalPages} onClick={() => setPage(current => current + 1)}>Next ›</button></div>
        </section>
      </> : <section className="members-empty-tab"><div className="empty-state-icon">{activeTab === "packages" ? "◈" : activeTab === "vouchers" ? "◇" : "▣"}</div><h3>{TABS.find(tab => tab.id === activeTab)?.label}</h3><p>Records for this section will appear here when they are created.</p><button type="button" className="btn btn-primary">+ Add {activeTab.slice(0, -1)}</button></section>}
    </div>
  );
}

export default Members;
