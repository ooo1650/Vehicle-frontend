import { useState, useEffect } from 'react';
import { adminFetch } from '../../context/AuthContext';
import { apiUrl } from '../../utils/api';

const inp = { width:'100%', padding:'9px 12px', border:'1px solid #e2e8f0', borderRadius:'8px', fontSize:'14px', boxSizing:'border-box', fontFamily:'inherit' };
const lbl = { fontSize:'13px', fontWeight:500, display:'block', marginBottom:'6px' };
const modalStyle = { position:'fixed',inset:0,background:'rgba(0,0,0,0.45)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000 };
const boxStyle   = { background:'#fff',borderRadius:'12px',padding:'28px',width:'500px',maxHeight:'90vh',overflowY:'auto',boxShadow:'0 4px 24px rgba(0,0,0,0.12)' };

function TermForm({ title, data, setData, onSave, onCancel, saving }) {
  return (
    <div style={modalStyle}>
      <div style={boxStyle}>
        <h3 style={{ margin:'0 0 20px',fontSize:'18px',fontWeight:700 }}>{title}</h3>
        <div style={{ marginBottom:'14px' }}>
          <label style={lbl}>Title</label>
          <input style={inp} value={data.title} onChange={e => setData({...data, title: e.target.value})} autoFocus />
        </div>
        <div style={{ marginBottom:'20px' }}>
          <label style={lbl}>Content</label>
          <textarea style={{ ...inp, height:120, resize:'vertical' }} value={data.content}
            onChange={e => setData({...data, content: e.target.value})} />
        </div>
        <div style={{ display:'flex', gap:'10px' }}>
          <button onClick={onSave} disabled={saving}
            style={{ flex:1,background:'#2563eb',color:'#fff',border:'none',padding:'10px',borderRadius:'8px',fontWeight:600,cursor:'pointer',opacity:saving?0.6:1 }}>
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button onClick={onCancel}
            style={{ flex:1,background:'#f1f5f9',color:'#64748b',border:'none',padding:'10px',borderRadius:'8px',fontWeight:600,cursor:'pointer' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminTerms() {
  const [terms,   setTerms]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newTerm, setNewTerm] = useState({ title:'', content:'' });
  const [saving,  setSaving]  = useState(false);
  const [msg,     setMsg]     = useState(null);

  function load() {
    fetch(apiUrl('/api/terms/terms.php'))
      .then(r => r.json())
      .then(d => { if (d.success) setTerms(d.terms); })
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  function showMsg(text, ok = true) {
    setMsg({ text, ok });
    setTimeout(() => setMsg(null), 3000);
  }

  async function handleAdd() {
    if (!newTerm.title.trim() || !newTerm.content.trim()) { showMsg('Title and content are required', false); return; }
    setSaving(true);
    const res = await adminFetch(apiUrl('/api/terms/terms.php'), { method:'POST', body: JSON.stringify(newTerm) });
    const d   = await res.json();
    setSaving(false);
    if (d.success) { setShowAdd(false); setNewTerm({ title:'', content:'' }); load(); showMsg('Clause added'); }
    else showMsg(d.message, false);
  }

  async function handleEdit() {
    if (!editing.title.trim() || !editing.content.trim()) { showMsg('Title and content are required', false); return; }
    setSaving(true);
    const res = await adminFetch(apiUrl('/api/terms/terms.php'), { method:'PUT', body: JSON.stringify(editing) });
    const d   = await res.json();
    setSaving(false);
    if (d.success) { setEditing(null); load(); showMsg('Clause updated'); }
    else showMsg(d.message, false);
  }

  async function handleDelete(id) {
    if (!confirm('Delete this clause?')) return;
    const res = await adminFetch(apiUrl(`/api/terms/terms.php?id=${id}`), { method:'DELETE' });
    const d   = await res.json();
    if (d.success) { load(); showMsg('Clause deleted'); }
    else showMsg(d.message, false);
  }

  return (
    <div style={{ padding:'28px', background:'#f8fafc', minHeight:'100vh' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'24px' }}>
        <div>
          <h2 style={{ margin:'0 0 4px', fontSize:'22px', fontWeight:700, color:'#1e293b' }}>Terms & Conditions</h2>
          <p style={{ margin:0, fontSize:'14px', color:'#64748b' }}>Manage rental terms shown to users during booking</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          style={{ background:'#2563eb',color:'#fff',border:'none',padding:'10px 20px',borderRadius:'8px',fontWeight:600,cursor:'pointer',fontSize:'14px' }}>
          + Add Clause
        </button>
      </div>

      {msg && (
        <div style={{ padding:'10px 16px', borderRadius:'8px', marginBottom:'16px', fontSize:'14px',
          background: msg.ok ? '#f0fdf4' : '#fef2f2', color: msg.ok ? '#15803d' : '#b91c1c',
          border: `1px solid ${msg.ok ? '#bbf7d0' : '#fecaca'}` }}>
          {msg.text}
        </div>
      )}

      {loading ? (
        <p style={{ color:'#64748b' }}>Loading...</p>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
          {terms.map((term, i) => (
            <div key={term.id} style={{ background:'#fff', border:'1px solid #e2e8f0', borderRadius:'10px', padding:'18px 20px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px' }}>
                    <span style={{ background:'#eff6ff', color:'#1d4ed8', borderRadius:'20px', padding:'2px 10px', fontSize:'12px', fontWeight:600 }}>
                      Clause {i + 1}
                    </span>
                    <span style={{ fontWeight:600, fontSize:'15px', color:'#1e293b' }}>{term.title}</span>
                  </div>
                  <p style={{ margin:0, fontSize:'14px', color:'#64748b', lineHeight:'1.6' }}>{term.content}</p>
                </div>
                <div style={{ display:'flex', gap:'8px', marginLeft:'16px', flexShrink:0 }}>
                  <button onClick={() => setEditing({...term})}
                    style={{ background:'none', border:'1px solid #e2e8f0', borderRadius:'6px', padding:'6px 12px', cursor:'pointer', color:'#64748b', fontSize:'13px' }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(term.id)}
                    style={{ background:'none', border:'1px solid #fecaca', borderRadius:'6px', padding:'6px 12px', cursor:'pointer', color:'#b91c1c', fontSize:'13px' }}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {terms.length === 0 && <p style={{ color:'#64748b', textAlign:'center', padding:'40px' }}>No terms added yet.</p>}
        </div>
      )}

      {showAdd && <TermForm title="Add Clause"  data={newTerm} setData={setNewTerm} onSave={handleAdd}  onCancel={() => setShowAdd(false)} saving={saving} />}
      {editing  && <TermForm title="Edit Clause" data={editing} setData={setEditing} onSave={handleEdit} onCancel={() => setEditing(null)}  saving={saving} />}
    </div>
  );
}
