import { useNavigate } from 'react-router-dom';

// SVG icons — no emojis
function FuelIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 22V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/>
      <path d="M3 22h12"/>
      <path d="M15 8h2a2 2 0 0 1 2 2v3a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V9.5L19 6"/>
    </svg>
  );
}

function SeatsIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}

export default function VehicleCard({ vehicle, onOpen }) {
  const navigate = useNavigate();
  const { id, name, type, fuel_type, seats, price_per_day, primary_image } = vehicle;

  const thumb = primary_image || 'https://placehold.co/600x300/e5e7eb/9ca3af?text=No+Image';

  function handleBookNow(e) {
    e.stopPropagation();
    navigate('/booking', { state: { vehicle } });
  }

  return (
    <div className="vehicle-card" onClick={() => onOpen(id)}>
      <div className="card-image-wrap">
        <img src={thumb} alt={name} className="card-image" />
        <span className="card-badge">{type}</span>
      </div>
      <div className="card-body">
        <h3 className="card-name">{name}</h3>
        <div className="card-meta">
          <span className="meta-item"><FuelIcon /> {fuel_type}</span>
          <span className="meta-item"><SeatsIcon /> {seats} seats</span>
        </div>
        <div className="card-footer">
          <div className="card-price">
            <span className="price-amount">NPR {Number(price_per_day).toLocaleString()}</span>
            <span className="price-unit"> /day</span>
          </div>
          <button className="btn-book" onClick={handleBookNow}>
            Book Now →
          </button>
        </div>
      </div>
    </div>
  );
}
