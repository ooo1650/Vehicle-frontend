// src/component/VehicleCard.jsx
// Updated for SCRUM-20: clicking a card navigates to /vehicles/:id

import React from "react";
import { useNavigate } from "react-router-dom";

const IMG_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost/Vehicle_Rental_System/backend";

function safeParse(val, fallback = []) {
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val) ?? fallback; }
  catch { return fallback; }
}

export default function VehicleCard({ vehicle }) {
  const navigate = useNavigate();
  const images   = safeParse(vehicle.images);
  const features = safeParse(vehicle.features);
  const thumb    = images[0] ? `${IMG_BASE}/${images[0]}` : null;

  return (
    <div
      className="card h-100 shadow-sm"
      style={{ borderRadius: 14, cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s" }}
      onClick={() => navigate(`/vehicles/${vehicle.id}`)}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.12)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)";    e.currentTarget.style.boxShadow = ""; }}
    >
      {/* Image */}
      <div style={{ height: 200, background: "#e5e7eb", borderRadius: "14px 14px 0 0", overflow: "hidden" }}>
        {thumb ? (
          <img src={thumb} alt={vehicle.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>
            No Image
          </div>
        )}
      </div>

      <div className="card-body d-flex flex-column gap-2">
        {/* Name + type badge */}
        <div className="d-flex justify-content-between align-items-start">
          <h5 className="card-title mb-0 fw-bold" style={{ fontSize: 16 }}>{vehicle.name}</h5>
          <span className="badge" style={{ background: "#eff6ff", color: "#1d4ed8", fontSize: 11 }}>
            {vehicle.type}
          </span>
        </div>

        {/* Brand / model / year */}
        <p className="text-muted mb-0" style={{ fontSize: 13 }}>
          {vehicle.brand} {vehicle.model} · {vehicle.year}
        </p>

        {/* Features */}
        {features.length > 0 && (
          <div className="d-flex flex-wrap gap-1">
            {features.slice(0, 3).map((f) => (
              <span key={f} style={{ background: "#f3f4f6", color: "#374151", padding: "2px 10px", borderRadius: 999, fontSize: 11 }}>
                {f}
              </span>
            ))}
            {features.length > 3 && (
              <span style={{ color: "#9ca3af", fontSize: 11 }}>+{features.length - 3} more</span>
            )}
          </div>
        )}

        {/* Price + CTA */}
        <div className="d-flex justify-content-between align-items-center mt-auto pt-2 border-top">
          <div>
            <span style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>
              NPR {Number(vehicle.price_per_day).toLocaleString()}
            </span>
            <span style={{ fontSize: 12, color: "#6b7280" }}> / day</span>
          </div>
          <button
            className="btn btn-primary btn-sm"
            style={{ borderRadius: 8, fontSize: 13 }}
            onClick={(e) => { e.stopPropagation(); navigate(`/vehicles/${vehicle.id}`); }}
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}