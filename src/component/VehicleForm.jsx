// Reusable vehicle form used by EditVehicle (and can be used for AddVehicle)
import { useState } from 'react';

const TYPES = ['Car', 'SUV', 'Van', 'Motorcycle', 'Truck'];
const FUELS = ['Petrol', 'Diesel', 'Electric'];

const inputStyle = { width:'100%', padding:'9px 12px', border:'1px solid #e2e8f0', borderRadius:'8px', fontSize:'14px', boxSizing:'border-box', fontFamily:'inherit' };
const labelStyle = { fontSize:'13px', fontWeight:500, display:'block', marginBottom:'6px', color:'#374151' };

export default function VehicleForm({ initialData = {}, onSubmit, isLoading }) {
  const [form, setForm] = useState({
    name:          initialData.name          || '',
    type:          initialData.type          || 'Car',
    fuel_type:     initialData.fuel_type     || 'Petrol',
    seats:         initialData.seats         || '',
    price_per_day: initialData.price_per_day || '',
    image_url:     initialData.image_url     || '',
  });

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} style={{ background:'#fff', borderRadius:'12px', border:'1px solid #e2e8f0', padding:'28px', maxWidth:'560px' }}>

      <div style={{ marginBottom:'16px' }}>
        <label style={labelStyle}>Vehicle Name</label>
        <input style={inputStyle} value={form.name} onChange={e => handleChange('name', e.target.value)} required />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', marginBottom:'16px' }}>
        <div>
          <label style={labelStyle}>Type</label>
          <select style={inputStyle} value={form.type} onChange={e => handleChange('type', e.target.value)}>
            {TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Fuel</label>
          <select style={inputStyle} value={form.fuel_type} onChange={e => handleChange('fuel_type', e.target.value)}>
            {FUELS.map(f => <option key={f}>{f}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Seats</label>
          <input style={inputStyle} type="number" value={form.seats} onChange={e => handleChange('seats', e.target.value)} required />
        </div>
        <div>
          <label style={labelStyle}>Price / day (NPR)</label>
          <input style={inputStyle} type="number" value={form.price_per_day} onChange={e => handleChange('price_per_day', e.target.value)} required />
        </div>
      </div>

      <div style={{ marginBottom:'24px' }}>
        <label style={labelStyle}>Image URL (optional)</label>
        <input style={inputStyle} value={form.image_url} onChange={e => handleChange('image_url', e.target.value)} />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        style={{ background:'#2563eb', color:'#fff', border:'none', padding:'11px 28px', borderRadius:'8px', fontWeight:600, fontSize:'14px', cursor:'pointer', opacity: isLoading ? 0.6 : 1 }}
      >
        {isLoading ? 'Saving...' : 'Save Vehicle'}
      </button>
    </form>
  );
}
