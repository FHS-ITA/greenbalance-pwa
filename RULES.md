# GreenBalance PWA — Costitution Rules for Antigravity Agent

Questo progetto aderisce a un framework clinico, psicologico e architetturale rigidamente definito. Come agente Google Antigravity incaricato dello sviluppo, DEVI rispettare queste direttive in ogni interazione, commit o generazione di codice.

## 1. Architettura Offline-First (Safari Mobile)
- **Regola:** Non usare MAI le `Background Sync API` (non funzionano su iOS Safari).
- **Stack Obbligatorio:** Tutte le scritture locali passano attraverso Dexie.js (IndexedDB). Nessun log nutrizionale o dato strutturato deve essere salvato in `localStorage`.
- **Sync Pattern:** Usa il `SyncManager` che listens a `window.ononline` per drenare la coda `sync_queue` verso Supabase.

## 2. UI/UX: Neuro-Estetica e Paradigma del Testimone
- **Regola:** Il colore ROSSO (`#FF0000`, `text-red-500`, ecc.) è **PROIBITO** in tutto il codice. Usa solo le varianti `ochre` (giallo scuro) o `earth` (marrone) per allarmi.
- **Microcopy:** Non usare mai parole di fallimento (error, fail, forgot, streak broken). Il sistema funge da "Testimone neutrale" (Psicosintesi).
- **No-Guilt Closure:** I giorni senza log vengono semplicemente ignorati visivamente. Nessun badge punitivo.

## 3. Motore Nutrizionale: Blacklist vs Whitelist
- **Regola Suprema:** La Whitelist (cozze, vongole, caglio animale) SOVRASCRIVE SEMPRE la Blacklist (carni, gorgonzola, additivi derivati da animali).
- **Proteine:** Calcola il target proteico al ~1.0 g/kg per compensare la minore biodisponibilità delle proteine vegetali (aumento del 10% rispetto alle LGN).
- **TDEE & PAL:** I coefficienti PAL devono riflettere il NEAT della "maternità attiva" (1.375 o 1.55).

## 4. Motore AI: Tono Socratico (Gemini 2.5 Flash)
- **Regola:** Il prompt di sistema di Gemini non deve MAI permettere un tono prescrittivo (es. "non dovresti mangiare", "evita questo").
- Usa linguaggio socratico e maieutico: "Cosa senti nel tuo corpo dopo...", "Ho notato che...", "Potremmo esplorare...".

Queste regole sono dettagliate nella cartella `.agents/rules` e `.agents/skills`. Caricale nel tuo contesto quando modifichi sezioni specifiche.
