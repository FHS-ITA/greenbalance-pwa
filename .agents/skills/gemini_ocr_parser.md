---
description: Setup Multimodal Prompt for Food Label Parsing
---

# Skill: Gemini 2.5 Flash OCR Parser

**Context:** The app scans food labels via the mobile camera and filters ingredients according to a strict Blacklist/Whitelist medical logic.

## Prompt Construction
1. Specify the system rules and identify Monica's condition (Alopecia Universale).
2. Explicitly bind the whitelist items ('cozze', 'vongole', 'caglio animale') to SUPERCEDE any general ban on animal products.
3. List the forbidden E-additives clearly (E120, E441, E542, isinglass).
4. Demand a `response_mime_type: "application/json"` with an explicitly provided schema structure:
   - `compatible` (boolean)
   - `flagged_ingredients` (string array)
   - `whitelist_present` (string array)
   - `blacklist_present` (string array)
   - `notes` (string)
5. Set inference Temperature very low (`0.1`) to avoid hallucinations in the parsed ingredients.
