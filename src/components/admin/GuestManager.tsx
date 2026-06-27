"use client";

import { useState, useEffect, useCallback } from "react";
import { type Event } from "./AdminDashboard";

interface Response {
  id: number;
  groupId: number;
  guestName: string;
  isAttending: boolean;
  respondedAt: string;
}

interface GuestGroup {
  id: number;
  eventId: number;
  groupName: string;
  phoneNumber: string | null;
  email: string | null;
  totalAllowed: number;
  uniqueToken: string;
  status: "Pending" | "Sent" | "Responded";
  createdAt: string;
  responses: Response[];
}

interface Stats {
  totalInvited: number;
  totalGroups: number;
  totalConfirmed: number;
  totalDeclined: number;
  totalPending: number;
  respondedGroups: number;
}

interface Props {
  event: Event;
  onBack: () => void;
  showToast: (msg: string, type?: "success" | "error") => void;
}

const BASE_URL =
  typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

function buildWhatsAppLink(
  phone: string,
  template: string,
  name: string,
  token: string
): string {
  const link = `${BASE_URL}/rsvp/${token}`;
  const message = template
    .replace(/\{name\}/g, name)
    .replace(/\{link\}/g, link);
  const cleaned = phone.replace(/\D/g, "");
  return `https://wa.me/${cleaned}?text=${encodeURIComponent(message)}`;
}

function defaultSaveDate(name: string): string {
  return `Hi ${name}! 🎉 Please Save the Date for our special celebration. View details here: ${BASE_URL}/rsvp/LINK`;
}

function defaultRsvp(name: string): string {
  return `Dear ${name}, you're formally invited! 🥂\n\nPlease RSVP here: ${BASE_URL}/rsvp/LINK\n\nWe hope to see you there!`;
}

