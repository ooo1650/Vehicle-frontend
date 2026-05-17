import { useState, useEffect } from 'react';
import { adminFetch } from '../../context/AuthContext';

const STATUSES = ['All', 'pending', 'pending_review', 'confirmed', 'completed', 'cancelled'];

const STATUS_META = {
  pending:        { bg:'#fffbeb', color:'#b45309', label:'Pending' },
  pending_review: { bg:'#fff7ed', color:'#c2410c', label:'Returned' },
  confirmed:      { bg:'#f0fdf4', color:'#15803d', label:'Confirmed' },
  completed:      { bg:'#f1f5f9', color:'#475569', label:'Completed' },
  cancelled:      { bg:'#fef2f2', color:'#b91c1c', label:'Cancelled' },
};

export default function AdminBookings() {
  const [bookings, setBookings]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('All');
  const [expanded, setExpanded]   = useState(null); // booking id with open panel
  const [noteText, setNoteText]   = useState({});   // { [id]: string }
  const [saving, setSaving]       = useState(null);

  function load() {
    setLoading(true);
    const url = filter === 'All'
      ? '/api/admin/bookings.php'
      : `/api/admin/bookings.php?status=${filter}`;

    adminFetch(url)
      .then(r => r.json())
      .then(d => { if (d.success) setBookings(d.data); })
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, [filter]);

  async function updateStatus(id, status, note) {
    setSaving(id);
    await adminFetch('/api/admin/bookings.php', {
      method: 'PUT',
      body: { id, status, admin_note: note || '' },
    });
    setSaving(null);
    setExpanded(null);
    load();
  }

  async function handleDelete(id) {
    if (!confirm('Delete this booking permanently?')) return;
    await adminFetch(`/api/admin/bookings.php?id=${id}`, { method: 'DELETE' });
    load();
  }

  function fmt(d) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
  }

  // Count pending for badge
  const pendingCount = bookings.filter(b => b.status === 'pending').length;

  return (
    <div style={{ padding:'28px', background:'#f8fafc', minHeight:'100vh' }}>
      <div style={{ marginBottom:'24px' }}>
        <h2 style={{ margin:'0 0 4px', fontSize:'22px', fontWeight:700, color:'#1e293b' }}>
          Manage Bookings
          {pendingCount > 0 && filter === 'All' && (
            <span style={{ marginLeft:'10px', background:'#ef4444', color:'#fff', borderRadius:'12px', padding:'2px 10px', fontSize:'13px', fontWeight:600, verticalAlign:'middle' }}>
              {pendingCount} pending
            </span>
          )}
        </h2>
        <p style={{ margin:0, fontSize:'14px', color:'#64748b' }}>
          Review booking requests, confirm availability, or return with a note.
        </p>
      </div>

      {/* Filter pills */}
      <div style={{ display:'flex', gap:'8px', marginBottom:'20px', flexWrap:'wrap' }}>
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{
            padding:'7px 16px', borderRadius:'20px', border:'1px solid',
            borderColor: filter === s ? '#2563eb' : '#e2e8f0',
            background: filter === s ? '#2563eb' : '#fff',
            color: filter === s ? '#fff' : '#64748b',
            fontSize:'13px', fontWeight:500, cursor:'pointer', textTransform:'capitalize',
          }}>
            {s === 'pending_review' ? 'Returned' : s}
          </button>
        ))}
      </div>

      {/* Cards */}
      {loading ? (
        <div style={{ textAlign:'center', padding:'48px', color:'#64748b' }}>Loading…</div>
      ) : bookings.length === 0 ? (
        <div style={{ textAlign:'center', padding:'48px', color:'#64748b' }}>No bookings found.</div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
          {bookings.map(b => {
            const meta = STATUS_META[b.status] || STATUS_META.pending;
            const isOpen = expanded === b.id;
            const note = noteText[b.id] ?? (b.admin_note || '');

            return (
              <div key={b.id} style={{
                background:'#fff', border:'1px solid #e2e8f0', borderRadius:'12px', overflow:'hidden',
                boxShadow: b.status === 'pending' ? '0 0 0 2px #fde68a' : 'none',
              }}>
                {/* Card header row */}
                <div style={{ display:'flex', alignItems:'center', gap:'16px', padding:'16px 20px', flexWrap:'wrap' }}>
                  {/* Vehicle image */}
                  {b.vehicle_image && (
                    <img
                      src={b.vehicle_image}
                      alt={b.vehicle_name}
                      style={{ width:80, height:56, objectFit:'cover', borderRadius:'8px', flexShrink:0 }}
                    />
                  )}

                  {/* Main info */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'10px', flexWrap:'wrap', marginBottom:'4px' }}>
                      <span style={{ fontWeight:700, fontSize:'15px', color:'#1e293b' }}>#{b.id} — {b.vehicle_name}</span>
                      <span style={{
                        padding:'3px 10px', borderRadius:'20px', fontSize:'12px', fontWeight:600,
                        background: meta.bg, color: meta.color,
                      }}>
                        {meta.label}
                      </span>
                      {/* Payment status badge */}
                      {b.payment_method === 'esewa' && (
                        <span style={{
                          padding:'3px 10px', borderRadius:'20px', fontSize:'12px', fontWeight:600,
                          background: b.payment_status === 'completed' ? '#f0fdf4' : '#fef9c3',
                          color:      b.payment_status === 'completed' ? '#15803d'  : '#854d0e',
                          border:     `1px solid ${b.payment_status === 'completed' ? '#bbf7d0' : '#fde68a'}`,
                        }}>
                          {b.payment_status === 'completed' ? '✓ Paid' : '⏳ Unpaid'}
                        </span>
                      )}
                    </div>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:'8px 20px', fontSize:'13px', color:'#64748b' }}>
                      <span>{b.given_name} {b.family_name}</span>
                      <span>{b.user_email}</span>
                      {b.contact_phone && <span>{b.contact_phone}</span>}
                      <span>{fmt(b.start_date)} — {fmt(b.end_date)}</span>
                      <span>{b.pickup_location || '—'}{b.dropoff_location ? ` → ${b.dropoff_location}` : ''}</span>
                      <span style={{ fontWeight:600, color:'#1e293b' }}>NPR {Number(b.total_price).toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display:'flex', gap:'8px', flexShrink:0, flexWrap:'wrap' }}>
                    {b.status === 'pending' || b.status === 'pending_review' ? (
                      <>
                        <button
                          onClick={() => updateStatus(b.id, 'confirmed', '')}
                          disabled={saving === b.id}
                          style={{
                            padding:'8px 16px', background:'#16a34a', color:'#fff', border:'none',
                            borderRadius:'8px', fontSize:'13px', fontWeight:600, cursor:'pointer',
                          }}
                        >
                          {saving === b.id ? '…' : 'Confirm'}
                        </button>
                        <button
                          onClick={() => setExpanded(isOpen ? null : b.id)}
                          style={{
                            padding:'8px 16px', background: isOpen ? '#fff7ed' : '#fff',
                            color:'#c2410c', border:'1px solid #fed7aa',
                            borderRadius:'8px', fontSize:'13px', fontWeight:600, cursor:'pointer',
                          }}
                        >
                          Return
                        </button>
                      </>
                    ) : (
                      <select
                        value={b.status}
                        onChange={e => updateStatus(b.id, e.target.value, b.admin_note || '')}
                        style={{
                          padding:'7px 10px', borderRadius:'8px', border:'1px solid #e2e8f0',
                          fontSize:'13px', fontWeight:600, background: meta.bg, color: meta.color, cursor:'pointer',
                        }}
                      >
                        {['pending','pending_review','confirmed','completed','cancelled'].map(st => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    )}
                    <button
                      onClick={() => handleDelete(b.id)}
                      style={{
                        padding:'8px 10px', background:'none', border:'1px solid #fecaca',
                        borderRadius:'8px', cursor:'pointer', color:'#b91c1c', fontSize:'13px',
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Existing admin note (if any and not editing) */}
                {b.admin_note && !isOpen && (
                  <div style={{
                    margin:'0 20px 14px', padding:'10px 14px', background:'#fff7ed',
                    border:'1px solid #fed7aa', borderRadius:'8px', fontSize:'13px', color:'#92400e',
                  }}>
                    <strong>Note sent to user:</strong> {b.admin_note}
                  </div>
                )}

                {/* Return-with-note panel */}
                {isOpen && (
                  <div style={{
                    borderTop:'1px solid #fed7aa', background:'#fff7ed', padding:'16px 20px',
                  }}>
                    <p style={{ margin:'0 0 10px', fontSize:'13px', fontWeight:600, color:'#c2410c' }}>
                      Return booking to user with a note
                    </p>
                    <textarea
                      rows={3}
                      placeholder="Explain why the booking is being returned (e.g. vehicle not available on those dates, location mismatch…)"
                      value={note}
                      onChange={e => setNoteText(prev => ({ ...prev, [b.id]: e.target.value }))}
                      style={{
                        width:'100%', padding:'10px 12px', border:'1px solid #fed7aa', borderRadius:'8px',
                        fontSize:'13px', fontFamily:'inherit', resize:'vertical', outline:'none',
                        background:'#fff', boxSizing:'border-box', color:'#1e293b',
                      }}
                    />
                    <div style={{ display:'flex', gap:'10px', marginTop:'10px' }}>
                      <button
                        disabled={!note.trim() || saving === b.id}
                        onClick={() => updateStatus(b.id, 'pending_review', note)}
                        style={{
                          padding:'8px 18px', background: note.trim() ? '#c2410c' : '#e2e8f0',
                          color: note.trim() ? '#fff' : '#94a3b8', border:'none',
                          borderRadius:'8px', fontSize:'13px', fontWeight:600,
                          cursor: note.trim() ? 'pointer' : 'not-allowed',
                        }}
                      >
                        {saving === b.id ? 'Sending…' : 'Send Note & Return'}
                      </button>
                      <button
                        onClick={() => setExpanded(null)}
                        style={{
                          padding:'8px 16px', background:'#fff', color:'#64748b',
                          border:'1px solid #e2e8f0', borderRadius:'8px', fontSize:'13px', cursor:'pointer',
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
