"use client";

interface NoGuiltDayClosureProps {
  date: string; // e.g. "2026-03-17"
  logsCount: number;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" });
}

export default function NoGuiltDayClosure({ date, logsCount }: NoGuiltDayClosureProps) {
  const isIncomplete = logsCount === 0;

  return (
    <div
      className="gb-card animate-fade-in"
      style={{
        padding: "1rem 1.25rem",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        opacity: isIncomplete ? 0.6 : 1,
        transition: "opacity 0.3s ease",
      }}
    >
      {/* Neutral day indicator — never red, never broken streak badge */}
      <div
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "50%",
          background: isIncomplete
            ? "rgba(178,172,136,0.15)"
            : "rgba(178,172,136,0.25)",
          border: `1.5px solid rgba(178,172,136,${isIncomplete ? "0.2" : "0.5"})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {isIncomplete ? (
          // Soft dot — no X, no warning
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "rgba(178,172,136,0.5)",
            }}
          />
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8L6.5 11.5L13 4.5" stroke="#B2AC88" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <div>
        <p style={{ fontSize: "13px", fontWeight: 500, color: "var(--gb-text)", textTransform: "capitalize" }}>
          {formatDate(date)}
        </p>
        <p style={{ fontSize: "11px", color: "var(--gb-muted)", marginTop: "2px" }}>
          {isIncomplete
            ? "Giornata non registrata — va bene così"
            : `${logsCount} pasto${logsCount > 1 ? "i" : ""} registrato${logsCount > 1 ? "i" : ""}`}
        </p>
      </div>
    </div>
  );
}
