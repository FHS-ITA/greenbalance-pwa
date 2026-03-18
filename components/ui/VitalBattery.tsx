"use client";

interface VitalBatteryProps {
  level: 0 | 1 | 2 | 3 | 4;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const levelConfig = {
  0: { bars: 0, color: "#8B5E3C", label: "Esaurita",    fill: 0 },
  1: { bars: 1, color: "#CCAA22", label: "Bassa",       fill: 25 },
  2: { bars: 2, color: "#CCAA22", label: "Moderata",    fill: 50 },
  3: { bars: 3, color: "#B2AC88", label: "Buona",       fill: 75 },
  4: { bars: 4, color: "#8F8A68", label: "Ottimale",    fill: 100 },
};

const sizeConfig = {
  sm: { width: 28, height: 14, barW: 4, barH: 8, gap: 2, cap: 3 },
  md: { width: 44, height: 22, barW: 7, barH: 13, gap: 3, cap: 4 },
  lg: { width: 64, height: 32, barW: 10, barH: 19, gap: 4, cap: 5 },
};

export default function VitalBattery({
  level,
  size = "md",
  showLabel = false,
}: VitalBatteryProps) {
  const config = levelConfig[level];
  const sz = sizeConfig[size];
  const totalBars = 4;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <svg
        width={sz.width + sz.cap}
        height={sz.height}
        viewBox={`0 0 ${sz.width + sz.cap} ${sz.height}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={`Energia: ${config.label}`}
      >
        {/* Battery casing */}
        <rect
          x={0}
          y={0}
          width={sz.width}
          height={sz.height}
          rx={sz.height * 0.22}
          stroke={config.color}
          strokeWidth={1.5}
          fill="rgba(255,253,208,0.5)"
        />
        {/* Battery cap */}
        <rect
          x={sz.width}
          y={sz.height * 0.3}
          width={sz.cap}
          height={sz.height * 0.4}
          rx={1}
          fill={config.color}
        />
        {/* Battery bars */}
        {Array.from({ length: totalBars }, (_, i) => {
          const filled = i < config.bars;
          const barX = 3 + i * (sz.barW + sz.gap);
          return (
            <rect
              key={i}
              x={barX}
              y={3}
              width={sz.barW}
              height={sz.height - 6}
              rx={2}
              fill={filled ? config.color : "rgba(178,172,136,0.12)"}
              style={{
                transition: "fill 0.3s ease",
              }}
            />
          );
        })}
      </svg>
      {showLabel && (
        <span
          style={{
            fontSize: size === "sm" ? "11px" : size === "md" ? "13px" : "15px",
            fontWeight: 500,
            color: config.color,
            fontFamily: "Outfit, system-ui, sans-serif",
          }}
        >
          {config.label}
        </span>
      )}
    </div>
  );
}
