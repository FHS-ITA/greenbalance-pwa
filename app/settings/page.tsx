"use client";

import { useEffect, useState } from "react";
import { getUserProfile, saveUserProfile, resetEntireProfile } from "@/lib/db/dexie";
import { computeNutritionProfile } from "@/lib/nutrition/calculator";
import type { UserProfile } from "@/lib/db/types";

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function load() {
      let p = await getUserProfile();
      if (!p) {
        p = {
          weight_kg: 60,
          height_cm: 165,
          age: 39,
          pal_coefficient: 1.375,
          goal: "maintain",
          updated_at: new Date().toISOString()
        };
      }
      setProfile(p);
    }
    load();
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    setIsSaving(true);
    await saveUserProfile({ ...profile, updated_at: new Date().toISOString() });
    setIsSaving(false);
    alert("Profilo aggiornato.");
  };

  const handleReset = async () => {
    if (confirm("ATTENZIONE: Questa azione cancellerà DEFINITIVAMENTE tutti i tuoi dati, i pasti registrati e le attività. Sei sicura?")) {
      await resetEntireProfile();
      alert("Tutti i dati sono stati cancellati. L'app verrà ricaricata.");
      window.location.href = "/";
    }
  };

  if (!profile) return null;
  const nutrition = computeNutritionProfile(profile);

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto">
      <header>
        <h1 className="gb-heading text-2xl">Profilo</h1>
        <p className="gb-subheading">Personalizza i tuoi parametri</p>
      </header>

      <section className="gb-card p-5">
        <h2 className="gb-label mb-4">Dati Antropometrici</h2>
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm text-charcoal mb-1 block">Peso (kg)</label>
              <input 
                type="number" step="0.5"
                className="w-full bg-white border border-sage/30 rounded-lg px-3 py-2 text-charcoal"
                value={profile.weight_kg} 
                onChange={e => setProfile({...profile, weight_kg: Number(e.target.value)})} 
              />
            </div>
            <div className="flex-1">
              <label className="text-sm text-charcoal mb-1 block">Altezza (cm)</label>
              <input 
                type="number" 
                className="w-full bg-white border border-sage/30 rounded-lg px-3 py-2 text-charcoal"
                value={profile.height_cm} 
                onChange={e => setProfile({...profile, height_cm: Number(e.target.value)})} 
              />
            </div>
            <div className="flex-1">
              <label className="text-sm text-charcoal mb-1 block">Età</label>
              <input 
                type="number" 
                className="w-full bg-white border border-sage/30 rounded-lg px-3 py-2 text-charcoal"
                value={profile.age} 
                onChange={e => setProfile({...profile, age: Number(e.target.value)})} 
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm text-charcoal mb-2 block">Obiettivo Nutrizionale</label>
            <div className="flex flex-col gap-2 mb-4">
              <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer ${profile.goal === 'lose_weight' ? 'bg-sage/10 border-sage text-sage-dark font-medium' : 'bg-white border-sage/30 text-charcoal'}`}>
                <input 
                  type="radio" name="goal" className="accent-sage"
                  checked={profile.goal === 'lose_weight'}
                  onChange={() => setProfile({...profile, goal: 'lose_weight'})}
                />
                Perdere peso (Deficit cal. sicuro)
              </label>
              <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer ${(!profile.goal || profile.goal === 'maintain') ? 'bg-sage/10 border-sage text-sage-dark font-medium' : 'bg-white border-sage/30 text-charcoal'}`}>
                <input 
                  type="radio" name="goal" className="accent-sage"
                  checked={!profile.goal || profile.goal === 'maintain'}
                  onChange={() => setProfile({...profile, goal: 'maintain'})}
                />
                Mantenimento
              </label>
              <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer ${profile.goal === 'reduce_cm' ? 'bg-sage/10 border-sage text-sage-dark font-medium' : 'bg-white border-sage/30 text-charcoal'}`}>
                <input 
                  type="radio" name="goal" className="accent-sage"
                  checked={profile.goal === 'reduce_cm'}
                  onChange={() => setProfile({...profile, goal: 'reduce_cm'})}
                />
                Ridurre cm (Mantenimento + Proteine)
              </label>
            </div>

            {profile.goal === 'lose_weight' && (
              <div className="mb-4 bg-sage/5 p-3 rounded-lg border border-sage/20">
                <label className="text-sm text-charcoal mb-1 block">Peso da raggiungere (kg)</label>
                <input 
                  type="number" step="0.5"
                  className="w-full bg-white border border-sage/30 rounded-lg px-3 py-2 text-charcoal focus-visible:outline-sage/50"
                  value={profile.target_weight_kg || ""}
                  placeholder="es. 55"
                  onChange={e => setProfile({...profile, target_weight_kg: Number(e.target.value)})} 
                />
              </div>
            )}

            {profile.goal === 'reduce_cm' && (
              <div className="mb-4 bg-sage/5 p-3 rounded-lg border border-sage/20">
                <label className="text-sm text-charcoal mb-1 block">Girovita/centimetri da ridurre</label>
                <input 
                  type="number" step="0.5"
                  className="w-full bg-white border border-sage/30 rounded-lg px-3 py-2 text-charcoal focus-visible:outline-sage/50"
                  value={profile.target_cm_reduction || ""}
                  placeholder="es. 3"
                  onChange={e => setProfile({...profile, target_cm_reduction: Number(e.target.value)})} 
                />
              </div>
            )}
          </div>
          
          <div>
            <label className="text-sm text-charcoal mb-2 block">Livello di Attività (NEAT)</label>
            <div className="flex flex-col gap-2">
              <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer ${profile.pal_coefficient === 1.375 ? 'bg-sage/10 border-sage text-sage-dark font-medium' : 'bg-white border-sage/30 text-charcoal'}`}>
                <input 
                  type="radio" 
                  name="pal" 
                  className="accent-sage"
                  checked={profile.pal_coefficient === 1.375}
                  onChange={() => setProfile({...profile, pal_coefficient: 1.375})}
                />
                Giornata tranquilla (Sedentaria)
              </label>
              <label className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer ${profile.pal_coefficient === 1.55 ? 'bg-sage/10 border-sage text-sage-dark font-medium' : 'bg-white border-sage/30 text-charcoal'}`}>
                <input 
                  type="radio" 
                  name="pal" 
                  className="accent-sage"
                  checked={profile.pal_coefficient === 1.55}
                  onChange={() => setProfile({...profile, pal_coefficient: 1.55})}
                />
                Giornata attiva (Maternità attiva/sport)
              </label>
            </div>
          </div>

          <button 
            className="gb-btn-primary w-full justify-center mt-2" 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Salvataggio..." : "Salva Profilo"}
          </button>
        </div>
      </section>

      <section className="gb-glass p-5 rounded-2xl">
        <h2 className="gb-label mb-4">Riepilogo Nutrizionale (Mifflin-St Jeor)</h2>
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="bg-sage/10 p-3 rounded-xl">
            <span className="text-xs text-charcoal-muted uppercase block">Metabolismo Basale</span>
            <span className="text-xl font-medium text-sage-dark">{nutrition.bmr} kcal</span>
          </div>
          <div className="bg-sage/10 p-3 rounded-xl">
            <span className="text-xs text-charcoal-muted uppercase block">Fabbisogno (TDEE)</span>
            <span className="text-xl font-medium text-sage-dark">{nutrition.tdee} kcal</span>
          </div>
          <div className="bg-earth/10 p-3 rounded-xl col-span-2">
            <span className="text-xs text-charcoal-muted uppercase block">Target Proteico (+10% Vegetariano)</span>
            <span className="text-xl font-medium text-earth-dark">{nutrition.protein_target_g} g/giorno</span>
          </div>
        </div>
      </section>

      <section className="mt-4 mb-8">
        <button 
          onClick={handleReset}
          className="w-full py-4 text-earth font-semibold text-sm border border-earth/20 rounded-2xl hover:bg-earth/5 transition-colors"
        >
          Reset Totale Dati
        </button>
        <p className="text-[10px] text-charcoal-muted text-center mt-2 px-6">
          Questa azione è irreversibile. Tutti i pasti, le attività e le impostazioni del profilo verranno eliminati localmente e dal cloud.
        </p>
      </section>
    </div>
  );
}
