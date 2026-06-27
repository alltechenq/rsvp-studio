"use client";

import { useState } from "react";

interface Props {
  ownerName: string;
  onOpen: () => void;
}

export default function EnvelopeAnimation({ ownerName, onOpen }: Props) {
  const [opened, setOpened] = useState(false);
  const [revealed, setRevealed] = useState(false);

  function handleClick() {
    if (opened) return;
    setOpened(true);
    // After envelope opens, trigger the reveal transition
    setTimeout(() => {
      setRevealed(true);
      setTimeout(() => onOpen(), 600);
    }, 900);
  }

  const initials = ownerName
    .split(/\s+&?\s*/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      className="animate-fade-in-up"
      style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <p
        style={{
          color: "var(--gold)",
          fontSize: 12,
          letterSpacing: 3,
          textTransform: "uppercase",
          marginBottom: 32,
          opacity: 0.8,
        }}
      >
        You have a personal invitation
      </p>

      {/* Envelope */}
      <div className="envelope-scene" style={{ marginBottom: 40 }}>
        <div
          className={`envelope ${opened ? "open" : ""} animate-float`}
          onClick={handleClick}
          style={{
            cursor: opened ? "default" : "pointer",
            animation: revealed ? "none" : undefined,
            opacity: revealed ? 0 : 1,
            transition: revealed ? "opacity 0.5s ease" : undefined,
          }}
        >
          <div className="envelope-body">
            <div className="envelope-left-flap" />
            <div className="envelope-right-flap" />
            <div className="envelope-bottom" />
            <div className="envelope-flap" />

            {/* Letter inside */}
            <div className="envelope-letter">
              <div className="letter-content">
                <div className="letter-monogram">{initials}</div>
                <div className="letter-subtitle">Personal Invitation</div>
              </div>
            </div>

            {/* Wax seal */}
            <div className="envelope-seal">✦</div>
          </div>
        </div>
      </div>

      {!opened && (
        <div>
          <button
            className="btn-gold animate-pulse-gold"
            onClick={handleClick}
            style={{ fontSize: 14, padding: "14px 40px" }}
          >
            Open Your Invitation ✦
          </button>
          <p style={{ color: "rgba(245,240,232,0.4)", fontSize: 12, marginTop: 12 }}>
            Click the envelope or the button to reveal
          </p>
        </div>
      )}

      {opened && !revealed && (
        <p style={{ color: "var(--gold)", fontSize: 13, opacity: 0.8 }}>
          Opening…
        </p>
      )}
    </div>
  );
}
