"use client";

import { useState } from "react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      window.location.href = "/";
    } else {
      setError("Fel lösenord");
    }
    setLoading(false);
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f5f5f5",
      fontFamily: "system-ui, sans-serif",
    }}>
      <form onSubmit={handleSubmit} style={{
        backgroundColor: "white",
        borderRadius: 12,
        padding: 40,
        boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
        width: 340,
        textAlign: "center",
      }}>
        <h1 style={{ fontSize: 24, marginBottom: 8 }}>Team Dashboard</h1>
        <p style={{ color: "#888", fontSize: 14, marginBottom: 24 }}>Ange lösenord för att komma åt dashboarden</p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Lösenord"
          autoFocus
          style={{
            width: "100%",
            padding: "12px 16px",
            fontSize: 16,
            border: "1px solid #ddd",
            borderRadius: 8,
            boxSizing: "border-box",
            marginBottom: 16,
          }}
        />

        <button type="submit" disabled={loading} style={{
          width: "100%",
          padding: "12px",
          fontSize: 15,
          fontWeight: 600,
          backgroundColor: "#1a1a2e",
          color: "white",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
        }}>
          {loading ? "Loggar in..." : "Logga in"}
        </button>

        {error && <p style={{ color: "#e74c3c", marginTop: 12, fontSize: 14 }}>{error}</p>}
      </form>
    </div>
  );
}
