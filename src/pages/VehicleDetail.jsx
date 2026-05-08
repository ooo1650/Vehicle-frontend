// src/pages/VehicleDetail.jsx
// SCRUM-20: Availability vehicle booking
// Shows full vehicle info + availability calendar + cost calculator + Book Now

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getVehicleById, createBooking } from "../services/bookingService";
import "./VehicleDetail.css";

const IMG_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost/Vehicle_Rental_System/backend";

function safeParse(val, fallback = []) {
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val) ?? fallback; }
  catch { return fallback; }
}

export default function VehicleDetail() {
  const { id }       = useParams();
  const navigate     = useNavigate();

  // ── Data states ─────────────────────────────────────────────
  const [vehicle,    setVehicle]   = useState(null);
  const [status,     setStatus]    = useState("loading"); // loading | ready | error
  const [activeImg,  setActiveImg] = useState(0);

  // ── Booking states ───────────────────────────────────────────
  const [startDate,  setStartDate] = useState("");
  const [endDate,    setEndDate]   = useState("");
  const [bookingMsg, setBookingMsg] = useState(null); // { type, text }
  const [booking,    setBooking]   = useState(false);

  // ── Fetch vehicle ────────────────────────────────────────────
  useEffect(() => {
    if (!id) { setStatus("error"); return; }
    let alive = true;
    setStatus("loading");

    getVehicleById(id)
      .then((data) => {
        if (!alive) return;
        if (data?.id) { setVehicle(data); setStatus("ready"); }
        else setStatus("error");
      })
      .catch(() => { if (alive) setStatus("error"); });

    return () => { alive = false; };
  }, [id]);

  // ── Cost calculator ──────────────────────────────────────────
  const calcDays = () => {
    if (!startDate || !endDate) return 0;
    const diff = (new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24);
    return diff > 0 ? diff : 0;
  };

  const days      = calcDays();
  const totalCost = days * Number(vehicle?.price_per_day || 0);

  // ── Book Now handler ─────────────────────────────────────────
  const handleBooking = async () => {
    if (!startDate || !endDate) {
      setBookingMsg({ type: "danger", text: "Please select both start and end dates." });
      return;
    }
    if (days <= 0) {
      setBookingMsg({ type: "danger", text: "End date must be after start date." });
      return;
    }
    if (startDate < vehicle.availability_start || endDate > vehicle.availability_end) {
      setBookingMsg({ type: "danger", text: "Selected dates are outside the vehicle's availability." });
      return;
    }

    setBooking(true);
    setBookingMsg(null);
    try {
      const res = await createBooking({
        vehicle_id:  vehicle.id,
        start_date:  startDate,
        end_date:    endDate,
        total_price: totalCost,
      });
      if (res.success) {
        setBookingMsg({ type: "success", text: "Booking confirmed! Redirecting to your bookings…" });
        setTimeout(() => navigate("/booking"), 2000);
      } else {
        setBookingMsg({ type: "danger", text: res.message || "Booking failed. Please try again." });
      }
    } catch {
      setBookingMsg({ type: "danger", text: "Server error. Please try again." });
    } finally {
      setBooking(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <div className="vd-state">
        <div className="spinner-border text-primary" />
        <p>Loading vehicle details…</p>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────
  if (status === "error") {
    return (
      <div className="vd-state vd-state--error">
        <span style={{ fontSize: 40 }}>⚠️</span>
        <p>Vehicle not found.</p>
        <button className="btn btn-outline-secondary" onClick={() => navigate("/vehicles")}>
          ← Back to Vehicles
        </button>
      </div>
    );
  }

  const images   = safeParse(vehicle.images);
  const features = safeParse(vehicle.features);

  // ── Ready ────────────────────────────────────────────────────
  return (
    <div className="vd-page">
      <div className="container py-4">

        {/* Back button */}
        <button className="btn btn-outline-secondary btn-sm mb-4" onClick={() => navigate("/vehicles")}>
          ← Back to Vehicles
        </button>

        <div className="row g-4">

          {/* ── LEFT: Images ── */}
          <div className="col-lg-7">

            {/* Main image */}
            <div className="vd-main-img-wrap">
              {images.length > 0 ? (
                <img
                  src={`${IMG_BASE}/${images[activeImg]}`}
                  alt={vehicle.name}
                  className="vd-main-img"
                />
              ) : (
                <div className="vd-no-img">No Image Available</div>
              )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="vd-thumbs">
                {images.map((url, i) => (
                  <img
                    key={i}
                    src={`${IMG_BASE}/${url}`}
                    alt=""
                    className={`vd-thumb ${i === activeImg ? "vd-thumb--active" : ""}`}
                    onClick={() => setActiveImg(i)}
                  />
                ))}
              </div>
            )}

            {/* ── Vehicle info ── */}
            <div className="vd-info-card mt-4">
              <h2 className="vd-title">{vehicle.name}</h2>
              <div className="vd-meta">
                <span className="vd-badge">{vehicle.type}</span>
                <span className="vd-meta-item">🏷️ {vehicle.brand}</span>
                <span className="vd-meta-item">🚗 {vehicle.model}</span>
                <span className="vd-meta-item">📅 {vehicle.year}</span>
              </div>

              {/* Features */}
              {features.length > 0 && (
                <div className="mt-3">
                  <p className="vd-section-label">Features</p>
                  <div className="vd-features">
                    {features.map((f) => (
                      <span key={f} className="vd-feature-pill">{f}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Availability */}
              <div className="mt-3">
                <p className="vd-section-label">Availability</p>
                <p className="vd-avail">
                  📆 {vehicle.availability_start} &nbsp;→&nbsp; {vehicle.availability_end}
                </p>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Booking panel ── */}
          <div className="col-lg-5">
            <div className="vd-booking-card">

              {/* Price */}
              <div className="vd-price-block">
                <span className="vd-price">NPR {Number(vehicle.price_per_day).toLocaleString()}</span>
                <span className="vd-price-label">/ day</span>
              </div>

              <hr />

              {/* Date pickers */}
              <div className="mb-3">
                <label className="form-label fw-semibold">Start Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={startDate}
                  min={vehicle.availability_start}
                  max={vehicle.availability_end}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">End Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={endDate}
                  min={startDate || vehicle.availability_start}
                  max={vehicle.availability_end}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              {/* Cost calculator */}
              {days > 0 && (
                <div className="vd-cost-box">
                  <div className="vd-cost-row">
                    <span>NPR {Number(vehicle.price_per_day).toLocaleString()} × {days} day{days > 1 ? "s" : ""}</span>
                    <span className="fw-bold">NPR {totalCost.toLocaleString()}</span>
                  </div>
                  <div className="vd-cost-row vd-cost-row--total">
                    <span>Total</span>
                    <span>NPR {totalCost.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* Feedback */}
              {bookingMsg && (
                <div className={`alert alert-${bookingMsg.type} py-2 mt-3`} role="alert">
                  {bookingMsg.text}
                </div>
              )}

              {/* Book Now */}
              <button
                className="btn btn-primary w-100 mt-3 vd-book-btn"
                onClick={handleBooking}
                disabled={booking}
              >
                {booking
                  ? <><span className="spinner-border spinner-border-sm me-2" />Processing…</>
                  : "Book Now"}
              </button>

              <p className="vd-note mt-2">
                You won't be charged until the booking is confirmed.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}