import { Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { StaffDashboard } from "./pages/staff/StaffDashboard";
import { ManageStaff } from "./pages/admin/ManageStaff";
import { ManageServices } from "./pages/admin/ManageServices";
import { NewBill } from "./pages/admin/NewBill";
import { BillsList } from "./pages/admin/BillsList";
import { BillDetail } from "./pages/admin/BillDetail";
import { Reports } from "./pages/admin/Reports";
import { Layout } from "./components/layout/Layout";
import { Clients } from "./pages/admin/Clients";
import { Inventory } from "./pages/admin/Inventory";
import { Members } from "./pages/admin/Members";
import { Loyalty } from "./pages/admin/Loyalty";
import { Templates } from "./pages/admin/Templates";
import { Settings } from "./pages/admin/Settings";

export type UserRole = "admin" | "owner" | "staff";

export function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route
            path="dashboard"
            element={
              <ProtectedRoute allowedRoles={["admin", "owner"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="staff-dashboard"
            element={
              <ProtectedRoute allowedRoles={["staff"]}>
                <StaffDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="staff"
            element={
              <ProtectedRoute allowedRoles={["admin", "owner"]}>
                <ManageStaff />
              </ProtectedRoute>
            }
          />
          <Route
            path="services"
            element={
              <ProtectedRoute allowedRoles={["admin", "owner"]}>
                <ManageServices />
              </ProtectedRoute>
            }
          />
          <Route
            path="billing/new"
            element={
              <ProtectedRoute allowedRoles={["admin", "owner", "staff"]}>
                <NewBill />
              </ProtectedRoute>
            }
          />
          <Route
            path="billing"
            element={
              <ProtectedRoute allowedRoles={["admin", "owner"]}>
                <BillsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="billing/:billId"
            element={
              <ProtectedRoute allowedRoles={["admin", "owner", "staff"]}>
                <BillDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="reports"
            element={
              <ProtectedRoute allowedRoles={["admin", "owner"]}>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="clients"
            element={
              <ProtectedRoute allowedRoles={["admin", "owner", "staff"]}>
                <Clients />
              </ProtectedRoute>
            }
          />
          <Route
            path="inventory"
            element={
              <ProtectedRoute allowedRoles={["admin", "owner"]}>
                <Inventory />
              </ProtectedRoute>
            }
          />
          <Route
            path="members"
            element={
              <ProtectedRoute allowedRoles={["admin", "owner"]}>
                <Members />
              </ProtectedRoute>
            }
          />
          <Route
            path="loyalty"
            element={
              <ProtectedRoute allowedRoles={["admin", "owner"]}>
                <Loyalty />
              </ProtectedRoute>
            }
          />
          <Route
            path="templates"
            element={
              <ProtectedRoute allowedRoles={["admin", "owner"]}>
                <Templates />
              </ProtectedRoute>
            }
          />
          <Route
            path="settings"
            element={
              <ProtectedRoute allowedRoles={["admin", "owner"]}>
                <Settings />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;

