"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import EventList from "./EventList";
import EventForm from "./EventForm";
import GuestManager from "./GuestManager";

export type Event = {
  id: number;
  title: string;
  eventType: string;
  ownerName: string;
  date: string;
  time: string;
  venue: string;
  rsvpDeadline: string;
  emailSubject: string | null;
  emailBody: string | null;
  saveDateMessage: string | null;
  rsvpMessage: string | null;
  createdAt: string;
};

type View = "events" | "create-event" | "edit-event" | "guests";

export default function AdminDashboard({ username }: { username: string }) {
  const router = useRouter();
  const [view, setView] = useState<View>("events");
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/events");
      if (res.ok) setEvents(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  }

  function goToGuests(event: Event) {
    setSelectedEvent(event);
    setView("guests");
  }

  function goToEdit(event: Event) {
    setSelectedEvent(event);
    setView("edit-event");
  }

  async function handleDeleteEvent(id: number) {
    if (!confirm("Delete this event and all its guests? This cannot be undone.")) return;
    const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
    if (res.ok) {
      showToast("Event deleted");
      loadEvents();
    } else {
      showToast("Failed to delete event", "error");
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex" }}>
      {/* ── Sidebar ── */}
      <aside
        style={{
          width: 240,
          background: "rgba(13,27,42,0.95)",
          borderRight: "1px solid rgba(212,175,55,0.12)",
          display: "flex",
          flexDirection: "column",
          padding: "28px 16px",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 50,
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              width: 40,
              height: 40,
              background: "linear-gradient(135deg,#d4af37,#b8960c)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 10px",
              fontSize: 16,
            }}
          >
            ✦
          </div>
          <h1
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: 18,
              color: "var(--gold)",
              fontStyle: "italic",
              margin: 0,
            }}
          >
            RSVP Studio
          </h1>
          <p style={{ fontSize: 11, color: "rgba(245,240,232,0.4)", margin: "4px 0 0" }}>
            Event Management
          </p>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
          <p
            style={{
              fontSize: 10,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "rgba(212,175,55,0.5)",
              padding: "0 16px",
              margin: "0 0 8px",
            }}
          >
            Navigation
          </p>
          <button
            className={`sidebar-link ${view === "events" ? "active" : ""}`}
            onClick={() => setView("events")}
          >
            <span>📅</span> Events
          </button>
          <button
            className={`sidebar-link ${view === "create-event" ? "active" : ""}`}
            onClick={() => setView("create-event")}
          >
            <span>➕</span> New Event
          </button>
          {selectedEvent && (
            <button
              className={`sidebar-link ${view === "guests" ? "active" : ""}`}
              onClick={() => setView("guests")}
            >
              <span>👥</span> Guests
            </button>
          )}
        </nav>

        {/* User */}
        <div
          style={{
            borderTop: "1px solid rgba(212,175,55,0.12)",
            paddingTop: 16,
            marginTop: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div
              style={{
                width: 32,
                height: 32,
                background: "linear-gradient(135deg,rgba(212,175,55,0.3),rgba(212,175,55,0.1))",
                border: "1px solid rgba(212,175,55,0.3)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                color: "var(--gold)",
                flexShrink: 0,
              }}
            >
              {username[0]?.toUpperCase()}
            </div>
            <div>
              <p style={{ fontSize: 13, color: "var(--offwhite)", margin: 0 }}>{username}</p>
              <p style={{ fontSize: 11, color: "rgba(245,240,232,0.4)", margin: 0 }}>
                Administrator
              </p>
            </div>
          </div>
          <button className="sidebar-link" onClick={handleLogout}>
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main style={{ marginLeft: 240, flex: 1, padding: "32px 32px 32px" }}>
        {view === "events" && (
          <EventList
            events={events}
            loading={loading}
            onRefresh={loadEvents}
            onCreateNew={() => setView("create-event")}
            onManageGuests={goToGuests}
            onEdit={goToEdit}
            onDelete={handleDeleteEvent}
            showToast={showToast}
          />
        )}

        {view === "create-event" && (
          <EventForm
            mode="create"
            onSuccess={(newEvent: Event) => {
              showToast("Event created successfully!");
              loadEvents();
              setSelectedEvent(newEvent);
              setView("guests");
            }}
            onCancel={() => setView("events")}
            showToast={showToast}
          />
        )}

        {view === "edit-event" && selectedEvent && (
          <EventForm
            mode="edit"
            event={selectedEvent}
            onSuccess={(updatedEvent: Event) => {
              showToast("Event updated successfully!");
              loadEvents();
              setSelectedEvent(updatedEvent);
              setView("events");
            }}
            onCancel={() => setView("events")}
            showToast={showToast}
          />
        )}

        {view === "guests" && selectedEvent && (
          <GuestManager
            event={selectedEvent}
            onBack={() => setView("events")}
            showToast={showToast}
          />
        )}
      </main>

      {/* ── Toast ── */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          <span>{toast.type === "success" ? "✓" : "✕"}</span>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
