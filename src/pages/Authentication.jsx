import { useState, useRef } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import '../Auth.css';
import { apiFetch } from '../utils/api';

const GOOGLE_CLIENT_ID = '537729065202-f0287ficblsbjfgp9k5gkg0judpk2nkv.apps.googleusercontent.com';

// Screen names
const S = {
  SIGNIN:         'signin',
  SIGNUP:         'signup',
  OTP:            'otp',
  SET_PASSWORD:   'set_password',
  FORGOT:         'forgot',
  RESET_PASSWORD: 'reset_password',
};

function pwStrength(pw) {
  if (!pw) return null;
  let s = 0;
  if (pw.length >= 8)            s++;
  if (/[A-Z]/.test(pw))         s++;
  if (/[0-9]/.test(pw))         s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const map = [
    null,
    { label: 'Weak',   color: '#dc2626', w: '25%' },
    { label: 'Fair',   color: '#d97706', w: '50%' },
    { label: 'Good',   color: '#2563eb', w: '75%' },
    { label: 'Strong', color: '#16a34a', w: '100%' },
  ];
  return map[s];
}

function validatePw(pw, cf) {
  if (!pw)              return 'Password is required';
  if (pw.length < 8)   return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(pw)) return 'Password must contain at least one uppercase letter';
  if (!/[0-9]/.test(pw)) return 'Password must contain at least one number';
  if (pw !== cf)        return 'Passwords do not match';
  return null;
}

function StrengthBar({ pw }) {
  const s = pwStrength(pw);
  if (!s) return null;
  return (
    <div className="pw-strength">
      <div className="pw-bar"><div style={{ width: s.w, background: s.color }} /></div>
      <span style={{ color: s.color }}>{s.label}</span>
    </div>
  );
}

