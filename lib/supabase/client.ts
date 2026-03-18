import { createClient } from "@supabase/supabase-js";
import type { NutritionLog, UserProfile, ActivityLog } from "@/lib/db/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// ─── Supabase push helpers ───────────────────────────────────────────────────

export async function pushNutritionLog(log: NutritionLog) {
  const { data, error } = await supabase
    .from("nutrition_logs")
    .upsert(log, { onConflict: "id" });
  if (error) throw error;
  return data;
}

export async function pushUserProfile(profile: UserProfile) {
  const { data, error } = await supabase
    .from("user_profile")
    .upsert(profile, { onConflict: "id" });
  if (error) throw error;
  return data;
}

export async function pushActivity(entry: ActivityLog) {
  const { data, error } = await supabase
    .from("activity_logs")
    .upsert(entry, { onConflict: "id" });
  if (error) throw error;
  return data;
}
