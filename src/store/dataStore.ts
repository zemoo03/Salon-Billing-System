// ────────────────────────────────────────────────────────────
//  EVES Spa & Salon – Central Data Store (localStorage‑backed)
// ────────────────────────────────────────────────────────────

export type UserRole = "admin" | "owner" | "staff";

export interface StaffMember {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  phone: string;
  commissionPct: number;
  joinDate: string;
  active: boolean;
}

export interface Service {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  durationMins: number;
}

export interface BillLineItem {
  id: string;
  serviceId: string;
  serviceName: string;
  staffId: string;
  staffName: string;
  price: number;
  commissionPct: number;
}

export interface Bill {
  id: string;
  billNumber: string;
  customerName: string;
  customerPhone: string;
  date: string;
  lineItems: BillLineItem[];
  total: number;
  discount: number;
  grandTotal: number;
  status: "draft" | "paid" | "cancelled";
  notes: string;
}

// ─── Seed data ──────────────────────────────────────────────

const SEED_STAFF: StaffMember[] = [
  { id: "s1", name: "Kriti Sharma", role: "staff", email: "kriti@salon.com",   phone: "9876543210", commissionPct: 20, joinDate: "2023-01-15", active: true },
  { id: "s2", name: "Pooja Mehta",  role: "staff", email: "pooja@salon.com",   phone: "9876543211", commissionPct: 18, joinDate: "2023-03-10", active: true },
  { id: "s3", name: "Riya Singh",   role: "staff", email: "riya@salon.com",    phone: "9876543212", commissionPct: 22, joinDate: "2022-11-01", active: true },
  { id: "s4", name: "Anjali Gupta", role: "staff", email: "anjali@salon.com",  phone: "9876543213", commissionPct: 15, joinDate: "2024-02-20", active: true },
  { id: "s5", name: "Meera Patel",  role: "owner", email: "owner@salon.com",   phone: "9876543214", commissionPct: 0,  joinDate: "2022-01-01", active: true },
  { id: "s6", name: "Admin User",   role: "admin", email: "admin@demo.local",  phone: "9999999999", commissionPct: 0,  joinDate: "2022-01-01", active: true },
];

const SEED_SERVICES: Service[] = [
  // Hair Cutting & Wash
  { id: "sv1",  name: "Hair Cutting (Women)",    category: "Hair", basePrice: 450,  durationMins: 45 },
  { id: "sv2",  name: "Hair Wash & Blow Dry",    category: "Hair", basePrice: 450,  durationMins: 30 },
  // Hair Treatment
  { id: "sv3",  name: "Hair Spa",                category: "Hair", basePrice: 800,  durationMins: 60 },
  { id: "sv4",  name: "Silk Shine Spa",          category: "Hair", basePrice: 1300, durationMins: 75 },
  { id: "sv5",  name: "Micro Fuel / Dandruff",   category: "Hair", basePrice: 1500, durationMins: 90 },
  // Hair Colour & Highlights
  { id: "sv6",  name: "Root Touch-up",           category: "Hair", basePrice: 800,  durationMins: 60 },
  { id: "sv7",  name: "Global Hair Colours",     category: "Hair", basePrice: 2000, durationMins: 120 },
  { id: "sv8",  name: "Full Hair High-Lights",   category: "Hair", basePrice: 3000, durationMins: 180 },
  // Protein & Chemical
  { id: "sv9",  name: "Botox / QDD",             category: "Hair", basePrice: 5000, durationMins: 180 },
  { id: "sv10", name: "Rebonding / Perming",     category: "Hair", basePrice: 3000, durationMins: 180 },
  // Make-Up
  { id: "sv11", name: "Make up in Salon",        category: "Face", basePrice: 1000, durationMins: 60 },
  { id: "sv12", name: "Makeup with Hair Style",  category: "Face", basePrice: 2000, durationMins: 120 },
  // Skin / Facial / Clean-up
  { id: "sv13", name: "Derma Spa Facial",        category: "Skin", basePrice: 2300, durationMins: 90 },
  { id: "sv14", name: "Hydra Facial",            category: "Skin", basePrice: 3500, durationMins: 90 },
  { id: "sv15", name: "Anti-blemish Clean-up",   category: "Skin", basePrice: 750,  durationMins: 45 },
  // Threading / Waxing
  { id: "sv16", name: "Threading (Eyebrows)",    category: "Face", basePrice: 50,   durationMins: 10 },
  { id: "sv17", name: "Normal Wax (Full Hands)", category: "Skin", basePrice: 200,  durationMins: 20 },
  { id: "sv18", name: "Choco Wax (Full Legs)",   category: "Skin", basePrice: 600,  durationMins: 40 },
  // Body Care & Massage
  { id: "sv19", name: "Full Body Massage",       category: "Body", basePrice: 2500, durationMins: 60 },
  { id: "sv20", name: "Skin Polishing (Full)",   category: "Body", basePrice: 7000, durationMins: 120 },
  // Hand & Feet
  { id: "sv21", name: "Lemon Manicure",          category: "Nails",basePrice: 500,  durationMins: 45 },
  { id: "sv22", name: "Lemon Pedicure",          category: "Nails",basePrice: 600,  durationMins: 45 },
];

