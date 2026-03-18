"use client";

import { useEffect, useRef } from "react";
import {
  getPendingSyncItems,
  clearSyncedItem,
} from "@/lib/db/dexie";
import {
  pushNutritionLog,
  pushActivity,
  pushUserProfile,
} from "@/lib/supabase/client";
import type { NutritionLog, UserProfile, ActivityLog } from "@/lib/db/types";

async function drainSyncQueue() {
  const items = await getPendingSyncItems();
  if (items.length === 0) return;

  for (const item of items) {
    try {
      if (item.table_name === "nutrition_logs") {
        await pushNutritionLog(item.payload as unknown as NutritionLog);
      } else if (item.table_name === "user_profile") {
        await pushUserProfile(item.payload as unknown as UserProfile);
      } else if (item.table_name === "activity_logs") {
        await pushActivity(item.payload as unknown as ActivityLog);
      }
      if (item.id !== undefined) {
        await clearSyncedItem(item.id);
      }
    } catch (err) {
      // Silently continue — will retry on next online event
      console.warn("[SyncManager] Failed to sync item:", item.id, err);
    }
  }
}

export default function SyncManager() {
  const hasSynced = useRef(false);

  useEffect(() => {
    // Drain on mount if online
    if (navigator.onLine && !hasSynced.current) {
      hasSynced.current = true;
      drainSyncQueue();
    }

    const handleOnline = () => {
      drainSyncQueue();
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  // Invisible component — only manages sync lifecycle
  return null;
}
