"use client";

import { type Event } from "./AdminDashboard";

interface Props {
  events: Event[];
  loading: boolean;
  onRefresh: () => void;
  onCreateNew: () => void;
  onManageGuests: (event: Event) => void;
  onEdit: (event: Event) => void;
  onDelete: (id: number) => void;
  showToast: (msg: string, type?: "success" | "error") => void;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function EventList({
  events,
  loading,
  onCreateNew,
  onManageGuests,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 32,
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: 28,
              color: "var(--gold)",
              margin: "0 0 4px",
              fontStyle: "italic",
            }}
          >
            Your Events
          </h2>
          <p style={{ color: "var(--offwhite-dim)", fontSize: 14, margin: 0 }}>
            {events.length} event{events.length !== 1 ? "s" : ""} created
          </p>
        </div>
        <button className="btn-gold" onClick={onCreateNew}>
          ✦ Create New Event
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: "var(--gold)" }}>
          <div style={{ fontSize: 32, marginBottom: 16, opacity: 0.5 }}>◌</div>
          <p style={{ color: "var(--offwhite-dim)", fontSize: 14 }}>Loading events…</p>
        </div>
      ) : events.length === 0 ? (
        <div
          className="glass-card"
          style={{ padding: "80px 40px", textAlign: "center" }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎪</div>
          <h3
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: 22,
              color: "var(--gold)",
              margin: "0 0 8px",
              fontStyle: "italic",
            }}
          >
            No events yet
          </h3>
          <p style={{ color: "var(--offwhite-dim)", fontSize: 14, marginBottom: 24 }}>
            Create your first event to start sending beautiful invitations.
          </p>
          <button className="btn-gold" onClick={onCreateNew}>
            ✦ Create Your First Event
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onManageGuests={onManageGuests}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EventCard({
  event,
  onManageGuests,
  onEdit,
  onDelete,
}: {
  event: Event;
  onManageGuests: (e: Event) => void;
  onEdit: (e: Event) => void;
  onDelete: (id: number) => void;
}) {
  const isPast = new Date(event.rsvpDeadline) < new Date();

  return (
    <div
      className="glass-card"
      style={{
        padding: "24px 28px",
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: 24,
        alignItems: "center",
        transition: "all 0.3s ease",
      }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <h3
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: 20,
              color: "var(--offwhite)",
              margin: 0,
              fontStyle: "italic",
            }}
          >
            {event.title}
          </h3>
          <span
            style={{
              background: isPast
                ? "rgba(239,68,68,0.15)"
                : "rgba(16,185,129,0.12)",
              border: `1px solid ${isPast ? "rgba(239,68,68,0.3)" : "rgba(16,185,129,0.3)"}`,
              color: isPast ? "#ef4444" : "#34d399",
              borderRadius: 20,
              padding: "2px 10px",
              fontSize: 11,
              fontWeight: 500,
            }}
          >
            {isPast ? "Closed" : "Active"}
          </span>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 20px" }}>
          {[
            { icon: "🎭", label: event.eventType },
            { icon: "📅", label: formatDate(event.date) },
            { icon: "⏰", label: event.time },
            { icon: "📍", label: event.venue },
            { icon: "🗓", label: `RSVP by ${formatDate(event.rsvpDeadline)}` },
          ].map(({ icon, label }) => (
            <span
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: 13,
                color: "var(--offwhite-dim)",
              }}
            >
              <span>{icon}</span> {label}
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <button
          className="btn-gold"
          style={{ padding: "9px 18px", fontSize: 13 }}
          onClick={() => onManageGuests(event)}
        >
          👥 Guests
        </button>
        <button className="btn-outline" style={{ padding: "9px 16px", fontSize: 13 }} onClick={() => onEdit(event)}>
          ✏️ Edit
        </button>
        <button
          className="btn-danger"
          style={{ padding: "9px 14px", fontSize: 13 }}
          onClick={() => onDelete(event.id)}
        >
          🗑
        </button>
      </div>
    </div>
  );
}