function dateOffset(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

const SEED_BILLS: Bill[] = [
  {
    id: "b1", billNumber: "INV-0001", customerName: "Neha Sharma", customerPhone: "9111111111", date: dateOffset(0),
    lineItems: [
      { id: "l1", serviceId: "sv14", serviceName: "Hydra Facial",         staffId: "s1", staffName: "Kriti Sharma", price: 3500, commissionPct: 20 },
      { id: "l2", serviceId: "sv16", serviceName: "Threading (Eyebrows)", staffId: "s2", staffName: "Pooja Mehta",  price: 50,   commissionPct: 18 },
    ],
    total: 3550, discount: 0, grandTotal: 3550, status: "paid", notes: ""
  },
  {
    id: "b2", billNumber: "INV-0002", customerName: "Priya Patel", customerPhone: "9222222222", date: dateOffset(0),
    lineItems: [
      { id: "l3", serviceId: "sv3",  serviceName: "Hair Spa",             staffId: "s3", staffName: "Riya Singh",   price: 800,  commissionPct: 22 },
      { id: "l4", serviceId: "sv21", serviceName: "Lemon Manicure",       staffId: "s4", staffName: "Anjali Gupta", price: 500,  commissionPct: 15 },
    ],
    total: 1300, discount: 0, grandTotal: 1300, status: "paid", notes: ""
  },
  {
    id: "b3", billNumber: "INV-0003", customerName: "Sunita Rao", customerPhone: "9333333333", date: dateOffset(1),
    lineItems: [
      { id: "l5", serviceId: "sv9",  serviceName: "Botox / QDD",          staffId: "s1", staffName: "Kriti Sharma", price: 5000, commissionPct: 20 },
      { id: "l6", serviceId: "sv7",  serviceName: "Global Hair Colours",  staffId: "s2", staffName: "Pooja Mehta",  price: 2000, commissionPct: 18 },
    ],
    total: 7000, discount: 500, grandTotal: 6500, status: "paid", notes: "Combo discount"
  },
  {
    id: "b4", billNumber: "INV-0004", customerName: "Kavya Iyer", customerPhone: "9444444444", date: dateOffset(1),
    lineItems: [
      { id: "l8",  serviceId: "sv18", serviceName: "Choco Wax (Full Legs)",   staffId: "s3", staffName: "Riya Singh",   price: 600, commissionPct: 22 },
      { id: "l9",  serviceId: "sv17", serviceName: "Normal Wax (Full Hands)", staffId: "s3", staffName: "Riya Singh",   price: 200, commissionPct: 22 },
    ],
    total: 800, discount: 0, grandTotal: 800, status: "paid", notes: ""
  },
  {
    id: "b5", billNumber: "INV-0005", customerName: "Meena Joshi", customerPhone: "9555555555", date: dateOffset(2),
    lineItems: [
      { id: "l10", serviceId: "sv1",  serviceName: "Hair Cutting (Women)",staffId: "s2", staffName: "Pooja Mehta",  price: 450,  commissionPct: 18 },
      { id: "l11", serviceId: "sv2",  serviceName: "Hair Wash & Blow Dry",staffId: "s2", staffName: "Pooja Mehta",  price: 450,  commissionPct: 18 },
    ],
    total: 900, discount: 0, grandTotal: 900, status: "paid", notes: ""
  },
];

// ─── Storage helpers ──────────────────────────────────────────

function load<T>(key: string, seed: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T[];
    localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  } catch { return seed; }
}

