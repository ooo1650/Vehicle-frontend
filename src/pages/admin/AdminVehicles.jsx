import { useState, useEffect } from "react";
import { adminFetch } from "../../context/AuthContext";

const TYPES = ["Car", "SUV", "Van", "Motorcycle", "Truck"];
const FUELS = ["Petrol", "Diesel", "Electric"];

const modalStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};
const boxStyle = {
  background: "#fff",
  borderRadius: "12px",
  padding: "28px",
  width: "460px",
  boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
};
const inputStyle = {
  width: "100%",
  padding: "9px 12px",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  fontSize: "14px",
  boxSizing: "border-box",
};
const selectStyle = {
  width: "100%",
  padding: "9px 12px",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  fontSize: "14px",
};

const emptyForm = {
  name: "",
  type: "Car",
  fuel_type: "Petrol",
  seats: "",
  price_per_day: "",
  image_url: "",
};

// ── Defined OUTSIDE AdminVehicles so it never re-mounts on parent re-render ──
function VehicleForm({ title, data, setData, onSave, onCancel }) {
  return (
    <div style={modalStyle}>
      <div style={boxStyle}>
        <h3 style={{ margin: "0 0 20px", fontSize: "18px", fontWeight: 700 }}>
          {title}
        </h3>

        <div style={{ marginBottom: "14px" }}>
          <label
            style={{
              fontSize: "13px",
              fontWeight: 500,
              display: "block",
              marginBottom: "6px",
            }}
          >
            Name
          </label>
          <input
            style={inputStyle}
            value={data.name}
            onChange={(e) => setData({ ...data, name: e.target.value })}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            marginBottom: "14px",
          }}
        >
          <div>
            <label
              style={{
                fontSize: "13px",
                fontWeight: 500,
                display: "block",
                marginBottom: "6px",
              }}
            >
              Type
            </label>
            <select
              style={selectStyle}
              value={data.type}
              onChange={(e) => setData({ ...data, type: e.target.value })}
            >
              {TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label
              style={{
                fontSize: "13px",
                fontWeight: 500,
                display: "block",
                marginBottom: "6px",
              }}
            >
              Fuel
            </label>
            <select
              style={selectStyle}
              value={data.fuel_type}
              onChange={(e) => setData({ ...data, fuel_type: e.target.value })}
            >
              {FUELS.map((f) => (
                <option key={f}>{f}</option>
              ))}
            </select>
          </div>
          <div>
            <label
              style={{
                fontSize: "13px",
                fontWeight: 500,
                display: "block",
                marginBottom: "6px",
              }}
            >
              Seats
            </label>
            <input
              style={inputStyle}
              type="number"
              value={data.seats}
              onChange={(e) => setData({ ...data, seats: e.target.value })}
            />
          </div>
          <div>
            <label
              style={{
                fontSize: "13px",
                fontWeight: 500,
                display: "block",
                marginBottom: "6px",
              }}
            >
              Price/day (NPR)
            </label>
            <input
              style={inputStyle}
              type="number"
              value={data.price_per_day}
              onChange={(e) =>
                setData({ ...data, price_per_day: e.target.value })
              }
            />
          </div>
        </div>

        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              fontSize: "13px",
              fontWeight: 500,
              display: "block",
              marginBottom: "6px",
            }}
          >
            Image URL (optional)
          </label>
          <input
            style={inputStyle}
            value={data.image_url || ""}
            onChange={(e) => setData({ ...data, image_url: e.target.value })}
          />
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button
            onClick={onSave}
            style={{
              flex: 1,
              background: "#2563eb",
              color: "#fff",
              border: "none",
              padding: "10px",
              borderRadius: "8px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Save
          </button>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              background: "#f1f5f9",
              color: "#64748b",
              border: "none",
              padding: "10px",
              borderRadius: "8px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(emptyForm);

  function load() {
    adminFetch("/api/admin/vehicles.php")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setVehicles(d.data);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleAdd() {
    const res = await adminFetch("/api/admin/vehicles.php", {
      method: "POST",
      body: JSON.stringify(form),
    });
    const d = await res.json();
    if (d.success) {
      setShowAdd(false);
      setForm(emptyForm);
      load();
    } else alert(d.message);
  }

  async function handleEdit() {
    const res = await adminFetch("/api/admin/vehicles.php", {
      method: "PUT",
      body: JSON.stringify(editing),
    });
    const d = await res.json();
    if (d.success) {
      setEditing(null);
      load();
    } else alert(d.message);
  }

  async function toggleAvailable(v) {
    // If activating, no check needed — just re-enable
    if (!v.available) {
      await adminFetch("/api/admin/vehicles.php", {
        method: "PUT",
        body: JSON.stringify({ id: v.id, available: 1 }),
      });
      load();
      return;
    }

    // If deactivating, ask for confirmation first
    const confirmed = window.confirm(
      `Are you sure you want to deactivate "${v.name}"?`,
    );
    if (!confirmed) return;

    // Send deactivate request — backend will check for active bookings
    const res = await adminFetch("/api/admin/vehicles.php", {
      method: "PUT",
      body: JSON.stringify({ id: v.id, available: 0 }),
    });
    const d = await res.json();

    if (!d.success) {
      // Show warning if vehicle has active bookings
      alert(d.message);
      return;
    }
    load();
  }

  async function handleDelete(id) {
    if (!confirm("Delete this vehicle?")) return;
    await adminFetch(`/api/admin/vehicles.php?id=${id}`, { method: "DELETE" });
    load();
  }

  const th = {
    padding: "12px 16px",
    textAlign: "left",
    fontWeight: 600,
    fontSize: "12px",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    borderBottom: "1px solid #e2e8f0",
  };
  const td = { padding: "14px 16px", color: "#64748b" };

  return (
    <div style={{ padding: "28px", background: "#f8fafc", minHeight: "100vh" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "22px",
            fontWeight: 700,
            color: "#1e293b",
          }}
        >
          Manage Vehicles
        </h2>
        <button
          onClick={() => setShowAdd(true)}
          style={{
            background: "#2563eb",
            color: "#fff",
            border: "none",
            padding: "10px 20px",
            borderRadius: "8px",
            fontWeight: 600,
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          + Add Vehicle
        </button>
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: "10px",
          border: "1px solid #e2e8f0",
          overflow: "hidden",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "14px",
          }}
        >
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              {[
                "Name",
                "Type",
                "Fuel",
                "Seats",
                "Price/day",
                "Status",
                "Actions",
              ].map((h) => (
                <th key={h} style={th}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="7"
                  style={{
                    padding: "24px",
                    textAlign: "center",
                    color: "#64748b",
                  }}
                >
                  Loading...
                </td>
              </tr>
            ) : (
              vehicles.map((v, i) => (
                <tr
                  key={v.id}
                  style={{
                    borderBottom:
                      i < vehicles.length - 1 ? "1px solid #f1f5f9" : "none",
                  }}
                >
                  <td style={{ ...td, fontWeight: 500, color: "#1e293b" }}>
                    {v.name}
                  </td>
                  <td style={td}>{v.type}</td>
                  <td style={td}>{v.fuel_type}</td>
                  <td style={td}>{v.seats}</td>
                  <td style={td}>
                    NPR {Number(v.price_per_day).toLocaleString()}
                  </td>
                  <td style={td}>
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: 600,
                        background: v.available ? "#f0fdf4" : "#fef2f2",
                        color: v.available ? "#15803d" : "#b91c1c",
                      }}
                    >
                      {v.available ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td style={td}>
                    <button
                      onClick={() => setEditing({ ...v })}
                      style={{
                        background: "none",
                        border: "1px solid #e2e8f0",
                        borderRadius: "6px",
                        padding: "6px 10px",
                        cursor: "pointer",
                        marginRight: "8px",
                        color: "#64748b",
                      }}
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => toggleAvailable(v)}
                      style={{
                        background: "none",
                        border: "1px solid #e2e8f0",
                        borderRadius: "6px",
                        padding: "6px 10px",
                        cursor: "pointer",
                        color: v.available ? "#b91c1c" : "#15803d",
                      }}
                    >
                      ⏻
                    </button>
                    <button
                      onClick={() => handleDelete(v.id)}
                      style={{
                        background: "none",
                        border: "1px solid #fecaca",
                        borderRadius: "6px",
                        padding: "6px 10px",
                        cursor: "pointer",
                        color: "#b91c1c",
                        marginLeft: "8px",
                      }}
                    >
                      🗑
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <VehicleForm
          title="Add Vehicle"
          data={form}
          setData={setForm}
          onSave={handleAdd}
          onCancel={() => setShowAdd(false)}
        />
      )}
      {editing && (
        <VehicleForm
          title="Edit Vehicle"
          data={editing}
          setData={setEditing}
          onSave={handleEdit}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  );
}
