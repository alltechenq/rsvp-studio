"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function SetupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "", confirm: "", setupKey: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          password: form.password,
          setupKey: form.setupKey,
        }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error ?? "Setup failed");
      else router.push("/admin/login");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in-up">
        <div className="text-center mb-10">
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 32,
              color: "var(--gold)",
              fontStyle: "italic",
              margin: "0 0 8px",
            }}
          >
            Initial Setup
          </h1>
          <p style={{ color: "var(--offwhite-dim)", fontSize: 14 }}>
            Create your admin account
          </p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="label">Setup Key</label>
              <input
                type="password"
                className="input-field"
                placeholder="Enter setup key (default: rsvp-setup-2024)"
                value={form.setupKey}
                onChange={(e) => setForm({ ...form, setupKey: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Username</label>
              <input
                type="text"
                className="input-field"
                placeholder="Choose a username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="Repeat password"
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                required
              />
            </div>
            {error && (
              <div
                style={{
                  background: "rgba(220,38,38,0.12)",
                  border: "1px solid rgba(220,38,38,0.3)",
                  borderRadius: 10,
                  padding: "12px 16px",
                  color: "#ef4444",
                  fontSize: 13,
                }}
              >
                ⚠ {error}
              </div>
            )}
            <button
              type="submit"
              className="btn-gold"
              style={{ justifyContent: "center" }}
              disabled={loading}
            >
              {loading ? "Creating…" : "Create Admin Account →"}
            </button>
          </form>

          <p
            style={{
              marginTop: 20,
              fontSize: 12,
              color: "rgba(245,240,232,0.4)",
              textAlign: "center",
            }}
          >
            Already have an account?{" "}
            <a href="/admin/login" style={{ color: "var(--gold)", textDecoration: "none" }}>
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
