import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VehicleCard from '../component/VehicleCard';
import VehicleDetail from '../component/VehicleDetail';
import Footer from '../component/Footer';
import './Home.css';
import { apiFetch } from '../utils/api';

const CATEGORIES = [
  { label: 'Car',        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l2-4h10l2 4h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/></svg> },
  { label: 'SUV',        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l2-4h10l2 4h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/></svg> },
  { label: 'Van',        icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="7" width="22" height="11" rx="2"/><path d="M1 12h22"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></svg> },
  { label: 'Motorcycle', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6h-5l-3 6h8l2-4"/><path d="M9 12l2-6"/></svg> },
  { label: 'Truck',      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> },
];

const WHY_ITEMS = [
  {
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    title: 'Verified Vehicles',
    desc: 'Every vehicle is inspected and insured for your safety.',
  },
  {
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    title: '24/7 Support',
    desc: 'Round the clock customer support wherever you are.',
  },
  {
    icon: <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="1.8"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    title: 'Best Rates',
    desc: 'Competitive pricing with no hidden charges in NPR.',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [featured, setFeatured]     = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    apiFetch('/api/vehicles/get_vehicles.php')
      .then((data) => { if (data.success) setFeatured(data.vehicles.slice(0, 6)); })
      .catch(() => {});
  }, []);

  return (
    <div className="home-page">

      {/* Hero */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-left">
            <span className="hero-badge">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/></svg>
              Nepal's #1 Vehicle Rental Platform
            </span>
            <h1>Your Ride,<br /><span>Your Way</span></h1>
            <p>Explore Nepal with confidence. Choose from hundreds of vehicles — from motorcycles to trucks — at the best rates.</p>
            <button className="btn-hero" onClick={() => navigate('/vehicles')}>Browse Vehicles →</button>
          </div>
          <div className="hero-right">
            <div className="hero-img-wrap">
              <img
                src="https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=700&q=80"
                alt="Vehicle"
                className="hero-img"
                onError={(e) => { e.target.src = 'https://placehold.co/700x280/2563eb/white?text=Mero+Gadi'; }}
              />
              <div className="hero-badge-card top-right">
                <span className="badge-label">Available Now</span>
                <span className="badge-value">50+ Vehicles</span>
              </div>
              <div className="hero-badge-card bottom-left">
                <span className="badge-label">Starting from</span>
                <span className="badge-value blue">NPR 2,500 / day</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category pills */}
      <section className="categories">
        <div className="categories-inner">
          {CATEGORIES.map((cat) => (
            <button key={cat.label} className="cat-pill" onClick={() => navigate('/vehicles')}>
              {cat.icon} {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Why Choose */}
      <section className="why-section">
        <h2>Why Choose Mero Gadi?</h2>
        <p className="why-sub">Trusted by thousands of travelers across Nepal</p>
        <div className="why-grid">
          {WHY_ITEMS.map((item) => (
            <div className="why-card" key={item.title}>
              <div className="why-icon">{item.icon}</div>
              <strong>{item.title}</strong>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Vehicles */}
      <section className="featured-section">
        <div className="featured-header">
          <div>
            <h2>Featured Vehicles</h2>
            <p>Popular picks from our fleet</p>
          </div>
          <button className="btn-view-all" onClick={() => navigate('/vehicles')}>View All →</button>
        </div>
        <div className="home-vehicles-grid">
          {featured.map((v) => <VehicleCard key={v.id} vehicle={v} onOpen={setSelectedId} />)}
        </div>
      </section>

      <Footer />
      {selectedId && <VehicleDetail vehicleId={selectedId} onClose={() => setSelectedId(null)} />}
    </div>
  );
}
