"use client";

import { useState, useEffect, useCallback } from "react";
import EnvelopeAnimation from "./EnvelopeAnimation";
import InvitationCard from "./InvitationCard";
import RSVPForm from "./RSVPForm";

interface GuestData {
  id: number;
  groupName: string;
  totalAllowed: number;
  status: string;
}

interface EventData {
  title: string;
  eventType: string;
  ownerName: string;
  date: string;
  time: string;
  venue: string;
  rsvpDeadline: string;
}

interface ExistingResponse {
  id: number;
  guestName: string;
  isAttending: boolean;
}

type Stage = "loading" | "error" | "envelope" | "invitation" | "form" | "submitted";

export default function RSVPPage({ token }: { token: string }) {
  const [stage, setStage] = useState<Stage>("loading");
  const [guest, setGuest] = useState<GuestData | null>(null);
  const [event, setEvent] = useState<EventData | null>(null);
  const [existingResponses, setExistingResponses] = useState<ExistingResponse[]>([]);
  const [hasResponded, setHasResponded] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/rsvp/${token}`);
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? "Invalid invitation link");
        setStage("error");
        return;
      }
      setGuest(data.guest);
      setEvent(data.event);
      setExistingResponses(data.existingResponses ?? []);
      setHasResponded(data.hasResponded);
      setStage("envelope");
    } catch {
      setErrorMsg("Could not load your invitation. Please try again.");
      setStage("error");
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  function handleEnvelopeOpen() {
    setStage("invitation");
  }

  function handleViewRSVP() {
    setStage("form");
  }

  async function handleSubmitRSVP(
    guestList: Array<{ name: string; isAttending: boolean }>
  ) {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/rsvp/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guests: guestList }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitMsg(data.error ?? "Submission failed");
      } else {
        setSubmitMsg(data.message ?? "RSVP submitted!");
        setStage("submitted");
      }
    } catch {
      setSubmitMsg("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const isDeadlinePassed =
    event ? new Date() > new Date(event.rsvpDeadline + "T23:59:59") : false;

  // ─── Loading ───
  if (stage === "loading") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 56,
              height: 56,
              border: "2px solid rgba(212,175,55,0.3)",
              borderTop: "2px solid var(--gold)",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: "var(--offwhite-dim)", fontSize: 14 }}>
            Loading your invitation…
          </p>
        </div>
      </div>
    );
  }

  // ─── Error ───
  if (stage === "error") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div className="glass-card" style={{ padding: "48px 40px", textAlign: "center", maxWidth: 480 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✦</div>
          <h2
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: 24,
              color: "var(--gold)",
              margin: "0 0 12px",
              fontStyle: "italic",
            }}
          >
            Invitation Not Found
          </h2>
          <p style={{ color: "var(--offwhite-dim)", fontSize: 14, lineHeight: 1.6 }}>
            {errorMsg}
          </p>
        </div>
      </div>
    );
  }

  // ─── Submitted confirmation ───
  if (stage === "submitted") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <div
          className="invitation-card animate-fade-in"
          style={{ padding: "56px 40px", textAlign: "center", maxWidth: 500, width: "100%" }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              background: "linear-gradient(135deg,#34d399,#059669)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              margin: "0 auto 24px",
              boxShadow: "0 8px 24px rgba(52,211,153,0.3)",
            }}
          >
            ✓
          </div>
          <div className="gold-divider" style={{ marginBottom: 24 }} />
          <h2
            style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: 28,
              color: "var(--gold)",
              margin: "0 0 12px",
              fontStyle: "italic",
            }}
          >
            Thank You, {guest?.groupName}!
          </h2>
          <p
            style={{
              color: "var(--offwhite-dim)",
              fontSize: 15,
              lineHeight: 1.7,
              margin: "0 0 8px",
            }}
          >
            Your RSVP has been received. We look forward to celebrating with you.
          </p>
          <p style={{ color: "rgba(245,240,232,0.4)", fontSize: 13 }}>
            {event?.ownerName} — {event?.eventType}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 500,
          height: 500,
          background:
            "radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />

      {/* Envelope Stage */}
      {stage === "envelope" && guest && event && (
        <EnvelopeAnimation
          ownerName={event.ownerName}
          onOpen={handleEnvelopeOpen}
        />
      )}

      {/* Invitation Card Stage */}
      {stage === "invitation" && guest && event && (
        <InvitationCard
          guest={guest}
          event={event}
          hasResponded={hasResponded}
          existingResponses={existingResponses}
          isDeadlinePassed={isDeadlinePassed}
          onRSVP={handleViewRSVP}
        />
      )}

      {/* RSVP Form Stage */}
      {stage === "form" && guest && event && (
        <RSVPForm
          guest={guest}
          event={event}
          existingResponses={existingResponses}
          isDeadlinePassed={isDeadlinePassed}
          submitting={submitting}
          submitMsg={submitMsg}
          onBack={() => setStage("invitation")}
          onSubmit={handleSubmitRSVP}
        />
      )}
    </div>
  );
}