function save<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

export const STAFF_KEY   = "salonpro_staff";
export const SERVICE_KEY = "salonpro_services";
export const BILL_KEY    = "salonpro_bills";

export function getStaff(): StaffMember[] { return load<StaffMember>(STAFF_KEY, SEED_STAFF); }
export function saveStaff(data: StaffMember[]): void { save(STAFF_KEY, data); }

export function getServices(): Service[] { return load<Service>(SERVICE_KEY, SEED_SERVICES); }
export function saveServices(data: Service[]): void { save(SERVICE_KEY, data); }

export function getBills(): Bill[] { return load<Bill>(BILL_KEY, SEED_BILLS); }
export function saveBills(data: Bill[]): void { save(BILL_KEY, data); }

export function nextBillNumber(): string {
  const bills = getBills();
  const nums = bills.map(b => parseInt(b.billNumber.replace("INV-", "")) || 0);
  const next = nums.length ? Math.max(...nums) + 1 : 1;
  return `INV-${String(next).padStart(4, "0")}`;
}

export interface StaffPerformance {
  staffId: string;
  staffName: string;
  commissionPct: number;
  services: number;
  revenue: number;
  commission: number;
}

export function getStaffPerformance(bills: Bill[]): StaffPerformance[] {
  const staffMap = new Map<string, StaffPerformance>();
  const paidBills = bills.filter(b => b.status === "paid");
  paidBills.forEach(bill => {
    bill.lineItems.forEach(item => {
      const existing = staffMap.get(item.staffId);
      if (existing) {
        existing.services++;
        existing.revenue += item.price;
        existing.commission += (item.price * item.commissionPct) / 100;
      } else {
        staffMap.set(item.staffId, {
          staffId:       item.staffId,
          staffName:     item.staffName,
          commissionPct: item.commissionPct,
          services:      1,
          revenue:       item.price,
          commission:    (item.price * item.commissionPct) / 100,
        });
      }
    });
  });
  return Array.from(staffMap.values()).sort((a, b) => b.revenue - a.revenue);
}

export interface ServiceStats { serviceId: string; serviceName: string; count: number; revenue: number; }

export function getServiceStats(bills: Bill[]): ServiceStats[] {
  const map = new Map<string, ServiceStats>();
  bills.filter(b => b.status === "paid").forEach(bill => {
    bill.lineItems.forEach(item => {
      const ex = map.get(item.serviceId);
      if (ex) { ex.count++; ex.revenue += item.price; }
      else map.set(item.serviceId, { serviceId: item.serviceId, serviceName: item.serviceName, count: 1, revenue: item.price });
    });
  });
  return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
}

export interface DailyRevenue { day: string; revenue: number; customers: number; }

export function getWeeklyRevenue(bills: Bill[]): DailyRevenue[] {
  const result: DailyRevenue[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toDateString();
    const dayBills = bills.filter(b => b.status === "paid" && new Date(b.date).toDateString() === dateStr);
    result.push({
      day: d.toLocaleDateString("en-IN", { weekday: "short" }),
      revenue: dayBills.reduce((s, b) => s + b.grandTotal, 0),
      customers: dayBills.length,
    });
  }
  return result;
}

export function getMonthlyRevenue(bills: Bill[]): DailyRevenue[] {
  const result: DailyRevenue[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(); d.setMonth(i);
    const month = d.toLocaleDateString("en-IN", { month: "short" });
    const monthBills = bills.filter(b => {
      const bd = new Date(b.date);
      return b.status === "paid" && bd.getMonth() === i && bd.getFullYear() === new Date().getFullYear();
    });
    result.push({
      day: month,
      revenue: monthBills.reduce((s, b) => s + b.grandTotal, 0),
      customers: monthBills.length,
    });
  }
  return result;
}
