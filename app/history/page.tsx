"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/db/dexie";
import NoGuiltDayClosure from "@/components/ui/NoGuiltDayClosure";

export default function HistoryPage() {
  const [days, setDays] = useState<{date: string, count: number}[]>([]);

  useEffect(() => {
    async function load() {
      // Get all logs
      const allLogs = await db.nutrition_logs.orderBy('date').reverse().toArray();
      // Group by date
      const group: Record<string, number> = {};
      
      // Generate last 7 days to show empty days as well
      const dates = Array.from({length: 14}).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split("T")[0];
      });

      dates.forEach(d => group[d] = 0);
      allLogs.forEach(log => {
        if (group[log.date] !== undefined) {
          group[log.date]++;
        } else {
            group[log.date] = 1;
        }
      });

      const processed = Object.keys(group)
        .sort((a,b) => b.localeCompare(a))
        .map(date => ({ date, count: group[date] }));
        
      setDays(processed);
    }
    load();
  }, []);

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto">
      <header>
        <h1 className="gb-heading text-2xl">Storico</h1>
        <p className="gb-subheading">Il tuo percorso da Testimone</p>
      </header>

      <section className="flex flex-col gap-3">
        {days.map((day) => (
          <NoGuiltDayClosure key={day.date} date={day.date} logsCount={day.count} />
        ))}
      </section>
    </div>
  );
}
