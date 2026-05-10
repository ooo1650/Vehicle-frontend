import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Authentication from './pages/Authentication';
import Home from './pages/Home';
import Vehicles from './pages/Vehicles';
import Booking from './pages/Booking';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Navbar from './component/Navbar';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminVehicles from './pages/admin/AdminVehicles';
import AdminBookings from './pages/admin/AdminBookings';
import AdminTerms from './pages/admin/AdminTerms';
import AdminDashboard from './pages/admin/AdminDashboard';
import { AuthProvider } from './context/AuthContext';

function isLoggedIn() {
  return localStorage.getItem('user') !== null;
}

function isAdminLoggedIn() {
  return localStorage.getItem('admin') !== null;
}

function ProtectedRoute({ children }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" />;
  }
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

function AdminRoute({ children }) {
  if (!isAdminLoggedIn()) {
    return <Navigate to="/admin/login" />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Authentication />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/admin" element={<Navigate to="/admin/login" />} />

        {/* Protected user routes - Navbar is shown inside ProtectedRoute */}
        <Route path="/dashboard" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/vehicles"  element={<ProtectedRoute><Vehicles /></ProtectedRoute>} />
        <Route path="/booking"   element={<ProtectedRoute><Booking /></ProtectedRoute>} />
        <Route path="/profile"   element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
        </Route>
        <Route path="/admin/bookings" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminBookings />} />
        </Route>
        <Route path="/admin/vehicles" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminVehicles />} />
        </Route>
        <Route path="/admin/terms" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminTerms />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}
