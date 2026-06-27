"use client";

import { useState, FormEvent } from "react";
import { type Event } from "./AdminDashboard";

interface Props {
  mode: "create" | "edit";
  event?: Event;
  onSuccess: (event: Event) => void;
  onCancel: () => void;
  showToast: (msg: string, type?: "success" | "error") => void;
}

const defaultForm = {
  title: "",
  eventType: "",
  ownerName: "",
  date: "",
  time: "",
  venue: "",
  rsvpDeadline: "",
  emailSubject: "",
  emailBody: "",
  saveDateMessage: "",
  rsvpMessage: "",
};

export default function EventForm({ mode, event, onSuccess, onCancel, showToast }: Props) {
  const [form, setForm] = useState(
    event
      ? {
          title: event.title,
          eventType: event.eventType,
          ownerName: event.ownerName,
          date: event.date,
          time: event.time,
          venue: event.venue,
          rsvpDeadline: event.rsvpDeadline,
          emailSubject: event.emailSubject ?? "",
          emailBody: event.emailBody ?? "",
          saveDateMessage: event.saveDateMessage ?? "",
          rsvpMessage: event.rsvpMessage ?? "",
        }
      : defaultForm
  );
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "messages">("details");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const url = mode === "create" ? "/api/events" : `/api/events/${event!.id}`;
      const method = mode === "create" ? "POST" : "PUT";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) showToast(data.error ?? "Error saving event", "error");
      else onSuccess(data as Event);
    } catch {
      showToast("Network error", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <button className="btn-ghost" onClick={onCancel} style={{ marginBottom: 12 }}>
          ← Back
        </button>
        <h2
          style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: 28,
            color: "var(--gold)",
            margin: "0 0 4px",
            fontStyle: "italic",
          }}
        >
          {mode === "create" ? "Create New Event" : "Edit Event"}
        </h2>
        <p style={{ color: "var(--offwhite-dim)", fontSize: 14, margin: 0 }}>
          {mode === "create" ? "Set up your event details and messaging" : "Update event information"}
        </p>
      </div>

      {/* Tabs */}
      <div className="tab-bar" style={{ marginBottom: 28, maxWidth: 400 }}>
        <button
          className={`tab-btn ${activeTab === "details" ? "active" : ""}`}
          onClick={() => setActiveTab("details")}
        >
          📋 Event Details
        </button>
        <button
          className={`tab-btn ${activeTab === "messages" ? "active" : ""}`}
          onClick={() => setActiveTab("messages")}
        >
          💬 Messages
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {activeTab === "details" && (
          <div className="glass-card" style={{ padding: 32 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 24,
              }}
            >
              <div style={{ gridColumn: "1/-1" }}>
                <label className="label">Event Title</label>
                <input
                  className="input-field"
                  placeholder="e.g. The Andersons' Wedding Celebration"
                  value={form.title}
                  onChange={set("title")}
                  required
                />
              </div>

              <div>
                <label className="label">Event Type</label>
                <select className="input-field" value={form.eventType} onChange={set("eventType")} required>
                  <option value="">Select type…</option>
                  {["Wedding", "Birthday", "Baby Shower", "Anniversary", "Graduation", "Engagement", "Corporate Event", "Other"].map(
                    (t) => <option key={t} value={t}>{t}</option>
                  )}
                </select>
              </div>

              <div>
                <label className="label">Host / Owner Name</label>
                <input
                  className="input-field"
                  placeholder="e.g. Sarah & Michael"
                  value={form.ownerName}
                  onChange={set("ownerName")}
                  required
                />
              </div>

              <div>
                <label className="label">Event Date</label>
                <input
                  type="date"
                  className="input-field"
                  value={form.date}
                  onChange={set("date")}
                  required
                />
              </div>

              <div>
                <label className="label">Event Time</label>
                <input
                  type="time"
                  className="input-field"
                  value={form.time}
                  onChange={set("time")}
                  required
                />
              </div>

              <div style={{ gridColumn: "1/-1" }}>
                <label className="label">Venue / Location</label>
                <input
                  className="input-field"
                  placeholder="e.g. The Grand Ballroom, 123 Elm Street, New York"
                  value={form.venue}
                  onChange={set("venue")}
                  required
                />
              </div>

              <div>
                <label className="label">RSVP Deadline</label>
                <input
                  type="date"
                  className="input-field"
                  value={form.rsvpDeadline}
                  onChange={set("rsvpDeadline")}
                  required
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "messages" && (
          <div className="glass-card" style={{ padding: 32 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div>
                <label className="label">Email Subject Line</label>
                <input
                  className="input-field"
                  placeholder="e.g. You're Invited – Sarah & Michael's Wedding"
                  value={form.emailSubject}
                  onChange={set("emailSubject")}
                />
              </div>

              <div>
                <label className="label">
                  Save the Date — WhatsApp Message Template
                </label>
                <p style={{ fontSize: 12, color: "var(--offwhite-dim)", marginBottom: 8 }}>
                  Use <code style={{ color: "var(--gold)" }}>{"{name}"}</code> and{" "}
                  <code style={{ color: "var(--gold)" }}>{"{link}"}</code> as placeholders.
                </p>
                <textarea
                  className="input-field"
                  rows={4}
                  placeholder={`Hi {name}! 🎉 Please Save the Date for our special celebration.\n\nView details & RSVP here: {link}`}
                  value={form.saveDateMessage}
                  onChange={set("saveDateMessage")}
                  style={{ resize: "vertical" }}
                />
              </div>

              <div>
                <label className="label">
                  RSVP — WhatsApp Message Template
                </label>
                <textarea
                  className="input-field"
                  rows={4}
                  placeholder={`Dear {name}, you're formally invited! 🥂\n\nPlease RSVP by clicking your exclusive link: {link}\n\nWe hope to see you there!`}
                  value={form.rsvpMessage}
                  onChange={set("rsvpMessage")}
                  style={{ resize: "vertical" }}
                />
              </div>
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
          <button type="submit" className="btn-gold" disabled={loading}>
            {loading ? "Saving…" : mode === "create" ? "✦ Create Event →" : "✦ Save Changes →"}
          </button>
          <button type="button" className="btn-outline" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
