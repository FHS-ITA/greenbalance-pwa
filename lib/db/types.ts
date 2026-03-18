export type MealType = "colazione" | "pranzo" | "cena" | "spuntino";

export interface FoodItem {
  name: string;
  quantity_g: number;
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  is_whitelist?: boolean;
  is_flagged?: boolean;
}

export interface NutritionLog {
  id?: number;
  date: string;           // ISO: "2026-03-18"
  meal_type: MealType;
  foods: FoodItem[];
  total_calories: number;
  total_protein_g: number;
  satiety: number;        // 0-100
  energy_level: 0 | 1 | 2 | 3 | 4;
  notes?: string;
  ai_insight?: string;
  synced: boolean;
  created_at: string;     // ISO datetime
}

export interface UserProfile {
  id?: number;
  weight_kg: number;
  height_cm: number;
  age: number;
  pal_coefficient: 1.375 | 1.55;
  goal?: "lose_weight" | "maintain" | "reduce_cm";
  target_weight_kg?: number;
  target_cm_reduction?: number;
  bmr?: number;
  tdee?: number;
  protein_target_g?: number;
  last_weight_update?: string; // ISO date — once/week
  updated_at: string;
}

export interface ActivityLog {
  id?: number;
  date: string;           // ISO date
  type: string;           // e.g., "Camminata", "Yoga", "Pilates"
  duration_minutes: number;
  intensity: 1 | 2 | 3;   // 1=Light, 2=Moderate, 3=Hard
  notes?: string;
  synced: boolean;
}

export interface SyncQueueItem {
  id?: number;
  table_name: "nutrition_logs" | "user_profile" | "activity_logs";
  operation: "insert" | "update" | "delete";
  payload: Record<string, unknown>;
  created_at: string;
}

export interface LabelAnalysis {
  compatible: boolean;
  flagged_ingredients: string[];
  whitelist_present: string[];
  blacklist_present: string[];
  notes: string;
  raw_ingredients?: string;
}

export interface Recipe {
  title: string;
  description: string;
  ingredients: { name: string; quantity: string }[];
  steps: string[];
  prep_time_min: number;
  estimated_calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  clinical_notes?: string;
}
