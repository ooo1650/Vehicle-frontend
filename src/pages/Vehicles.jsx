import { useEffect, useState } from 'react';
import VehicleCard from '../component/VehicleCard';
import VehicleDetail from '../component/VehicleDetail';
import Footer from '../component/Footer';
import './Vehicles.css';
import { apiFetch } from '../utils/api';

const TYPES = ['All', 'Car', 'SUV', 'Van', 'Motorcycle', 'Truck'];
const MAX_PRICE = 50000;

export default function Vehicles() {
  const [vehicles, setVehicles]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [activeType, setActiveType] = useState('All');
  const [search, setSearch]       = useState('');
  const [maxPrice, setMaxPrice]   = useState(MAX_PRICE);
  const [sortBy, setSortBy]       = useState('price_asc');
  const [selectedId, setSelectedId] = useState(null); // overlay

  useEffect(() => {
    apiFetch('/api/vehicles/get_vehicles.php')
      .then((data) => {
        if (data.success) setVehicles(data.vehicles);
        else setError('Failed to load vehicles.');
      })
      .catch(() => setError('Cannot connect to server.'))
      .finally(() => setLoading(false));
  }, []);

  // Apply filters
  let filtered = vehicles
    .filter((v) => activeType === 'All' || v.type === activeType)
    .filter((v) => v.name.toLowerCase().includes(search.toLowerCase()))
    .filter((v) => Number(v.price_per_day) <= maxPrice);

  // Apply sort
  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'price_asc')  return a.price_per_day - b.price_per_day;
    if (sortBy === 'price_desc') return b.price_per_day - a.price_per_day;
    return a.name.localeCompare(b.name);
  });

  function clearFilters() {
    setActiveType('All');
    setSearch('');
    setMaxPrice(MAX_PRICE);
    setSortBy('price_asc');
  }

  if (loading) return <div className="vehicles-state">Loading vehicles...</div>;
  if (error)   return <div className="vehicles-state vehicles-error">{error}</div>;

  return (
    <div className="vehicles-page">
      <div className="vehicles-content">

      {/* Top bar */}
      <div className="vehicles-topbar">
        <div>
          <h2>Browse Vehicles</h2>
          <p>{filtered.length} vehicle{filtered.length !== 1 ? 's' : ''} available</p>
        </div>
        <select
          className="sort-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="name">Name: A–Z</option>
        </select>
      </div>

      {/* Search */}
      <div className="search-wrap">
        <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          className="search-input"
          type="text"
          placeholder="Search vehicles by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="vehicles-body">

        {/* Sidebar filters */}
        <aside className="filters-sidebar">
          <h4>Filters</h4>

          <div className="filter-group">
            <label>Vehicle Type</label>
            {TYPES.map((t) => (
              <button
                key={t}
                className={`filter-type-btn${activeType === t ? ' active' : ''}`}
                onClick={() => setActiveType(t)}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="filter-group">
            <label>Price Range (NPR)</label>
            <input
              type="range"
              min="0"
              max={MAX_PRICE}
              step="500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="price-range"
            />
            <div className="price-range-labels">
              <span>NPR 0</span>
              <span>NPR {maxPrice.toLocaleString()}</span>
            </div>
          </div>

          <button className="btn-clear" onClick={clearFilters}>
            Clear All Filters
          </button>
        </aside>

        {/* Grid */}
        <div className="vehicles-grid">
          {filtered.length === 0 ? (
            <p className="no-results">No vehicles match your filters.</p>
          ) : (
            filtered.map((v) => <VehicleCard key={v.id} vehicle={v} onOpen={setSelectedId} />)
          )}
        </div>

      </div>
      </div>
      <Footer />
      {selectedId && <VehicleDetail vehicleId={selectedId} onClose={() => setSelectedId(null)} />}
    </div>
  );
}
