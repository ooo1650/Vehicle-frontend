import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Footer from '../component/Footer';
import './Booking.css';

const PAYMENT_METHODS = [
  { id: 'esewa',  label: 'eSewa',  sub: 'Digital Wallet', color: '#60bb46' },
  { id: 'khalti', label: 'Khalti', sub: 'Digital Wallet', color: '#5c2d91' },
];

export default function Booking() {
  const { state }  = useLocation();
  const navigate   = useNavigate();
  const vehicle    = state?.vehicle;

  const [pickup,   setPickup]   = useState('');
  const [dropoff,  setDropoff]  = useState('');
  const [startDate, setStart]   = useState('');
  const [endDate,   setEnd]     = useState('');
  const [phone,    setPhone]    = useState('');
  const [agreed,   setAgreed]   = useState(false);
  const [payment,  setPayment]  = useState('esewa');
  const [terms,    setTerms]    = useState([]);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [bookingId, setBookingId] = useState(null);

  useEffect(() => {
    fetch('/api/terms/terms.php')
      .then(r => r.json())
      .then(d => { if (d.success) setTerms(d.terms); })
      .catch(() => {});
  }, []);

  const days = startDate && endDate
    ? Math.max(0, Math.ceil((new Date(endDate) - new Date(startDate)) / 86400000))
    : 0;
  const total = days * Number(vehicle?.price_per_day || 0);

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const canSubmit = agreed && days > 0 && pickup.trim() && phone.trim();

  async function handleSubmit() {
    setError(null);
    if (!canSubmit) return;
    setLoading(true);
    try {
      const res  = await fetch('/api/user/bookings.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email:             user.email,
          vehicle_id:        vehicle.id,
          start_date:        startDate,
          end_date:          endDate,
          total_price:       total,
          pickup_location:   pickup,
          dropoff_location:  dropoff,
          contact_phone:     phone,
          payment_method:    payment,
        }),
      });
      const data = await res.json();
      if (!data.success) { setError(data.message); return; }
      setBookingId(data.id);
      setConfirmed(true);
    } catch {
      setError('Cannot connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (!vehicle) {
    return (
      <div className="booking-empty">
        <h2>No vehicle selected</h2>
        <button className="booking-btn-back" onClick={() => navigate('/vehicles')}>Browse Vehicles</button>
      </div>
    );
  }

  const thumb = vehicle.primary_image || vehicle.image_url
    || 'https://placehold.co/120x80/e5e7eb/9ca3af?text=No+Image';

  // ── Confirmation screen ──────────────────────────────────────────────────
  if (confirmed) {
    return (
      <div className="booking-page">
        <div className="booking-inner">
          <div className="bk-confirmed">
            <div className="bk-confirmed-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                <polyline points="22 4 12 14.01 9 11.01"/>
              </svg>
            </div>
            <h2>Booking Request Sent!</h2>
            <p className="bk-confirmed-ref">Reference #{bookingId}</p>
            <div className="bk-confirmed-info">
              <p>Your booking request for <strong>{vehicle.name}</strong> has been received.</p>
              <p>You will be notified of your booking status <strong>within 1 hour or less</strong>.</p>
            </div>
            <div className="bk-refund-notice">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              Your advance payment is <strong>100% refundable</strong> if you cancel or if the booking is not confirmed.
            </div>
            <div style={{ display:'flex', gap:'12px', marginTop:'24px' }}>
              <button className="bk-confirm-btn" onClick={() => navigate('/my-bookings')}>
                View My Bookings
              </button>
              <button className="bk-confirm-btn" style={{ background:'#f1f5f9', color:'#374151' }}
                onClick={() => navigate('/vehicles')}>
                Browse More
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Booking form ─────────────────────────────────────────────────────────
  return (
    <div className="booking-page">
      <div className="booking-inner">
        <h1 className="booking-title">Complete Your Booking</h1>

        <div className="booking-layout">
          <div className="booking-left">

            {/* Vehicle */}
            <div className="bk-card">
              <img src={thumb} alt={vehicle.name} className="bk-vehicle-img" />
              <div>
                <h2 className="bk-vehicle-name">{vehicle.name}</h2>
                <p className="bk-vehicle-meta">{vehicle.type} · {vehicle.fuel_type} · {vehicle.seats} seats</p>
                <p className="bk-vehicle-price">NPR {Number(vehicle.price_per_day).toLocaleString()} / day</p>
              </div>
            </div>

            {/* Trip Details */}
            <div className="bk-section">
              <h3 className="bk-section-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Trip Details
              </h3>
              <div className="bk-grid-2">
                <div className="bk-field">
                  <label>Pick-up Location *</label>
                  <input placeholder="e.g. Kathmandu" value={pickup} onChange={e => setPickup(e.target.value)} />
                </div>
                <div className="bk-field">
                  <label>Drop-off Location</label>
                  <input placeholder="e.g. Pokhara" value={dropoff} onChange={e => setDropoff(e.target.value)} />
                </div>
                <div className="bk-field">
                  <label>Start Date *</label>
                  <input type="date" value={startDate} onChange={e => setStart(e.target.value)}
                    min={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="bk-field">
                  <label>End Date *</label>
                  <input type="date" value={endDate} onChange={e => setEnd(e.target.value)}
                    min={startDate || new Date().toISOString().split('T')[0]} />
                </div>
              </div>
            </div>

            {/* Contact */}
            <div className="bk-section">
              <h3 className="bk-section-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 11.63 19 19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6.29 6.29l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                Contact Information
              </h3>
              <div className="bk-field">
                <label>Phone Number *</label>
                <input type="tel" placeholder="e.g. 9800000000" value={phone}
                  onChange={e => setPhone(e.target.value)} />
              </div>
              <p style={{ margin:'8px 0 0', fontSize:'12px', color:'#6b7280' }}>
                We will contact you on this number to confirm your booking within 1 hour.
              </p>
            </div>

            {/* Terms */}
            <div className="bk-section">
              <h3 className="bk-section-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                Terms &amp; Conditions
              </h3>
              <div className="bk-terms-box">
                {terms.length > 0 ? terms.map((t, i) => (
                  <div key={t.id} style={{ marginBottom: i < terms.length-1 ? '12px' : 0 }}>
                    <strong style={{ fontSize:'13px', color:'#1e293b' }}>{i+1}. {t.title}</strong>
                    <p style={{ margin:'3px 0 0', fontSize:'13px', color:'#475569', lineHeight:'1.6' }}>{t.content}</p>
                  </div>
                )) : <p style={{ margin:0, fontSize:'13px', color:'#9ca3af' }}>Loading terms...</p>}
              </div>
              <label className="bk-agree-row" onClick={() => setAgreed(!agreed)}>
                <div className={`bk-checkbox${agreed ? ' checked' : ''}`}>
                  {agreed && <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <span>I have read and accept the Terms &amp; Conditions</span>
              </label>
            </div>

            {/* Payment */}
            <div className="bk-section">
              <h3 className="bk-section-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                Payment Method
              </h3>
              {PAYMENT_METHODS.map(m => (
                <label key={m.id} className={`bk-payment-row${payment === m.id ? ' selected' : ''}`}
                  onClick={() => setPayment(m.id)}>
                  <div className={`bk-radio${payment === m.id ? ' checked' : ''}`} />
                  <div className="bk-payment-info">
                    <span className="bk-payment-name">{m.label}</span>
                    <span className="bk-payment-sub">{m.sub}</span>
                  </div>
                  <span className="bk-payment-badge" style={{ color: m.color }}>{m.label}</span>
                </label>
              ))}
              <p style={{ margin:'10px 0 0', fontSize:'12px', color:'#6b7280' }}>
                Payment will be collected at vehicle pickup. Your advance is 100% refundable if cancelled.
              </p>
            </div>

          </div>

          {/* Summary */}
          <div className="booking-summary">
            <h3 className="bk-summary-title">Booking Summary</h3>
            <div className="bk-summary-rows">
              <div className="bk-summary-row"><span>Vehicle</span><span>{vehicle.name}</span></div>
              <div className="bk-summary-row"><span>Daily Rate</span><span>NPR {Number(vehicle.price_per_day).toLocaleString()}</span></div>
              <div className="bk-summary-row"><span>Duration</span><span>{days > 0 ? `${days} day${days > 1 ? 's' : ''}` : '— days'}</span></div>
              <div className="bk-summary-row"><span>Payment</span><span>{PAYMENT_METHODS.find(m => m.id === payment)?.label}</span></div>
            </div>
            <div className="bk-summary-total">
              <span>Total</span>
              <span className="bk-total-amount">NPR {total.toLocaleString()}</span>
            </div>

            {error && <p style={{ color:'#dc2626', fontSize:'13px', margin:'0 0 10px', textAlign:'center' }}>{error}</p>}

            <button className={`bk-confirm-btn${canSubmit ? '' : ' disabled'}`}
              disabled={!canSubmit || loading} onClick={handleSubmit}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              {loading ? 'Submitting...' : 'Confirm Booking'}
            </button>

            {!agreed && <p className="bk-summary-hint">Accept Terms &amp; Conditions to proceed.</p>}
            {agreed && days === 0 && <p className="bk-summary-hint">Select start and end dates.</p>}
            {agreed && days > 0 && !phone.trim() && <p className="bk-summary-hint">Enter your contact phone number.</p>}
            {agreed && days > 0 && phone.trim() && !pickup.trim() && <p className="bk-summary-hint">Enter pick-up location.</p>}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
