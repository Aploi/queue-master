import type { Skill } from "./types";

// Storage helpers
export const LS_KEYS = {
  players: "bq_players_v6",
  courts: "bq_courts_v6",
  readySets: "bq_ready_sets_v6",
  firstMatchDone: "bq_first_match_done_v6",
  playerGroups: "bq_player_groups_v1",
} as const;

export function loadLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function saveLS<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

// ID & Utils
export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}_${Date.now()
    .toString(36)
    .slice(-4)}`;
}

export function shuffleArr<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const SKILL_ORDER: Record<Skill, number> = {
  Novice: 1,
  Intermediate: 2,
  Advance: 3,
};

export function fmtDuration(ms?: number | null) {
  if (!ms) return "";
  const sec = Math.floor(ms / 1000);
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// Pure helpers (also used by tests)
export function shiftSetsAfterAssign(sets: string[][], index: number): string[][] {
  const copy = sets.map((s) => [...s]);
  copy.splice(index, 1);
  copy.push([]);
  if (copy.length === 0) copy.push([]);
  return copy;
}

export function distributeFill(
  sets: string[][],
  queueIds: string[],
  capacity = 4
): { sets: string[][]; used: string[] } {
  const res = sets.map((s) => [...s]);
  const used: string[] = [];
  for (let i = 0; i < res.length; i++) {
    while (res[i].length < capacity && queueIds.length > 0) {
      const id = queueIds.shift()!;
      res[i].push(id);
      used.push(id);
    }
  }
  if (res.length === 0) res.push([]);
  return { sets: res, used };
}
