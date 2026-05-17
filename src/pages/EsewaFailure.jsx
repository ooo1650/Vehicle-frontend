import { useNavigate } from 'react-router-dom';
import './EsewaResult.css';

export default function EsewaFailure() {
  const navigate = useNavigate();

  return (
    <div className="esewa-result-page">
      <div className="esewa-result-card">
        <div className="esewa-icon error">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <h2>Payment Cancelled</h2>
        <p className="esewa-msg">
          Your eSewa payment was not completed. Your booking has <strong>not</strong> been confirmed.
          No amount has been charged.
        </p>
        <div className="esewa-actions">
          <button className="esewa-btn primary" onClick={() => navigate(-1)}>
            Try Again
          </button>
          <button className="esewa-btn secondary" onClick={() => navigate('/vehicles')}>
            Browse Vehicles
          </button>
        </div>
      </div>
    </div>
  );
}
