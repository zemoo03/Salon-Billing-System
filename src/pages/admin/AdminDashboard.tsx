import { useMemo, useState, useEffect } from "react";
import {
  getBills,
  getStaff,
  getServices,
  getAppointments,
  saveAppointments,
  type Appointment,
} from "../../store/dataStore";

export function AdminDashboard() {
  // Calendar states
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date("2026-07-23"));
  const [viewMode, setViewMode] = useState<"Day" | "Week" | "Month">("Day");
  const [selectedStaffId, setSelectedStaffId] = useState<string>("All");
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  
  // Form states
  const [formClientName, setFormClientName] = useState("");
  const [formClientPhone, setFormClientPhone] = useState("");
  const [formServiceId, setFormServiceId] = useState("");
  const [formStaffId, setFormStaffId] = useState("");
  const [formDate, setFormDate] = useState("2026-07-23");
  const [formTime, setFormTime] = useState("09:00");
  const [formDuration, setFormDuration] = useState(60);
  const [formPrice, setFormPrice] = useState(0);
  const [formPaymentMethod, setFormPaymentMethod] = useState<"Cash" | "Card" | "Online" | "Voucher">("Cash");
  const [formStatus, setFormStatus] = useState<"scheduled" | "completed" | "cancelled">("scheduled");

  // Stats panel visibility
  const [statsExpanded, setStatsExpanded] = useState(true);

  // Load backend data
  const bills = useMemo(() => getBills(), []);
  const staff = useMemo(() => getStaff().filter(s => s.active), []);
  const services = useMemo(() => getServices(), []);
  const [appointments, setAppointments] = useState<Appointment[]>(() => getAppointments());

  // Set default values when modal opens
  useEffect(() => {
    if (services.length > 0 && !formServiceId) {
      setFormServiceId(services[0].id);
      setFormPrice(services[0].basePrice);
    }
    if (staff.length > 0 && !formStaffId) {
      setFormStaffId(staff[0].id);
    }
  }, [services, staff, formServiceId, formStaffId]);

  // Save appointments to store
  const persistAppointments = (newApps: Appointment[]) => {
    setAppointments(newApps);
    saveAppointments(newApps);
  };

  // Synchronize price with service
  const handleServiceChange = (svcId: string) => {
    setFormServiceId(svcId);
    const svc = services.find(s => s.id === svcId);
    if (svc) {
      setFormPrice(svc.basePrice);
      setFormDuration(svc.durationMins);
    }
  };

  // Open modal for new appointment
  const openNewAppointmentModal = () => {
    setEditingAppointment(null);
    setFormClientName("");
    setFormClientPhone("");
    if (services.length > 0) {
      setFormServiceId(services[0].id);
      setFormPrice(services[0].basePrice);
      setFormDuration(services[0].durationMins);
    }
    if (staff.length > 0) {
      setFormStaffId(staff[0].id);
    }
    // format date to YYYY-MM-DD
    const yyyy = currentDate.getFullYear();
    const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dd = String(currentDate.getDate()).padStart(2, '0');
    setFormDate(`${yyyy}-${mm}-${dd}`);
    setFormTime("09:00");
    setFormPaymentMethod("Cash");
    setFormStatus("scheduled");
    setIsModalOpen(true);
  };

  // Open modal for editing existing appointment
  const openEditAppointmentModal = (app: Appointment) => {
    setEditingAppointment(app);
    setFormClientName(app.clientName);
    setFormClientPhone(app.clientPhone);
    setFormServiceId(app.serviceId);
    setFormStaffId(app.staffId);
    setFormDate(app.date);
    setFormTime(app.time);
    setFormDuration(app.durationMins);
    setFormPrice(app.price);
    setFormPaymentMethod(app.paymentMethod);
    setFormStatus(app.status);
    setIsModalOpen(true);
  };

  // Handle save appointment
  const handleSaveAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formClientName.trim()) return;

    const selSvc = services.find(s => s.id === formServiceId);
    const selStaff = staff.find(s => s.id === formStaffId);

    const appData: Appointment = {
      id: editingAppointment ? editingAppointment.id : crypto.randomUUID(),
      clientName: formClientName.trim(),
      clientPhone: formClientPhone.trim(),
      serviceId: formServiceId,
      serviceName: selSvc ? selSvc.name : "Custom Service",
      staffId: formStaffId,
      staffName: selStaff ? selStaff.name : "Staff",
      date: formDate,
      time: formTime,
      durationMins: Number(formDuration),
      price: Number(formPrice),
      paymentMethod: formPaymentMethod,
      status: formStatus
    };

    if (editingAppointment) {
      const updated = appointments.map(a => a.id === editingAppointment.id ? appData : a);
      persistAppointments(updated);
    } else {
      persistAppointments([...appointments, appData]);
    }
    setIsModalOpen(false);
  };

  // Handle delete appointment
  const handleDeleteAppointment = () => {
    if (!editingAppointment) return;
    if (confirm("Are you sure you want to delete this appointment?")) {
      const updated = appointments.filter(a => a.id !== editingAppointment.id);
      persistAppointments(updated);
      setIsModalOpen(false);
    }
  };

  // Dashboard calculations incorporating base + dynamic changes
  const stats = useMemo(() => {
    // Row 1 totals (Today)
    let todaySales = 12392;
    let todayServices = 12392;
    let todayProducts = 0;
    let todayExpenses = 0;

    let todayCash = 4696;
    let todayCard = 0;
    let todayOnline = 6926;
    let todayPettyCash = 12392;

    let todayVoucher = 0;
    let todayPrepaid = 0;
    let todayPackage = 0;
    let todayDue = 0;

    // Row 2 totals (Current Month)
    let monthSales = 227659;
    let monthServices = 230286;
    let monthProducts = 1350;

    let monthCash = 137861;
    let monthCard = 8456;
    let monthOnline = 77316;
    let monthPettyCash = 369409;

    let monthVoucher = 0;
    let monthPrepaid = 0;
    let monthPackage = 0;
    let monthDue = 0;

    // Calculate user-added bills (which don't start with "b")
    const userBills = bills.filter(b => !b.id.startsWith("b"));
    userBills.forEach(b => {
      todaySales += b.grandTotal;
      monthSales += b.grandTotal;
      todayServices += b.grandTotal;
      monthServices += b.grandTotal;
      
      todayCash += b.grandTotal;
      monthCash += b.grandTotal;
      todayPettyCash += b.grandTotal;
      monthPettyCash += b.grandTotal;
    });

    // Calculate user-added completed appointments (which don't start with "ap")
    const userApps = appointments.filter(a => !a.id.startsWith("ap") && a.status === "completed");
    userApps.forEach(a => {
      todaySales += a.price;
      monthSales += a.price;
      todayServices += a.price;
      monthServices += a.price;

      if (a.paymentMethod === "Cash") {
        todayCash += a.price;
        monthCash += a.price;
      } else if (a.paymentMethod === "Card") {
        todayCard += a.price;
        monthCard += a.price;
      } else if (a.paymentMethod === "Online") {
        todayOnline += a.price;
        monthOnline += a.price;
      } else if (a.paymentMethod === "Voucher") {
        todayVoucher += a.price;
        monthVoucher += a.price;
      }
      
      todayPettyCash += a.price;
      monthPettyCash += a.price;
    });

    return {
      today: {
        expenses: todayExpenses,
        sales: todaySales,
        services: todayServices,
        products: todayProducts,
        cash: todayCash,
        card: todayCard,
        online: todayOnline,
        pettyCash: todayPettyCash,
        voucher: todayVoucher,
        prepaid: todayPrepaid,
        pkg: todayPackage,
        due: todayDue
      },
      month: {
        sales: monthSales,
        services: monthServices,
        products: monthProducts,
        cash: monthCash,
        card: monthCard,
        online: monthOnline,
        pettyCash: monthPettyCash,
        voucher: monthVoucher,
        prepaid: monthPrepaid,
        pkg: monthPackage,
        due: monthDue
      }
    };
  }, [bills, appointments]);

  // Navigate dates
  const handlePrevDate = () => {
    const d = new Date(currentDate);
    if (viewMode === "Day") d.setDate(d.getDate() - 1);
    else if (viewMode === "Week") d.setDate(d.getDate() - 7);
    else d.setMonth(d.getMonth() - 1);
    setCurrentDate(d);
  };

  const handleNextDate = () => {
    const d = new Date(currentDate);
    if (viewMode === "Day") d.setDate(d.getDate() + 1);
    else if (viewMode === "Week") d.setDate(d.getDate() + 7);
    else d.setMonth(d.getMonth() + 1);
    setCurrentDate(d);
  };

  const handleTodayDate = () => {
    setCurrentDate(new Date("2026-07-23")); // Default seed date
  };

  // Filter appointments for the view
  const formattedSelectedDate = useMemo(() => {
    const yyyy = currentDate.getFullYear();
    const mm = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dd = String(currentDate.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, [currentDate]);

  const filteredAppointments = useMemo(() => {
    let result = appointments;
    
    // Filter by staff
    if (selectedStaffId !== "All") {
      result = result.filter(a => a.staffId === selectedStaffId);
    }

    // Filter by date range
    if (viewMode === "Day") {
      result = result.filter(a => a.date === formattedSelectedDate);
    } else if (viewMode === "Week") {
      // Find start of week (Sunday or Monday)
      const day = currentDate.getDay();
      const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1); // start on Monday
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(diff);
      startOfWeek.setHours(0,0,0,0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      endOfWeek.setHours(23,59,59,999);

      result = result.filter(a => {
        const appDate = new Date(a.date);
        return appDate >= startOfWeek && appDate <= endOfWeek;
      });
    } else {
      // Month
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      result = result.filter(a => {
        const appDate = new Date(a.date);
        return appDate.getFullYear() === year && appDate.getMonth() === month;
      });
    }

    return result;
  }, [appointments, currentDate, viewMode, selectedStaffId, formattedSelectedDate]);

  // Format date display
  const dateHeadingText = useMemo(() => {
    return currentDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    });
  }, [currentDate]);

  const weekdayName = useMemo(() => {
    return currentDate.toLocaleDateString("en-US", { weekday: "long" });
  }, [currentDate]);

  // Hours list (8 AM to 8 PM)
  const hoursRange = Array.from({ length: 13 }, (_, i) => i + 8); // [8, 9, ..., 20]
  
  const formatHourLabel = (h: number) => {
    if (h === 12) return "12pm";
    return h > 12 ? `${h - 12}pm` : `${h}am`;
  };

  return (
    <div className="crm-dashboard">
      
      {/* Dynamic Expand/Collapse stats arrow */}
      <div className="flex justify-center mb-2">
        <button 
          onClick={() => setStatsExpanded(!statsExpanded)}
          className="btn btn-ghost btn-sm"
          style={{ 
            padding: "2px 20px", 
            border: "1px solid var(--border)", 
            borderRadius: "15px",
            background: "var(--surface)",
            boxShadow: "var(--shadow-sm)",
            transform: statsExpanded ? "none" : "rotate(180deg)",
            transition: "transform 0.3s ease"
          }}
          title={statsExpanded ? "Collapse Statistics Panel" : "Expand Statistics Panel"}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
        </button>
      </div>

      {statsExpanded && (
        <div className="stats-container mb-4">
          {/* Row 1: Today/Total */}
          <div className="grid grid-3 mb-3">
            {/* Total Block */}
            <div className="card stat-block">
              <div className="block-header">Total</div>
              <div className="block-row">
                <div className="metric-item">
                  <div className="metric-value">₹{stats.today.expenses.toLocaleString("en-IN")}</div>
                  <div className="metric-label label-blue">Expenses</div>
                </div>
                <div className="metric-item">
                  <div className="metric-value">₹{stats.today.sales.toLocaleString("en-IN")}</div>
                  <div className="metric-label label-green">Sales</div>
                </div>
                <div className="metric-item">
                  <div className="metric-value">₹{stats.today.services.toLocaleString("en-IN")}</div>
                  <div className="metric-label label-red">Services</div>
                </div>
                <div className="metric-item">
                  <div className="metric-value">₹{stats.today.products.toLocaleString("en-IN")}</div>
                  <div className="metric-label label-purple">Products</div>
                </div>
              </div>
            </div>

            {/* Finance Block */}
            <div className="card stat-block">
              <div className="block-header">Finance</div>
              <div className="block-row">
                <div className="metric-item">
                  <div className="metric-value">₹{stats.today.cash.toLocaleString("en-IN")}</div>
                  <div className="metric-label label-blue">Cash</div>
                </div>
                <div className="metric-item">
                  <div className="metric-value">₹{stats.today.card.toLocaleString("en-IN")}</div>
                  <div className="metric-label label-green">Card</div>
                </div>
                <div className="metric-item">
                  <div className="metric-value">₹{stats.today.online.toLocaleString("en-IN")}</div>
                  <div className="metric-label label-red">Online</div>
                </div>
                <div className="metric-item">
                  <div className="metric-value">₹{stats.today.pettyCash.toLocaleString("en-IN")}</div>
                  <div className="metric-label label-purple">PettyCash</div>
                </div>
              </div>
            </div>

            {/* Redemption Balance Block */}
            <div className="card stat-block">
              <div className="block-header">Redemption Balance</div>
              <div className="block-row">
                <div className="metric-item">
                  <div className="metric-value">₹{stats.today.voucher.toLocaleString("en-IN")}</div>
                  <div className="metric-label label-blue">Voucher</div>
                </div>
                <div className="metric-item">
                  <div className="metric-value">₹{stats.today.prepaid.toLocaleString("en-IN")}</div>
                  <div className="metric-label label-green">Prepaid</div>
                </div>
                <div className="metric-item">
                  <div className="metric-value">₹{stats.today.pkg.toLocaleString("en-IN")}</div>
                  <div className="metric-label label-red">Package</div>
                </div>
                <div className="metric-item">
                  <div className="metric-value">₹{stats.today.due.toLocaleString("en-IN")}</div>
                  <div className="metric-label label-purple">Due</div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Current Month */}
          <div className="current-month-section mb-3">
            <div className="text-sm font-semibold mb-2" style={{ color: "var(--text)" }}>Current Month</div>
            <div className="grid grid-3">
              {/* Total Block */}
              <div className="card stat-block">
                <div className="block-header">Total</div>
                <div className="block-row">
                  <div className="metric-item">
                    <div className="metric-value" style={{ visibility: "hidden" }}>—</div>
                    <div className="metric-label" style={{ visibility: "hidden" }}>Placeholder</div>
                  </div>
                  <div className="metric-item">
                    <div className="metric-value">₹{stats.month.sales.toLocaleString("en-IN")}</div>
                    <div className="metric-label label-green">Sales</div>
                  </div>
                  <div className="metric-item">
                    <div className="metric-value">₹{stats.month.services.toLocaleString("en-IN")}</div>
                    <div className="metric-label label-green">Services</div>
                  </div>
                  <div className="metric-item">
                    <div className="metric-value">₹{stats.month.products.toLocaleString("en-IN")}</div>
                    <div className="metric-label label-red">Products</div>
                  </div>
                </div>
              </div>

              {/* Finance Block */}
              <div className="card stat-block">
                <div className="block-header">Finance</div>
                <div className="block-row">
                  <div className="metric-item">
                    <div className="metric-value">₹{stats.month.cash.toLocaleString("en-IN")}</div>
                    <div className="metric-label label-blue">Cash</div>
                  </div>
                  <div className="metric-item">
                    <div className="metric-value">₹{stats.month.card.toLocaleString("en-IN")}</div>
                    <div className="metric-label label-green">Card</div>
                  </div>
                  <div className="metric-item">
                    <div className="metric-value">₹{stats.month.online.toLocaleString("en-IN")}</div>
                    <div className="metric-label label-red">Online</div>
                  </div>
                  <div className="metric-item">
                    <div className="metric-value">₹{stats.month.pettyCash.toLocaleString("en-IN")}</div>
                    <div className="metric-label label-purple">PettyCash</div>
                  </div>
                </div>
              </div>

              {/* Redemption Balance Block */}
              <div className="card stat-block">
                <div className="block-header">Redemption Balance</div>
                <div className="block-row">
                  <div className="metric-item">
                    <div className="metric-value">₹{stats.month.voucher.toLocaleString("en-IN")}</div>
                    <div className="metric-label label-blue">Voucher</div>
                  </div>
                  <div className="metric-item">
                    <div className="metric-value">₹{stats.month.prepaid.toLocaleString("en-IN")}</div>
                    <div className="metric-label label-green">Prepaid</div>
                  </div>
                  <div className="metric-item">
                    <div className="metric-value">₹{stats.month.pkg.toLocaleString("en-IN")}</div>
                    <div className="metric-label label-red">Package</div>
                  </div>
                  <div className="metric-item">
                    <div className="metric-value">₹{stats.month.due.toLocaleString("en-IN")}</div>
                    <div className="metric-label label-purple">Due</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Area */}
      <div className="calendar-card card" style={{ padding: 0, overflow: "hidden" }}>
        
        {/* Calendar Header matching screenshot banner */}
        <div className="calendar-header-banner">
          {/* Navigation Controls */}
          <div className="nav-controls">
            <button className="cal-pill-btn" onClick={handlePrevDate}>Prev</button>
            <button className="cal-pill-btn" onClick={handleTodayDate}>Today</button>
            <button className="cal-pill-btn" onClick={handleNextDate}>Next</button>
          </div>

          {/* Filter Dropdown */}
          <div className="filter-dropdown-container">
            <select 
              className="calendar-dropdown" 
              value={selectedStaffId} 
              onChange={e => setSelectedStaffId(e.target.value)}
            >
              <option value="All">All Staff</option>
              {staff.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Center Date Display */}
          <div className="center-date-title">
            {dateHeadingText}
          </div>

          {/* Add Appointment Button */}
          <div className="action-button-container">
            <button className="cal-pill-btn primary-cal-btn" onClick={openNewAppointmentModal}>
              Add Appointment
            </button>
          </div>

          {/* View Toggles */}
          <div className="view-toggles">
            {(["Day", "Week", "Month"] as const).map(mode => (
              <button 
                key={mode} 
                className={`cal-pill-btn ${viewMode === mode ? "active-cal-mode" : ""}`}
                onClick={() => setViewMode(mode)}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>

        {/* Calendar Grid Area */}
        <div className="calendar-grid-body">
          
          {/* DAY VIEW GRID */}
          {viewMode === "Day" && (
            <div className="day-grid-container">
              {/* Day heading banner */}
              <div className="day-name-heading">
                {weekdayName}
              </div>

              {/* Grid content */}
              <div className="day-grid-content">
                {/* Time ruler column */}
                <div className="time-ruler-col">
                  {hoursRange.map(h => (
                    <div key={h} className="hour-ruler-tick">
                      <span>{formatHourLabel(h)}</span>
                    </div>
                  ))}
                </div>

                {/* Day grid column slots */}
                <div className="appointments-grid-col">
                  {/* Grid paper lines */}
                  <div className="grid-paper-background">
                    {hoursRange.map(h => (
                      <div key={h} className="grid-hour-row" />
                    ))}
                  </div>

                  {/* Absolute positioned appointments cards */}
                  {filteredAppointments.map(app => {
                    // Calculate absolute positions
                    const [hStr, mStr] = app.time.split(":");
                    const startHour = Number(hStr) + Number(mStr) / 60;
                    
                    // We render grid from 8:00 AM (8.0) to 8:00 PM (20.0)
                    // Skip if out of bounds
                    if (startHour < 8 || startHour >= 21) return null;

                    const gridTopOffset = (startHour - 8) * 60; // 60px per hour
                    const gridHeight = app.durationMins; // 1px per min = 60px per hr
                    
                    // Border color based on status or staff
                    let statusColor = "#3b82f6"; // scheduled: blue
                    if (app.status === "completed") statusColor = "#10b981"; // green
                    if (app.status === "cancelled") statusColor = "#ef4444"; // red

                    return (
                      <div
                        key={app.id}
                        className="appointment-card"
                        style={{
                          top: `${gridTopOffset}px`,
                          height: `${gridHeight}px`,
                          borderLeft: `4px solid ${statusColor}`
                        }}
                        onClick={() => openEditAppointmentModal(app)}
                      >
                        <div className="app-card-title">{app.clientName}</div>
                        <div className="app-card-details">
                          <span>📞 {app.clientPhone}</span>
                          <span>✂️ {app.serviceName} ({app.price}₹)</span>
                          <span>👤 Staff: {app.staffName}</span>
                        </div>
                        <div className="app-card-time-badge">
                          {app.time} ({app.durationMins}m)
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* WEEK VIEW GRID */}
          {viewMode === "Week" && (
            <div className="week-grid-container">
              <div className="week-grid-header">
                <div className="week-time-gutter-header" />
                {Array.from({ length: 7 }).map((_, idx) => {
                  const day = currentDate.getDay();
                  const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1) + idx;
                  const dateVal = new Date(currentDate);
                  dateVal.setDate(diff);
                  const isCurrentDay = dateVal.toDateString() === new Date().toDateString();
                  return (
                    <div key={idx} className={`week-day-col-header ${isCurrentDay ? "today-highlight" : ""}`}>
                      <div className="week-day-name">{dateVal.toLocaleDateString("en-US", { weekday: "short" })}</div>
                      <div className="week-day-date">{dateVal.getDate()}</div>
                    </div>
                  );
                })}
              </div>

              <div className="week-grid-scroll-area">
                <div className="week-grid-time-ruler">
                  {hoursRange.map(h => (
                    <div key={h} className="hour-ruler-tick">
                      <span>{formatHourLabel(h)}</span>
                    </div>
                  ))}
                </div>

                <div className="week-grid-cols-wrapper">
                  {Array.from({ length: 7 }).map((_, colIdx) => {
                    const day = currentDate.getDay();
                    const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1) + colIdx;
                    const dateVal = new Date(currentDate);
                    dateVal.setDate(diff);

                    const yyyy = dateVal.getFullYear();
                    const mm = String(dateVal.getMonth() + 1).padStart(2, '0');
                    const dd = String(dateVal.getDate()).padStart(2, '0');
                    const colDateStr = `${yyyy}-${mm}-${dd}`;

                    const dayApps = filteredAppointments.filter(a => a.date === colDateStr);

                    return (
                      <div key={colIdx} className="week-day-col-slot">
                        <div className="grid-paper-background">
                          {hoursRange.map(h => (
                            <div key={h} className="grid-hour-row" />
                          ))}
                        </div>

                        {dayApps.map(app => {
                          const [hStr, mStr] = app.time.split(":");
                          const startHour = Number(hStr) + Number(mStr) / 60;
                          
                          if (startHour < 8 || startHour >= 21) return null;

                          const gridTopOffset = (startHour - 8) * 60;
                          const gridHeight = app.durationMins;

                          let statusColor = "#3b82f6";
                          if (app.status === "completed") statusColor = "#10b981";
                          if (app.status === "cancelled") statusColor = "#ef4444";

                          return (
                            <div
                              key={app.id}
                              className="appointment-card mini-week-card"
                              style={{
                                top: `${gridTopOffset}px`,
                                height: `${gridHeight}px`,
                                borderLeft: `3px solid ${statusColor}`
                              }}
                              onClick={() => openEditAppointmentModal(app)}
                              title={`${app.clientName} - ${app.serviceName}`}
                            >
                              <div className="app-card-title truncate" style={{ fontSize: "0.7rem" }}>{app.clientName}</div>
                              <div className="app-card-time-badge" style={{ fontSize: "0.6rem" }}>{app.time}</div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* MONTH VIEW GRID */}
          {viewMode === "Month" && (
            <div className="month-grid-container">
              <div className="month-grid-header">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
                  <div key={d} className="month-day-header">{d}</div>
                ))}
              </div>
              <div className="month-grid-cells">
                {(() => {
                  const cells = [];
                  const year = currentDate.getFullYear();
                  const month = currentDate.getMonth();

                  // First day of month
                  const firstDay = new Date(year, month, 1);
                  // Day of week (0-6), convert 0 (Sunday) to 6, Monday to 0
                  const startDayIdx = (firstDay.getDay() + 6) % 7;
                  // Total days in month
                  const daysInMonth = new Date(year, month + 1, 0).getDate();

                  // Padding cells
                  for (let i = 0; i < startDayIdx; i++) {
                    cells.push(<div key={`pad-${i}`} className="month-day-cell empty-cell" />);
                  }

                  // Month days
                  for (let dNum = 1; dNum <= daysInMonth; dNum++) {
                    const cellDateVal = new Date(year, month, dNum);
                    
                    const yyyy = cellDateVal.getFullYear();
                    const mm = String(cellDateVal.getMonth() + 1).padStart(2, '0');
                    const dd = String(cellDateVal.getDate()).padStart(2, '0');
                    const cellDateStr = `${yyyy}-${mm}-${dd}`;

                    const cellApps = filteredAppointments.filter(a => a.date === cellDateStr);
                    const isToday = cellDateVal.toDateString() === new Date().toDateString();

                    cells.push(
                      <div key={dNum} className={`month-day-cell ${isToday ? "today-cell-highlight" : ""}`}>
                        <div className="cell-day-num">{dNum}</div>
                        <div className="cell-appointments-list">
                          {cellApps.slice(0, 3).map(app => (
                            <div 
                              key={app.id} 
                              className={`month-app-pill app-status-${app.status}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditAppointmentModal(app);
                              }}
                            >
                              {app.time} {app.clientName.split(" ")[0]}
                            </div>
                          ))}
                          {cellApps.length > 3 && (
                            <div className="more-apps-indicator">+{cellApps.length - 3} more</div>
                          )}
                        </div>
                      </div>
                    );
                  }

                  return cells;
                })()}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Appointment Modal Popup (Add & Edit) */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: "500px" }}>
            <div className="modal-header">
              <h3 className="modal-title">
                {editingAppointment ? "Edit Appointment Details" : "Schedule New Appointment"}
              </h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            
            <form onSubmit={handleSaveAppointment}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Client Name *</label>
                  <input
                    type="text"
                    required
                    className="input"
                    placeholder="e.g. Neha Sharma"
                    value={formClientName}
                    onChange={e => setFormClientName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Client Phone *</label>
                  <input
                    type="text"
                    required
                    className="input"
                    placeholder="e.g. 9876543210"
                    value={formClientPhone}
                    onChange={e => setFormClientPhone(e.target.value)}
                  />
                </div>

                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">Service Booking</label>
                    <select
                      className="select"
                      value={formServiceId}
                      onChange={e => handleServiceChange(e.target.value)}
                    >
                      {services.map(s => (
                        <option key={s.id} value={s.id}>{s.name} (₹{s.basePrice})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Staff Member Assignee</label>
                    <select
                      className="select"
                      value={formStaffId}
                      onChange={e => setFormStaffId(e.target.value)}
                    >
                      {staff.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-3">
                  <div className="form-group">
                    <label className="form-label">Appointment Date</label>
                    <input
                      type="date"
                      required
                      className="input"
                      value={formDate}
                      onChange={e => setFormDate(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Start Time</label>
                    <input
                      type="time"
                      required
                      className="input"
                      value={formTime}
                      onChange={e => setFormTime(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Duration (mins)</label>
                    <input
                      type="number"
                      required
                      min={10}
                      max={480}
                      className="input"
                      value={formDuration}
                      onChange={e => setFormDuration(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="grid grid-3">
                  <div className="form-group">
                    <label className="form-label">Session Price (₹)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      className="input"
                      value={formPrice}
                      onChange={e => setFormPrice(Number(e.target.value))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Payment Method</label>
                    <select
                      className="select"
                      value={formPaymentMethod}
                      onChange={e => setFormPaymentMethod(e.target.value as any)}
                    >
                      <option value="Cash">Cash</option>
                      <option value="Card">Card</option>
                      <option value="Online">Online</option>
                      <option value="Voucher">Voucher</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      className="select"
                      value={formStatus}
                      onChange={e => setFormStatus(e.target.value as any)}
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                {editingAppointment && (
                  <button
                    type="button"
                    className="btn btn-danger"
                    style={{ marginRight: "auto" }}
                    onClick={handleDeleteAppointment}
                  >
                    Delete Booking
                  </button>
                )}
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default AdminDashboard;
