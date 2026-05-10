import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();

  // Get user from localStorage (saved during Google login)
  const user = JSON.parse(localStorage.getItem('user'));

  const [stats, setStats] = useState(null);
  const [memberSince, setMemberSince] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch this user's booking stats from the backend
    fetch('/api/user/dashboard.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ google_id: user.sub }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setStats(data.stats);
          setMemberSince(data.member_since);
        }
      })
      .catch(() => {}) // stats are optional — page still works without them
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'Total Bookings',     value: stats?.total_bookings,     color: '#1d4ed8' },
    { label: 'Confirmed',          value: stats?.confirmed_bookings,  color: '#16a34a' },
    { label: 'Pending',            value: stats?.pending_bookings,    color: '#d97706' },
    { label: 'Completed',          value: stats?.completed_bookings,  color: '#7c3aed' },
  ];

  return (
    <div className="dashboard-page">

      {/* Welcome banner */}
      <div className="dashboard-welcome">
        <img
          src={user?.picture}
          alt={user?.name}
          className="welcome-avatar"
          referrerPolicy="no-referrer"
        />
        <div className="welcome-text">
          <h2>Welcome back, {user?.given_name}!</h2>
          <p>{user?.email} {memberSince && `· Member since ${memberSince}`}</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="stats-grid">
        {statCards.map((card) => (
          <div className="stat-card" key={card.label}>
            <span className="stat-value" style={{ color: card.color }}>
              {loading ? '—' : (card.value ?? 0)}
            </span>
            <span className="stat-label">{card.label}</span>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="quick-actions">
        <h3>What would you like to do?</h3>
        <div className="action-cards">
          <div className="action-card" onClick={() => navigate('/vehicles')}>
            <span className="action-icon">🚗</span>
            <div>
              <strong>Browse Vehicles</strong>
              <p>Find and book your next ride</p>
            </div>
          </div>
          <div className="action-card" onClick={() => navigate('/my-bookings')}>
            <span className="action-icon">📋</span>
            <div>
              <strong>My Bookings</strong>
              <p>View and manage your bookings</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
