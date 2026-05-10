import { useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import '../Auth.css';

const GOOGLE_CLIENT_ID = '537729065202-f0287ficblsbjfgp9k5gkg0judpk2nkv.apps.googleusercontent.com';

// Which screen to show
// 'form'  → email + optional username input
// 'otp'   → 6-digit OTP input
const SCREEN = { FORM: 'form', OTP: 'otp' };

export default function Authentication() {
  const navigate = useNavigate();

  const [screen, setScreen]   = useState(SCREEN.FORM);
  const [tab, setTab]         = useState('login');    // 'login' | 'register'
  const [email, setEmail]     = useState('');
  const [username, setUsername] = useState('');
  const [otp, setOtp]         = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [error, setError]     = useState(null);
  const [loading, setLoading] = useState(false);

  // ── Step 1: Submit email (and username for sign up) ──
  async function handleEmailSubmit(e) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const body = { email };
      if (tab === 'register') body.username = username;

      const res  = await fetch('/api/auth/send_otp.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!data.success) { setError(data.message); return; }

      setPendingEmail(email);
      setScreen(SCREEN.OTP);
    } catch {
      setError('Cannot connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // ── Step 2: Verify OTP ──
  async function handleOtpSubmit(e) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res  = await fetch('/api/auth/verify_otp.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingEmail, otp }),
      });
      const data = await res.json();

      if (!data.success) { setError(data.message); return; }

      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch {
      setError('Cannot connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // ── Google OAuth → also goes through OTP ──
  async function handleGoogleSuccess(credentialResponse) {
    setLoading(true); setError(null);
    const googleUser = jwtDecode(credentialResponse.credential);
    try {
      const res  = await fetch('/api/auth/google_login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(googleUser),
      });
      const data = await res.json();

      if (!data.success) { setError('Google sign-in failed.'); return; }

      // Google login also requires OTP
      setPendingEmail(data.email);
      setScreen(SCREEN.OTP);
    } catch {
      setError('Cannot connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function goBack() {
    setScreen(SCREEN.FORM);
    setOtp('');
    setError(null);
    setDevOtp(null);
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="auth-page">
        <div className="auth-card auth-card--wide">

          <div className="auth-icon">
            <img src="/logo.png" alt="Mero Gadi" />
          </div>
          <h2>Welcome to Mero Gadi</h2>

          {/* ── OTP Screen ── */}
          {screen === SCREEN.OTP && (
            <>
              <p>Enter the 6-digit code sent to<br /><strong>{pendingEmail}</strong></p>

              {error && <p className="auth-error">{error}</p>}

              <form className="auth-form" onSubmit={handleOtpSubmit}>
                <input
                  className="auth-input auth-input--otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  autoFocus
                  required
                />
                <button type="submit" className="auth-btn" disabled={loading || otp.length !== 6}>
                  {loading ? 'Verifying...' : 'Verify Code'}
                </button>
              </form>

              <button className="auth-back" onClick={goBack}>← Back</button>
            </>
          )}

          {/* ── Email Form Screen ── */}
          {screen === SCREEN.FORM && (
            <>
              <div className="auth-tabs">
                <button className={`auth-tab${tab === 'login' ? ' active' : ''}`}
                  onClick={() => { setTab('login'); setError(null); }}>
                  Sign In
                </button>
                <button className={`auth-tab${tab === 'register' ? ' active' : ''}`}
                  onClick={() => { setTab('register'); setError(null); }}>
                  Sign Up
                </button>
              </div>

              {error && <p className="auth-error">{error}</p>}

              <form className="auth-form" onSubmit={handleEmailSubmit}>
                {tab === 'register' && (
                  <input
                    className="auth-input"
                    type="text"
                    placeholder="Your name"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                  />
                )}
                <input
                  className="auth-input"
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className="auth-btn" disabled={loading}>
                  {loading ? 'Sending code...' : 'Continue with Email'}
                </button>
              </form>

              <div className="auth-divider"><span>or</span></div>

              {loading ? (
                <p className="auth-loading">Signing you in...</p>
              ) : (
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google sign-in failed.')}
                  text="continue_with"
                  shape="rectangular"
                  theme="outline"
                  size="large"
                  locale="en"
                />
              )}
            </>
          )}

        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
