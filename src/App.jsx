// src/App.jsx
// Changes from original:
//   + import VehicleDetail   (SCRUM-20)
//   + import ErrorBoundary   (SCRUM-75)
//   + /vehicles/:id route    (SCRUM-20)
//   + ErrorBoundary wraps all protected routes (SCRUM-75)

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Authentication from './pages/Authentication';
import Home from './pages/Home';
import Vehicles from './pages/Vehicles';
import VehicleDetail from './pages/VehicleDetail';       // SCRUM-20
import Booking from './pages/Booking';
import NotFound from './pages/NotFound';
import Navbar from './component/Navbar';
import ErrorBoundary from './component/ErrorBoundary';   // SCRUM-75
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminVehicles from './pages/admin/AdminVehicles';
import AdminBookings from './pages/admin/AdminBookings';
import AdminTerms from './pages/admin/AdminTerms';
import AdminDashboard from './pages/admin/AdminDashboard';
import AddVehicle from './pages/admin/AddVehicle';
import EditVehicle from './pages/admin/EditVehicle';
import { AuthProvider } from './context/AuthContext';

function isLoggedIn() {
  return localStorage.getItem('user') !== null;
}

function isAdminLoggedIn() {
  return localStorage.getItem('admin') !== null;
}

function ProtectedRoute({ children }) {
  if (!isLoggedIn()) return <Navigate to="/login" />;
  return (
    <ErrorBoundary>   {/* SCRUM-75: catches errors in any user page */}
      <Navbar />
      {children}
    </ErrorBoundary>
  );
}

function AdminRoute({ children }) {
  if (!isAdminLoggedIn()) return <Navigate to="/admin/login" />;
  return (
    <ErrorBoundary>   {/* SCRUM-75: catches errors in any admin page */}
      {children}
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login"       element={<Authentication />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/"            element={<Navigate to="/dashboard" />} />
        <Route path="/admin"       element={<Navigate to="/admin/login" />} />

        {/* ── User routes ── */}
        <Route path="/dashboard"       element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/vehicles"        element={<ProtectedRoute><Vehicles /></ProtectedRoute>} />
        <Route path="/vehicles/:id"    element={<ProtectedRoute><VehicleDetail /></ProtectedRoute>} />  {/* SCRUM-20 */}
        <Route path="/booking"         element={<ProtectedRoute><Booking /></ProtectedRoute>} />

        {/* ── Admin routes ── */}
        <Route path="/admin/dashboard" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
        </Route>
        <Route path="/admin/bookings"  element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminBookings />} />
        </Route>
        <Route path="/admin/vehicles"  element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminVehicles />} />
        </Route>
        <Route path="/admin/terms"     element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminTerms />} />
        </Route>
        <Route path="/admin/vehicles/add" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AddVehicle />} />
        </Route>
        <Route path="/admin/vehicles/edit/:id" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<EditVehicle />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}