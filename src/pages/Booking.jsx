import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Footer from "../component/Footer";

const TERMS = [
  {
    title: "Payment & Cancellation Policy",
    body: "Full payment is required at booking confirmation via eSewa or Khalti. Cancellations made 48+ hours before pickup receive a refund minus NPR 200 processing fee. Cancellations within 24–48 hours receive a 50% refund. No refund for cancellations under 24 hours or no-shows.",
  },
  {
    title: "Vehicle Return Rules",
    body: "The vehicle must be returned by the agreed date and time with the same fuel level as at pickup. Late returns incur the daily rate per extra day. Failure to return within 24 hours of the agreed time without notice is considered unauthorised use.",
  },
  {
    title: "User Responsibilities During Rental",
    body: "You are responsible for all fines, penalties, and damage during the rental period. The vehicle must not be used for racing, off-road driving, transporting illegal goods, or driven under the influence. A refundable security deposit is collected at handover and returned within 5 business days after return.",
  },
  {
    title: "Eligibility",
    body: "You must be at least 18 years old and hold a valid driving licence for the vehicle type rented. A government-issued photo ID and valid licence must be presented at vehicle handover. Failure to provide valid documents will result in cancellation without refund.",
  },
];

export default function Booking() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const vehicle = state?.vehicle;
  const [agreed, setAgreed] = useState(false);

  if (!vehicle) {
    return (
      <div style={{ padding: "60px", textAlign: "center" }}>
        <h2 style={{ color: "#1e293b" }}>No vehicle selected.</h2>
        <button
          onClick={() => navigate("/vehicles")}
          style={{
            marginTop: "16px",
            padding: "10px 24px",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Browse Vehicles
        </button>
      </div>
    );
  }

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh" }}>
      <div
        style={{ maxWidth: "760px", margin: "0 auto", padding: "40px 24px" }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            padding: "24px",
            marginBottom: "28px",
            display: "flex",
            gap: "20px",
            alignItems: "center",
          }}
        >
          <img
            src={
              vehicle.image_url || "https://placehold.co/120x80?text=No+Image"
            }
            alt={vehicle.name}
            style={{
              width: "120px",
              height: "80px",
              objectFit: "cover",
              borderRadius: "8px",
            }}
          />
          <div>
            <h2
              style={{ margin: "0 0 6px", fontSize: "20px", color: "#1e293b" }}
            >
              {vehicle.name}
            </h2>
            <p
              style={{ margin: "0 0 4px", color: "#64748b", fontSize: "14px" }}
            >
              {vehicle.type} · {vehicle.fuel_type} · {vehicle.seats} seats
            </p>
            <p
              style={{
                margin: 0,
                fontWeight: 700,
                color: "#2563eb",
                fontSize: "16px",
              }}
            >
              NPR {Number(vehicle.price_per_day).toLocaleString()} / day
            </p>
          </div>
        </div>

        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            padding: "28px",
            marginBottom: "24px",
          }}
        >
          <h3
            style={{
              margin: "0 0 20px",
              fontSize: "18px",
              fontWeight: 700,
              color: "#1e293b",
            }}
          >
            Terms & Conditions
          </h3>
          <p style={{ margin: "0 0 20px", color: "#64748b", fontSize: "14px" }}>
            Please read all terms carefully before confirming your booking.
          </p>

          {TERMS.map((t, i) => (
            <div
              key={i}
              style={{
                marginBottom: "20px",
                paddingBottom: "20px",
                borderBottom:
                  i < TERMS.length - 1 ? "1px solid #f1f5f9" : "none",
              }}
            >
              <h4
                style={{
                  margin: "0 0 8px",
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "#1e293b",
                }}
              >
                {i + 1}. {t.title}
              </h4>
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  color: "#64748b",
                  lineHeight: "1.6",
                }}
              >
                {t.body}
              </p>
            </div>
          ))}

          <div
            onClick={() => setAgreed(!agreed)}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              marginTop: "24px",
              cursor: "pointer",
              padding: "16px",
              background: agreed ? "#f0fdf4" : "#f8fafc",
              borderRadius: "8px",
              border: `1px solid ${agreed ? "#86efac" : "#e2e8f0"}`,
            }}
          >
            <div
              style={{
                width: "20px",
                height: "20px",
                borderRadius: "4px",
                border: `2px solid ${agreed ? "#16a34a" : "#cbd5e1"}`,
                background: agreed ? "#16a34a" : "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                marginTop: "1px",
              }}
            >
              {agreed && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 6l3 3 5-5"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
            <p
              style={{
                margin: 0,
                fontSize: "14px",
                color: "#1e293b",
                lineHeight: "1.5",
              }}
            >
              I have read and agree to the Terms & Conditions above. I
              understand the payment, cancellation, and vehicle return policies.
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={() => navigate("/vehicles")}
            style={{
              flex: 1,
              padding: "12px",
              background: "#f1f5f9",
              color: "#64748b",
              border: "none",
              borderRadius: "8px",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "15px",
            }}
          >
            ← Back
          </button>
          <button
            disabled={!agreed}
            onClick={() =>
              alert("Booking confirmed! Payment integration coming soon.")
            }
            style={{
              flex: 2,
              padding: "12px",
              background: agreed ? "#2563eb" : "#cbd5e1",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontWeight: 600,
              cursor: agreed ? "pointer" : "not-allowed",
              fontSize: "15px",
            }}
          >
            Confirm Booking →
          </button>
        </div>

        {!agreed && (
          <p
            style={{
              textAlign: "center",
              color: "#ef4444",
              fontSize: "13px",
              marginTop: "10px",
            }}
          >
            You must agree to the Terms & Conditions to proceed.
          </p>
        )}
      </div>
      <Footer />
    </div>
  );
}
