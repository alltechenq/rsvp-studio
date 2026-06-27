"use client";

import { useState, useEffect } from "react";

interface GuestEntry {
  name: string;
  isAttending: boolean | null;
}

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
  existingResponses: Array<{ id: number; guestName: string; isAttending: boolean }>;
  isDeadlinePassed: boolean;
  submitting: boolean;
  submitMsg: string;
  onBack: () => void;
  onSubmit: (guests: Array<{ name: string; isAttending: boolean }>) => void;
}

export default function RSVPForm({
  guest,
  event,
  existingResponses,
  isDeadlinePassed,
  submitting,
  submitMsg,
  onBack,
  onSubmit,
}: Props) {
  const [entries, setEntries] = useState<GuestEntry[]>(() => {
    const initial: GuestEntry[] = [];
    for (let i = 0; i < guest.totalAllowed; i++) {
      const existing = existingResponses[i];
      initial.push({
        name: existing?.guestName ?? "",
        isAttending: existing !== undefined ? existing.isAttending : null,
      });
    }
    return initial;
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  function updateEntry(index: number, field: keyof GuestEntry, value: string | boolean | null) {
    setEntries((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
    // Clear errors on change
    setErrors([]);
  }

  function validate(): boolean {
    const newErrors: string[] = [];

    entries.forEach((entry, i) => {
      if (entry.isAttending === true && !entry.name.trim()) {
        newErrors.push(`Please enter the name for Guest ${i + 1}.`);
      }
      if (entry.isAttending === true && entry.name.trim().length < 2) {
        newErrors.push(`Guest ${i + 1} name must be at least 2 characters.`);
      }
    });

    const hasAnyResponse = entries.some((e) => e.isAttending !== null);
    if (!hasAnyResponse) {
      newErrors.push("Please indicate attendance for at least one guest.");
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isDeadlinePassed) return;
    if (!validate()) return;

    // Build the final submission list — only include entries where a choice was made
    const submittable = entries
      .map((e, i) => ({
        name:
          e.name.trim() ||
          (e.isAttending === false
            ? `${guest.groupName} (Guest ${i + 1})`
            : ""),
        isAttending: e.isAttending as boolean,
        chosen: e.isAttending !== null,
      }))
      .filter((e) => e.chosen)
      .map(({ name, isAttending }) => ({ name, isAttending }));

    onSubmit(submittable);
  }

  const confirmedCount = entries.filter((e) => e.isAttending === true).length;
  const declinedCount = entries.filter((e) => e.isAttending === false).length;

  return (
    <div
      style={{
        maxWidth: 540,
        width: "100%",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <button
          className="btn-ghost"
          onClick={onBack}
          style={{ marginBottom: 16, display: "inline-flex" }}
        >
          ← Back to Invitation
        </button>
        <div className="gold-divider" style={{ marginBottom: 20 }} />
        <h2
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 30,
            color: "var(--gold)",
            fontStyle: "italic",
            margin: "0 0 8px",
          }}
        >
          RSVP
        </h2>
        <p style={{ color: "var(--offwhite-dim)", fontSize: 14, margin: 0 }}>
          {event.ownerName}&apos;s {event.eventType} · Up to {guest.totalAllowed} guest
          {guest.totalAllowed !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Summary (if selections made) */}
      {(confirmedCount > 0 || declinedCount > 0) && (
        <div
          style={{
            background: "rgba(212,175,55,0.06)",
            border: "1px solid rgba(212,175,55,0.15)",
            borderRadius: 12,
            padding: "12px 20px",
            marginBottom: 20,
            display: "flex",
            gap: 20,
            justifyContent: "center",
          }}
        >
          {confirmedCount > 0 && (
            <span style={{ color: "#34d399", fontSize: 13, fontWeight: 500 }}>
              ✓ {confirmedCount} Attending
            </span>
          )}
          {declinedCount > 0 && (
            <span style={{ color: "#ef4444", fontSize: 13, fontWeight: 500 }}>
              ✕ {declinedCount} Not Attending
            </span>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {entries.map((entry, i) => (
            <div
              key={i}
              className="glass-card"
              style={{
                padding: "20px 24px",
                borderColor:
                  entry.isAttending === true
                    ? "rgba(52,211,153,0.3)"
                    : entry.isAttending === false
                    ? "rgba(239,68,68,0.25)"
                    : "var(--glass-border)",
                transition: "border-color 0.3s ease",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    background:
                      entry.isAttending === true
                        ? "rgba(52,211,153,0.2)"
                        : entry.isAttending === false
                        ? "rgba(239,68,68,0.15)"
                        : "rgba(212,175,55,0.1)",
                    border: `1px solid ${
                      entry.isAttending === true
                        ? "rgba(52,211,153,0.4)"
                        : entry.isAttending === false
                        ? "rgba(239,68,68,0.35)"
                        : "rgba(212,175,55,0.2)"
                    }`,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    color:
                      entry.isAttending === true
                        ? "#34d399"
                        : entry.isAttending === false
                        ? "#ef4444"
                        : "var(--gold)",
                    flexShrink: 0,
                    transition: "all 0.3s ease",
                  }}
                >
                  {i + 1}
                </div>
                <label className="label" style={{ margin: 0 }}>
                  Guest {i + 1}
                  {i === 0 && (
                    <span
                      style={{
                        fontSize: 10,
                        color: "rgba(212,175,55,0.5)",
                        fontWeight: 400,
                        marginLeft: 6,
                        letterSpacing: 0,
                        textTransform: "none",
                      }}
                    >
                      (Primary)
                    </span>
                  )}
                </label>
              </div>

              {/* Attending Toggle */}
              <div className="attending-toggle" style={{ marginBottom: 12 }}>
                <button
                  type="button"
                  className={`attending-btn yes ${entry.isAttending === true ? "active" : ""}`}
                  onClick={() => updateEntry(i, "isAttending", true)}
                >
                  ✓ Attending
                </button>
                <button
                  type="button"
                  className={`attending-btn no ${entry.isAttending === false ? "active" : ""}`}
                  onClick={() => updateEntry(i, "isAttending", false)}
                >
                  ✕ Not Attending
                </button>
              </div>

              {/* Name field - show when attending */}
              <div
                style={{
                  maxHeight: entry.isAttending === true ? 80 : 0,
                  overflow: "hidden",
                  transition: "max-height 0.4s cubic-bezier(0.4,0,0.2,1)",
                }}
              >
                <input
                  className="input-field"
                  placeholder={`Full name of Guest ${i + 1}`}
                  value={entry.name}
                  onChange={(e) => updateEntry(i, "name", e.target.value)}
                  required={entry.isAttending === true}
                  style={{ marginTop: 4 }}
                />
              </div>

              {/* Optional name for declining guests */}
              {entry.isAttending === false && (
                <div
                  style={{
                    maxHeight: 80,
                    transition: "max-height 0.4s ease",
                  }}
                >
                  <input
                    className="input-field"
                    placeholder={`Name (optional)`}
                    value={entry.name}
                    onChange={(e) => updateEntry(i, "name", e.target.value)}
                    style={{ marginTop: 4 }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <div
            style={{
              marginTop: 16,
              background: "rgba(220,38,38,0.1)",
              border: "1px solid rgba(220,38,38,0.3)",
              borderRadius: 10,
              padding: "12px 16px",
            }}
          >
            {errors.map((err, i) => (
              <p key={i} style={{ color: "#ef4444", fontSize: 13, margin: "2px 0" }}>
                ⚠ {err}
              </p>
            ))}
          </div>
        )}

        {submitMsg && !submitting && (
          <div
            style={{
              marginTop: 16,
              background: "rgba(220,38,38,0.1)",
              border: "1px solid rgba(220,38,38,0.3)",
              borderRadius: 10,
              padding: "12px 16px",
              color: "#ef4444",
              fontSize: 13,
            }}
          >
            ⚠ {submitMsg}
          </div>
        )}

        {/* Submit */}
        <div style={{ marginTop: 24, textAlign: "center" }}>
          {isDeadlinePassed ? (
            <p style={{ color: "#f59e0b", fontSize: 14 }}>
              ⚠ The RSVP deadline has passed
            </p>
          ) : (
            <button
              type="submit"
              className="btn-gold"
              style={{ padding: "15px 56px", fontSize: 15, width: "100%", justifyContent: "center" }}
              disabled={submitting}
            >
              {submitting ? "Submitting…" : "Confirm My RSVP ✦"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
