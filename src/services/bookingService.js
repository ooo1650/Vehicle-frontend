// src/services/bookingService.js
// Handles vehicle detail fetch + booking creation
// Talks to: backend/vehicles/get_vehicles.php (GET single)
//           backend/user/bookings.php          (POST booking)

import axios from "axios";

const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost/Vehicle_Rental_System/backend";

const api = axios.create({
  baseURL: BASE,
  withCredentials: true, // keeps your user session cookie
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) window.location.href = "/login";
    return Promise.reject(err);
  }
);

// GET single vehicle by id — for VehicleDetail page
export async function getVehicleById(id) {
  const { data } = await api.get(`/vehicles/get_vehicles.php?id=${id}`);
  return data.vehicle ?? data;
}

// POST — create a new booking
export async function createBooking(bookingData) {
  const { data } = await api.post("/user/bookings.php", bookingData);
  return data; // { success, message, booking_id }
}