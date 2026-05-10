import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './VehicleDetail.css';

// SVG icons — no emojis
function FuelIcon()  { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 22V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/><path d="M3 22h12"/><path d="M15 8h2a2 2 0 0 1 2 2v3a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V9.5L19 6"/></svg>; }
function SeatsIcon() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>; }
function GearIcon()  { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>; }
function PinIcon()   { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>; }

export default function VehicleDetail({ vehicleId, onClose }) {
  const navigate = useNavigate();
  const [vehicle,   setVehicle]  = useState(null);
  const [loading,   setLoading]  = useState(true);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    setLoading(true);
    setActiveImg(0);
    fetch(`/api/vehicles/get_vehicle.php?id=${vehicleId}`)
      .then(r => r.json())
      .then(d => { if (d.success) setVehicle(d.vehicle); })
      .finally(() => setLoading(false));
  }, [vehicleId]);

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function handleBackdrop(e) {
    if (e.target === e.currentTarget) onClose();
  }

  function handleBookNow() {
    onClose();
    navigate('/booking', { state: { vehicle } });
  }

  return (
    <div className="vd-backdrop" onClick={handleBackdrop}>
      <div className="vd-modal">
        <button className="vd-close" onClick={onClose}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {loading && <div className="vd-loading">Loading...</div>}

        {!loading && vehicle && (
          <div className="vd-body">

            {/* LEFT: images + description */}
            <div className="vd-left">
              <div className="vd-main-img-wrap">
                <span className="vd-type-badge">{vehicle.type}</span>
                <img
                  src={vehicle.images?.[activeImg]?.image_path || 'https://placehold.co/600x300/e5e7eb/9ca3af?text=No+Image'}
                  alt={vehicle.name}
                  className="vd-main-img"
                />
              </div>

              {vehicle.images?.length > 1 && (
                <div className="vd-thumbs">
                  {vehicle.images.map((img, i) => (
                    <img key={i} src={img.image_path} alt=""
                      className={`vd-thumb${activeImg === i ? ' active' : ''}`}
                      onClick={() => setActiveImg(i)} />
                  ))}
                </div>
              )}

              {vehicle.description && (
                <div className="vd-desc">
                  <h4>Description</h4>
                  <p>{vehicle.description}</p>
                </div>
              )}
            </div>

            {/* RIGHT: details */}
            <div className="vd-right">
              <h2 className="vd-name">{vehicle.name}</h2>

              {/* Fuel · Seats · Transmission */}
              <div className="vd-specs-row">
                <span className="vd-spec"><FuelIcon /> {vehicle.fuel_type}</span>
                <span className="vd-spec"><SeatsIcon /> {vehicle.seats} seats</span>
                <span className="vd-spec"><GearIcon /> {vehicle.transmission || 'Manual'}</span>
              </div>

              {/* Availability */}
              <div className={`vd-availability ${vehicle.available ? 'available' : 'unavailable'}`}>
                <span className="vd-dot" />
                {vehicle.available ? 'Available' : 'Not Available'}
              </div>

              {/* Price */}
              <div className="vd-price-section">
                <span className="vd-price-label">Price (per day)</span>
                <div className="vd-price">
                  NPR {Number(vehicle.price_per_day).toLocaleString()}
                  <span className="vd-price-unit"> /day</span>
                </div>
              </div>

              {/* Two-column detail grid */}
              <div className="vd-detail-cols">
                <div className="vd-detail-col">
                  {vehicle.pickup_location && (
                    <div className="vd-detail-item">
                      <span className="vd-detail-label">Pick-up Location</span>
                      <span className="vd-detail-val"><PinIcon /> {vehicle.pickup_location}</span>
                    </div>
                  )}
                  <div className="vd-detail-item">
                    <span className="vd-detail-label">Fuel Type</span>
                    <span className="vd-detail-val">{vehicle.fuel_type}</span>
                  </div>
                  {vehicle.mileage && (
                    <div className="vd-detail-item">
                      <span className="vd-detail-label">Mileage</span>
                      <span className="vd-detail-val">{vehicle.mileage}</span>
                    </div>
                  )}
                  {vehicle.year && (
                    <div className="vd-detail-item">
                      <span className="vd-detail-label">Year</span>
                      <span className="vd-detail-val">{vehicle.year}</span>
                    </div>
                  )}
                  {vehicle.doors && (
                    <div className="vd-detail-item">
                      <span className="vd-detail-label">Doors</span>
                      <span className="vd-detail-val">{vehicle.doors}</span>
                    </div>
                  )}
                  {vehicle.luggage_capacity && (
                    <div className="vd-detail-item">
                      <span className="vd-detail-label">Luggage Capacity</span>
                      <span className="vd-detail-val">{vehicle.luggage_capacity}</span>
                    </div>
                  )}
                </div>

                {vehicle.features?.length > 0 && (
                  <div className="vd-features">
                    <div className="vd-features-title">Features:</div>
                    <p className="vd-features-text">
                      Equipped with {vehicle.features.join(', ')}.
                    </p>
                  </div>
                )}
              </div>

              <button className="vd-book-btn" disabled={!vehicle.available} onClick={handleBookNow}>
                Book Now →
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
