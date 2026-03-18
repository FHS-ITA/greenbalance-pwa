"use server";

import { getGeminiModel } from "./gemini-client";
import type { NutritionLog } from "@/lib/db/types";

// ─── Tono socratico: sistema di vincoli linguistici ──────────────────────────
// 
// PROIBITO: imperativo diretto, "dovresti", "devi", "evita", "non mangiare"
// AMMESSO:  "Ho notato che...", "Cosa senti nel corpo?", "Potremmo esplorare..."
// L'utente è SEMPRE esperta del proprio corpo — l'IA non prescrive, osserva.
// ─────────────────────────────────────────────────────────────────────────────

const SOCRATIC_SYSTEM_PROMPT = `Sei il co-facilitatore terapeutico di Monica, una psicoterapeuta transpersonale di 39 anni.

IDENTITÀ:
- Parli come un collega clinico rispettoso, mai come un nutrizionista prescrittivo
- Sei un "Testimone neutrale" (Psicosintesi di Assagioli): osservi senza giudicare

REGOLE LINGUISTICHE ASSOLUTE:
- VIETATO: imperativo diretto ("evita", "mangia", "non farlo")
- VIETATO: "dovresti", "devi", "è sbagliato", "non va bene"
- VIETATO: punti esclamativi nelle risposte
- AMMESSO: "Ho notato che...", "Mi chiedo se...", "Cosa senti nel corpo..."
- AMMESSO: domande aperte che restituiscono l'agency a Monica
- MAX 2-3 frasi per risposta in stile chat
- Tono: caldo, professionale, non semplificato

CLINICA:
- Alopecia universale → sensibile all'infiammazione intestinale
- Cozze e vongole sono TERAPEUTICI, non "eccezioni" da commentare
- Se noti correlazione IG alto → calo energia: offri l'osservazione come ipotesi aperta`;

export interface ConversationalMessage {
  role: "user" | "model";
  content: string;
}

export async function getAIInsight(
  log: NutritionLog,
  previousMessages: ConversationalMessage[] = [],
  activityContext: string = "",
  goalContext: string = ""
): Promise<string> {
  const model = getGeminiModel();

  // Costruisce il contesto del pasto
  let mealContext = buildMealContext(log);
  if (activityContext) {
    mealContext += `\nCONTESTO ATTIVITÀ FISICA RECENTE: ${activityContext}`;
  }
  if (goalContext) {
    mealContext += `\nOBIETTIVO CLINICO DELL'UTENTE: ${goalContext}`;
  }

  const history = previousMessages.map((m) => ({
    role: m.role,
    parts: [{ text: m.content }],
  }));

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: SOCRATIC_SYSTEM_PROMPT }],
      },
      ...history,
      {
        role: "user",
        parts: [{ text: mealContext }],
      },
    ],
    generationConfig: {
      temperature: 0.8,
      maxOutputTokens: 200,
    },
  });

  return result.response.text().trim();
}

function buildMealContext(log: NutritionLog): string {
  const foods = log.foods.map((f) => f.name).join(", ");
  const energyLabels = ["esaurita", "bassa", "moderata", "buona", "ottimale"];
  const energyLabel = energyLabels[log.energy_level];

  let context = `Monica ha appena registrato: ${log.meal_type} — ${foods}.`;
  context += ` Energia percepita: ${energyLabel}. Sazietà: ${log.satiety}%.`;

  if (log.energy_level <= 1 && log.total_calories > 400) {
    context += " Ha consumato calorie sufficienti ma segnala un calo energetico.";
  }
  if (log.satiety > 85) {
    context += " Si sente molto sazia.";
  }
  if (log.notes) {
    context += ` Note: ${log.notes}`;
  }

  return context;
}

export async function getConversationalResponse(
  userMessage: string,
  history: ConversationalMessage[]
): Promise<string> {
  const model = getGeminiModel();

  const contents = [
    {
      role: "user" as const,
      parts: [{ text: SOCRATIC_SYSTEM_PROMPT }],
    },
    ...history.map((m) => ({
      role: m.role,
      parts: [{ text: m.content }],
    })),
    {
      role: "user" as const,
      parts: [{ text: userMessage }],
    },
  ];

  const result = await model.generateContent({
    contents,
    generationConfig: {
      temperature: 0.75,
      maxOutputTokens: 250,
    },
  });

  return result.response.text().trim();
}
