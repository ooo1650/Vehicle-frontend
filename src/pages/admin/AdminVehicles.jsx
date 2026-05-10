import { useState, useEffect, useRef } from 'react';
import { adminFetch } from '../../context/AuthContext';

const TYPES = ['Car', 'SUV', 'Van', 'Motorcycle', 'Truck'];
const FUELS = ['Petrol', 'Diesel', 'Electric'];
const TRANS = ['Manual', 'Automatic'];

const emptyForm = {
  name: '', type: 'Car', fuel_type: 'Petrol', seats: '', transmission: 'Manual',
  year: '', doors: '', mileage: '', luggage_capacity: '', pickup_location: '',
  description: '', features: '', price_per_day: '',
};

const inp = { width:'100%', padding:'9px 12px', border:'1px solid #e2e8f0', borderRadius:'8px', fontSize:'14px', boxSizing:'border-box', fontFamily:'inherit' };
const lbl = { fontSize:'13px', fontWeight:500, display:'block', marginBottom:'5px', color:'#374151' };

// ── VehicleForm defined OUTSIDE to prevent re-mount on every keystroke ──
function VehicleForm({ title, data, setData, onSave, onCancel, saving }) {
  const fileRef = useRef(null);
  const [previews, setPreviews] = useState([]);

  function handleFiles(e) {
    const files = Array.from(e.target.files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
    setData({ ...data, _files: files });
  }

  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,padding:'20px' }}>
      <div style={{ background:'#fff',borderRadius:'14px',padding:'28px',width:'560px',maxHeight:'90vh',overflowY:'auto',boxShadow:'0 8px 32px rgba(0,0,0,0.15)' }}>
        <h3 style={{ margin:'0 0 20px',fontSize:'18px',fontWeight:700 }}>{title}</h3>

        {/* Images */}
        <div style={{ marginBottom:'16px' }}>
          <label style={lbl}>Photos (select multiple)</label>
          <div style={{ border:'2px dashed #e2e8f0',borderRadius:'10px',padding:'16px',textAlign:'center',cursor:'pointer' }}
            onClick={() => fileRef.current.click()}>
            {previews.length > 0 ? (
              <div style={{ display:'flex',gap:'8px',flexWrap:'wrap',justifyContent:'center' }}>
                {previews.map((p,i) => <img key={i} src={p} alt="" style={{ width:80,height:60,objectFit:'cover',borderRadius:6 }} />)}
              </div>
            ) : (
              <span style={{ color:'#9ca3af',fontSize:'14px' }}>Click to select images</span>
            )}
            <input ref={fileRef} type="file" accept="image/*" multiple style={{ display:'none' }} onChange={handleFiles} />
          </div>
        </div>

        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',marginBottom:'12px' }}>
          <div style={{ gridColumn:'1/-1' }}>
            <label style={lbl}>Vehicle Name *</label>
            <input style={inp} value={data.name} onChange={e => setData({...data,name:e.target.value})} />
          </div>
          <div>
            <label style={lbl}>Type</label>
            <select style={inp} value={data.type} onChange={e => setData({...data,type:e.target.value})}>
              {TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Fuel</label>
            <select style={inp} value={data.fuel_type} onChange={e => setData({...data,fuel_type:e.target.value})}>
              {FUELS.map(f => <option key={f}>{f}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Transmission</label>
            <select style={inp} value={data.transmission} onChange={e => setData({...data,transmission:e.target.value})}>
              {TRANS.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={lbl}>Seats *</label>
            <input style={inp} type="number" value={data.seats} onChange={e => setData({...data,seats:e.target.value})} />
          </div>
          <div>
            <label style={lbl}>Year</label>
            <input style={inp} type="number" placeholder="e.g. 2022" value={data.year} onChange={e => setData({...data,year:e.target.value})} />
          </div>
          <div>
            <label style={lbl}>Doors</label>
            <input style={inp} type="number" value={data.doors} onChange={e => setData({...data,doors:e.target.value})} />
          </div>
          <div>
            <label style={lbl}>Mileage</label>
            <input style={inp} placeholder="e.g. 18 km/l" value={data.mileage} onChange={e => setData({...data,mileage:e.target.value})} />
          </div>
          <div>
            <label style={lbl}>Luggage Capacity</label>
            <input style={inp} placeholder="e.g. 2 Bags" value={data.luggage_capacity} onChange={e => setData({...data,luggage_capacity:e.target.value})} />
          </div>
          <div>
            <label style={lbl}>Price / day (NPR) *</label>
            <input style={inp} type="number" value={data.price_per_day} onChange={e => setData({...data,price_per_day:e.target.value})} />
          </div>
          <div style={{ gridColumn:'1/-1' }}>
            <label style={lbl}>Pick-up Location</label>
            <input style={inp} placeholder="e.g. Thamel, Kathmandu" value={data.pickup_location} onChange={e => setData({...data,pickup_location:e.target.value})} />
          </div>
          <div style={{ gridColumn:'1/-1' }}>
            <label style={lbl}>Features (comma separated)</label>
            <input style={inp} placeholder="Air Conditioning, Bluetooth, ABS Brakes" value={data.features} onChange={e => setData({...data,features:e.target.value})} />
          </div>
          <div style={{ gridColumn:'1/-1' }}>
            <label style={lbl}>Description</label>
            <textarea style={{ ...inp,height:80,resize:'vertical' }} value={data.description} onChange={e => setData({...data,description:e.target.value})} />
          </div>
        </div>

        <div style={{ display:'flex',gap:'10px',marginTop:'8px' }}>
          <button onClick={onSave} disabled={saving}
            style={{ flex:1,background:'#2563eb',color:'#fff',border:'none',padding:'11px',borderRadius:'8px',fontWeight:600,cursor:'pointer',opacity:saving?0.6:1 }}>
            {saving ? 'Saving...' : 'Save Vehicle'}
          </button>
          <button onClick={onCancel}
            style={{ flex:1,background:'#f1f5f9',color:'#64748b',border:'none',padding:'11px',borderRadius:'8px',fontWeight:600,cursor:'pointer' }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [editing,  setEditing]  = useState(null);
  const [showAdd,  setShowAdd]  = useState(false);
  const [form,     setForm]     = useState(emptyForm);
  const [saving,   setSaving]   = useState(false);

  function load() {
    adminFetch('/api/admin/vehicles.php')
      .then(r => r.json())
      .then(d => { if (d.success) setVehicles(d.data); })
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleAdd() {
    if (!form.name || !form.seats || !form.price_per_day) { alert('Name, seats and price are required'); return; }
    setSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (k !== '_files' && v !== '') fd.append(k, v); });
    (form._files || []).forEach(f => fd.append('images[]', f));
    const res = await adminFetch('/api/admin/vehicles.php', { method: 'POST', body: fd, headers: {} });
    const d   = await res.json();
    setSaving(false);
    if (d.success) { setShowAdd(false); setForm(emptyForm); load(); }
    else alert(d.message);
  }

  async function handleEdit() {
    if (!editing.name || !editing.seats || !editing.price_per_day) { alert('Name, seats and price are required'); return; }
    setSaving(true);
    // If new images selected, use multipart; otherwise JSON
    if (editing._files?.length) {
      const fd = new FormData();
      Object.entries(editing).forEach(([k, v]) => { if (k !== '_files' && v !== null && v !== '') fd.append(k, v); });
      editing._files.forEach(f => fd.append('images[]', f));
      fd.append('_method', 'PUT');
      // Use POST with _method override for multipart PUT
      const res = await adminFetch('/api/admin/vehicles.php', { method: 'POST', body: fd, headers: {} });
      const d   = await res.json();
      setSaving(false);
      if (d.success) { setEditing(null); load(); } else alert(d.message);
    } else {
      const res = await adminFetch('/api/admin/vehicles.php', { method: 'PUT', body: JSON.stringify(editing) });
      const d   = await res.json();
      setSaving(false);
      if (d.success) { setEditing(null); load(); } else alert(d.message);
    }
  }

  async function toggleAvailable(v) {
    if (v.available && !confirm(`Deactivate "${v.name}"?`)) return;
    const res = await adminFetch('/api/admin/vehicles.php', { method:'PUT', body: JSON.stringify({ id:v.id, available: v.available ? 0 : 1 }) });
    const d   = await res.json();
    if (!d.success) alert(d.message);
    else load();
  }

  async function handleDelete(id) {
    if (!confirm('Delete this vehicle?')) return;
    await adminFetch(`/api/admin/vehicles.php?id=${id}`, { method:'DELETE' });
    load();
  }

  const th = { padding:'12px 16px',textAlign:'left',fontWeight:600,fontSize:'12px',color:'#64748b',textTransform:'uppercase',letterSpacing:'0.05em',borderBottom:'1px solid #e2e8f0' };
  const td = { padding:'14px 16px',color:'#64748b' };

  return (
    <div style={{ padding:'28px',background:'#f8fafc',minHeight:'100vh' }}>
      <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px' }}>
        <h2 style={{ margin:0,fontSize:'22px',fontWeight:700,color:'#1e293b' }}>Manage Vehicles</h2>
        <button onClick={() => setShowAdd(true)}
          style={{ background:'#2563eb',color:'#fff',border:'none',padding:'10px 20px',borderRadius:'8px',fontWeight:600,cursor:'pointer',fontSize:'14px' }}>
          + Add Vehicle
        </button>
      </div>

      <div style={{ background:'#fff',borderRadius:'10px',border:'1px solid #e2e8f0',overflow:'hidden' }}>
        <table style={{ width:'100%',borderCollapse:'collapse',fontSize:'14px' }}>
          <thead>
            <tr style={{ background:'#f8fafc' }}>
              {['Photo','Name','Type','Fuel','Seats','Price/day','Status','Actions'].map(h => <th key={h} style={th}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" style={{ padding:'24px',textAlign:'center',color:'#64748b' }}>Loading...</td></tr>
            ) : vehicles.map((v, i) => (
              <tr key={v.id} style={{ borderBottom: i < vehicles.length-1 ? '1px solid #f1f5f9' : 'none' }}>
                <td style={td}>
                  <img src={v.primary_image || 'https://placehold.co/60x40/e5e7eb/9ca3af?text=?'} alt=""
                    style={{ width:60,height:40,objectFit:'cover',borderRadius:6 }} />
                </td>
                <td style={{ ...td,fontWeight:500,color:'#1e293b' }}>{v.name}</td>
                <td style={td}>{v.type}</td>
                <td style={td}>{v.fuel_type}</td>
                <td style={td}>{v.seats}</td>
                <td style={td}>NPR {Number(v.price_per_day).toLocaleString()}</td>
                <td style={td}>
                  <span style={{ padding:'3px 10px',borderRadius:'20px',fontSize:'12px',fontWeight:600,
                    background:v.available?'#f0fdf4':'#fef2f2',color:v.available?'#15803d':'#b91c1c' }}>
                    {v.available ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td style={td}>
                  <button onClick={() => setEditing({...v, features: Array.isArray(v.features) ? v.features.join(', ') : (v.features||''), _files:null})}
                    style={{ background:'none',border:'1px solid #e2e8f0',borderRadius:'6px',padding:'6px 12px',cursor:'pointer',marginRight:'6px',color:'#64748b',fontSize:'13px' }}>Edit</button>
                  <button onClick={() => toggleAvailable(v)}
                    style={{ background:'none',border:'1px solid #e2e8f0',borderRadius:'6px',padding:'6px 12px',cursor:'pointer',color:v.available?'#b91c1c':'#15803d',fontSize:'13px' }}>
                    {v.available ? 'Deactivate' : 'Activate'}
                  </button>
                  <button onClick={() => handleDelete(v.id)}
                    style={{ background:'none',border:'1px solid #fecaca',borderRadius:'6px',padding:'6px 12px',cursor:'pointer',color:'#b91c1c',marginLeft:'6px',fontSize:'13px' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd  && <VehicleForm title="Add Vehicle"  data={form}    setData={setForm}    onSave={handleAdd}  onCancel={() => setShowAdd(false)} saving={saving} />}
      {editing  && <VehicleForm title="Edit Vehicle" data={editing} setData={setEditing} onSave={handleEdit} onCancel={() => setEditing(null)}  saving={saving} />}
    </div>
  );
}
