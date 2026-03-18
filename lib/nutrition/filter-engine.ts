// ─── GreenBalance: Blacklist / Whitelist Filter Engine ───────────────────────
// 
// Blacklist assoluta: tutte le carni, gorgonzola, additivi occulti di origine
// animale (E120, E441, E542, isinglass).
//
// Whitelist strategica: cozze, vongole, caglio animale (nei formaggi DOP).
// Queste eccezioni sono CLINICAMENTE MOTIVATE e NON possono essere bloccate.
// ─────────────────────────────────────────────────────────────────────────────

const BLACKLIST_TERMS: string[] = [
  // Carni
  "carne", "manzo", "vitello", "bovino", "bue",
  "maiale", "prosciutto", "pancetta", "lardo", "strutto",
  "pollo", "tacchino", "anatra", "oca", "quaglia",
  "agnello", "coniglio", "cinghiale", "selvaggina",
  "salsiccia", "salame", "mortadella", "bresaola", "speck",
  "pesce", "tonno", "salmone", "baccalà", "acciughe", "sardine",
  "gamberi", "calamari", "polpo", "seppia",
  "uova di pesce", "caviale",
  // Formaggi vietati
  "gorgonzola",
  // Additivi occulti di origine animale
  "e120", "carminio", "cochineal", "carmin",
  "e441", "gelatina", "gelatine",
  "e542", "fosfato di ossa",
  "isinglass", "colla di pesce",
  "albumina", "albumin",
];

// La whitelist SOVRASCRIVE la blacklist per questi termini
const WHITELIST_OVERRIDE_TERMS: string[] = [
  "cozze", "vongole", "cozza", "vongola",
  "caglio animale", "caglio",
  "mitili",
];

export type IngredientStatus = "allowed" | "blocked" | "whitelist";

export interface IngredientCheck {
  ingredient: string;
  status: IngredientStatus;
  matchedTerm?: string;
}

function normalize(s: string): string {
  return s.toLowerCase().trim();
}

export function checkIngredient(ingredient: string): IngredientCheck {
  const norm = normalize(ingredient);

  // 1. Controlla whitelist prima (ha priorità assoluta)
  for (const term of WHITELIST_OVERRIDE_TERMS) {
    if (norm.includes(term)) {
      return { ingredient, status: "whitelist", matchedTerm: term };
    }
  }

  // 2. Controlla blacklist
  for (const term of BLACKLIST_TERMS) {
    if (norm.includes(term)) {
      return { ingredient, status: "blocked", matchedTerm: term };
    }
  }

  return { ingredient, status: "allowed" };
}

export function checkIngredientList(ingredients: string[]): {
  results: IngredientCheck[];
  compatible: boolean;
  blockedItems: IngredientCheck[];
  whitelistItems: IngredientCheck[];
} {
  const results = ingredients.map(checkIngredient);
  const blockedItems = results.filter((r) => r.status === "blocked");
  const whitelistItems = results.filter((r) => r.status === "whitelist");

  return {
    results,
    compatible: blockedItems.length === 0,
    blockedItems,
    whitelistItems,
  };
}

// Parsing del testo grezzo dell'etichetta in lista ingredienti
export function parseRawIngredients(raw: string): string[] {
  return raw
    .split(/[,;.()\[\]\/]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1);
}
