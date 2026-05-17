import { useState, useEffect, useRef } from 'react';
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

// ── Receipt modal ─────────────────────────────────────────────────────────
function ReceiptModal({ booking, onClose }) {
  const printRef = useRef();

  function handlePrint() {
    const content = printRef.current.innerHTML;
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Receipt #${booking.id}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 32px; color: #1e293b; max-width: 600px; margin: 0 auto; }
        h2 { color: #2563eb; margin: 0 0 4px; }
        .sub { color: #64748b; font-size: 13px; margin: 0 0 24px; }
        table { width: 100%; border-collapse: collapse; margin: 16px 0; }
        td { padding: 8px 0; font-size: 14px; border-bottom: 1px solid #f1f5f9; }
        td:last-child { text-align: right; font-weight: 600; }
        .total td { font-size: 16px; font-weight: 700; border-bottom: none; padding-top: 12px; }
        .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .paid { background: #f0fdf4; color: #15803d; }
        .footer { margin-top: 32px; font-size: 12px; color: #94a3b8; text-align: center; }
      </style></head><body>${content}</body></html>
    `);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  }

  const days = Math.max(1, Math.ceil(
    (new Date(booking.end_date) - new Date(booking.start_date)) / 86400000
  ));

  function fmt(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  return (
    <div className="mb-modal-overlay" onClick={onClose}>
      <div className="mb-modal" onClick={e => e.stopPropagation()}>
        <div className="mb-modal-header">
          <h3>Payment Receipt</h3>
          <button className="mb-modal-close" onClick={onClose}>✕</button>
        </div>

        <div ref={printRef}>
          <h2 style={{ color: '#2563eb', margin: '0 0 4px' }}>Mero Gadi</h2>
          <p className="sub" style={{ color: '#64748b', fontSize: '13px', margin: '0 0 20px' }}>
            Booking Receipt · Ref #{booking.id}
          </p>

          <table>
            <tbody>
              <tr><td>Vehicle</td><td>{booking.vehicle_name}</td></tr>
              <tr><td>Type</td><td>{booking.vehicle_type} · {booking.fuel_type}</td></tr>
              <tr><td>Pick-up</td><td>{booking.pickup_location || '—'}</td></tr>
              {booking.dropoff_location && <tr><td>Drop-off</td><td>{booking.dropoff_location}</td></tr>}
              <tr><td>Start Date</td><td>{fmt(booking.start_date)}</td></tr>
              <tr><td>End Date</td><td>{fmt(booking.end_date)}</td></tr>
              <tr><td>Duration</td><td>{days} day{days > 1 ? 's' : ''}</td></tr>
              <tr><td>Daily Rate</td><td>NPR {Number(booking.price_per_day).toLocaleString()}</td></tr>
              <tr><td>Contact</td><td>{booking.contact_phone || '—'}</td></tr>
              <tr><td>Payment Method</td><td style={{ textTransform: 'capitalize' }}>{booking.payment_method}</td></tr>
              <tr><td>Payment Status</td>
                <td>
                  <span className={`badge ${booking.payment_status === 'completed' ? 'paid' : ''}`}
                    style={{ background: booking.payment_status === 'completed' ? '#f0fdf4' : '#fef9c3',
                             color: booking.payment_status === 'completed' ? '#15803d' : '#854d0e' }}>
                    {booking.payment_status === 'completed' ? '✓ Paid' : 'Unpaid'}
                  </span>
                </td>
              </tr>
              {booking.esewa_transaction_id && (
                <tr><td>eSewa Ref</td><td style={{ fontSize: '12px' }}>{booking.esewa_transaction_id}</td></tr>
              )}
              {booking.paid_at && (
                <tr><td>Paid On</td><td>{fmt(booking.paid_at)}</td></tr>
              )}
            </tbody>
            <tfoot>
              <tr className="total">
                <td>Total Amount</td>
                <td style={{ color: '#2563eb' }}>NPR {Number(booking.total_price).toLocaleString()}</td>
              </tr>
            </tfoot>
          </table>

          <p className="footer" style={{ marginTop: '24px', fontSize: '12px', color: '#94a3b8', textAlign: 'center' }}>
            Thank you for choosing Mero Gadi · This is a computer-generated receipt
          </p>
        </div>

        <div className="mb-modal-actions">
          <button className="mb-receipt-print-btn" onClick={handlePrint}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
              <rect x="6" y="14" width="12" height="8"/>
            </svg>
            Print / Save PDF
          </button>
          <button className="mb-modal-close-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ── Edit panel ────────────────────────────────────────────────────────────
function EditPanel({ booking, onSave, onCancel, saving }) {
  const [pickup,  setPickup]  = useState(booking.pickup_location  || '');
  const [dropoff, setDropoff] = useState(booking.dropoff_location || '');
  const [phone,   setPhone]   = useState(booking.contact_phone    || '');
  const [start,   setStart]   = useState(booking.start_date       || '');
  const [end,     setEnd]     = useState(booking.end_date         || '');

  const days = start && end
    ? Math.max(0, Math.ceil((new Date(end) - new Date(start)) / 86400000))
    : 0;
  const newTotal   = days * Number(booking.price_per_day || 0);
  const paidAmount = Number(booking.paid_amount || 0);
  const extraDue   = Math.max(0, newTotal - paidAmount);

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
            <label>Duration / New Total</label>
            <span>{days} day{days > 1 ? 's' : ''} — NPR {newTotal.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Extra payment notice */}
      {days > 0 && paidAmount > 0 && extraDue > 0 && (
        <div className="mb-edit-topup-notice">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>
            You have already paid <strong>NPR {paidAmount.toLocaleString()}</strong>.
            Saving this edit will require an additional payment of{' '}
            <strong>NPR {extraDue.toLocaleString()}</strong> via eSewa.
          </span>
        </div>
      )}

      <div className="mb-edit-actions">
        <button
          className="mb-save-btn"
          disabled={!canSave || saving}
          onClick={() => onSave({
            pickup_location: pickup, dropoff_location: dropoff,
            contact_phone: phone, start_date: start, end_date: end, total_price: newTotal,
          })}
        >
          {saving ? 'Saving…' : (extraDue > 0 ? 'Save & Pay Extra' : 'Save & Resubmit')}
        </button>
        <button className="mb-edit-cancel-btn" onClick={onCancel}>Discard</button>
      </div>
      <p className="mb-edit-note">Saving will resubmit the booking for admin review.</p>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────
export default function MyBookings() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [bookings,   setBookings]   = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [tab,        setTab]        = useState('active');
  const [cancelling, setCancelling] = useState(null);
  const [editing,    setEditing]    = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [paying,     setPaying]     = useState(null);
  const [msgMap,     setMsgMap]     = useState({});
  const [receipt,    setReceipt]    = useState(null); // booking for receipt modal

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

  // Initiate eSewa payment for unpaid / top-up
  async function handlePayNow(bookingId) {
    setPaying(bookingId);
    try {
      const data = await apiFetch('/api/payment/esewa_topup.php', {
        method: 'POST',
        body: { email: user.email, booking_id: bookingId },
      });

      if (!data.success) {
        setMsgMap(prev => ({ ...prev, [bookingId]: { text: data.message, ok: false } }));
        return;
      }

      sessionStorage.setItem('esewa_booking_id', bookingId);

      const form = document.createElement('form');
      form.method = 'POST';
      form.action = data.gateway_url;
      form.style.display = 'none';

      Object.entries(data.params).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (e) {
      setMsgMap(prev => ({ ...prev, [bookingId]: { text: e.message || 'Payment failed. Try again.', ok: false } }));
      setPaying(null);
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
              const meta      = STATUS_META[b.status] || STATUS_META.pending;
              const img       = b.vehicle_image || 'https://placehold.co/110x76/e5e7eb/9ca3af?text=No+Image';
              const canEdit   = EDITABLE_STATUSES.includes(b.status);
              const isEditing = editing === b.id;
              const isPaid    = b.payment_status === 'completed';
              const isEsewa   = b.payment_method === 'esewa';
              // Show Pay Now if eSewa booking and not yet paid
              const needsPay  = isEsewa && !isPaid && !['cancelled'].includes(b.status);
              // Show receipt if paid
              const canReceipt = isPaid;

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

                  {/* Unpaid warning */}
                  {needsPay && (
                    <div className="mb-unpaid-notice">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      <span>Payment pending — complete your eSewa payment to confirm this booking.</span>
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
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                          <span
                            className="mb-status-badge"
                            style={{ background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}
                          >
                            {meta.label}
                          </span>
                          {/* Payment badge */}
                          {isEsewa && (
                            <span className={`mb-payment-badge ${isPaid ? 'paid' : 'unpaid'}`}>
                              {isPaid ? '✓ Paid' : '⏳ Unpaid'}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mb-card-meta">
                        <span>{fmt(b.start_date)} — {fmt(b.end_date)}</span>
                        <span>{daysBetween(b.start_date, b.end_date)}</span>
                        {b.contact_phone && <span>{b.contact_phone}</span>}
                        <span className="mb-ref">Ref #{b.id}</span>
                      </div>

                      <div className="mb-card-footer">
                        <span className="mb-price">NPR {Number(b.total_price).toLocaleString()}</span>

                        <div className="mb-action-row">
                          {/* Pay Now button */}
                          {needsPay && (
                            <button
                              className="mb-pay-btn"
                              disabled={paying === b.id}
                              onClick={() => handlePayNow(b.id)}
                            >
                              {paying === b.id ? 'Redirecting…' : 'Pay with eSewa'}
                            </button>
                          )}

                          {/* Receipt button */}
                          {canReceipt && (
                            <button
                              className="mb-receipt-btn"
                              onClick={() => setReceipt(b)}
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                              </svg>
                              Receipt
                            </button>
                          )}

                          {!['completed', 'cancelled'].includes(b.status) && (
                            <>
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
                            </>
                          )}
                        </div>
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

      {/* Receipt modal */}
      {receipt && <ReceiptModal booking={receipt} onClose={() => setReceipt(null)} />}
    </div>
  );
}
