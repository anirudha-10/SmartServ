import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import AuthLayout from './layouts/AuthLayout';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import DashboardLayout from './layouts/DashboardLayout';

// Role-Based Dashboards & Sub-Modules
import CustomerDashboard from './pages/Customer/CustomerDashboard';
import ServiceTracker from './pages/Customer/ServiceTracker';
import RsaRequest from './pages/Customer/RsaRequest';
import ProfileSettings from './pages/Customer/ProfileSettings';

import ManagerDashboard from './pages/Manager/ManagerDashboard';
import PendingAppointments from './pages/Manager/PendingAppointments';
import JobCardManager from './pages/Manager/JobCardManager';

import MechanicDashboard from './pages/Mechanic/MechanicDashboard';

import AdminDashboard from './pages/Admin/AdminDashboard';
import UserManagement from './pages/Admin/UserManagement';
import AnalyticsReports from './pages/Admin/AnalyticsReports';

// Resource CRUD Modules
import VehicleList from './pages/Vehicles/VehicleList';
import VehicleForm from './pages/Vehicles/VehicleForm';
import AppointmentList from './pages/Appointments/AppointmentList';
import AppointmentForm from './pages/Appointments/AppointmentForm';
import InventoryList from './pages/Inventory/InventoryList';
import InventoryForm from './pages/Inventory/InventoryForm';
import UserList from './pages/Users/UserList';
import UserForm from './pages/Users/UserForm';
import InvoiceList from './pages/Invoices/InvoiceList';

// Error Pages
import NotFound from './pages/Error/NotFound';
import Unauthorized from './pages/Error/Unauthorized';
import ServerError from './pages/Error/ServerError';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isLoggedIn, role, loading } = useAuth();

  if (loading) return null;

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Automatic Role Redirect Component for Root Path '/'
const RoleHomeRedirect = () => {
  const { role } = useAuth();
  switch (role) {
    case 'ADMIN': return <Navigate to="/admin" replace />;
    case 'MANAGER': return <Navigate to="/manager" replace />;
    case 'MECHANIC': return <Navigate to="/mechanic" replace />;
    case 'CUSTOMER':
    default:
      return <Navigate to="/customer" replace />;
  }
};

function App() {
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />
      <Routes>
        {/* Auth Public Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
        
        {/* Protected Dashboard App Routes */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          } 
        >
          <Route index element={<RoleHomeRedirect />} />

          {/* Customer Routes */}
          <Route 
            path="customer/*" 
            element={
              <ProtectedRoute allowedRoles={['CUSTOMER', 'ADMIN']}>
                <Routes>
                  <Route index element={<CustomerDashboard />} />
                  <Route path="tracker" element={<ServiceTracker />} />
                  <Route path="rsa" element={<RsaRequest />} />
                  <Route path="profile" element={<ProfileSettings />} />
                </Routes>
              </ProtectedRoute>
            } 
          />

          {/* Manager Routes */}
          <Route 
            path="manager/*" 
            element={
              <ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}>
                <Routes>
                  <Route index element={<ManagerDashboard />} />
                  <Route path="approvals" element={<PendingAppointments />} />
                </Routes>
              </ProtectedRoute>
            } 
          />

          {/* Mechanic Routes */}
          <Route 
            path="mechanic/*" 
            element={
              <ProtectedRoute allowedRoles={['MECHANIC', 'ADMIN']}>
                <Routes>
                  <Route index element={<MechanicDashboard />} />
                </Routes>
              </ProtectedRoute>
            } 
          />

          {/* Admin Routes */}
          <Route 
            path="admin/*" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <Routes>
                  <Route index element={<AdminDashboard />} />
                  <Route path="users" element={<UserManagement />} />
                  <Route path="reports" element={<AnalyticsReports />} />
                </Routes>
              </ProtectedRoute>
            } 
          />

          {/* Shared Resource Routes */}
          <Route path="vehicles">
            <Route index element={<VehicleList />} />
            <Route path="new" element={<VehicleForm />} />
            <Route path="edit/:id" element={<VehicleForm />} />
          </Route>

          <Route path="appointments">
            <Route index element={<AppointmentList />} />
            <Route path="new" element={<AppointmentForm />} />
          </Route>

          <Route 
            path="job-cards" 
            element={
              <ProtectedRoute allowedRoles={['MANAGER', 'MECHANIC', 'ADMIN']}>
                <JobCardManager />
              </ProtectedRoute>
            } 
          />

          <Route path="inventory">
            <Route index element={<InventoryList />} />
            <Route 
              path="new" 
              element={
                <ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}>
                  <InventoryForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="edit/:id" 
              element={
                <ProtectedRoute allowedRoles={['MANAGER', 'ADMIN']}>
                  <InventoryForm />
                </ProtectedRoute>
              } 
            />
          </Route>

          <Route 
            path="users/*" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'MANAGER']}>
                <Routes>
                  <Route index element={<UserList />} />
                  <Route path="new" element={<UserForm />} />
                  <Route path="edit/:id" element={<UserForm />} />
                </Routes>
              </ProtectedRoute>
            } 
          />

          <Route path="invoices" element={<InvoiceList />} />
        </Route>
        
        {/* Error Pages */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/500" element={<ServerError />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
