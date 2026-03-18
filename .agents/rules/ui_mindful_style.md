---
description: Mindful UI style specifications and color prohibitions
---

# UI Mindful Style Constraint

**Context:** The UI is designed to lower cognitive load and cortisol levels, acting as a neutral observer (Witness paradigm) rather than a gamified/punishing system.

## Absolute Rules
1. **NO RED ALLOWED**: You must never use the color red in any form. This includes `#FF0000`, `red`, tailwind classes `bg-red-500`, `text-red-600`, `border-red-400`, etc.
2. **Error States**: For warnings and errors, explicitly use the custom tailwind tokens: `text-ochre`, `text-earth`, `bg-earth/10`, etc.
3. **No Punitive Microcopy**: Never use words like "Fail", "Error", "Forgot", "Missed", "Break", "Streak lost".
4. **Tone**: Interface copy must be warm, dry, and professional.

## Palette Reference
Always use the alias tokens defined in `tailwind.config.ts`:
- **Sage (`bg-sage`)**: Primary actions, navigation, success.
- **Cream (`bg-cream`)**: Global backgrounds.
- **Charcoal (`text-charcoal`)**: Primary typography.
- **Ochre (`text-ochre`)**: Warnings, low energy states.
- **Earth (`text-earth`)**: Errors, exhausted states.
