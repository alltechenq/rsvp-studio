"use client";

import { useEffect, useState } from "react";

interface Props {
  guest: {
    id: number;
    groupName: string;
    totalAllowed: number;
    status: string;
  };
  event: {
    title: string;
    eventType: string;
    ownerName: string;
    date: string;
    time: string;
    venue: string;
    rsvpDeadline: string;
  };
  hasResponded: boolean;
  existingResponses: Array<{ id: number; guestName: string; isAttending: boolean }>;
  isDeadlinePassed: boolean;
  onRSVP: () => void;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(t: string) {
  const [h, m] = t.split(":");
  const d = new Date();
  d.setHours(Number(h), Number(m));
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

export default function InvitationCard({
  guest,
  event,
  hasResponded,
  existingResponses,
  isDeadlinePassed,
  onRSVP,
}: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="invitation-card"
      style={{
        maxWidth: 520,
        width: "100%",
        padding: "48px 40px",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0) scale(1)" : "translateY(24px) scale(0.97)",
        transition: "opacity 0.7s ease, transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* Top decoration */}
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <p
          style={{
            fontSize: 11,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "rgba(212,175,55,0.6)",
            margin: "0 0 16px",
          }}
        >
          Personal Invitation
        </p>
        <div className="gold-divider" style={{ marginBottom: 20 }} />
        <h1
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 38,
            color: "var(--gold)",
            fontStyle: "italic",
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          {event.eventType}
        </h1>
      </div>

      {/* Salutation */}
      <p
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 18,
          color: "var(--offwhite)",
          fontStyle: "italic",
          marginBottom: 16,
          textAlign: "center",
        }}
      >
        Dear {guest.groupName},
      </p>

      <p
        style={{
          color: "var(--offwhite-dim)",
          fontSize: 15,
          lineHeight: 1.8,
          textAlign: "center",
          marginBottom: 32,
        }}
      >
        We joyfully invite you to celebrate the{" "}
        <span style={{ color: "var(--gold)" }}>{event.eventType}</span> of{" "}
        <span
          style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle: "italic",
            color: "var(--offwhite)",
          }}
        >
          {event.ownerName}
        </span>
        .
      </p>

      {/* Event Details Card */}
      <div
        style={{
          background: "rgba(212,175,55,0.06)",
          border: "1px solid rgba(212,175,55,0.2)",
          borderRadius: 14,
          padding: "24px 28px",
          marginBottom: 36,
        }}
      >
        {[
          { icon: "📅", label: "Date", value: formatDate(event.date) },
          { icon: "⏰", label: "Time", value: formatTime(event.time) },
          { icon: "📍", label: "Venue", value: event.venue },
          {
            icon: "🗓",
            label: "RSVP By",
            value: formatDate(event.rsvpDeadline),
            warning: isDeadlinePassed,
          },
        ].map(({ icon, label, value, warning }) => (
          <div
            key={label}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              padding: "10px 0",
              borderBottom: "1px solid rgba(212,175,55,0.08)",
            }}
          >
            <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{icon}</span>
            <div>
              <p
                style={{
                  fontSize: 10,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  color: "var(--gold)",
                  margin: "0 0 2px",
                  fontWeight: 500,
                }}
              >
                {label}
              </p>
              <p
                style={{
                  fontSize: 14,
                  color: warning ? "#f59e0b" : "var(--offwhite)",
                  margin: 0,
                  fontWeight: warning ? 500 : 400,
                }}
              >
                {value}
                {warning && " ⚠ Deadline passed"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Already responded state */}
      {hasResponded && (
        <div
          style={{
            background: "rgba(16,185,129,0.08)",
            border: "1px solid rgba(16,185,129,0.25)",
            borderRadius: 10,
            padding: "14px 20px",
            marginBottom: 20,
          }}
        >
          <p
            style={{
              fontSize: 13,
              color: "#34d399",
              margin: "0 0 8px",
              fontWeight: 500,
            }}
          >
            ✓ You&apos;ve already responded
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {existingResponses.map((r) => (
              <span
                key={r.id}
                style={{
                  background: r.isAttending
                    ? "rgba(16,185,129,0.12)"
                    : "rgba(239,68,68,0.1)",
                  border: `1px solid ${r.isAttending ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
                  color: r.isAttending ? "#34d399" : "#ef4444",
                  borderRadius: 8,
                  padding: "3px 10px",
                  fontSize: 12,
                }}
              >
                {r.isAttending ? "✓" : "✕"} {r.guestName}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div style={{ textAlign: "center" }}>
        {isDeadlinePassed ? (
          <div>
            <p style={{ color: "#f59e0b", fontSize: 14, marginBottom: 8 }}>
              ⚠ The RSVP deadline has passed
            </p>
            <p style={{ color: "rgba(245,240,232,0.4)", fontSize: 13 }}>
              Please contact the host directly for any inquiries.
            </p>
          </div>
        ) : (
          <button
            className="btn-gold animate-pulse-gold"
            style={{ fontSize: 15, padding: "15px 48px" }}
            onClick={onRSVP}
          >
            {hasResponded ? "Update My RSVP ✦" : "RSVP Now ✦"}
          </button>
        )}
      </div>

      {/* Footer signature */}
      <div style={{ textAlign: "center", marginTop: 36 }}>
        <div className="gold-divider" style={{ marginBottom: 16 }} />
        <p
          style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle: "italic",
            fontSize: 15,
            color: "rgba(212,175,55,0.6)",
          }}
        >
          — {event.ownerName}
        </p>
      </div>
    </div>
  );
}
