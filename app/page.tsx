"use client";

import { useEffect, useState } from "react";
import VitalBattery from "@/components/ui/VitalBattery";
import SatietyIndicator from "@/components/ui/SatietyIndicator";
import SocraticToast from "@/components/ui/SocraticToast";
import { useAppState } from "@/components/AppProviders";
import { getUserProfile, getLogsForDate } from "@/lib/db/dexie";
import { computeNutritionProfile } from "@/lib/nutrition/calculator";
import type { UserProfile, NutritionLog } from "@/lib/db/types";

const MANIFESTO_PHRASES = [
  "Non devi guadagnarti il riposo. Esisti, ed è abbastanza. Lascia andare la 'figlia modello' per un istante.",
  "La tua bussola interna sa perfettamente cosa è giusto per te oggi. Fai un respiro e ascoltala.",
  "L'efficienza è uno strumento, non la tua identità. Puoi fermarti senza perdere alcun valore.",
  "Smetti di compiacere le aspettative esterne. Cosa desideri davvero, senza mediazioni, in questo momento?",
  "Hai passato anni a capire cosa il mondo voleva da te. Ora è tempo di ritornare a te stessa.",
  "La vulnerabilità non è un difetto di prestazione. È la chiave per accedere alla tua verità profonda."
];

export default function DashboardPage() {
  const { energyLevel, satiety, isLowEnergy } = useAppState();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [todayLogs, setTodayLogs] = useState<NutritionLog[]>([]);
  const [dailyPhrase, setDailyPhrase] = useState(MANIFESTO_PHRASES[0]);

  useEffect(() => {
    async function loadData() {
      const p = await getUserProfile();
      if (p) {
        setProfile(p);
      } else {
        // Fallback profile for dev since we don't have onboarding yet
        setProfile({
          id: 1,
          weight_kg: 60,
          height_cm: 165,
          age: 39,
          pal_coefficient: 1.375,
          updated_at: new Date().toISOString(),
        });
      }
      const today = new Date().toISOString().split("T")[0];
      const logs = await getLogsForDate(today);
      setTodayLogs(logs);

      // Frase del giorno deterministica basata sulla data per evitare mismatch React
      const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
      setDailyPhrase(MANIFESTO_PHRASES[dayOfYear % MANIFESTO_PHRASES.length]);
    }
    loadData();
  }, []);

  if (!profile) return null;

  const nutrition = computeNutritionProfile(profile);
  const consumedCalories = todayLogs.reduce((acc, log) => acc + log.total_calories, 0);
  const consumedProtein = todayLogs.reduce((acc, log) => acc + log.total_protein_g, 0);

  const calPct = Math.min((consumedCalories / nutrition.tdee) * 100, 100);
  const protPct = Math.min((consumedProtein / nutrition.protein_target_g) * 100, 100);

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto">
      {/* Header */}
      <header className="flex justify-between items-center mb-2">
        <div>
          <h1 className="gb-heading text-2xl">Oggi</h1>
          <p className="gb-subheading">{new Date().toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })}</p>
        </div>
        {!isLowEnergy && (
          <div className="flex gap-4">
            <VitalBattery level={energyLevel as any} size="sm" />
            <SatietyIndicator satiety={satiety} size="sm" />
          </div>
        )}
      </header>

      {/* Socratic Toast (only show if not exhausted) */}
      {!isLowEnergy && <SocraticToast message={dailyPhrase} />}

      {/* Primary KPI Card: Energy & Macros */}
      <section className="gb-card p-5">
        <div className="flex justify-between items-end mb-4">
          <div>
            <span className="gb-label block mb-1">Energie Assunte</span>
            <span className="text-3xl gb-heading text-sage-dark">{consumedCalories}</span>
            <span className="text-charcoal-muted font-medium text-sm ml-1">/ {nutrition.tdee} kcal</span>
          </div>
          <div className="text-right">
            <span className="gb-label block mb-1">Proteine</span>
            <span className="text-xl gb-heading text-earth">{Math.round(consumedProtein)}g</span>
            <span className="text-charcoal-muted text-xs ml-1">/ {nutrition.protein_target_g}g</span>
          </div>
        </div>

        {/* Unified progress bar */}
        <div className="h-4 bg-sage/20 rounded-full overflow-hidden flex relative">
          <div
            className="h-full bg-sage transition-all duration-1000 ease-out"
            style={{ width: `${calPct}%`, opacity: 0.7 }}
          />
          <div
            className="absolute top-0 bottom-0 left-0 bg-sage-dark transition-all duration-1000 ease-out z-10"
            style={{ width: `${protPct}%`, opacity: 0.9 }}
          />
        </div>
        <p className="text-xs text-charcoal-muted mt-2 text-right">La barra scura indica l'apporto proteico</p>
      </section>

      {/* Somatic Status */}
      <section className="flex gap-4">
        <div className="gb-card p-4 flex-1 flex flex-col items-center justify-center gap-2">
          <span className="gb-label">Energia</span>
          <VitalBattery level={energyLevel as any} size="lg" showLabel />
        </div>
        <div className="gb-card p-4 flex-1 flex flex-col items-center justify-center gap-2">
          <span className="gb-label">Sazietà</span>
          <SatietyIndicator satiety={satiety} size="lg" showLabel />
        </div>
      </section>

      {/* Log Feed */}
      <section className="mt-4 pb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="gb-heading text-lg">Diario di Oggi</h2>
        </div>
        <div className="space-y-3">
          {todayLogs.length === 0 ? (
            <div className="text-center py-8 gb-glass rounded-2xl border border-sage/20 border-dashed">
              <p className="text-charcoal-muted text-sm italic">Nessun pasto registrato oggi.</p>
            </div>
          ) : (
            todayLogs.map((log, index) => (
              <div key={index} className="gb-glass p-4 rounded-2xl flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-charcoal capitalize">{log.meal_type}</h3>
                  <p className="text-sm text-charcoal-muted">{log.foods.map(f => f.name).join(", ")}</p>
                </div>
                <div className="text-right">
                  <span className="block font-medium text-sage-dark">{log.total_calories} kcal</span>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
