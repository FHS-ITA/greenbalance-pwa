"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface AppState {
  energyLevel: number; // 0-4
  satiety: number;     // 0-100
  isLowEnergy: boolean;
  setEnergyLevel: (level: number) => void;
  setSatiety: (satiety: number) => void;
}

const AppContext = createContext<AppState>({
  energyLevel: 3,
  satiety: 50,
  isLowEnergy: false,
  setEnergyLevel: () => {},
  setSatiety: () => {},
});

export function useAppState() {
  return useContext(AppContext);
}

export default function AppProviders({ children }: { children: React.ReactNode }) {
  const [energyLevel, setEnergyLevel] = useState(3);
  const [satiety, setSatiety] = useState(50);
  const isLowEnergy = energyLevel <= 1;

  return (
    <AppContext.Provider value={{ energyLevel, satiety, isLowEnergy, setEnergyLevel, setSatiety }}>
      <div
        data-low-energy={isLowEnergy ? "true" : "false"}
        style={{ minHeight: "100dvh" }}
      >
        {children}
      </div>
    </AppContext.Provider>
  );
}
