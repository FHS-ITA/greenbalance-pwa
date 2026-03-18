"use server";

import { getGeminiModel } from "./gemini-client";
import type { Recipe, UserProfile } from "@/lib/db/types";
import { computeNutritionProfile } from "@/lib/nutrition/calculator";

const BLACKLIST = [
  "carne", "manzo", "maiale", "pollo", "tacchino", "agnello", "tonno",
  "salmone", "gamberi", "gorgonzola", "e120", "e441", "e542", "isinglass"
];

const WHITELIST = ["cozze", "vongole", "caglio animale"];

function buildSvuotaFrigoPrompt(
  ingredients: string[],
  profile: UserProfile
): string {
  const nutrition = computeNutritionProfile(profile);

  let goalText = "Mantenimento peso";
  if (profile.goal === "lose_weight") {
    goalText = `Perdere peso (Target da raggiungere: ${profile.target_weight_kg || '?'} kg)`;
  } else if (profile.goal === "reduce_cm") {
    goalText = `Ricomposizione e riduzione centimetri (Target riduzione: ${profile.target_cm_reduction || '?'} cm)`;
  }

  return `Sei il cuoco-consulente nutrizionale di Monica, donna vegetariana flessibile con alopecia universale.

PROFILO NUTRIZIONALE E OBIETTIVI:
- Obiettivo Clinico: ${goalText}
- TDEE giornaliero ricalibrato: ${nutrition.tdee} kcal (PAL ${profile.pal_coefficient})
- Target proteico adeguato all'obiettivo: ${nutrition.protein_target_g}g/giorno
- Dieta plant-based con eccezioni cliniche (cozze, vongole, caglio animale ammessi)

INGREDIENTI DISPONIBILI: ${ingredients.join(", ")}

VINCOLI ASSOLUTI E COSTRUZIONE RICETTA:
- DEVI COSTRUIRE LA RICETTA ESCLUSIVAMENTE CON GLI INGREDIENTI DISPONIBILI: ${ingredients.join(", ")}
- NON INVENTARE ingredienti principali extra o proteine extra. Puoi aggiungere solo elementi base da dispensa (sale, pepe, olio, aglio, spezie, acqua).
- NON usare mai: ${BLACKLIST.join(", ")}
- Gli ingredienti whitelist (${WHITELIST.join(", ")}) sono permessi SOLO SE l'utente li ha scritti. NON aggiungerli di tua iniziativa per aumentare i nutrienti.
- Tieni conto dei micronutrienti terapeutici (zinco, ferro, B12) SOLO attraverso gli ingredienti forniti.
- Ricetta deve essere realizzabile in meno di 30 minuti (Monica è stanca e ha poco tempo)
- Tono: pratico, caldo, non prescrittivo

Genera UNA ricetta e restituisci SOLO un JSON valido in questo formato:
{
  "title": string,
  "description": string,
  "ingredients": [{"name": string, "quantity": string}],
  "steps": string[],
  "prep_time_min": number,
  "estimated_calories": number,
  "protein_g": number,
  "carbs_g": number,
  "fat_g": number,
  "clinical_notes": string
}`;
}

export async function generateRecipeFromFridge(
  ingredients: string[],
  profile: UserProfile
): Promise<Recipe> {
  const model = getGeminiModel();
  const prompt = buildSvuotaFrigoPrompt(ingredients, profile);

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.7,
    },
  });

  const text = result.response.text();

  try {
    return JSON.parse(text) as Recipe;
  } catch {
    return {
      title: "Ricetta non disponibile",
      description: "Non è stato possibile generare una ricetta con questi ingredienti.",
      ingredients: [],
      steps: [],
      prep_time_min: 0,
      estimated_calories: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
    };
  }
}
