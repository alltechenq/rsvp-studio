"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Login failed");
      } else {
        router.push("/admin");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background orbs */}
      <div
        style={{
          position: "absolute",
          top: "15%",
          right: "15%",
          width: 320,
          height: 320,
          background: "radial-gradient(circle, rgba(212,175,55,0.07) 0%, transparent 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "20%",
          left: "10%",
          width: 250,
          height: 250,
          background: "radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 70%)",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />

      <div className="w-full max-w-md animate-fade-in-up">
        {/* Logo / Header */}
        <div className="text-center mb-10">
          <div
            style={{
              width: 64,
              height: 64,
              background: "linear-gradient(135deg, #d4af37 0%, #b8960c 100%)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
              fontSize: 28,
              boxShadow: "0 8px 24px rgba(212,175,55,0.3)",
            }}
          >
            ✦
          </div>
          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 36,
              fontWeight: 700,
              color: "var(--gold)",
              margin: "0 0 8px",
              fontStyle: "italic",
            }}
          >
            RSVP Studio
          </h1>
          <p style={{ color: "var(--offwhite-dim)", fontSize: 14 }}>
            Admin Portal · Sign in to continue
          </p>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="label">Username</label>
              <input
                type="text"
                className="input-field"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
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
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span>⚠</span> {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-gold"
              style={{ justifyContent: "center", marginTop: 4 }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span style={{ opacity: 0.7 }}>Signing in…</span>
                </>
              ) : (
                <>Sign In →</>
              )}
            </button>
          </form>

          <div
            style={{
              marginTop: 28,
              paddingTop: 24,
              borderTop: "1px solid rgba(212,175,55,0.12)",
            }}
          >
            <p style={{ color: "rgba(245,240,232,0.4)", fontSize: 12, textAlign: "center" }}>
              First time?{" "}
              <a
                href="/admin/setup"
                style={{ color: "var(--gold)", textDecoration: "none" }}
              >
                Set up your account
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
