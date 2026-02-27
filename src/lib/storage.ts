export interface GameSession {
  id: string;
  object: string;
  uses: string[];
  durationSeconds: number;
  timestamp: number; // ms since epoch
}

const STORAGE_KEY = "divergent-thinking-sessions";

function getSessions(): GameSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSessions(sessions: GameSession[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

export function addSession(session: GameSession): void {
  const sessions = getSessions();
  sessions.push(session);
  saveSessions(sessions);
}

export function getAllSessions(): GameSession[] {
  return getSessions();
}

// --- Analytics helpers ---

export interface DayBucket {
  date: string; // YYYY-MM-DD
  totalUses: number;
  sessionCount: number;
  avg: number;
}

export interface WeekBucket {
  weekLabel: string; // e.g. "Feb 17 – Feb 23"
  totalUses: number;
  sessionCount: number;
  avg: number;
}

function dateKey(ts: number): string {
  const d = new Date(ts);
  return d.toISOString().slice(0, 10);
}

function startOfWeek(d: Date): Date {
  const day = d.getDay(); // 0=Sun
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Mon start
  const mon = new Date(d);
  mon.setDate(diff);
  mon.setHours(0, 0, 0, 0);
  return mon;
}

function formatShortDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function getDailyBuckets(): DayBucket[] {
  const sessions = getSessions();
  const map = new Map<string, { totalUses: number; sessionCount: number }>();

  for (const s of sessions) {
    const key = dateKey(s.timestamp);
    const entry = map.get(key) ?? { totalUses: 0, sessionCount: 0 };
    entry.totalUses += s.uses.length;
    entry.sessionCount += 1;
    map.set(key, entry);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, { totalUses, sessionCount }]) => ({
      date,
      totalUses,
      sessionCount,
      avg: Math.round((totalUses / sessionCount) * 10) / 10,
    }));
}

export function getWeeklyBuckets(): WeekBucket[] {
  const sessions = getSessions();
  const map = new Map<string, { totalUses: number; sessionCount: number; weekStart: Date }>();

  for (const s of sessions) {
    const d = new Date(s.timestamp);
    const ws = startOfWeek(d);
    const key = ws.toISOString().slice(0, 10);
    const entry = map.get(key) ?? { totalUses: 0, sessionCount: 0, weekStart: ws };
    entry.totalUses += s.uses.length;
    entry.sessionCount += 1;
    map.set(key, entry);
  }

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, { totalUses, sessionCount, weekStart }]) => {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      return {
        weekLabel: `${formatShortDate(weekStart)} – ${formatShortDate(weekEnd)}`,
        totalUses,
        sessionCount,
        avg: Math.round((totalUses / sessionCount) * 10) / 10,
      };
    });
}
