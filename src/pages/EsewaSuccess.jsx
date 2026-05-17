import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import './EsewaResult.css';

export default function EsewaSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status,    setStatus]    = useState('verifying'); // verifying | success | error
  const [bookingId, setBookingId] = useState(null);
  const [message,   setMessage]   = useState('');

  useEffect(() => {
    const data = searchParams.get('data');
    if (!data) {
      setStatus('error');
      setMessage('No payment data received from eSewa.');
      return;
    }

    apiFetch('/api/payment/esewa_verify.php', {
      method: 'POST',
      body: { data },
    })
      .then(res => {
        if (res.success) {
          setBookingId(res.booking_id);
          setStatus('success');
          sessionStorage.removeItem('esewa_booking_id');
        } else {
          setStatus('error');
          setMessage(res.message || 'Payment verification failed.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Could not verify payment. Please contact support.');
      });
  }, []);

  if (status === 'verifying') {
    return (
      <div className="esewa-result-page">
        <div className="esewa-result-card">
          <div className="esewa-spinner" />
          <h2>Verifying your payment…</h2>
          <p>Please wait, do not close this page.</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="esewa-result-page">
        <div className="esewa-result-card">
          <div className="esewa-icon success">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <h2>Payment Successful!</h2>
          {bookingId && <p className="esewa-ref">Booking Reference #{bookingId}</p>}
          <p className="esewa-msg">
            Your eSewa payment was verified. Your booking is now <strong>under review</strong> — 
            you will be notified within 1 hour once confirmed.
          </p>
          <div className="esewa-actions">
            <button className="esewa-btn primary" onClick={() => navigate('/my-bookings')}>
              View My Bookings
            </button>
            <button className="esewa-btn secondary" onClick={() => navigate('/vehicles')}>
              Browse More
            </button>
          </div>
        </div>
      </div>
    );
  }

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
        <h2>Verification Failed</h2>
        <p className="esewa-msg">{message}</p>
        <div className="esewa-actions">
          <button className="esewa-btn primary" onClick={() => navigate('/my-bookings')}>
            My Bookings
          </button>
          <button className="esewa-btn secondary" onClick={() => navigate('/vehicles')}>
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}
