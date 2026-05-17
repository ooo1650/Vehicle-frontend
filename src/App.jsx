import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Authentication from './pages/Authentication';
import Home from './pages/Home';
import Vehicles from './pages/Vehicles';
import Booking from './pages/Booking';
import MyBookings from './pages/MyBookings';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Navbar from './component/Navbar';
import ErrorBoundary from './component/ErrorBoundary';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminVehicles from './pages/admin/AdminVehicles';
import AdminBookings from './pages/admin/AdminBookings';
import AdminTerms from './pages/admin/AdminTerms';
import AdminDashboard from './pages/admin/AdminDashboard';
import EditVehicle from './pages/admin/EditVehicle';
import EsewaSuccess from './pages/EsewaSuccess';
import EsewaFailure from './pages/EsewaFailure';
import { AuthProvider } from './context/AuthContext';

// Lazy stubs for pages not yet built
const VehicleDetail = () => <div style={{padding:40}}><h2>Vehicle Detail</h2><p>Coming soon.</p></div>;
const AddVehicle    = () => <div style={{padding:40}}><h2>Add Vehicle</h2><p>Coming soon.</p></div>;

function isLoggedIn()      { return localStorage.getItem('user')  !== null; }
function isAdminLoggedIn() { return localStorage.getItem('admin') !== null; }

function ProtectedRoute({ children }) {
  if (!isLoggedIn()) return <Navigate to="/login" />;
  return (
    <ErrorBoundary>
      <Navbar />
      {children}
    </ErrorBoundary>
  );
}

function AdminRoute({ children }) {
  if (!isAdminLoggedIn()) return <Navigate to="/admin/login" />;
  return <ErrorBoundary>{children}</ErrorBoundary>;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/login"       element={<Authentication />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/"            element={<Navigate to="/dashboard" />} />
        <Route path="/admin"       element={<Navigate to="/admin/login" />} />

        {/* User protected */}
        <Route path="/dashboard"      element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/vehicles"       element={<ProtectedRoute><Vehicles /></ProtectedRoute>} />
        <Route path="/vehicles/:id"   element={<ProtectedRoute><VehicleDetail /></ProtectedRoute>} />
        <Route path="/booking"        element={<ProtectedRoute><Booking /></ProtectedRoute>} />
        <Route path="/my-bookings"    element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
        <Route path="/profile"        element={<ProtectedRoute><Profile /></ProtectedRoute>} />

        {/* eSewa payment callbacks — no Navbar needed, user may not be "logged in" context here */}
        <Route path="/payment/esewa/success" element={<EsewaSuccess />} />
        <Route path="/payment/esewa/failure" element={<EsewaFailure />} />

        {/* Admin protected */}
        <Route path="/admin/dashboard"         element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminDashboard />} />
        </Route>
        <Route path="/admin/bookings"          element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminBookings />} />
        </Route>
        <Route path="/admin/vehicles"          element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminVehicles />} />
        </Route>
        <Route path="/admin/vehicles/add"      element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AddVehicle />} />
        </Route>
        <Route path="/admin/vehicles/edit/:id" element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<EditVehicle />} />
        </Route>
        <Route path="/admin/terms"             element={<AdminRoute><AdminLayout /></AdminRoute>}>
          <Route index element={<AdminTerms />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}
