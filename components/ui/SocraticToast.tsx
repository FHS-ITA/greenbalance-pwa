"use client";

import { useEffect, useState } from "react";

interface SocraticToastProps {
  message: string;
  onDismiss?: () => void;
  autoHideMs?: number;
}

export default function SocraticToast({
  message,
  onDismiss,
  autoHideMs = 8000,
}: SocraticToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!autoHideMs) return;
    const timer = setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, autoHideMs);
    return () => clearTimeout(timer);
  }, [autoHideMs, onDismiss]);

  if (!visible) return null;

  return (
    <div
      className="animate-slide-up"
      style={{
        background: "rgba(255,253,208,0.96)",
        border: "1px solid rgba(178,172,136,0.3)",
        borderLeft: "3px solid #B2AC88",
        borderRadius: "1rem",
        padding: "1rem 1.25rem",
        boxShadow: "0 4px 20px rgba(51,51,51,0.08)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        gap: "12px",
        alignItems: "flex-start",
      }}
      role="status"
      aria-live="polite"
    >
      {/* AI indicator — leaf icon in sage */}
      <div style={{ flexShrink: 0, marginTop: "2px" }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 21C12 21 4 16 4 10C4 7.23858 7.13401 5 11 5C11.3422 5 11.6769 5.02097 12 5.06107C12.3231 5.02097 12.6578 5 13 5C16.866 5 20 7.23858 20 10C20 16 12 21 12 21Z"
            fill="#B2AC88"
          />
          <path d="M12 21V10" stroke="rgba(255,253,208,0.9)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>

      <div style={{ flex: 1 }}>
        <p
          style={{
            fontSize: "13px",
            lineHeight: "1.55",
            color: "var(--gb-text)",
            fontFamily: "Outfit, system-ui, sans-serif",
            fontStyle: "italic",
          }}
        >
          {message}
        </p>
      </div>

      <button
        onClick={() => { setVisible(false); onDismiss?.(); }}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "var(--gb-muted)",
          padding: "0 4px",
          flexShrink: 0,
          fontSize: "16px",
          lineHeight: 1,
        }}
        aria-label="Chiudi"
      >
        ·
      </button>
    </div>
  );
}
