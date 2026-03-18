import type { UserProfile } from "@/lib/db/types";

// ─── Mifflin-St Jeor (femminile) ────────────────────────────────────────────
export function calculateBMR(
  weight_kg: number,
  height_cm: number,
  age: number
): number {
  return Math.round((10 * weight_kg) + (6.25 * height_cm) - (5 * age) - 161);
}

// ─── TDEE con PAL dinamico e Obiettivo ──────────────────────────────────────────
export function calculateTDEE(bmr: number, pal: 1.375 | 1.55, goal?: UserProfile["goal"]): number {
  const tdeeBase = Math.round(bmr * pal);
  if (goal === "lose_weight") {
    // Deficit calorico sicuro (~15%), MAI scendere sotto il BMR
    const target = Math.round(tdeeBase * 0.85);
    return target < bmr ? bmr : target;
  }
  return tdeeBase; // Per 'maintain' e 'reduce_cm' le calorie restano di base quelle di mantenimento
}

// ─── Target proteico vegano +10% ─────────────────────────────────────────────
export function calculateProteinTarget(weight_kg: number, goal?: UserProfile["goal"]): number {
  // Goal 'reduce_cm': ricomposizione corporea -> necessità di più mattoni per i muscoli (1.2 g/kg)
  if (goal === "reduce_cm" || goal === "lose_weight") {
    return Math.round(weight_kg * 1.2);
  }
  // Standard: 0.9 g/kg — con +10% per biodisponibilità vegetale → ~1.0 g/kg
  return Math.round(weight_kg * 1.0);
}

// ─── Calcolo completo per il profilo ─────────────────────────────────────────
export function computeNutritionProfile(profile: UserProfile): {
  bmr: number;
  tdee: number;
  protein_target_g: number;
  carb_target_g: number;
  fat_target_g: number;
} {
  const bmr = calculateBMR(profile.weight_kg, profile.height_cm, profile.age);
  const tdee = calculateTDEE(bmr, profile.pal_coefficient, profile.goal);
  const protein_target_g = calculateProteinTarget(profile.weight_kg, profile.goal);

  // Macros: proteine 20%, grassi 35%, carboidrati 45% (plant-based oriented)
  const protein_kcal = protein_target_g * 4;
  const fat_kcal = tdee * 0.35;
  const carb_kcal = tdee - protein_kcal - fat_kcal;

  return {
    bmr,
    tdee,
    protein_target_g,
    carb_target_g: Math.round(carb_kcal / 4),
    fat_target_g: Math.round(fat_kcal / 9),
  };
}

// ─── Stima PAL da contesto giornaliero ───────────────────────────────────────
export function estimatePAL(activeDay: boolean): 1.375 | 1.55 {
  // Active day = maternità attiva intensa (gioco fisico, uscite, trasporto bambino)
  return activeDay ? 1.55 : 1.375;
}

// ─── Fabbisogno giornaliero rimanente ────────────────────────────────────────
export function remainingCalories(tdee: number, consumedCalories: number): number {
  return Math.max(0, tdee - consumedCalories);
}
