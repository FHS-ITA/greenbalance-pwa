---
description: Implement Dexie.js + Supabase Sync Manager
---

# Skill: Dexie & Supabase Sync Manager

**Context:** The application needs a robust offline-first architecture on iOS Safari, where Service Worker Background Sync is unsupported.

## Implementation Details
1. Define a local database inherited from `Dexie`.
2. Ensure you have a global `sync_queue` table holding:
   - `id`: Local primary key
   - `table_name`: Target Supabase table
   - `operation`: Insert / Update / Delete
   - `payload`: The actual JSON data to upsert
   - `created_at`: Datetime
3. The React component using the hook should listen to `window.addEventListener('online')` and `navigator.onLine` to flush the queue when internet is available.
4. Suppress errors when the batch upload fails. Silent retries are the core of eventual consistency.
