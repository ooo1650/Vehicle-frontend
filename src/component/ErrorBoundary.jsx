// src/component/ErrorBoundary.jsx
// SCRUM-75: Handle exception cases
// Wrap any page or component to catch unexpected JS errors gracefully
// Usage: <ErrorBoundary> <YourPage /> </ErrorBoundary>

import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log to console — swap with your logging service if needed
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    // Navigate back or reload
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.href = "/dashboard";
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI — or use props.fallback if passed
      if (this.props.fallback) return this.props.fallback;

      return (
        <div style={styles.wrapper}>
          <div style={styles.card}>
            <div style={styles.icon}>⚠️</div>
            <h2 style={styles.title}>Something went wrong</h2>
            <p style={styles.msg}>
              An unexpected error occurred. Please try again or go back to the dashboard.
            </p>
            {/* Show error detail only in development */}
            {import.meta.env.DEV && (
              <pre style={styles.detail}>
                {this.state.error?.message}
              </pre>
            )}
            <div style={styles.actions}>
              <button style={styles.btnPrimary} onClick={this.handleReset}>
                Go to Dashboard
              </button>
              <button style={styles.btnSecondary} onClick={() => window.location.reload()}>
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f3f4f6",
    padding: 24,
    fontFamily: "'DM Sans','Segoe UI',sans-serif",
  },
  card: {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: "48px 40px",
    maxWidth: 480,
    width: "100%",
    textAlign: "center",
    boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
  },
  icon:  { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: 700, color: "#111827", margin: "0 0 12px" },
  msg:   { fontSize: 15, color: "#6b7280", margin: "0 0 24px", lineHeight: 1.6 },
  detail: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: 8,
    padding: "12px 16px",
    fontSize: 12,
    color: "#b91c1c",
    textAlign: "left",
    marginBottom: 24,
    overflowX: "auto",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  actions: { display: "flex", gap: 12, justifyContent: "center" },
  btnPrimary: {
    padding: "10px 24px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  btnSecondary: {
    padding: "10px 24px",
    background: "transparent",
    color: "#374151",
    border: "1px solid #d1d5db",
    borderRadius: 10,
    fontSize: 14,
    cursor: "pointer",
  },
};