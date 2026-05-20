import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';
import { apiFetch } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { getSession, setSession } from '../utils/session';

export default function Profile() {
  const navigate  = useNavigate();
  const fileRef   = useRef(null);
  const { logoutUser } = useAuth();
  const [user, setUser] = useState(getSession() || {});

  const [editing,     setEditing]     = useState(false);
  const [firstName,   setFirstName]   = useState(user.given_name  || '');
  const [lastName,    setLastName]    = useState(user.family_name || '');
  const validDob = user.dob && user.dob > '1900-01-01' ? user.dob : '';
  const [dob, setDob] = useState(validDob);
  const [picFile,     setPicFile]     = useState(null);
  const [picPreview,  setPicPreview]  = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [saveError,   setSaveError]   = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const displayName = `${user.given_name || ''} ${user.family_name || ''}`.trim() || user.username || user.email;
  const picture     = picPreview || user.picture || null;

  const lastLogin = user.last_login
    ? new Date(user.last_login).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
    : 'N/A';

  // Don't show obviously wrong DOB values
  const displayDob = user.dob && user.dob > '1900-01-01' ? user.dob : '—';

  function handlePicChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setSaveError('Image must be under 2MB');
      return;
    }
    setPicFile(file);
    // Generate preview AND base64 for upload
    const reader = new FileReader();
    reader.onload = ev => setPicPreview(ev.target.result); // data URL
    reader.readAsDataURL(file);
  }

  async function handleSave() {
    if (!firstName.trim()) { setSaveError('First name is required'); return; }
    setSaving(true); setSaveError(null); setSaveSuccess(false);

    try {
      // Build picture value — use base64 preview if a new file was picked
      const newPicture = picPreview || user.picture;

      const data = await apiFetch('/api/user/update_profile.php', {
        method: 'PUT',
        body: {
          email:       user.email,
          given_name:  firstName.trim(),
          family_name: lastName.trim(),
          dob:         dob,
          picture:     picPreview || undefined, // only send if changed
        },
      });

      const updated = {
        ...user,
        given_name:  data.given_name,
        family_name: data.family_name,
        username:    data.username,
        dob:         data.dob,
        picture:     newPicture,
      };
      setSession(updated);
      setUser(updated);
      setPicFile(null);
      setPicPreview(null);
      setSaveSuccess(true);
      setEditing(false);
    } catch (e) {
      setSaveError(e.message || 'Could not connect to server.');
    } finally {
      setSaving(false);
    }
  }

  function cancelEdit() {
    setEditing(false);
    setFirstName(user.given_name  || '');
    setLastName(user.family_name  || '');
    setDob(user.dob && user.dob > '1900-01-01' ? user.dob : '');
    setPicFile(null);
    setPicPreview(null);
    setSaveError(null);
  }

  return (
    <div className="profile-page">
      <div className="profile-card">

        {/* Avatar */}
        <div className="profile-avatar-wrap" onClick={editing ? () => fileRef.current.click() : undefined}
          style={{ cursor: editing ? 'pointer' : 'default' }}>
          {picture
            ? <img src={picture} alt={displayName} className="profile-avatar" referrerPolicy="no-referrer" />
            : <img src="/default-avatar.svg" alt="avatar" className="profile-avatar" />
          }
          {editing && <div className="profile-avatar-overlay">📷</div>}
          <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handlePicChange} />
        </div>

        {/* Name */}
        {editing ? (
          <div className="profile-edit-name">
            <div className="profile-name-fields">
              <input className="profile-name-input" placeholder="First name *"
                value={firstName} onChange={e => setFirstName(e.target.value)} autoFocus />
              <input className="profile-name-input" placeholder="Last name"
                value={lastName}  onChange={e => setLastName(e.target.value)} />
            </div>
            <div style={{ width:'100%', textAlign:'left', marginTop:4 }}>
              <label style={{ fontSize:12, color:'#6b7280', fontWeight:500 }}>Date of birth</label>
              <input className="profile-name-input" type="date" value={dob}
                onChange={e => setDob(e.target.value)}
                style={{ fontSize:14, fontWeight:400, textAlign:'left', marginTop:4 }} />
            </div>
            <div className="profile-edit-actions">
              <button className="profile-save-btn" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button className="profile-cancel-btn" onClick={cancelEdit}>Cancel</button>
            </div>
            {saveError && <p className="profile-save-error">{saveError}</p>}
          </div>
        ) : (
          <div className="profile-name-row">
            <h2 className="profile-name">{displayName}</h2>
            <button className="profile-edit-btn" onClick={() => { setEditing(true); setSaveSuccess(false); }} title="Edit profile">✏️</button>
          </div>
        )}

        {saveSuccess && <p className="profile-save-success">✓ Profile updated successfully</p>}
        <p className="profile-email">{user.email}</p>

        {/* Info rows */}
        <div className="profile-info">
          <div className="profile-row">
            <span className="profile-label">First name</span>
            <span className="profile-value">{user.given_name  || '—'}</span>
          </div>
          <div className="profile-row">
            <span className="profile-label">Last name</span>
            <span className="profile-value">{user.family_name || '—'}</span>
          </div>
          <div className="profile-row">
            <span className="profile-label">Date of birth</span>
            <span className="profile-value">{displayDob}</span>
          </div>
          <div className="profile-row">
            <span className="profile-label">Email</span>
            <span className="profile-value">{user.email}</span>
          </div>
          <div className="profile-row">
            <span className="profile-label">Last signed in</span>
            <span className="profile-value">{lastLogin}</span>
          </div>
          <div className="profile-row">
            <span className="profile-label">Sign-in method</span>
            <span className="profile-value">{user.auth_provider === 'google' ? '🔵 Google' : '✉️ Email'}</span>
          </div>
        </div>

        <button className="profile-logout" onClick={() => logoutUser()}>
          Sign Out
        </button>
      </div>
    </div>
  );
}
