"use server";

import { getGeminiModel } from "./gemini-client";
import type { FoodItem } from "@/lib/db/types";

const ESTIMATOR_SYSTEM_PROMPT = `Sei un assistante nutrizionale esperto e discreto per Monica, una psicoterapeuta vegetariana.

OBIETTIVO:
Data una descrizione naturale di un alimento (es. "fetta di torta di carote", "piatto di pasta al pesto"), stima il peso tipico in grammi e i relativi macro-nutrienti.

REGOLE DI RISPOSTA:
1. Restituisci SEMPRE e SOLO un oggetto JSON valido.
2. Sii realistico con le porzioni "medie" se non specificate.
3. Non aggiungere commenti o testo extra.
4. Usa i nomi dei campi: name, quantity_g, calories, protein_g, carbs_g, fat_g.
5. Se l'alimento non è vegetariano, segnalalo nel nome aggiungendo "(Non vegetariano?)" ma stima comunque i valori.

FORMATO JSON:
{
  "name": "nome alimento",
  "quantity_g": valore numerico,
  "calories": valore numerico,
  "protein_g": valore numerico,
  "carbs_g": valore numerico,
  "fat_g": valore numerico
}`;

export async function estimateFoodMetrics(description: string): Promise<FoodItem> {
  const model = getGeminiModel();
  
  const prompt = `Descrizione: ${description}\n\nStima peso e macro in formato JSON:`;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: ESTIMATOR_SYSTEM_PROMPT }, { text: prompt }] }],
      generationConfig: {
        temperature: 0.2, // Bassa temperatura per risposte più consistenti/tecniche
        responseMimeType: "application/json",
      },
    });

    const text = result.response.text();
    const data = JSON.parse(text);

    return {
      name: data.name || description,
      quantity_g: Number(data.quantity_g) || 100,
      calories: Number(data.calories) || 0,
      protein_g: Number(data.protein_g) || 0,
      carbs_g: Number(data.carbs_g) || 0,
      fat_g: Number(data.fat_g) || 0,
    };
  } catch (error) {
    console.error("Error estimating food metrics:", error);
    // Fallback sicuro
    return {
      name: description,
      quantity_g: 100,
      calories: 0,
      protein_g: 0,
    };
  }
}
