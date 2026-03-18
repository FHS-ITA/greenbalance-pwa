"use client";

import React from "react";

interface SocraticFeedbackProps {
  calories: {
    consumed: number;
    target: number;
  };
  protein: {
    consumed: number;
    target: number;
  };
}

export default function SocraticFeedback({ calories, protein }: SocraticFeedbackProps) {
  const calRatio = calories.consumed / (calories.target || 2000);
  const protRatio = protein.consumed / (protein.target || 60);

  const getCalFeedback = () => {
    if (calRatio < 0.7) {
      return "Ho notato che il tuo corpo oggi ha ricevuto meno energia del solito. Come senti il tuo vigore e la tua presenza?";
    }
    if (calRatio > 1.2) {
      return "Oggi l'energia assunta è stata particolarmente abbondante. C'è qualche emozione o bisogno profondo che ha cercato nutrimento attraverso il cibo?";
    }
    if (calRatio >= 0.9 && calRatio <= 1.1) {
      return "L'apporto energetico di oggi sembra in armonioso equilibrio con ciò di cui il tuo corpo ha bisogno.";
    }
    return null;
  };

  const getProtFeedback = () => {
    if (protRatio < 0.8) {
      return "Le proteine sono i mattoni che sostengono la tua struttura. Mi chiedo se nei prossimi pasti potremmo esplorare modi per nutrire questa forza.";
    }
    return null;
  };

  const calFeedback = getCalFeedback();
  const protFeedback = getProtFeedback();

  if (!calFeedback && !protFeedback) return null;

  return (
    <div className="gb-glass p-5 rounded-2xl border border-sage/20 animate-fade-in space-y-4">
      <div className="flex gap-3">
        <div className="mt-1">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sage-dark">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </div>
        <div className="flex-1 space-y-3">
          {calFeedback && (
            <p className="text-sm text-charcoal leading-relaxed italic">
              {calFeedback}
            </p>
          )}
          {protFeedback && (
            <p className="text-sm text-charcoal leading-relaxed italic">
              {protFeedback}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
