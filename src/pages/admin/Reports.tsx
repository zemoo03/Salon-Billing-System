import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getBills, getServiceStats, getStaffPerformance, type Bill } from "../../store/dataStore";

type ReportTab = "sales" | "staff" | "customers" | "invoice" | "inventory" | "expense";
type ChartType = "bar" | "pie";

const REPORT_TABS: { id: ReportTab; label: string }[] = [
  { id: "sales", label: "Sales" },
  { id: "staff", label: "Staff" },
  { id: "customers", label: "Customers" },
  { id: "invoice", label: "Invoice" },
  { id: "inventory", label: "Inventory" },
  { id: "expense", label: "Expense" },
];

const COLORS = ["#94d4b2", "#8cb9df", "#c8b6e9", "#f2c48b"];
const SALES_TYPES = ["service", "product", "Package", "Membership"] as const;
type SalesType = typeof SALES_TYPES[number];

interface SalesRow { type: SalesType; count: number; price: number; discount: number; tax: number; total: number; }

function buildSalesRows(bills: Bill[]): SalesRow[] {
  const serviceRows = new Map<string, SalesRow>();
  let discount = 0;
  bills.forEach(bill => {
    if (bill.status !== "paid") return;
    discount += bill.discount;
    bill.lineItems.forEach(item => {
      const existing = serviceRows.get(item.serviceId);
      if (existing) { existing.count++; existing.price += item.price; existing.total += item.price; }
      else serviceRows.set(item.serviceId, { type: "service", count: 1, price: item.price, discount: 0, tax: 0, total: item.price });
    });
  });
  const service = Array.from(serviceRows.values()).reduce((row, item) => ({ ...row, count: row.count + item.count, price: row.price + item.price, total: row.total + item.total }), { type: "service" as const, count: 0, price: 0, discount, tax: 0, total: 0 });
  return [service, ...SALES_TYPES.slice(1).map(type => ({ type, count: 0, price: 0, discount: 0, tax: 0, total: 0 }))];
}

const money = (value: number) => `₹ ${Math.round(value).toLocaleString("en-IN")}`;

export function Reports() {
  const bills = useMemo(() => getBills(), []);
  const [activeTab, setActiveTab] = useState<ReportTab>("sales");
  const [period, setPeriod] = useState("Day");
  const [summary, setSummary] = useState("Sales Summary");
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const staffPerf = useMemo(() => getStaffPerformance(bills), [bills]);
  const servicePerf = useMemo(() => getServiceStats(bills), [bills]);
  const salesRows = useMemo(() => buildSalesRows(bills), [bills]);
  const paidBills = useMemo(() => bills.filter(bill => bill.status === "paid"), [bills]);
  const salesTotal = useMemo(() => salesRows.reduce((sum, row) => sum + row.total, 0), [salesRows]);
  const salesCount = useMemo(() => salesRows.reduce((sum, row) => sum + row.count, 0), [salesRows]);
  const salesChartData = useMemo(() => salesRows.map(row => ({ name: row.type, amount: row.total })), [salesRows]);

  const renderSales = () => (
    <>
      <div className="reports-control-row">
        <select className="select reports-period" value={period} onChange={event => setPeriod(event.target.value)}><option>Day</option><option>Week</option><option>Month</option><option>Year</option></select>
        <select className="select reports-summary" value={summary} onChange={event => setSummary(event.target.value)}><option>Sales Summary</option><option>Sales By Category</option><option>Sales By Payment</option></select>
        <button type="button" className="btn btn-secondary reports-export" onClick={() => window.print()}>Export Data</button>
      </div>
      <div className="reports-chart-controls">
        <label className="reports-date"><input className="input" type="date" value={date} onChange={event => setDate(event.target.value)} /><span>▣</span></label>
        <select className="select reports-chart-type" value={chartType} onChange={event => setChartType(event.target.value as ChartType)}><option value="bar">Bar Chart</option><option value="pie">Pie Chart</option></select>
      </div>
      <div className="reports-chart-panel">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "bar" ? <BarChart data={salesChartData} margin={{ top: 8, right: 20, left: 20, bottom: 20 }}><CartesianGrid stroke="#e2e8f0" vertical={false} /><XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} /><YAxis tick={{ fontSize: 10, fill: "#64748b" }} /><Tooltip formatter={value => money(Number(value ?? 0))} /><Bar dataKey="amount" name="Amount" fill="#94d4b2" barSize={72} /></BarChart> : <PieChart><Pie data={salesChartData} dataKey="amount" nameKey="name" cx="50%" cy="50%" outerRadius={110} label>{salesChartData.map((entry, index) => <Cell key={entry.name} fill={COLORS[index]} />)}</Pie><Tooltip formatter={value => money(Number(value ?? 0))} /></PieChart>}
        </ResponsiveContainer>
      </div>
      <div className="reports-table-card"><div className="table-wrap"><table className="table reports-table"><thead><tr><th>Type</th><th>Count</th><th>Price</th><th>Discount</th><th>Tax</th><th>Total</th></tr></thead><tbody>
        {salesRows.map(row => <tr key={row.type}><td>{row.type}</td><td>{row.count}</td><td>{money(row.price)}</td><td>{money(row.discount)}</td><td>{money(row.tax)}</td><td>{money(row.total)}</td></tr>)}
        <tr className="reports-total-row"><td>Total</td><td>{salesCount}</td><td>{money(salesRows.reduce((sum, row) => sum + row.price, 0))}</td><td>{money(salesRows.reduce((sum, row) => sum + row.discount, 0))}</td><td>{money(0)}</td><td>{money(salesTotal)}</td></tr>
      </tbody></table></div></div>
    </>
  );

  return (
    <div className="reports-screen">
      <div className="reports-breadcrumb">⌂ <span>/</span> Reports</div>
      <div className="reports-tabs" role="tablist">{REPORT_TABS.map(tab => <button type="button" key={tab.id} role="tab" aria-selected={activeTab === tab.id} className={`reports-tab ${activeTab === tab.id ? "reports-tab-active" : ""}`} onClick={() => setActiveTab(tab.id)}>{tab.label}</button>)}</div>
      {activeTab === "sales" && renderSales()}
      {activeTab === "staff" && <div className="reports-detail-card"><h3>Staff Performance</h3><div className="table-wrap"><table className="table"><thead><tr><th>Staff</th><th>Services</th><th>Revenue</th><th>Commission</th></tr></thead><tbody>{staffPerf.map(staff => <tr key={staff.staffId}><td>{staff.staffName}</td><td>{staff.services}</td><td>{money(staff.revenue)}</td><td>{money(staff.commission)}</td></tr>)}</tbody></table></div></div>}
      {activeTab === "customers" && <ReportEmpty title="Customer Report" text={`${paidBills.length} paid customer records are available.`} />}
      {activeTab === "invoice" && <ReportEmpty title="Invoice Report" text={`${bills.length} invoice records are available.`} />}
      {activeTab === "inventory" && <ReportEmpty title="Inventory Report" text="Inventory report data will appear here." />}
      {activeTab === "expense" && <ReportEmpty title="Expense Report" text="Expense report data will appear here." />}
      {activeTab === "sales" && servicePerf.length === 0 && <span className="reports-visually-hidden">No service sales recorded.</span>}
    </div>
  );
}

function ReportEmpty({ title, text }: { title: string; text: string }) {
  return <div className="reports-detail-card reports-empty"><h3>{title}</h3><p>{text}</p></div>;
}