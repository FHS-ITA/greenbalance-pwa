"use client";

interface SatietyIndicatorProps {
  satiety: number; // 0-100
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

function getSatietyLabel(satiety: number): string {
  if (satiety < 15) return "Stomaco vuoto";
  if (satiety < 35) return "Ancora capienza";
  if (satiety < 60) return "Parzialmente sazia";
  if (satiety < 80) return "Quasi sazia";
  return "Sazia";
}

export default function SatietyIndicator({
  satiety,
  size = "md",
  showLabel = false,
}: SatietyIndicatorProps) {
  const clamped = Math.max(0, Math.min(100, satiety));
  const opacity = 0.15 + (clamped / 100) * 0.85;
  const label = getSatietyLabel(clamped);

  const iconSize = size === "sm" ? 24 : size === "md" ? 36 : 48;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <div
        style={{
          opacity,
          transition: "opacity 0.5s ease",
          display: "inline-flex",
          position: "relative",
        }}
        role="img"
        aria-label={`Sazietà: ${label} (${clamped}%)`}
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Leaf / plant icon representing nourishment */}
          <circle cx="18" cy="18" r="15" fill="rgba(178,172,136,0.18)" />
          <path
            d="M18 26C18 26 10 21 10 14.5C10 11.4624 13.134 9 17 9C17.3422 9 17.6769 9.02097 18 9.06107C18.3231 9.02097 18.6578 9 19 9C22.866 9 26 11.4624 26 14.5C26 21 18 26 18 26Z"
            fill="#B2AC88"
          />
          <path
            d="M18 26V14"
            stroke="rgba(255,253,208,0.8)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
      {showLabel && (
        <span
          style={{
            fontSize: size === "sm" ? "11px" : size === "md" ? "13px" : "15px",
            fontWeight: 500,
            color: "var(--gb-muted)",
            fontFamily: "Outfit, system-ui, sans-serif",
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
