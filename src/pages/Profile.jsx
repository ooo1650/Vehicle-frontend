import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

export default function Profile() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [editing, setEditing]   = useState(false);
  const [name, setName]         = useState(user.name || user.username || '');
  const [saving, setSaving]     = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const lastLogin = user.iat
    ? new Date(user.iat * 1000).toLocaleString('en-US', {
        dateStyle: 'medium', timeStyle: 'short',
      })
    : 'N/A';

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true); setSaveError(null); setSaveSuccess(false);
    try {
      const res  = await fetch('/api/user/update_profile.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, username: name.trim() }),
      });
      const data = await res.json();
      if (!data.success) { setSaveError(data.message); return; }

      // Update localStorage so navbar reflects the new name immediately
      const updated = {
        ...user,
        name:        data.username,
        username:    data.username,
        given_name:  data.given_name,
      };
      localStorage.setItem('user', JSON.stringify(updated));
      setSaveSuccess(true);
      setEditing(false);
    } catch {
      setSaveError('Could not connect to server.');
    } finally {
      setSaving(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem('user');
    navigate('/login');
  }

  const displayName = user.name || user.username;

  return (
    <div className="profile-page">
      <div className="profile-card">

        {/* Avatar */}
        <div className="profile-avatar-wrap">
          {user.picture ? (
            <img src={user.picture} alt={displayName} className="profile-avatar" referrerPolicy="no-referrer" />
          ) : (
            <img src="/default-avatar.svg" alt="Default avatar" className="profile-avatar" />
          )}
        </div>

        {/* Name — editable */}
        {editing ? (
          <div className="profile-edit-name">
            <input
              className="profile-name-input"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
              placeholder="Your name"
            />
            <div className="profile-edit-actions">
              <button className="profile-save-btn" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button className="profile-cancel-btn" onClick={() => { setEditing(false); setName(displayName); setSaveError(null); }}>
                Cancel
              </button>
            </div>
            {saveError && <p className="profile-save-error">{saveError}</p>}
          </div>
        ) : (
          <div className="profile-name-row">
            <h2 className="profile-name">{displayName}</h2>
            <button className="profile-edit-btn" onClick={() => { setEditing(true); setSaveSuccess(false); }} title="Edit name">
              ✏️
            </button>
          </div>
        )}

        {saveSuccess && <p className="profile-save-success">Name updated successfully</p>}

        <p className="profile-email">{user.email}</p>

        {/* Info rows */}
        <div className="profile-info">
          <div className="profile-row">
            <span className="profile-label">First name</span>
            <span className="profile-value">{user.given_name || user.username || '—'}</span>
          </div>
          <div className="profile-row">
            <span className="profile-label">Last name</span>
            <span className="profile-value">{user.family_name || '—'}</span>
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
            <span className="profile-value">
              {user.sub || user.google_id ? '🔵 Google' : '✉️ Email'}
            </span>
          </div>
        </div>

        <button className="profile-logout" onClick={handleLogout}>Sign Out</button>
      </div>
    </div>
  );
}
