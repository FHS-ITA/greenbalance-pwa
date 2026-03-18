"use client";

import { useState, useEffect } from "react";
import { db, addActivity, deleteActivity } from "@/lib/db/dexie";
import type { ActivityLog } from "@/lib/db/types";

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    type: "Camminata Veloce",
    duration: 30,
    intensity: 2 as 1 | 2 | 3,
  });

  useEffect(() => {
    loadActivities();
  }, []);

  async function loadActivities() {
    const data = await db.activity_logs.orderBy("date").reverse().limit(10).toArray();
    setActivities(data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    
    await addActivity({
      date: new Date().toISOString(),
      type: formData.type,
      duration_minutes: formData.duration,
      intensity: formData.intensity,
      synced: false,
    });
    
    await loadActivities();
    setIsSubmitting(false);
    alert("Attività registrata con successo!");
  }

  async function handleDelete(id?: number) {
    console.log("[Activity] Attempting to delete activity with ID:", id);
    if (!id) return;
    if (confirm("Vuoi eliminare questa attività?")) {
      await deleteActivity(id);
      console.log("[Activity] Activity deleted, reloading...");
      await loadActivities();
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto relative pb-20">
      <header>
        <h1 className="gb-heading text-2xl">Movimento</h1>
        <p className="gb-subheading">Registra la tua attività fisica</p>
      </header>

      <section className="gb-card p-5">
        <h2 className="gb-label mb-4">Nuova Attività</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm text-charcoal mb-1 block">Tipo di Attività</label>
            <select 
              className="w-full bg-white border border-sage/30 rounded-lg px-3 py-2 text-charcoal"
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
            >
              <option value="Camminata Veloce">Camminata Veloce</option>
              <option value="Yoga / Stretching">Yoga / Stretching</option>
              <option value="Pilates">Pilates</option>
              <option value="Ciclismo Leggero">Ciclismo Leggero</option>
              <option value="Altro">Altro</option>
            </select>
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm text-charcoal mb-1 block">Durata (min)</label>
              <input 
                type="number" min="5" step="5"
                className="w-full bg-white border border-sage/30 rounded-lg px-3 py-2 text-charcoal"
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: Number(e.target.value)})}
              />
            </div>
            <div className="flex-1">
              <label className="text-sm text-charcoal mb-1 block">Intensità</label>
              <select 
                title="Scegli il livello di sforzo percepito"
                className="w-full bg-white border border-sage/30 rounded-lg px-3 py-2 text-charcoal"
                value={formData.intensity}
                onChange={(e) => setFormData({...formData, intensity: Number(e.target.value) as 1|2|3})}
              >
                <option value={1}>Bassa</option>
                <option value={2}>Moderata</option>
                <option value={3}>Alta</option>
              </select>
            </div>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="gb-btn-primary w-full justify-center mt-2"
          >
            {isSubmitting ? "Salvataggio..." : "Registra Attività"}
          </button>
        </form>
      </section>

      <section className="gb-glass p-5 rounded-2xl">
        <h2 className="gb-label mb-4">Ultime Attività</h2>
        {activities.length === 0 ? (
          <p className="text-sm text-charcoal-muted text-center py-4">Nessuna attività registrata di recente.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {activities.map(act => (
              <div key={act.id} className="bg-white/50 border border-sage/20 p-3 rounded-xl flex justify-between items-center">
                <div>
                  <div className="font-medium text-charcoal">{act.type}</div>
                  <div className="text-xs text-charcoal-muted">
                    {new Date(act.date).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })} • {act.duration_minutes} min
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-xs font-medium px-2 py-1 rounded-full bg-sage/10 text-sage-dark">
                    Intensità {act.intensity}
                  </div>
                  <button 
                    onClick={() => handleDelete(act.id)} 
                    className="w-11 h-11 flex items-center justify-center text-earth hover:bg-earth/5 active:bg-earth/10 rounded-full transition-colors"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