export default function Authentication() {
  const navigate  = useNavigate();
  const fileRef   = useRef(null);

  const [screen, setScreen] = useState(S.SIGNIN);
  const [error,  setError]  = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  // Sign-in fields
  const [siEmail, setSiEmail]   = useState('');
  const [siPw,    setSiPw]      = useState('');

  // Sign-up fields
  const [suFirst,   setSuFirst]   = useState('');
  const [suLast,    setSuLast]    = useState('');
  const [suDob,     setSuDob]     = useState('');
  const [suEmail,   setSuEmail]   = useState('');
  const [suPicFile, setSuPicFile] = useState(null);   // File object
  const [suPicPrev, setSuPicPrev] = useState(null);   // preview URL
  const [suGoogleId, setSuGoogleId] = useState('');   // set when coming from Google

  // OTP
  const [otp,          setOtp]          = useState('');
  const [pendingEmail, setPendingEmail] = useState('');
  const [otpMode,      setOtpMode]      = useState('signin'); // 'signin' | 'signup' | 'forgot'

  // Set-password / Reset-password
  const [pw1, setPw1] = useState('');
  const [pw2, setPw2] = useState('');

  // Forgot password
  const [fpEmail, setFpEmail] = useState('');

  function err(msg) { setError(msg); setSuccessMsg(null); setLoading(false); }
  function clearErr() { setError(null); setSuccessMsg(null); }

  // ── Helpers ──────────────────────────────────────────────────────────────

  function handlePicChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setSuPicFile(file);
    setSuPicPrev(URL.createObjectURL(file));
  }

  function calcAge(dob) {
    const b = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - b.getFullYear();
    const m = today.getMonth() - b.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < b.getDate())) age--;
    return age;
  }

  // ── Sign In — direct login, no OTP ──────────────────────────────────────

  async function handleSignIn(e) {
    e.preventDefault(); clearErr();
    if (!siEmail.trim()) return err('Email is required');
    if (!siPw.trim())    return err('Password is required');

    setLoading(true);
    try {
      const data = await apiFetch('/api/auth/signin.php', {
        method: 'POST',
        body: { email: siEmail.trim(), password: siPw },
      });
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (e) { err(e.message); }
    finally     { setLoading(false); }
  }

  // ── Sign Up ───────────────────────────────────────────────────────────────

  async function handleSignUp(e) {
    e.preventDefault(); clearErr();

    if (!suFirst.trim()) return err('First name is required');
    if (!suEmail.trim()) return err('Email is required');
    if (!suDob)          return err('Date of birth is required');
    if (calcAge(suDob) < 18) return err('You must be at least 18 years old to register');

    setLoading(true);
    try {
      let body;
      if (suPicFile) {
        const fd = new FormData();
        fd.append('given_name',  suFirst.trim());
        fd.append('family_name', suLast.trim());
        fd.append('email',       suEmail.trim());
        fd.append('dob',         suDob);
        if (suGoogleId) fd.append('google_id', suGoogleId);
        fd.append('picture', suPicFile);
        body = fd;
      } else {
        body = {
          given_name:  suFirst.trim(),
          family_name: suLast.trim(),
          email:       suEmail.trim(),
          dob:         suDob,
          ...(suGoogleId ? { google_id: suGoogleId } : {}),
        };
      }

      const data = await apiFetch('/api/auth/signup.php', { method: 'POST', body });

      // If existing user — OTP sent, go to OTP screen to log them in
      if (data.existing_user) {
        setPendingEmail(suEmail.trim());
        setOtpMode('existing_login');
        setOtp('');
        setScreen(S.OTP);
        return;
      }

      // New user — OTP sent, go to OTP → set password
      setPendingEmail(suEmail.trim());
      setOtpMode('signup');
      setOtp('');
      setScreen(S.OTP);
    } catch (e) { err(e.message); }
    finally     { setLoading(false); }
  }

  // ── Google OAuth ──────────────────────────────────────────────────────────

  async function handleGoogle(credentialResponse) {
    setLoading(true); clearErr();
    const g = jwtDecode(credentialResponse.credential);
    try {
      const data = await apiFetch('/api/auth/google_login.php', {
        method: 'POST',
        body: g,
      });
      if (data.is_new_user) {
        // New user — pre-fill sign-up form
        setSuFirst(data.given_name  || '');
        setSuLast(data.family_name  || '');
        setSuEmail(data.email       || '');
        setSuPicPrev(data.picture   || null);
        setSuGoogleId(data.google_id || '');
        setScreen(S.SIGNUP);
      } else {
        // Existing user — Google verified identity, log in directly
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      }
    } catch (e) { err(e.message || 'Google sign-in failed'); }
    finally     { setLoading(false); }
  }

  // ── Verify OTP ────────────────────────────────────────────────────────────

  async function handleOtp(e) {
    e.preventDefault(); clearErr();
    if (otp.length !== 6) return err('Please enter the full 6-digit code');

    setLoading(true);
    try {
      const data = await apiFetch('/api/auth/verify_otp.php', {
        method: 'POST',
        body: { email: pendingEmail, otp },
      });
      if (otpMode === 'forgot') {
        setPw1(''); setPw2('');
        setScreen(S.RESET_PASSWORD);
      } else if (otpMode === 'existing_login') {
        // Existing user signed up again — log them straight in
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      } else if (data.needs_password) {
        setScreen(S.SET_PASSWORD);
      } else {
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      }
    } catch (e) { err(e.message); }
    finally     { setLoading(false); }
  }

  // ── Forgot Password ───────────────────────────────────────────────────────

  async function handleForgotPassword(e) {
    e.preventDefault(); clearErr();
    if (!fpEmail) return err('Email is required');
    if (!/\S+@\S+\.\S+/.test(fpEmail)) return err('Please enter a valid email address');

    setLoading(true);
    try {
      await apiFetch('/api/auth/forgot_password.php', {
        method: 'POST',
        body: { email: fpEmail },
      });
      setPendingEmail(fpEmail);
      setOtpMode('forgot');
      setOtp('');
      setScreen(S.OTP);
    } catch (e) { err(e.message); }
    finally     { setLoading(false); }
  }

  // ── Reset Password ────────────────────────────────────────────────────────

  async function handleResetPassword(e) {
    e.preventDefault(); clearErr();
    const pwErr = validatePw(pw1, pw2);
    if (pwErr) return err(pwErr);

    setLoading(true);
    try {
      await apiFetch('/api/auth/reset_password.php', {
        method: 'POST',
        body: { email: pendingEmail, password: pw1 },
      });
      setScreen(S.SIGNIN);
      setSiEmail(pendingEmail);
      setError(null);
      setSuccessMsg('Password reset successfully. You can now sign in.');
      setPendingEmail('');
      setFpEmail('');
    } catch (e) { err(e.message); }
    finally     { setLoading(false); }
  }

  // ── Set Password ──────────────────────────────────────────────────────────

  async function handleSetPassword(e) {
    e.preventDefault(); clearErr();
    const pwErr = validatePw(pw1, pw2);
    if (pwErr) return err(pwErr);

    setLoading(true);
    try {
      const data = await apiFetch('/api/auth/set_password.php', {
        method: 'POST',
        body: { email: pendingEmail, password: pw1 },
      });
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (e) { err(e.message); }
    finally     { setLoading(false); }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="auth-page">
        <div className={`auth-card ${screen === S.SIGNUP ? 'auth-card--signup' : 'auth-card--wide'}`}>

          <div className="auth-icon">
            <img src="/logo.png" alt="Mero Gadi" />
          </div>
          <h2>Welcome to Mero Gadi</h2>

          {error && <p className="auth-error">{error}</p>}

          {/* ── Sign In ── */}
          {screen === S.SIGNIN && (
            <>
              <div className="auth-tabs">
                <button className="auth-tab active">Sign In</button>
                <button className="auth-tab" onClick={() => { setScreen(S.SIGNUP); clearErr(); }}>Sign Up</button>
              </div>
              {successMsg && <p className="auth-success">{successMsg}</p>}
              <form className="auth-form" onSubmit={handleSignIn}>
                <input className="auth-input" type="email" placeholder="Email address"
                  value={siEmail} onChange={e => setSiEmail(e.target.value)} autoFocus />
                <input className="auth-input" type="password" placeholder="Password"
                  value={siPw} onChange={e => setSiPw(e.target.value)} />
                <button className="auth-btn" type="submit" disabled={loading}>
                  {loading ? 'Please wait...' : 'Sign In'}
                </button>
              </form>
              <button className="auth-forgot-link" onClick={() => { setFpEmail(siEmail); clearErr(); setScreen(S.FORGOT); }}>
                Forgot password?
              </button>
              <div className="auth-divider"><span>or</span></div>
              {loading ? <p className="auth-loading">Signing you in...</p> : (
                <GoogleLogin onSuccess={handleGoogle} onError={() => err('Google sign-in failed')}
                  text="continue_with" shape="rectangular" theme="outline" size="large" locale="en" />
              )}
            </>
          )}

          {/* ── Sign Up ── */}
          {screen === S.SIGNUP && (
            <>
              <div className="auth-tabs">
                <button className="auth-tab" onClick={() => { setScreen(S.SIGNIN); clearErr(); }}>Sign In</button>
                <button className="auth-tab active">Sign Up</button>
              </div>
              <form className="auth-form" onSubmit={handleSignUp}>

                {/* Avatar picker */}
                <div className="auth-avatar-pick" onClick={() => fileRef.current.click()}>
                  {suPicPrev
                    ? <img src={suPicPrev} alt="Preview" className="auth-avatar-preview" />
                    : <div className="auth-avatar-placeholder"><span>Add photo (optional)</span></div>
                  }
                  <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handlePicChange} />
                </div>

                <div className="auth-name-row">
                  <input className="auth-input" type="text" placeholder="First name *"
                    value={suFirst} onChange={e => setSuFirst(e.target.value)} required
                    readOnly={!!suGoogleId && !!suFirst} />
                  <input className="auth-input" type="text" placeholder="Last name"
                    value={suLast} onChange={e => setSuLast(e.target.value)} />
                </div>

                <div className="auth-field-label">Date of birth *</div>
                <input className="auth-input" type="date" value={suDob} onChange={e => setSuDob(e.target.value)}
                  required />
                {suDob && calcAge(suDob) < 18
                  ? <p className="auth-age-error">You must be at least 18 years old to register</p>
                  : suDob && <p className="pw-hint" style={{color:'#16a34a'}}>Age verified</p>
                }

                <input className="auth-input" type="email" placeholder="Email address *"
                  value={suEmail} onChange={e => setSuEmail(e.target.value)} required
                  readOnly={!!suGoogleId && !!suEmail} />

                <button className="auth-btn" type="submit" disabled={loading}>
                  {loading ? 'Please wait...' : 'Continue'}
                </button>
              </form>

              {!suGoogleId && (
                <>
                  <div className="auth-divider"><span>or sign up with</span></div>
                  {loading ? <p className="auth-loading">Please wait...</p> : (
                    <GoogleLogin onSuccess={handleGoogle} onError={() => err('Google sign-in failed')}
                      text="signup_with" shape="rectangular" theme="outline" size="large" locale="en" />
                  )}
                </>
              )}
              <button className="auth-back" onClick={() => { setScreen(S.SIGNIN); clearErr(); setSuGoogleId(''); }}>← Back to Sign In</button>
            </>
          )}

          {/* ── OTP ── */}
          {screen === S.OTP && (
            <>
              <p>
                {otpMode === 'forgot'
                  ? <>Enter the 6-digit reset code sent to<br /><strong>{pendingEmail}</strong></>
                  : otpMode === 'existing_login'
                  ? <>An account with this email already exists.<br />We sent a sign-in code to <strong>{pendingEmail}</strong></>
                  : <>Enter the 6-digit verification code sent to<br /><strong>{pendingEmail}</strong></>
                }
              </p>
              <form className="auth-form" onSubmit={handleOtp}>
                <input className="auth-input auth-input--otp" type="text" inputMode="numeric"
                  maxLength={6} placeholder="· · · · · ·" value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} autoFocus required />
                <button className="auth-btn" type="submit" disabled={loading || otp.length !== 6}>
                  {loading ? 'Verifying...' : 'Verify Code'}
                </button>
              </form>
              <p className="pw-hint" style={{ textAlign:'center' }}>Max 3 codes per 10 minutes</p>
              <button className="auth-back" onClick={() => {
                setOtp(''); clearErr();
                setScreen(otpMode === 'forgot' ? S.FORGOT : S.SIGNIN);
              }}>← Back</button>
            </>
          )}

          {/* ── Set Password ── */}
          {screen === S.SET_PASSWORD && (
            <>
              <p>Almost done! Set a password for your account.</p>
              <form className="auth-form" onSubmit={handleSetPassword}>
                <input className="auth-input" type="password" placeholder="Password"
                  value={pw1} onChange={e => setPw1(e.target.value)} required autoFocus />
                <StrengthBar pw={pw1} />
                <input className="auth-input" type="password" placeholder="Confirm password"
                  value={pw2} onChange={e => setPw2(e.target.value)} required />
                <p className="pw-hint">Min 8 chars · one uppercase · one number</p>
                <button className="auth-btn" type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Create Account'}
                </button>
              </form>
            </>
          )}

          {/* ── Forgot Password ── */}
          {screen === S.FORGOT && (
            <>
              <p style={{ marginBottom: 4 }}>Enter your account email and we'll send you a reset code.</p>
              <form className="auth-form" onSubmit={handleForgotPassword}>
                <input className="auth-input" type="email" placeholder="Email address"
                  value={fpEmail} onChange={e => setFpEmail(e.target.value)} required autoFocus />
                <button className="auth-btn" type="submit" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset Code'}
                </button>
              </form>
              <button className="auth-back" onClick={() => { clearErr(); setScreen(S.SIGNIN); }}>← Back to Sign In</button>
            </>
          )}

          {/* ── Reset Password ── */}
          {screen === S.RESET_PASSWORD && (
            <>
              <p>OTP verified. Set your new password for<br /><strong>{pendingEmail}</strong></p>
              <form className="auth-form" onSubmit={handleResetPassword}>
                <input className="auth-input" type="password" placeholder="New password"
                  value={pw1} onChange={e => setPw1(e.target.value)} required autoFocus />
                <StrengthBar pw={pw1} />
                <input className="auth-input" type="password" placeholder="Confirm new password"
                  value={pw2} onChange={e => setPw2(e.target.value)} required />
                <p className="pw-hint">Min 8 chars · one uppercase · one number</p>
                <button className="auth-btn" type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}

        </div>
      </div>
    </GoogleOAuthProvider>
  );
}
