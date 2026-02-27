"use client";

import { useEffect, useState } from "react";
import {
  getAllSessions,
  getDailyBuckets,
  getWeeklyBuckets,
  type GameSession,
  type DayBucket,
  type WeekBucket,
} from "@/lib/storage";

function BarChart({
  items,
  labelKey,
  valueKey,
  color = "bg-zinc-900 dark:bg-white",
}: {
  items: Record<string, unknown>[];
  labelKey: string;
  valueKey: string;
  color?: string;
}) {
  if (items.length === 0) return null;
  const max = Math.max(...items.map((i) => Number(i[valueKey])), 1);

  return (
    <div className="flex items-end gap-2" style={{ height: 180 }}>
      {items.map((item, i) => {
        const val = Number(item[valueKey]);
        const h = Math.max((val / max) * 160, 4);
        return (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-xs font-semibold">{val}</span>
            <div
              className={`w-full max-w-[40px] rounded-t ${color}`}
              style={{ height: h }}
            />
            <span className="mt-1 max-w-[60px] truncate text-center text-[10px] text-zinc-400">
              {String(item[labelKey])}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function Analytics() {
  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [daily, setDaily] = useState<DayBucket[]>([]);
  const [weekly, setWeekly] = useState<WeekBucket[]>([]);

  useEffect(() => {
    setSessions(getAllSessions());
    setDaily(getDailyBuckets());
    setWeekly(getWeeklyBuckets());
  }, []);

  const totalSessions = sessions.length;
  const totalUses = sessions.reduce((s, g) => s + g.uses.length, 0);
  const overallAvg =
    totalSessions > 0
      ? Math.round((totalUses / totalSessions) * 10) / 10
      : 0;

  if (totalSessions === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <h2 className="text-2xl font-bold">No data yet</h2>
        <p className="text-zinc-500">
          Play a few rounds first, then come back here to see your progress.
        </p>
      </div>
    );
  }

  // Show last 14 days and last 8 weeks max
  const recentDaily = daily.slice(-14);
  const recentWeekly = weekly.slice(-8);

  return (
    <div className="space-y-10">
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total sessions" value={totalSessions} />
        <StatCard label="Total uses" value={totalUses} />
        <StatCard label="Avg uses / session" value={overallAvg} />
      </div>

      {/* Daily chart */}
      <section>
        <h3 className="mb-4 text-lg font-semibold">
          Daily average uses per session
        </h3>
        <BarChart
          items={recentDaily as unknown as Record<string, unknown>[]}
          labelKey="date"
          valueKey="avg"
        />
      </section>

      {/* Weekly chart */}
      <section>
        <h3 className="mb-4 text-lg font-semibold">
          Weekly average uses per session
        </h3>
        <BarChart
          items={recentWeekly as unknown as Record<string, unknown>[]}
          labelKey="weekLabel"
          valueKey="avg"
        />
      </section>

      {/* Recent sessions table */}
      <section>
        <h3 className="mb-4 text-lg font-semibold">Recent sessions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-zinc-500 dark:border-zinc-700">
                <th className="pb-2 pr-4 font-medium">Date</th>
                <th className="pb-2 pr-4 font-medium">Object</th>
                <th className="pb-2 pr-4 font-medium">Uses</th>
                <th className="pb-2 font-medium">Duration</th>
              </tr>
            </thead>
            <tbody>
              {[...sessions]
                .reverse()
                .slice(0, 20)
                .map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-zinc-100 dark:border-zinc-800"
                  >
                    <td className="py-2 pr-4 tabular-nums">
                      {new Date(s.timestamp).toLocaleDateString()}
                    </td>
                    <td className="py-2 pr-4">{s.object}</td>
                    <td className="py-2 pr-4 font-semibold">
                      {s.uses.length}
                    </td>
                    <td className="py-2 tabular-nums">
                      {Math.floor(s.durationSeconds / 60)}:
                      {(s.durationSeconds % 60).toString().padStart(2, "0")}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-700">
      <p className="text-sm text-zinc-500">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </div>
  );
}
