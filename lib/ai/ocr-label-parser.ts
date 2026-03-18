"use server";

import { getGeminiVisionModel } from "./gemini-client";
import type { LabelAnalysis } from "@/lib/db/types";

const BLACKLIST = [
  "carne", "manzo", "maiale", "pollo", "tacchino", "agnello", "tonno",
  "salmone", "gamberi", "pesce", "gorgonzola",
  "e120", "e441", "e542", "isinglass", "colla di pesce", "gelatina",
  "carminio", "albumina"
];

const WHITELIST = ["cozze", "vongole", "caglio animale", "caglio", "mitili"];

const SYSTEM_PROMPT = `Sei l'assistente nutrizionale di Monica, una donna vegetariana flessibile con alopecia universale.

REGOLE ASSOLUTE:
- Ingredienti SEMPRE vietati (blacklist): ${BLACKLIST.join(", ")}
- Ingredienti SEMPRE ammessi anche se di origine animale (whitelist con priorità assoluta): ${WHITELIST.join(", ")}
- Il caglio animale nei formaggi DOP è SEMPRE ammesso — non bloccarlo mai
- Gli additivi E120, E441, E542 e isinglass devono essere rilevati anche se scritti per nome esteso

Analizza la lista ingredienti dell'etichetta e restituisci SOLO un JSON valido nel seguente formato:
{
  "compatible": boolean,
  "flagged_ingredients": string[],
  "whitelist_present": string[],
  "blacklist_present": string[],
  "notes": string,
  "raw_ingredients": string
}`;

export async function parseLabelFromImage(
  imageBase64: string,
  mimeType: "image/jpeg" | "image/png" | "image/webp" = "image/jpeg"
): Promise<LabelAnalysis> {
  const model = getGeminiVisionModel();

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType,
              data: imageBase64,
            },
          },
          {
            text: `${SYSTEM_PROMPT}\n\nAnalizza questa etichetta alimentare:`,
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.1,
    },
  });

  const text = result.response.text();

  try {
    return JSON.parse(text) as LabelAnalysis;
  } catch {
    return {
      compatible: false,
      flagged_ingredients: [],
      whitelist_present: [],
      blacklist_present: [],
      notes: "Impossibile analizzare l'etichetta. Riprova con un'immagine più nitida.",
      raw_ingredients: text,
    };
  }
}

export async function parseLabelFromText(ingredientsText: string): Promise<LabelAnalysis> {
  const model = getGeminiVisionModel();

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `${SYSTEM_PROMPT}\n\nLista ingredienti da analizzare:\n${ingredientsText}`,
          },
        ],
      },
    ],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.1,
    },
  });

  const text = result.response.text();
  try {
    return JSON.parse(text) as LabelAnalysis;
  } catch {
    return {
      compatible: false,
      flagged_ingredients: [],
      whitelist_present: [],
      blacklist_present: [],
      notes: "Errore nell'analisi del testo.",
    };
  }
}
