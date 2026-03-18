"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    href: "/",
    label: "Oggi",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M3 9.5L12 3L21 9.5V20C21 20.5523 20.5523 21 20 21H15V15H9V21H4C3.44772 21 3 20.5523 3 20V9.5Z"
          fill={active ? "#B2AC88" : "none"}
          stroke={active ? "#B2AC88" : "#888888"}
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/log",
    label: "Registra",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="9" stroke={active ? "#B2AC88" : "#888888"} strokeWidth="1.8" />
        <path d="M12 8V16M8 12H16" stroke={active ? "#B2AC88" : "#888888"} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/svuota-frigo",
    label: "Frigo",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="5" y="2" width="14" height="20" rx="2" stroke={active ? "#B2AC88" : "#888888"} strokeWidth="1.8" />
        <path d="M5 10H19" stroke={active ? "#B2AC88" : "#888888"} strokeWidth="1.8" />
        <path d="M9 6V8M9 14V17" stroke={active ? "#B2AC88" : "#888888"} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/activity",
    label: "Attività",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M3 12H6L8 6L11 18L13 10L15 14H18L21 12"
          stroke={active ? "#B2AC88" : "#888888"}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/settings",
    label: "Profilo",
    icon: (active: boolean) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="8" r="3.5" stroke={active ? "#B2AC88" : "#888888"} strokeWidth="1.8" />
        <path d="M4 20C4 17.2386 7.58172 15 12 15C16.4183 15 20 17.2386 20 20" stroke={active ? "#B2AC88" : "#888888"} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        background: "rgba(255,253,208,0.92)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderTop: "1px solid rgba(178,172,136,0.2)",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        height: "64px",
      }}
    >
      {navItems.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "2px",
              textDecoration: "none",
              padding: "6px 12px",
              borderRadius: "12px",
              transition: "background 0.2s ease",
              background: active ? "rgba(178,172,136,0.12)" : "transparent",
              minWidth: "56px",
            }}
          >
            {item.icon(active)}
            <span
              style={{
                fontSize: "10px",
                fontWeight: active ? 600 : 400,
                color: active ? "#B2AC88" : "#888888",
                fontFamily: "Outfit, system-ui, sans-serif",
                transition: "color 0.2s ease",
              }}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
