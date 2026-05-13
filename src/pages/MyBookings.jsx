import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../component/Footer';
import './MyBookings.css';
import { apiFetch } from '../utils/api';

const STATUS_META = {
  pending:        { label: 'Pending Review',   bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  pending_review: { label: 'Needs Attention',  bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' },
  confirmed:      { label: 'Confirmed',        bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' },
  completed:      { label: 'Completed',        bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' },
  cancelled:      { label: 'Cancelled',        bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' },
};

const EDITABLE_STATUSES = ['pending', 'pending_review'];

function EditPanel({ booking, onSave, onCancel, saving }) {
  const [pickup,  setPickup]  = useState(booking.pickup_location  || '');
  const [dropoff, setDropoff] = useState(booking.dropoff_location || '');
  const [phone,   setPhone]   = useState(booking.contact_phone    || '');
  const [start,   setStart]   = useState(booking.start_date       || '');
  const [end,     setEnd]     = useState(booking.end_date         || '');

  const days = start && end
    ? Math.max(0, Math.ceil((new Date(end) - new Date(start)) / 86400000))
    : 0;
  const total = days * Number(booking.price_per_day || 0);

  const canSave = pickup.trim() && phone.trim() && days > 0;

  return (
    <div className="mb-edit-panel">
      <p className="mb-edit-title">Edit Booking</p>
      <div className="mb-edit-grid">
        <div className="mb-edit-field">
          <label>Pick-up Location</label>
          <input value={pickup} onChange={e => setPickup(e.target.value)} placeholder="e.g. Kathmandu" />
        </div>
        <div className="mb-edit-field">
          <label>Drop-off Location</label>
          <input value={dropoff} onChange={e => setDropoff(e.target.value)} placeholder="e.g. Pokhara" />
        </div>
        <div className="mb-edit-field">
          <label>Start Date</label>
          <input type="date" value={start} min={new Date().toISOString().split('T')[0]}
            onChange={e => setStart(e.target.value)} />
        </div>
        <div className="mb-edit-field">
          <label>End Date</label>
          <input type="date" value={end} min={start || new Date().toISOString().split('T')[0]}
            onChange={e => setEnd(e.target.value)} />
        </div>
        <div className="mb-edit-field">
          <label>Contact Phone</label>
          <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 9800000000" />
        </div>
        {days > 0 && (
          <div className="mb-edit-field mb-edit-summary">
            <label>Duration / Total</label>
            <span>{days} day{days > 1 ? 's' : ''} — NPR {(days * Number(booking.price_per_day || 0)).toLocaleString()}</span>
          </div>
        )}
      </div>
      <div className="mb-edit-actions">
        <button
          className="mb-save-btn"
          disabled={!canSave || saving}
          onClick={() => onSave({ pickup_location: pickup, dropoff_location: dropoff, contact_phone: phone, start_date: start, end_date: end, total_price: total })}
        >
          {saving ? 'Saving…' : 'Save & Resubmit'}
        </button>
        <button className="mb-edit-cancel-btn" onClick={onCancel}>Discard</button>
      </div>
      <p className="mb-edit-note">Saving will resubmit the booking for admin review.</p>
    </div>
  );
}

export default function MyBookings() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [bookings,   setBookings]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [tab,        setTab]        = useState('active');
  const [cancelling, setCancelling] = useState(null);
  const [editing,    setEditing]    = useState(null);   // booking id
  const [saving,     setSaving]     = useState(false);
  const [msgMap,     setMsgMap]     = useState({});     // { [id]: { text, ok } }

  function load() {
    if (!user?.email) return;
    setLoading(true);
    apiFetch(`/api/user/bookings.php?email=${encodeURIComponent(user.email)}`)
      .then(d => { if (d.success) setBookings(d.bookings); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  const active  = bookings.filter(b => !['completed', 'cancelled'].includes(b.status));
  const history = bookings.filter(b =>  ['completed', 'cancelled'].includes(b.status));
  const shown   = tab === 'active' ? active : history;

  async function cancelBooking(id) {
    setCancelling(id);
    try {
      const data = await apiFetch('/api/user/bookings.php', {
        method: 'PUT',
        body: { id, email: user.email, action: 'cancel' },
      });
      setMsgMap(prev => ({ ...prev, [id]: { text: data.message, ok: true } }));
      load();
    } catch {
      setMsgMap(prev => ({ ...prev, [id]: { text: 'Failed to cancel. Try again.', ok: false } }));
    } finally {
      setCancelling(null);
    }
  }

  async function saveEdit(id, fields) {
    setSaving(true);
    try {
      const data = await apiFetch('/api/user/bookings.php', {
        method: 'PUT',
        body: { id, email: user.email, action: 'edit', ...fields },
      });
      setMsgMap(prev => ({ ...prev, [id]: { text: data.message, ok: true } }));
      setEditing(null);
      load();
    } catch {
      setMsgMap(prev => ({ ...prev, [id]: { text: 'Failed to save. Try again.', ok: false } }));
    } finally {
      setSaving(false);
    }
  }

  function fmt(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function daysBetween(s, e) {
    const diff = Math.ceil((new Date(e) - new Date(s)) / 86400000);
    return diff > 0 ? `${diff} day${diff > 1 ? 's' : ''}` : '1 day';
  }

  return (
    <div className="mb-page">
      <div className="mb-inner">
        <div className="mb-header">
          <h1 className="mb-title">My Bookings</h1>
          <p className="mb-subtitle">Manage and track all your vehicle rentals.</p>
        </div>

        <div className="mb-tabs">
          <button className={`mb-tab${tab === 'active' ? ' active' : ''}`} onClick={() => setTab('active')}>
            Active {active.length > 0 && <span className="mb-tab-count">{active.length}</span>}
          </button>
          <button className={`mb-tab${tab === 'history' ? ' active' : ''}`} onClick={() => setTab('history')}>
            History {history.length > 0 && <span className="mb-tab-count">{history.length}</span>}
          </button>
        </div>

        {loading ? (
          <div className="mb-empty">
            <div className="mb-spinner" />
            <p>Loading your bookings…</p>
          </div>
        ) : shown.length === 0 ? (
          <div className="mb-empty">
            <div className="mb-empty-icon">—</div>
            <h3>{tab === 'active' ? 'No active bookings' : 'No booking history'}</h3>
            {tab === 'active' && (
              <button className="mb-browse-btn" onClick={() => navigate('/vehicles')}>Browse Vehicles</button>
            )}
          </div>
        ) : (
          <div className="mb-list">
            {shown.map(b => {
              const meta    = STATUS_META[b.status] || STATUS_META.pending;
              const img     = b.vehicle_image || 'https://placehold.co/110x76/e5e7eb/9ca3af?text=No+Image';
              const canEdit = EDITABLE_STATUSES.includes(b.status);
              const isEditing = editing === b.id;

              return (
                <div key={b.id} className="mb-card">

                  {/* Admin returned note */}
                  {b.status === 'pending_review' && b.admin_note && (
                    <div className="mb-admin-note">
                      <div className="mb-admin-note-header">
                        <strong>Admin returned your request</strong>
                      </div>
                      <p>{b.admin_note}</p>
                      <span className="mb-admin-note-hint">
                        Update your booking details below and resubmit, or wait for re-review.
                      </span>
                    </div>
                  )}

                  {/* Pending assurance */}
                  {b.status === 'pending' && (
                    <div className="mb-pending-notice">
                      <span>
                        Under review — you will be notified{' '}
                        <strong>within 1 hour</strong>.
                        Your advance is <strong>100% refundable</strong> if not confirmed.
                      </span>
                    </div>
                  )}

                  <div className="mb-card-body">
                    <img src={img} alt={b.vehicle_name} className="mb-vehicle-img" />

                    <div className="mb-card-info">
                      <div className="mb-card-top">
                        <div>
                          <h3 className="mb-vehicle-name">{b.vehicle_name}</h3>
                          <p className="mb-route">
                            {b.pickup_location || '—'}
                            {b.dropoff_location ? ` → ${b.dropoff_location}` : ''}
                          </p>
                        </div>
                        <span
                          className="mb-status-badge"
                          style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}
                        >
                          {meta.label}
                        </span>
                      </div>

                      <div className="mb-card-meta">
                        <span>{fmt(b.start_date)} — {fmt(b.end_date)}</span>
                        <span>{daysBetween(b.start_date, b.end_date)}</span>
                        {b.contact_phone && <span>{b.contact_phone}</span>}
                        <span className="mb-ref">Ref #{b.id}</span>
                      </div>

                      <div className="mb-card-footer">
                        <span className="mb-price">NPR {Number(b.total_price).toLocaleString()}</span>

                        {!['completed', 'cancelled'].includes(b.status) && (
                          <div className="mb-action-row">
                            {canEdit && (
                              <button
                                className="mb-edit-btn"
                                onClick={() => setEditing(isEditing ? null : b.id)}
                              >
                                {isEditing ? 'Close' : 'Edit'}
                              </button>
                            )}
                            <button
                              className="mb-cancel-btn"
                              disabled={cancelling === b.id}
                              onClick={() => {
                                if (window.confirm('Cancel this booking? Your advance will be 100% refunded.'))
                                  cancelBooking(b.id);
                              }}
                            >
                              {cancelling === b.id ? 'Cancelling…' : 'Cancel'}
                            </button>
                          </div>
                        )}
                      </div>

                      {msgMap[b.id] && (
                        <p style={{ fontSize: '12px', margin: '6px 0 0', color: msgMap[b.id].ok ? '#16a34a' : '#dc2626' }}>
                          {msgMap[b.id].text}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Inline edit panel */}
                  {isEditing && (
                    <EditPanel
                      booking={b}
                      saving={saving}
                      onSave={fields => saveEdit(b.id, fields)}
                      onCancel={() => setEditing(null)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
