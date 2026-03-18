"use client";

import { useState } from "react";
import { generateRecipeFromFridge } from "@/lib/ai/svuota-frigo";
import { getUserProfile, addNutritionLog } from "@/lib/db/dexie";
import type { Recipe, MealType } from "@/lib/db/types";

export default function SvuotaFrigoPage() {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [current, setCurrent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLogging, setIsLogging] = useState(false);
  const [selectedMeal, setSelectedMeal] = useState<MealType>("cena");

  const addIngredient = () => {
    if (!current.trim()) return;
    setIngredients([...ingredients, current.trim()]);
    setCurrent("");
  };

  const handleGenerate = async () => {
    if (ingredients.length === 0) return;
    setIsLoading(true);
    setRecipe(null);
    try {
      let profile = await getUserProfile();
      if (!profile) {
        profile = { id: 1, weight_kg: 60, height_cm: 165, age: 39, pal_coefficient: 1.375, updated_at: "" };
      }
      const newRecipe = await generateRecipeFromFridge(ingredients, profile);
      setRecipe(newRecipe);
    } catch (e) {
      console.error(e);
      alert("Errore nella generazione della ricetta.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogRecipe = async () => {
    if (!recipe) return;
    setIsLogging(true);
    try {
      await addNutritionLog({
        date: new Date().toISOString().split("T")[0],
        meal_type: selectedMeal,
        foods: [{ name: recipe.title, quantity_g: 100 }], // 100 is just a placeholder for full portion
        total_calories: recipe.estimated_calories,
        total_protein_g: recipe.protein_g,
        satiety: 50, // default neutral
        energy_level: 2, // default neutral
        notes: "Ricetta Svuota Frigo AI",
        synced: false,
        created_at: new Date().toISOString()
      });
      alert("Ricetta aggiunta al diario di oggi!");
    } catch (err) {
      console.error(err);
      alert("Errore durante il salvataggio.");
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto">
      <header>
        <h1 className="gb-heading text-2xl">Svuota Frigo</h1>
        <p className="gb-subheading">Invenzioni culinarie rapide</p>
      </header>

      {!recipe && (
        <section className="gb-card p-5 flex flex-col gap-4">
          <p className="text-sm text-charcoal leading-relaxed">
            Inserisci gli ingredienti che hai e creeremo una ricetta veloce rispettando i tuoi vincoli infiammatori.
          </p>

          <div className="flex gap-2 mt-2">
            <input
              type="text"
              className="flex-1 bg-white border border-sage/30 rounded-lg px-3 py-2 text-charcoal"
              placeholder="es. Zucchine, Uova..."
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addIngredient()}
            />
            <button className="gb-btn-primary px-4 py-2" onClick={addIngredient}>+</button>
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            {ingredients.map((ing, i) => (
              <div key={i} className="bg-sage/20 text-sage-dark px-3 py-1 rounded-full text-sm flex items-center gap-2">
                <span>{ing}</span>
                <button onClick={() => setIngredients(ingredients.filter((_, idx) => idx !== i))} className="text-earth hover:text-earth-dark">&times;</button>
              </div>
            ))}
          </div>

          <button
            className="gb-btn-primary w-full justify-center mt-6 py-3"
            onClick={handleGenerate}
            disabled={ingredients.length === 0 || isLoading}
          >
            {isLoading ? "Invenzione in corso..." : "Genera Ricetta (AI)"}
          </button>
        </section>
      )}

      {recipe && (
        <section className="gb-glass p-0 rounded-2xl overflow-hidden animate-slide-up">
          <div className="bg-sage/20 p-5 border-b border-sage/30">
            <div className="flex justify-between items-start mb-2">
              <h2 className="gb-heading text-xl text-sage-dark">{recipe.title}</h2>
              <button className="text-charcoal-muted" onClick={() => setRecipe(null)}>&times;</button>
            </div>
            <p className="text-sm text-charcoal italic">{recipe.description}</p>
          </div>

          <div className="p-5 flex flex-col gap-5">
            <div className="flex justify-between items-center text-sm font-medium">
              <span className="text-ochre">⏱ {recipe.prep_time_min} min</span>
              <span className="text-charcoal">{recipe.estimated_calories} kcal</span>
              <span className="text-earth">{recipe.protein_g}g Prot</span>
            </div>

            {recipe.clinical_notes && (
              <div className="bg-cream-dark p-3 rounded-xl border border-sage/20">
                <p className="text-xs text-sage-dark font-medium uppercase tracking-wider mb-1">Nota Nutrizionale</p>
                <p className="text-sm text-charcoal">{recipe.clinical_notes}</p>
              </div>
            )}

            <div>
              <h3 className="gb-label mb-2">Ingredienti Utilizzati</h3>
              <ul className="text-sm text-charcoal space-y-1 ml-4 list-disc">
                {recipe.ingredients.map((ing, i) => (
                  <li key={i}><strong>{ing.quantity}</strong> {ing.name}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="gb-label mb-2">Procedimento</h3>
              <ol className="text-sm text-charcoal space-y-3 ml-4">
                {recipe.steps.map((step, i) => (
                  <li key={i} className="pl-1">
                    <span className="font-semibold text-sage mr-2">{i+1}.</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>

            {/* Azione rapida: Aggiungi al diario */}
            <div className="mt-4 border-t border-sage/30 pt-6">
              <h3 className="gb-label mb-3">Registra nel Diario di Oggi</h3>
              <div className="flex gap-2 bg-sage/10 p-1 rounded-xl mb-4">
                {(["colazione", "pranzo", "cena", "spuntino"] as MealType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedMeal(type)}
                    className={`flex-1 py-2 px-2 rounded-lg text-xs font-medium capitalize transition-all ${
                      selectedMeal === type ? "bg-white shadow-card text-charcoal" : "text-charcoal-muted"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <button
                className="gb-btn-primary w-full justify-center"
                onClick={handleLogRecipe}
                disabled={isLogging}
              >
                {isLogging ? "Salvataggio..." : "Registra Pasto"}
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
