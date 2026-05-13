// src/services/vehicleService.js
import { adminFetch } from '../context/AuthContext';
import { apiUrl } from '../utils/api';

// GET all available vehicles (public)
export async function getAll() {
  const res  = await fetch(apiUrl('/api/vehicles/get_vehicles.php'), {
    headers: { Accept: 'application/json' },
  });
  const data = await res.json();
  return data.vehicles ?? [];
}

// GET single vehicle by id (admin)
export async function getById(id) {
  const res  = await adminFetch(`/api/admin/vehicles.php?id=${id}`);
  const data = await res.json();
  return data.data ?? null;
}

// POST — create new vehicle (admin, multipart)
export async function create(formData) {
  const res  = await adminFetch('/api/admin/vehicles.php', {
    method: 'POST',
    body: formData,   // FormData — adminFetch handles headers correctly
  });
  return res.json();
}

// PUT — update existing vehicle (admin)
export async function update(id, payload) {
  const res  = await adminFetch('/api/admin/vehicles.php', {
    method: 'PUT',
    body: { id, ...payload },
  });
  return res.json();
}
