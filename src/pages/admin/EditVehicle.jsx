// src/pages/admin/EditVehicle.jsx
// Sits inside your existing src/pages/admin/ folder

import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import VehicleForm from "../../component/VehicleForm";
import { getById, update } from "../../services/vehicleService";

export default function EditVehicle() {
  const { id }     = useParams();       // /admin/vehicles/edit/:id
  const navigate   = useNavigate();

  const [vehicle,  setVehicle]  = useState(null);
  const [status,   setStatus]   = useState("loading"); // "loading"|"ready"|"error"
  const [loading,  setLoading]  = useState(false);
  const [alert,    setAlert]    = useState(null);

  // ── Fetch vehicle on mount ──────────────────────────────────
  useEffect(() => {
    if (!id) { setStatus("error"); return; }
    let alive = true;

    getById(id)
      .then((data) => {
        if (!alive) return;
        if (data?.id) { setVehicle(data); setStatus("ready"); }
        else           setStatus("error");
      })
      .catch(() => { if (alive) setStatus("error"); });

    return () => { alive = false; };
  }, [id]);

  // ── Alert helper ────────────────────────────────────────────
  const showAlert = (type, msg) => {
    setAlert({ type, msg });
    setTimeout(() => setAlert(null), 4000);
  };

  // ── Submit ──────────────────────────────────────────────────
  const handleSubmit = async (formData) => {
    setLoading(true);
    try {
      const res = await update(id, formData);
      if (res.success) {
        showAlert("success", "Vehicle updated successfully! Redirecting…");
        setTimeout(() => navigate("/admin/vehicles"), 1500);
      } else {
        showAlert("danger", res.message || "Update failed.");
      }
    } catch (err) {
      console.error(err);
      showAlert("danger", "Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Loading state ───────────────────────────────────────────
  if (status === "loading") {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" />
          <p className="text-muted">Loading vehicle details…</p>
        </div>
      </div>
    );
  }

  // ── Error / not found ───────────────────────────────────────
  if (status === "error") {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger">
          Vehicle not found or failed to load.
          <button className="btn btn-sm btn-outline-danger ms-3" onClick={() => navigate("/admin/vehicles")}>
            ← Back to Vehicles
          </button>
        </div>
      </div>
    );
  }

  // ── Ready ───────────────────────────────────────────────────
  return (
    <div className="container-fluid py-4">

      {/* Alert */}
      {alert && (
        <div className={`alert alert-${alert.type} alert-dismissible`} role="alert">
          {alert.msg}
          <button type="button" className="btn-close" onClick={() => setAlert(null)} />
        </div>
      )}

      {/* Header — matches your existing admin page style */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div>
          <h4 className="mb-0 fw-bold">Edit Vehicle</h4>
          <p className="text-muted small mb-0">
            Editing: <strong>{vehicle.name}</strong> — changes reflect immediately in the vehicle list.
          </p>
        </div>
      </div>

      <VehicleForm
        initialData={vehicle}
        onSubmit={handleSubmit}
        isLoading={loading}
      />
    </div>
  );
}