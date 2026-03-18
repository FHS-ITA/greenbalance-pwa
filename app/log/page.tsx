"use client";

import { useState, useRef } from "react";
import { useAppState } from "@/components/AppProviders";
import { db, addNutritionLog, getUserProfile } from "@/lib/db/dexie";
import { parseLabelFromImage } from "@/lib/ai/ocr-label-parser";
import { getAIInsight } from "@/lib/ai/conversational";
import { estimateFoodMetrics } from "@/lib/ai/nutrition-estimator";
import type { MealType, FoodItem, NutritionLog, LabelAnalysis } from "@/lib/db/types";

export default function LogPage() {
  const { energyLevel, satiety, setEnergyLevel, setSatiety } = useAppState();
  const [mealType, setMealType] = useState<MealType>("pranzo");
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [currentFoodName, setCurrentFoodName] = useState("");
  const [totalCalories, setTotalCalories] = useState(0);
  const [totalProtein, setTotalProtein] = useState(0);
  const [notes, setNotes] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [isEstimating, setIsEstimating] = useState(false);
  const [scanResult, setScanResult] = useState<LabelAnalysis | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFood = async () => {
    if (!currentFoodName) return;
    const name = currentFoodName;
    setCurrentFoodName("");
    setIsEstimating(true);

    try {
      const estimated = await estimateFoodMetrics(name);
      const newFoods = [...foods, estimated];
      setFoods(newFoods);
      
      // Update totals based on AI estimate
      const newCal = newFoods.reduce((acc, f) => acc + (f.calories || 0), 0);
      const newProt = newFoods.reduce((acc, f) => acc + (f.protein_g || 0), 0);
      setTotalCalories(Math.round(newCal));
      setTotalProtein(Math.round(newProt));
    } catch (err) {
      setFoods([...foods, { name, quantity_g: 100 }]);
    } finally {
      setIsEstimating(false);
    }
  };

  const updateFoodQuantity = (index: number, grams: number) => {
    const newFoods = [...foods];
    const food = newFoods[index];
    const ratio = grams / (food.quantity_g || 100);
    
    newFoods[index] = {
      ...food,
      quantity_g: grams,
      calories: food.calories ? Math.round(food.calories * ratio) : 0,
      protein_g: food.protein_g ? food.protein_g * ratio : 0,
      carbs_g: food.carbs_g ? food.carbs_g * ratio : 0,
      fat_g: food.fat_g ? food.fat_g * ratio : 0,
    };
    
    setFoods(newFoods);
    
    // Sync totals
    setTotalCalories(Math.round(newFoods.reduce((acc, f) => acc + (f.calories || 0), 0)));
    setTotalProtein(Math.round(newFoods.reduce((acc, f) => acc + (f.protein_g || 0), 0)));
  };

  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setScanResult(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = (event.target?.result as string).split(",")[1];
      try {
        const result = await parseLabelFromImage(base64, file.type as any);
        setScanResult(result);
        if (result.compatible) {
          // Aggiungiamo un placeholder, Monica dovrà poi precisarlo
          setFoods([...foods, { name: "Prodotto scannerizzato", quantity_g: 100, is_whitelist: result.whitelist_present.length > 0 }]);
        }
      } catch (err) {
        setScanResult({
          compatible: false,
          flagged_ingredients: [],
          whitelist_present: [],
          blacklist_present: [],
          notes: "Errore di connessione durante l'analisi visiva.",
        });
      } finally {
        setIsScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (foods.length === 0 && !notes) return; // Nothing to log

    const newLog: Omit<NutritionLog, "id"> = {
      date: new Date().toISOString().split("T")[0],
      meal_type: mealType,
      foods,
      total_calories: Number(totalCalories) || 0,
      total_protein_g: Number(totalProtein) || 0,
      satiety,
      energy_level: energyLevel as any,
      notes,
      synced: false,
      created_at: new Date().toISOString()
    };

    try {
      // Legge le attività recenti per dare contesto alla AI
      const recentActivities = await db.activity_logs.orderBy("date").reverse().limit(5).toArray();
      let activityContext = "";
      if (recentActivities.length > 0) {
        activityContext = recentActivities.map(a => `${a.type} (${a.duration_minutes} min, intensità ${a.intensity})`).join(", ");
      }

      // Legge il profilo per passare l'obiettivo alla AI
      const profile = await getUserProfile();
      let goalContext = "Mantenimento";
      if (profile) {
        if (profile.goal === "lose_weight") goalContext = `Perdere peso (Target: ${profile.target_weight_kg || '?'} kg)`;
        if (profile.goal === "reduce_cm") goalContext = `Ricomposizione e dare compattezza (Target riduzione: ${profile.target_cm_reduction || '?'} cm)`;
      }

      // 1. Get AI Insight first so it can be saved with the log if needed
      const aiResponse = await getAIInsight(newLog as NutritionLog, [], activityContext, goalContext);
      newLog.ai_insight = aiResponse;
      
      // 2. Save
      await addNutritionLog(newLog);

      // 3. Reset
      setFoods([]);
      setTotalCalories(0);
      setTotalProtein(0);
      setNotes("");
      setScanResult(null);
      
      // We could show a success toast here or redirect
      alert("Pasto registrato! " + (newLog.ai_insight ? "\n\n" + newLog.ai_insight : ""));
    } catch (err) {
      console.error(err);
      alert("Errore nel salvataggio. Riprova.");
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto">
      <header>
        <h1 className="gb-heading text-2xl">Registra Pasto</h1>
        <p className="gb-subheading">Aggiungi senza giudizio</p>
      </header>

      <section className="gb-card p-5 flex flex-col gap-4">
        {/* Meal Type */}
        <div>
          <label className="gb-label block mb-2">Tipo di Pasto</label>
          <div className="flex gap-2 bg-sage/10 p-1 rounded-xl">
            {(["colazione", "pranzo", "cena", "spuntino"] as MealType[]).map((type) => (
              <button
                key={type}
                onClick={() => setMealType(type)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium capitalize transition-all ${
                  mealType === type ? "bg-white shadow-card text-charcoal" : "text-charcoal-muted"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* OCR Scanner */}
        <div className="mt-2">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={fileInputRef}
            className="hidden"
            onChange={handleScan}
          />
          <button
            className="gb-btn-ghost w-full justify-center border-sage text-sage-dark"
            onClick={() => fileInputRef.current?.click()}
            disabled={isScanning}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 8V6C4 4.89543 4.89543 4 6 4H8M16 4H18C19.1046 4 20 4.89543 20 6V8M4 16V18C4 19.1046 4.89543 20 6 20H8M16 20H18C19.1046 20 20 19.1046 20 18V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
            </svg>
            {isScanning ? "Lettura etichetta..." : "Scansiona Etichetta (OCR)"}
          </button>
        </div>

        {/* Scan Result Alert */}
        {scanResult && (
          <div className={`p-4 rounded-xl border ${scanResult.compatible ? 'bg-sage/10 border-sage/30' : 'bg-earth/10 border-earth/30'}`}>
            <div className="flex gap-2 items-center mb-1">
              {scanResult.compatible ? (
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 13L9 17L19 7" stroke="#B2AC88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="#8B5E3C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              )}
              <h4 className={`font-medium ${scanResult.compatible ? 'text-sage-dark' : 'text-earth-dark'}`}>
                {scanResult.compatible ? "Prodotto Compatibile" : "Attenzione: Elementi Vietati"}
              </h4>
            </div>
            <p className="text-sm text-charcoal-muted mt-2">{scanResult.notes}</p>
            {scanResult.blacklist_present && scanResult.blacklist_present.length > 0 && (
              <p className="text-sm font-medium text-earth mt-1">Rilevati: {scanResult.blacklist_present.join(', ')}</p>
            )}
            {scanResult.whitelist_present && scanResult.whitelist_present.length > 0 && (
              <p className="text-sm font-medium text-sage-dark mt-1">Include: {scanResult.whitelist_present.join(', ')} (Ammesso)</p>
            )}
          </div>
        )}

        {/* Manual Input */}
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 bg-white border border-sage/30 rounded-lg px-3 py-2 text-charcoal focus-visible:outline-sage/50 placeholder:text-sage/50"
            placeholder="Aggiungi ingrediente..."
            value={currentFoodName}
            onChange={(e) => setCurrentFoodName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addFood()}
          />
          <button 
            className="gb-btn-primary px-4 py-2 disabled:opacity-50" 
            onClick={addFood}
            disabled={isEstimating}
          >
            {isEstimating ? "..." : "+"}
          </button>
        </div>

        {foods.length > 0 && (
          <ul className="space-y-2 mt-2">
            {foods.map((f, i) => (
              <li key={i} className="flex flex-col gap-1 py-2 border-b border-sage/10 last:border-0">
                <div className="flex justify-between items-center">
                  <span className="text-charcoal font-medium">{f.name}</span>
                  <button className="text-earth text-xl leading-none" onClick={() => {
                    const next = foods.filter((_, idx) => idx !== i);
                    setFoods(next);
                    setTotalCalories(Math.round(next.reduce((acc, food) => acc + (food.calories || 0), 0)));
                    setTotalProtein(Math.round(next.reduce((acc, food) => acc + (food.protein_g || 0), 0)));
                  }}>&times;</button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <input 
                      type="number" 
                      className="w-16 bg-white/50 border border-sage/20 rounded px-1 text-sm text-charcoal"
                      value={f.quantity_g}
                      onChange={(e) => updateFoodQuantity(i, parseInt(e.target.value) || 0)}
                    />
                    <span className="text-xs text-charcoal-muted">g</span>
                  </div>
                  <div className="text-xs text-sage-dark flex gap-2">
                    <span>{Math.round(f.calories || 0)} kcal</span>
                    <span>{f.protein_g?.toFixed(1)}g prot</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Macros */}
        <div className="flex gap-4 mt-2">
          <div className="flex-1">
            <label className="gb-label block mb-1">Calorie (Opz)</label>
            <input
              type="number"
              className="w-full bg-white border border-sage/30 rounded-lg px-3 py-2 text-charcoal focus-visible:outline-sage/50"
              value={totalCalories || ""}
              onChange={(e) => setTotalCalories(parseInt(e.target.value))}
            />
          </div>
          <div className="flex-1">
            <label className="gb-label block mb-1">Proteine g (Opz)</label>
            <input
              type="number"
              className="w-full bg-white border border-sage/30 rounded-lg px-3 py-2 text-charcoal focus-visible:outline-sage/50"
              value={totalProtein || ""}
              onChange={(e) => setTotalProtein(parseInt(e.target.value))}
            />
          </div>
        </div>

        {/* Somatic Slider - Energia */}
        <div className="mt-2">
          <div className="flex justify-between items-end mb-2">
            <label className="gb-label">Energia Percepita</label>
            <span className="text-sm font-medium text-sage-dark">{energyLevel}/4</span>
          </div>
          <input
            type="range"
            min="0"
            max="4"
            className="w-full accent-sage"
            value={energyLevel}
            onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
          />
        </div>

        {/* Somatic Slider - Sazietà */}
        <div className="mt-2">
          <div className="flex justify-between items-end mb-2">
            <label className="gb-label">Sazietà Percepita</label>
            <span className="text-sm font-medium text-sage-dark">{satiety}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            className="w-full accent-sage"
            value={satiety}
            onChange={(e) => setSatiety(parseInt(e.target.value))}
          />
        </div>

        {/* Notes */}
        <div className="mt-2">
          <label className="gb-label block mb-1">Note Somatiche</label>
          <textarea
            className="w-full bg-white border border-sage/30 rounded-lg px-3 py-2 text-charcoal focus-visible:outline-sage/50"
            rows={2}
            placeholder="Come ti senti?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <button className="gb-btn-primary w-full justify-center mt-4" onClick={handleSubmit}>
          Salva nel Diario senza giudizio
        </button>
      </section>
    </div>
  );
}
