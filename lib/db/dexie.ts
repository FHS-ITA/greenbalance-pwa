import Dexie, { type Table } from "dexie";
import type {
  NutritionLog,
  UserProfile,
  ActivityLog,
  SyncQueueItem,
} from "./types";

export class GreenBalanceDB extends Dexie {
  nutrition_logs!: Table<NutritionLog>;
  user_profile!: Table<UserProfile>;
  activity_logs!: Table<ActivityLog>;
  sync_queue!: Table<SyncQueueItem>;

  constructor() {
    super("GreenBalanceDB");

    this.version(2).stores({
      nutrition_logs: "++id, date, meal_type, synced, created_at",
      user_profile:   "++id, updated_at",
      activity_logs:  "++id, date, synced",
      sync_queue:     "++id, table_name, operation, created_at",
    });
  }
}

export const db = new GreenBalanceDB();

// ─── Helpers ────────────────────────────────────────────────────────────────

export async function getLogsForDate(date: string): Promise<NutritionLog[]> {
  return db.nutrition_logs.where("date").equals(date).toArray();
}

export async function getLogsForRange(
  from: string, // ISO "YYYY-MM-DD"
  to: string
): Promise<NutritionLog[]> {
  return db.nutrition_logs
    .where("date")
    .between(from, to, true, true)
    .toArray();
}

export async function getUserProfile(): Promise<UserProfile | undefined> {
  const profiles = await db.user_profile.toArray();
  return profiles[0];
}

export async function saveUserProfile(profile: Omit<UserProfile, "id">): Promise<void> {
  const existing = await getUserProfile();
  if (existing?.id) {
    await db.user_profile.update(existing.id, { ...profile });
  } else {
    await db.user_profile.add({ ...profile });
  }
}

export async function addNutritionLog(log: Omit<NutritionLog, "id">): Promise<number> {
  const id = await db.nutrition_logs.add({ ...log });
  // Queue for sync
  await db.sync_queue.add({
    table_name: "nutrition_logs",
    operation: "insert",
    payload: { ...log, id },
    created_at: new Date().toISOString(),
  });
  return id as number;
}

export async function addActivity(log: Omit<ActivityLog, "id">): Promise<number> {
  const id = await db.activity_logs.add({ ...log });
  await db.sync_queue.add({
    table_name: "activity_logs",
    operation: "insert",
    payload: { ...log, id },
    created_at: new Date().toISOString(),
  });
  return id as number;
}

export async function getPendingSyncItems(): Promise<SyncQueueItem[]> {
  return db.sync_queue.toArray();
}

export async function clearSyncedItem(id: number): Promise<void> {
  await db.sync_queue.delete(id);
}

export async function deleteActivity(id: number): Promise<void> {
  await db.activity_logs.delete(id);
  // Optional: Queue deletion for Supabase sync if needed
  await db.sync_queue.add({
    table_name: "activity_logs",
    operation: "delete",
    payload: { id },
    created_at: new Date().toISOString(),
  });
}
