// src/services/bookingService.js
import { apiFetch } from '../utils/api';

// GET single vehicle by id (public)
export async function getVehicleById(id) {
  const data = await apiFetch(`/api/vehicles/get_vehicles.php?id=${id}`);
  return data.vehicle ?? data;
}

// POST — create a new booking
export async function createBooking(bookingData) {
  return apiFetch('/api/user/bookings.php', {
    method: 'POST',
    body: bookingData,
  });
}
