// src/services/bookingService.js
import { apiUrl } from '../utils/api';

// GET single vehicle by id (public)
export async function getVehicleById(id) {
  const res  = await fetch(apiUrl(`/api/vehicles/get_vehicles.php?id=${id}`));
  const data = await res.json();
  return data.vehicle ?? data;
}

// POST — create a new booking
export async function createBooking(bookingData) {
  const res  = await fetch(apiUrl('/api/user/bookings.php'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookingData),
  });
  return res.json(); // { success, message, booking_id }
}
