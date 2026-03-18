---
description: Constraints for PWA data persistence on iOS Safari
---

# Safari Mobile constraints (Offline-First)

**Context:** Apple's WebKit on iOS has historically hostile support for advanced PWA background features. We must build around these limitations.

## Data Persistence Rules
1. **Background Sync API is FORBIDDEN**: Do not attempt to use `navigator.serviceWorker.ready.then(sw => sw.sync.register())`. iOS Safari does not support it and it will crash the execution path.
2. **IndexedDB is Mandatory**: Use `Dexie.js` for all local structural database operations. Do not use `localStorage` for complex objects or arrays as quota limits are strict and performance is synchronous (blocking UI).
3. **Eventual Consistency**: Use the Sync Queue Pattern. 
   - Write to Dexie immediately.
   - Insert a record into Dexie's `sync_queue` table.
   - Use `window.addEventListener('online', drainQueue)` to flush to Supabase.

## Viewport Rules
- Always use `viewport-fit=cover`.
- Always pad bottom sticky elements with `env(safe-area-inset-bottom)` to avoid the iPhone home indicator overlapping clickable areas.
