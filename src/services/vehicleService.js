// src/services/vehicleService.js
// Talks to your existing: backend/admin/vehicles.php
//                    and: backend/vehicles/get_vehicles.php

import axios from "axios";

const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost/Vehicle_Rental_System/backend";

const api = axios.create({
  baseURL: BASE,
  withCredentials: true, // keeps your admin_auth.php session cookie
});

// Redirect to login on 401 (works with your existing Authentication.jsx flow)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) window.location.href = "/login";
    return Promise.reject(err);
  }
);

// Converts a plain form object → FormData for multipart/file uploads
function buildFormData(data) {
  const fd = new FormData();
  Object.entries(data).forEach(([key, val]) => {
    if (key === "images") {
      // Array of new File objects — PHP reads as $_FILES['images'][]
      (val || []).forEach((file) => fd.append("images[]", file));
    } else if (key === "features" || key === "existing_images") {
      // Send arrays as JSON strings; PHP decodes with json_decode()
      fd.append(key, JSON.stringify(val || []));
    } else if (val !== null && val !== undefined) {
      fd.append(key, val);
    }
  });
  return fd;
}

// GET all vehicles — uses your existing get_vehicles.php
export async function getAll() {
  const { data } = await api.get("/vehicles/get_vehicles.php");
  return data.vehicles ?? data;
}

// GET single vehicle by id — your vehicles.php?id=X
export async function getById(id) {
  const { data } = await api.get(`/admin/vehicles.php?id=${id}`);
  return data.vehicle ?? data;
}

// POST — create new vehicle
export async function create(formData) {
  const { data } = await api.post("/admin/vehicles.php", buildFormData(formData));
  return data; // { success, message, id }
}

// PUT — update existing vehicle
// PHP doesn't parse multipart PUT bodies so we use POST + _method override
export async function update(id, formData) {
  const fd = buildFormData(formData);
  fd.append("_method", "PUT");
  fd.append("id", id);
  const { data } = await api.post("/admin/vehicles.php", fd);
  return data; // { success, message }
}