export default function GuestManager({ event, onBack, showToast }: Props) {
  const [guests, setGuests] = useState<GuestGroup[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editGuest, setEditGuest] = useState<GuestGroup | null>(null);
  const [activeTab, setActiveTab] = useState<"guests" | "tracking">("tracking");
  const [sending, setSending] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [gRes, sRes] = await Promise.all([
      fetch(`/api/events/${event.id}/guests`),
      fetch(`/api/events/${event.id}/stats`),
    ]);
    if (gRes.ok) setGuests(await gRes.json());
    if (sRes.ok) setStats(await sRes.json());
    setLoading(false);
  }, [event.id]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(guestId: number) {
    if (!confirm("Remove this guest group?")) return;
    const res = await fetch(`/api/guests/${guestId}`, { method: "DELETE" });
    if (res.ok) { showToast("Guest removed"); load(); }
    else showToast("Failed to remove guest", "error");
  }

  async function sendEmail(guest: GuestGroup, isRsvp: boolean) {
    setSending(guest.id);
    try {
      const res = await fetch(`/api/guests/${guest.id}/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRsvp }),
      });
      const data = await res.json();
      if (res.ok) { showToast(`Email sent to ${guest.groupName}`); load(); }
      else showToast(data.error ?? "Email failed", "error");
    } finally {
      setSending(null);
    }
  }

  const rsvpLink = (token: string) => `${BASE_URL}/rsvp/${token}`;

  const saveDateTemplate = event.saveDateMessage ?? "";
  const rsvpTemplate = event.rsvpMessage ?? "";

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <button className="btn-ghost" onClick={onBack} style={{ marginBottom: 10 }}>
          ← Back to Events
        </button>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: 26,
                color: "var(--gold)",
                margin: "0 0 4px",
                fontStyle: "italic",
              }}
            >
              {event.title}
            </h2>
            <p style={{ color: "var(--offwhite-dim)", fontSize: 13, margin: 0 }}>
              🎭 {event.eventType} · 📅{" "}
              {new Date(event.date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}{" "}
              · 📍 {event.venue}
            </p>
          </div>
          <button className="btn-gold" onClick={() => setShowAddModal(true)}>
            + Add Guest Group
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-bar" style={{ marginBottom: 24, maxWidth: 360 }}>
        <button
          className={`tab-btn ${activeTab === "tracking" ? "active" : ""}`}
          onClick={() => setActiveTab("tracking")}
        >
          📊 Tracking
        </button>
        <button
          className={`tab-btn ${activeTab === "guests" ? "active" : ""}`}
          onClick={() => setActiveTab("guests")}
        >
          👥 Guest List
        </button>
      </div>

      {/* ─── Tracking Tab ─── */}
      {activeTab === "tracking" && stats && (
        <div>
          {/* Stat Cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: 16,
              marginBottom: 32,
            }}
          >
            {[
              { label: "Total Invited", value: stats.totalInvited, icon: "🎟", color: "var(--gold)" },
              { label: "Confirmed", value: stats.totalConfirmed, icon: "✅", color: "#34d399" },
              { label: "Declined", value: stats.totalDeclined, icon: "❌", color: "#ef4444" },
              { label: "Pending", value: stats.totalPending, icon: "⏳", color: "#f59e0b" },
              { label: "Groups Responded", value: `${stats.respondedGroups}/${stats.totalGroups}`, icon: "👥", color: "#60a5fa" },
            ].map(({ label, value, icon, color }) => (
              <div className="stat-card" key={label}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 22 }}>{icon}</span>
                  <span style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: "rgba(245,240,232,0.5)" }}>
                    {label}
                  </span>
                </div>
                <div
                  style={{
                    fontFamily: "'Playfair Display',serif",
                    fontSize: 36,
                    fontWeight: 700,
                    color,
                    lineHeight: 1,
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>

          {/* Capacity Progress */}
          {stats.totalInvited > 0 && (
            <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
              <h3
                style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: 18,
                  color: "var(--gold)",
                  margin: "0 0 20px",
                  fontStyle: "italic",
                }}
              >
                Attendance Overview
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  {
                    label: "Confirmed",
                    value: stats.totalConfirmed,
                    total: stats.totalInvited,
                    color: "#34d399",
                  },
                  {
                    label: "Declined",
                    value: stats.totalDeclined,
                    total: stats.totalInvited,
                    color: "#ef4444",
                  },
                  {
                    label: "Pending",
                    value: stats.totalPending,
                    total: stats.totalInvited,
                    color: "#f59e0b",
                  },
                ].map(({ label, value, total, color }) => (
                  <div key={label}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 6,
                        fontSize: 13,
                      }}
                    >
                      <span style={{ color: "var(--offwhite-dim)" }}>{label}</span>
                      <span style={{ color, fontWeight: 600 }}>
                        {value} / {total}
                      </span>
                    </div>
                    <div className="progress-bar-track">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${(value / total) * 100}%`,
                          background: `linear-gradient(90deg, ${color}99, ${color})`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Response List */}
          {guests.filter((g) => g.responses.length > 0).length > 0 && (
            <div className="glass-card" style={{ padding: 28 }}>
              <h3
                style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: 18,
                  color: "var(--gold)",
                  margin: "0 0 20px",
                  fontStyle: "italic",
                }}
              >
                Individual Responses
              </h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Guest Name</th>
                    <th>Group</th>
                    <th>Status</th>
                    <th>Responded</th>
                  </tr>
                </thead>
                <tbody>
                  {guests
                    .flatMap((g) =>
                      g.responses.map((r) => ({
                        ...r,
                        groupName: g.groupName,
                      }))
                    )
                    .map((r) => (
                      <tr key={r.id}>
                        <td style={{ color: "var(--offwhite)", fontWeight: 500 }}>
                          {r.guestName}
                        </td>
                        <td>{r.groupName}</td>
                        <td>
                          <span
                            className={`badge ${r.isAttending ? "badge-responded" : "badge-pending"}`}
                            style={
                              !r.isAttending
                                ? {
                                    background: "rgba(239,68,68,0.12)",
                                    color: "#ef4444",
                                    border: "1px solid rgba(239,68,68,0.3)",
                                  }
                                : {}
                            }
                          >
                            {r.isAttending ? "✓ Attending" : "✕ Not Attending"}
                          </span>
                        </td>
                        <td style={{ fontSize: 12 }}>
                          {new Date(r.respondedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── Guest List Tab ─── */}
      {activeTab === "guests" && (
        <div>
          {loading ? (
            <div style={{ textAlign: "center", padding: 60, color: "var(--offwhite-dim)" }}>
              Loading…
            </div>
          ) : guests.length === 0 ? (
            <div className="glass-card" style={{ padding: "60px 40px", textAlign: "center" }}>
              <p style={{ color: "var(--offwhite-dim)", fontSize: 15 }}>
                No guests added yet.
              </p>
              <button
                className="btn-gold"
                style={{ marginTop: 16 }}
                onClick={() => setShowAddModal(true)}
              >
                + Add First Guest
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {guests.map((guest) => (
                <GuestCard
                  key={guest.id}
                  guest={guest}
                  event={event}
                  rsvpLink={rsvpLink(guest.uniqueToken)}
                  saveDateTemplate={saveDateTemplate}
                  rsvpTemplate={rsvpTemplate}
                  onEdit={() => setEditGuest(guest)}
                  onDelete={() => handleDelete(guest.id)}
                  onSendEmail={sendEmail}
                  sending={sending === guest.id}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Add/Edit Modal ─── */}
      {(showAddModal || editGuest) && (
        <GuestModal
          eventId={event.id}
          guest={editGuest}
          onClose={() => { setShowAddModal(false); setEditGuest(null); }}
          onSuccess={() => {
            setShowAddModal(false);
            setEditGuest(null);
            showToast(editGuest ? "Guest updated" : "Guest added");
            load();
          }}
          showToast={showToast}
        />
      )}
    </div>
  );
}

/* ─────────────────── GuestCard ─────────────────── */

function GuestCard({
  guest,
  event,
  rsvpLink,
  saveDateTemplate,
  rsvpTemplate,
  onEdit,
  onDelete,
  onSendEmail,
  sending,
}: {
  guest: GuestGroup;
  event: Event;
  rsvpLink: string;
  saveDateTemplate: string;
  rsvpTemplate: string;
  onEdit: () => void;
  onDelete: () => void;
  onSendEmail: (guest: GuestGroup, isRsvp: boolean) => void;
  sending: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  const saveDateWA = guest.phoneNumber
    ? buildWhatsAppLink(
        guest.phoneNumber,
        saveDateTemplate || `Hi {name}! Please save the date. RSVP here: {link}`,
        guest.groupName,
        guest.uniqueToken
      )
    : null;

  const rsvpWA = guest.phoneNumber
    ? buildWhatsAppLink(
        guest.phoneNumber,
        rsvpTemplate || `Dear {name}, you're invited! RSVP here: {link}`,
        guest.groupName,
        guest.uniqueToken
      )
    : null;

  const statusClass =
    guest.status === "Responded"
      ? "badge-responded"
      : guest.status === "Sent"
      ? "badge-sent"
      : "badge-pending";

  return (
    <div className="glass-card" style={{ padding: "20px 24px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          cursor: "pointer",
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span
              style={{
                fontFamily: "'Playfair Display',serif",
                fontSize: 16,
                color: "var(--offwhite)",
                fontStyle: "italic",
              }}
            >
              {guest.groupName}
            </span>
            <span className={`badge ${statusClass}`}>{guest.status}</span>
            {guest.responses.length > 0 && (
              <span style={{ fontSize: 12, color: "var(--offwhite-dim)" }}>
                ({guest.responses.filter((r) => r.isAttending).length}/
                {guest.totalAllowed} attending)
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 16, fontSize: 12, color: "var(--offwhite-dim)" }}>
            {guest.email && <span>✉ {guest.email}</span>}
            {guest.phoneNumber && <span>📱 {guest.phoneNumber}</span>}
            <span>🎟 Up to {guest.totalAllowed} guests</span>
          </div>
        </div>
        <span
          style={{
            color: "var(--gold)",
            fontSize: 12,
            transition: "transform 0.2s",
            transform: expanded ? "rotate(180deg)" : "none",
          }}
        >
          ▼
        </span>
      </div>

      {expanded && (
        <div
          style={{
            marginTop: 16,
            paddingTop: 16,
            borderTop: "1px solid rgba(212,175,55,0.12)",
          }}
        >
          {/* RSVP Link */}
          <div
            style={{
              background: "rgba(212,175,55,0.06)",
              border: "1px solid rgba(212,175,55,0.15)",
              borderRadius: 10,
              padding: "12px 16px",
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span style={{ fontSize: 12, color: "var(--offwhite-dim)", flex: 1, wordBreak: "break-all" }}>
              🔗 {rsvpLink}
            </span>
            <button
              className="btn-ghost"
              style={{ fontSize: 11, padding: "6px 12px", flexShrink: 0 }}
              onClick={() => {
                navigator.clipboard.writeText(rsvpLink);
              }}
            >
              Copy
            </button>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {/* WhatsApp */}
            {saveDateWA && (
              <a
                href={saveDateWA}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp"
                style={{ fontSize: 12, padding: "8px 16px" }}
              >
                <span>📱</span> WhatsApp Save the Date
              </a>
            )}
            {rsvpWA && (
              <a
                href={rsvpWA}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp"
                style={{ fontSize: 12, padding: "8px 16px" }}
              >
                <span>📱</span> WhatsApp RSVP
              </a>
            )}

            {/* Email */}
            {guest.email && (
              <>
                <button
                  className="btn-outline"
                  style={{ fontSize: 12, padding: "8px 16px" }}
                  disabled={sending}
                  onClick={() => onSendEmail(guest, false)}
                >
                  ✉ Email Save the Date
                </button>
                <button
                  className="btn-outline"
                  style={{ fontSize: 12, padding: "8px 16px" }}
                  disabled={sending}
                  onClick={() => onSendEmail(guest, true)}
                >
                  ✉ Email RSVP
                </button>
              </>
            )}
          </div>

          {/* Responses */}
          {guest.responses.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: "var(--gold)", margin: "0 0 8px" }}>
                Responses
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {guest.responses.map((r) => (
                  <span
                    key={r.id}
                    style={{
                      background: r.isAttending ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                      border: `1px solid ${r.isAttending ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
                      color: r.isAttending ? "#34d399" : "#ef4444",
                      borderRadius: 8,
                      padding: "4px 12px",
                      fontSize: 12,
                    }}
                  >
                    {r.isAttending ? "✓" : "✕"} {r.guestName}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Edit/Delete */}
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-ghost" onClick={onEdit}>
              ✏️ Edit
            </button>
            <button className="btn-danger" onClick={onDelete}>
              🗑 Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────── GuestModal ─────────────────── */

function GuestModal({
  eventId,
  guest,
  onClose,
  onSuccess,
  showToast,
}: {
  eventId: number;
  guest: GuestGroup | null;
  onClose: () => void;
  onSuccess: () => void;
  showToast: (msg: string, type?: "success" | "error") => void;
}) {
  const [form, setForm] = useState({
    groupName: guest?.groupName ?? "",
    phoneNumber: guest?.phoneNumber ?? "",
    email: guest?.email ?? "",
    totalAllowed: String(guest?.totalAllowed ?? 1),
  });
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm({ ...form, [k]: e.target.value });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const url = guest
        ? `/api/guests/${guest.id}`
        : `/api/events/${eventId}/guests`;
      const method = guest ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          totalAllowed: Number(form.totalAllowed),
          status: guest?.status ?? "Pending",
        }),
      });
      const data = await res.json();
      if (!res.ok) showToast(data.error ?? "Error", "error");
      else onSuccess();
    } catch {
      showToast("Network error", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div
          style={{
            padding: "28px 32px 20px",
            borderBottom: "1px solid rgba(212,175,55,0.12)",
          }}
        >
          <h3
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: 22,
              color: "var(--gold)",
              margin: 0,
              fontStyle: "italic",
            }}
          >
            {guest ? "Edit Guest Group" : "Add Guest Group"}
          </h3>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "24px 32px 28px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <label className="label">Group Name / Head Guest</label>
              <input
                className="input-field"
                placeholder="e.g. The Smith Family"
                value={form.groupName}
                onChange={set("groupName")}
                required
              />
            </div>

            <div>
              <label className="label">Max Guests Allowed</label>
              <select
                className="input-field"
                value={form.totalAllowed}
                onChange={set("totalAllowed")}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "person" : "people"}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Phone Number (for WhatsApp)</label>
              <input
                className="input-field"
                placeholder="+1 555 000 0000 (include country code)"
                value={form.phoneNumber}
                onChange={set("phoneNumber")}
              />
            </div>

            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                className="input-field"
                placeholder="guest@email.com"
                value={form.email}
                onChange={set("email")}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
            <button type="submit" className="btn-gold" disabled={loading}>
              {loading ? "Saving…" : guest ? "Save Changes" : "Add Guest"}
            </button>
            <button type="button" className="btn-outline" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
