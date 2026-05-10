import { useEffect, useState } from 'react';
import { adminFetch } from '../../context/AuthContext';
import './AdminDashboard.css';

const STATUS_COLORS = {
  pending:   { bg: '#fffbeb', color: '#b45309' },
  confirmed: { bg: '#f0fdf4', color: '#15803d' },
  completed: { bg: '#f1f5f9', color: '#475569' },
  cancelled: { bg: '#fef2f2', color: '#b91c1c' },
  active:    { bg: '#eff6ff', color: '#1d4ed8' },
};

export default function AdminDashboard() {
  const [counts, setCounts]   = useState({ users: 0, vehicles: 0, bookings: 0 });
  const [revenue, setRevenue] = useState(0);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch('/api/admin/dashboard.php')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setCounts(data.data.counts);
          setRevenue(data.data.revenue);
          setBookings(data.data.recent_bookings);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    {
      label: 'Total Vehicles',
      value: counts.vehicles,
      color: 'blue',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8">
          <rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
        </svg>
      ),
    },
    {
      label: 'Active Bookings',
      value: counts.bookings,
      color: 'green',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="1.8">
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
      ),
    },
    {
      label: 'Total Revenue',
      value: `NPR ${Number(revenue).toLocaleString()}`,
      color: 'amber',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.8">
          <circle cx="12" cy="12" r="10"/><path d="M12 6v2m0 8v2M9 9h4.5a1.5 1.5 0 0 1 0 3H10a1.5 1.5 0 0 0 0 3H15"/>
        </svg>
      ),
    },
    {
      label: 'Total Bookings',
      value: counts.bookings,
      color: 'purple',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.8">
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back — here is an overview of your rental operations.</p>
      </div>

      <div className="summary-cards">
        {statCards.map((card) => (
          <div className="summary-card" key={card.label}>
            <div className="card-info">
              <h3>{card.label}</h3>
              <p>{loading ? '—' : card.value}</p>
            </div>
            <div className={`card-icon ${card.color}`}>{card.icon}</div>
          </div>
        ))}
      </div>

      <div className="recent-bookings">
        <div className="section-header">
          <h2>Recent Bookings</h2>
          <p>Latest vehicle rental bookings</p>
        </div>

        <table className="bookings-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Vehicle</th>
              <th>Start</th>
              <th>End</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>Loading...</td></tr>
            ) : bookings.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px', color: '#64748b' }}>No bookings yet</td></tr>
            ) : (
              bookings.map((b) => {
                const s = STATUS_COLORS[b.status] || STATUS_COLORS.pending;
                return (
                  <tr key={b.id}>
                    <td>#{b.id}</td>
                    <td>{b.user_name}</td>
                    <td>{b.vehicle_name}</td>
                    <td>{b.start_date}</td>
                    <td>{b.end_date}</td>
                    <td>
                      <span className="status-badge" style={{ background: s.bg, color: s.color }}>
                        {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
