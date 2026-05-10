// src/pages/admin/AddVehicle.jsx
// Sits inside your existing src/pages/admin/ folder

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import VehicleForm from "../../component/VehicleForm";
import { create } from "../../services/vehicleService";

export default function AddVehicle() {
  const navigate    = useNavigate();
  const [loading,   setLoading]   = useState(false);
  const [alert,     setAlert]     = useState(null); // { type:"success"|"danger", msg }

  const showAlert = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 4000);
  };

  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const res = await create(formData);
      if (res.success) {
        showAlert("success", "Vehicle added successfully! Redirecting…");
        setTimeout(() => navigate("/admin/vehicles"), 1500);
      } else {
        showAlert("danger", res.message || "Failed to add vehicle.");
      }
    } catch (err) {
      console.error(err);
      showAlert("danger", "Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-4">

      {/* Alert */}
      {alert && (
        <div className={`alert alert-${alert.type} alert-dismissible`} role="alert">
          {alert.msg}
          <button type="button" className="btn-close" onClick={() => setAlert(null)} />
        </div>
      )}

      {/* Header — matches your existing Dashboard/Booking page style */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div>
          <h4 className="mb-0 fw-bold">Add New Vehicle</h4>
          <p className="text-muted small mb-0">
            Vehicle will appear in the user-facing list immediately after saving.
          </p>
        </div>
      </div>

      <VehicleForm
        initialData={null}
        onSubmit={handleSubmit}
        isLoading={loading}
      />
    </div>
  );
}