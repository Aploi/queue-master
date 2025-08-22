import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Users,
  Swords,
  Clock,
  CheckCircle2,
  Square as Stop,
  Trash2,
  Shield,
  Sprout,
  Crown,
  Play,
} from "lucide-react";

// ------------------ Types ------------------
type Gender = "Male" | "Female" | "Other";
type Skill = "Novice" | "Intermediate" | "Advance";

type Player = {
  id: string;
  name: string;
  gender: Gender;
  skill: Skill;
  matches: number; // matches played
  status: "pool" | "ready" | "playing"; // determines where they appear
};

type Court = {
  id: string;
  name: string;
  playingIds: string[]; // 4 ids when a game is active
  startedAt?: number | null;
};

// ------------------ Storage helpers ------------------
const LS_KEYS = {
  players: "bq_players_v6",
  courts: "bq_courts_v6",
  readySets: "bq_ready_sets_v6",
  firstMatchDone: "bq_first_match_done_v6",
} as const;

function loadLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveLS<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

// ------------------ ID & Utils ------------------
function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}_${Date.now()
    .toString(36)
    .slice(-4)}`;
}

function shuffleArr<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const SKILL_ORDER: Record<Skill, number> = {
  Novice: 1,
  Intermediate: 2,
  Advance: 3,
};

function fmtDuration(ms?: number | null) {
  if (!ms) return "";
  const sec = Math.floor(ms / 1000);
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// Pure helpers (also used by tests)
function shiftSetsAfterAssign(sets: string[][], index: number): string[][] {
  const copy = sets.map((s) => [...s]);
  copy.splice(index, 1);
  copy.push([]);
  if (copy.length === 0) copy.push([]);
  return copy;
}

function distributeFill(
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

// ------------------ Skill icon helper ------------------
function SkillIcon({ skill, className = "" }: { skill: Skill; className?: string }) {
  return skill === "Novice" ? (
    <Sprout size={18} className={`text-emerald-600 ${className}`} />
  ) : skill === "Intermediate" ? (
    <Shield size={18} className={`text-indigo-600 ${className}`} />
  ) : (
    <Crown size={18} className={`text-amber-600 ${className}`} />
  );
}

// ------------------ Component ------------------
export default function QueueMasterApp() {
  // players & courts
  const [players, setPlayers] = useState<Player[]>(() => loadLS<Player[]>(LS_KEYS.players, []));
  const [courts, setCourts] = useState<Court[]>(() => loadLS<Court[]>(LS_KEYS.courts, []));

  // Multiple ready sets (each set holds up to 4 ids)
  const [readySets, setReadySets] = useState<string[][]>(() => {
    const fromLS = loadLS<string[][]>(LS_KEYS.readySets, [[]]);
    return fromLS.length ? fromLS : [[]];
  });
  const [assignTargetSet, setAssignTargetSet] = useState<number | null>(null);
  const [firstMatchDone, setFirstMatchDone] = useState<boolean>(() =>
    loadLS<boolean>(LS_KEYS.firstMatchDone, false)
  );

  // Modals
  const [addOpen, setAddOpen] = useState(false);
  const [editTargetId, setEditTargetId] = useState<string | null>(null);
  const [swapOpen, setSwapOpen] = useState(false);
  const [swapIndex, setSwapIndex] = useState<number | null>(null); // index within set 0..3
  const [swapSetIndex, setSwapSetIndex] = useState<number | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [startArmed, setStartArmed] = useState(false);

  // add-player form state
  const [addForm, setAddForm] = useState<{ name: string; gender: Gender; skill: Skill }>(
    { name: "", gender: "Male", skill: "Novice" }
  );

  // derived
  const poolPlayers = useMemo(() => players.filter((p) => p.status === "pool"), [players]);
  const [search, setSearch] = useState("");
  const filteredPoolPlayers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return poolPlayers;
    return poolPlayers.filter((p) => p.name.toLowerCase().includes(q));
  }, [poolPlayers, search]);

  // persist
  useEffect(() => saveLS(LS_KEYS.players, players), [players]);
  useEffect(() => saveLS(LS_KEYS.courts, courts), [courts]);
  useEffect(() => saveLS(LS_KEYS.readySets, readySets), [readySets]);
  useEffect(() => saveLS(LS_KEYS.firstMatchDone, firstMatchDone), [firstMatchDone]);

  // Auto-fill empties whenever Start has been pressed and pool/sets change
  useEffect(() => {
    if (!startArmed) return;
    fillAllSets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [players, readySets, startArmed]);

  // Sanitize sets: remove ids that don't exist anymore (fixes 4/4 with empty slot)
  useEffect(() => {
    setReadySets((sets) => sets.map((s) => s.filter((id) => players.some((p) => p.id === id))));
  }, [players]);

  // ------------- Player actions -------------
  function openAddModal() {
    setAddForm({ name: "", gender: "Male", skill: "Novice" });
    setAddOpen(true);
  }

  function confirmAddPlayer() {
    const name = addForm.name.trim();
    if (!name) return;
    const newP: Player = {
      id: uid("p"),
      name,
      gender: addForm.gender,
      skill: addForm.skill,
      matches: 0,
      status: "pool",
    };
    setPlayers((prev) => [newP, ...prev]);
    setAddOpen(false);
  }

  function openEditPlayer(id: string) {
    setEditTargetId(id);
  }

  function saveEditPlayer() {
    if (!editTargetId) return;
    setPlayers((prev) => prev.map((p) => (p.id === editTargetId ? { ...p } : p)));
    setEditTargetId(null);
  }

  function deletePlayer(id: string) {
    // remove from any ready set and court
    setReadySets((sets) => sets.map((s) => s.filter((pid) => pid !== id)));
    setCourts((prev) =>
      prev.map((c) =>
        c.playingIds.includes(id)
          ? { ...c, playingIds: c.playingIds.filter((x) => x !== id) }
          : c
      )
    );
    setPlayers((prev) => prev.filter((p) => p.id !== id));
    if (editTargetId === id) setEditTargetId(null);
  }

  // add player to the first set that has space (immediate transfer)
  function addToReady(id: string) {
    const targetIndex = readySets.findIndex((s) => s.length < 4);
    if (targetIndex === -1) return;
    setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, status: "ready" } : p)));
    setReadySets((sets) => {
      const copy = sets.map((s) => [...s]);
      copy[targetIndex] = [...copy[targetIndex], id];
      return copy;
    });
  }

  // remove from ready back to pool (not used directly but kept for completeness)
  // function removeFromReady(id: string) {
  //   setPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, status: "pool" } : p)));
  //   setReadySets((sets) => sets.map((s) => s.filter((pid) => pid !== id)));
  // }

  // Swap within a set using a pool player
  function swapReadyWithPool(setIndex: number, readyIndex: number, poolPlayerId: string) {
    const outId = (readySets[setIndex] || [])[readyIndex];
    if (!outId) return;
    setPlayers((prev) => prev.map((p) => (p.id === outId ? { ...p, status: "pool" } : p)));
    setPlayers((prev) => prev.map((p) => (p.id === poolPlayerId ? { ...p, status: "ready" } : p)));
    setReadySets((sets) => {
      const copy = sets.map((s) => [...s]);
      copy[setIndex] = (copy[setIndex] || []).map((id, idx) => (idx === readyIndex ? poolPlayerId : id));
      return copy;
    });
  }

  // ------------- Auto-fill helpers -------------
  // function pickNextPlayers(n: number): string[] {
  //   // Prioritize least matches; tie-break by skill (Novice < Intermediate < Advance), then by name
  //   const sorted = [...poolPlayers].sort((a, b) => {
  //     if (a.matches !== b.matches) return a.matches - b.matches;
  //     if (SKILL_ORDER[a.skill] !== SKILL_ORDER[b.skill]) return SKILL_ORDER[a.skill] - SKILL_ORDER[b.skill];
  //     return a.name.localeCompare(b.name);
  //   });
  //   return sorted.slice(0, n).map((p) => p.id);
  // }

  // Fill ALL sets' empty slots using the same strategy (UNIVERSAL START)
  function fillAllSets() {
    const pool = players.filter((p) => p.status === "pool");
    const anyMatches = players.some((p) => p.matches > 0);
    const queue = anyMatches
      ? [...pool].sort((a, b) => {
          if (a.matches !== b.matches) return a.matches - b.matches;
          if (SKILL_ORDER[a.skill] !== SKILL_ORDER[b.skill]) return SKILL_ORDER[a.skill] - SKILL_ORDER[b.skill];
          return a.name.localeCompare(b.name);
        })
      : shuffleArr(pool);

    const { sets: newSets, used } = distributeFill(readySets, queue.map((p) => p.id), 4);
    if (used.length === 0) return;

    setReadySets(newSets);
    setPlayers((prev) => prev.map((p) => (used.includes(p.id) ? { ...p, status: "ready" } : p)));
  }

  // ------------- Court actions -------------
  function addCourt() {
    const name = `Court ${courts.length + 1}`;
    const newCourt: Court = { id: uid("c"), name, playingIds: [], startedAt: null };
    setCourts((prev) => [...prev, newCourt]);
  }

  function removeCourt(id: string) {
    const court = courts.find((c) => c.id === id);
    if (court && court.playingIds.length) {
      setPlayers((prev) =>
        prev.map((p) => (court.playingIds.includes(p.id) ? { ...p, status: "pool", matches: p.matches + 1 } : p))
      );
    }
    setCourts((prev) => prev.filter((c) => c.id !== id));
  }

  function assignSetToCourt(setIndex: number, courtId: string) {
    const ids = readySets[setIndex] || [];
    if (ids.length !== 4) return;
    setCourts((prev) => prev.map((c) => (c.id === courtId ? { ...c, playingIds: [...ids], startedAt: Date.now() } : c)));
    setPlayers((prev) => prev.map((p) => (ids.includes(p.id) ? { ...p, status: "playing" } : p)));
    // remove the assigned set so others move up, append a new empty set at the end
    setReadySets((sets) => shiftSetsAfterAssign(sets, setIndex));
  }

  function removeSet(setIndex: number) {
    setReadySets((sets) => {
      const current = sets[setIndex] || [];
      if (current.length) {
        setPlayers((prev) => prev.map((p) => (current.includes(p.id) ? { ...p, status: "pool" } : p)));
      }
      const copy = sets.map((s) => [...s]);
      copy.splice(setIndex, 1);
      if (copy.length === 0) copy.push([]);
      return copy;
    });
  }

  function endMatch(courtId: string) {
    const court = courts.find((c) => c.id === courtId);
    if (!court) return;
    const ids = court.playingIds;
    if (ids.length) {
      setPlayers((prev) => prev.map((p) => (ids.includes(p.id) ? { ...p, matches: p.matches + 1, status: "pool" } : p)));
    }
    setCourts((prev) => prev.map((c) => (c.id === courtId ? { ...c, playingIds: [], startedAt: null } : c)));
  }

  // ------------- UI helpers -------------
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  function ReadyTile({ ids, onClickPlayer }: { ids: string[]; onClickPlayer?: (idx: number) => void }) {
    return (
      <div className="rounded-xl bg-slate-50 p-2 ring-1 ring-slate-200">
        <div className="grid grid-cols-2 gap-2">
          {ids.map((id, i) => {
            const p = players.find((pp) => pp.id === id);
            if (!p) {
              return (
                <div key={`loading-${id}-${i}`} className="flex h-9 items-center justify-center rounded-lg border text-xs text-slate-400">Loading…</div>
              );
            }
            return (
              <button
                key={p.id}
                onClick={() => onClickPlayer && onClickPlayer(i)}
                className={`flex w-full items-center gap-2 truncate rounded-lg px-2 py-2 ring-1 ring-slate-200 ${onClickPlayer ? "hover:bg-white hover:ring-indigo-300" : ""}`}
                title={onClickPlayer ? "Swap with a player from pool" : undefined}
              >
                <SkillIcon skill={p.skill} />
                <span className="truncate text-sm">{p.name}</span>
              </button>
            );
          })}
          {Array.from({ length: Math.max(0, 4 - ids.length) }).map((_, i) => (
            <div key={`empty-${i}`} className="flex h-9 items-center justify-center rounded-lg border border-dashed text-xs text-slate-400">Empty</div>
          ))}
        </div>
      </div>
    );
  }

  // ------------------ UI ------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 text-slate-900">
      {/* Header */}
      <div className="mx-auto mb-4 flex max-w-6xl items-center justify-between">
        <div className="flex items-center gap-2">
          <Swords className="text-indigo-600" />
          <h1 className="text-2xl font-extrabold tracking-tight">Queue Master</h1>
        </div>
        {/* <div className="text-xs text-slate-500">Offline-ready UI (PWA hooks ready)</div> */}
        <div className="text-xs text-slate-500">by Cock Blockers</div>
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 md:grid-cols-3">
        {/* Players / Pool */}
        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
            <Users size={18} /> Players
          </h2>

          {/* Search + Add */}
          <div className="mb-3 flex items-center gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search players..."
              className="flex-1 rounded-xl border px-3 py-2 text-sm ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={openAddModal}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <Plus size={16} /> Add Player
            </button>
          </div>

          {/* Pool list */}
          <div className="mb-2 text-xs text-slate-500">Players: <b>{filteredPoolPlayers.length}</b></div>

          <div className="max-h-80 overflow-auto pr-1">
            {filteredPoolPlayers.length === 0 ? (
              <p className="text-sm text-slate-500">No players in pool. Add players or finish a match.</p>
            ) : (
              <ul className="space-y-2">
                {filteredPoolPlayers.map((p) => (
                  <li
                    key={p.id}
                    className="flex cursor-pointer items-center justify-between rounded-xl border px-3 py-2 text-sm hover:bg-slate-50"
                    onClick={() => openEditPlayer(p.id)}
                    title="Edit / Delete"
                  >
                    <div className="flex min-w-0 items-center gap-2">
                      <SkillIcon skill={p.skill} />
                      <span className="truncate font-medium">{p.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="mr-1 text-xs text-slate-500">{p.matches}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToReady(p.id);
                        }}
                        disabled={!readySets.some((s) => s.length < 4)}
                        title={!readySets.some((s) => s.length < 4) ? "All sets are full" : "Add to a set"}
                        className="rounded-lg bg-emerald-600 px-2 py-1 text-white hover:bg-emerald-700 disabled:opacity-40"
                      >
                        Ready
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Ready panel */}
        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <CheckCircle2 size={18} /> Ready to Play
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setStartArmed(true);
                  fillAllSets();
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                title="Fill empty slots across ALL sets"
              >
                Start
              </button>
              <button
                onClick={() => setReadySets((sets) => [...sets, []])}
                className="inline-flex items-center justify-center rounded-xl bg-white px-3 py-2 text-sm ring-1 ring-slate-200 hover:bg-slate-50"
                title="Create another set"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Stacked sets */}
          <div className="space-y-3">
            {readySets.map((setIds, i) => (
              <div key={i} className={`rounded-2xl border p-3`}>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full px-2 py-0.5 text-xs ring-1 bg-white text-slate-700 ring-slate-200">Set {i + 1}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {i === 0 && (
                      <button
                        onClick={() => {
                          if ((readySets[0] || []).length === 4) {
                            setAssignTargetSet(0);
                            setAssignOpen(true);
                            if (!firstMatchDone) setFirstMatchDone(true);
                          }
                        }}
                        disabled={(readySets[0] || []).length !== 4}
                        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40"
                        title="Assign Set 1 to a court"
                      >
                        <Play size={16} /> Play
                      </button>
                    )}
                    <button
                      onClick={() => removeSet(i)}
                      className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-1.5 text-sm ring-1 ring-slate-200 hover:bg-slate-50"
                      title="Delete this set"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <ReadyTile ids={setIds} onClickPlayer={(idx) => { setSwapSetIndex(i); setSwapIndex(idx); setSwapOpen(true); }} />
              </div>
            ))}
          </div>

          <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
            Tip: Tap a player to swap them with someone from the pool. Use <b>Start</b> (top) to fill every set, then press <b>Play</b> on a set to choose a court.
          </div>
        </section>

        {/* Courts */}
        <section className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
          <h2 className="mb-3 flex items-center gap-2 text-lg font-bold">
            <Shield size={18} /> Courts
          </h2>

          <div className="mb-3 flex gap-2">
            <button
              onClick={addCourt}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <Plus size={16} /> Add Court
            </button>
          </div>

          {courts.length === 0 ? (
            <p className="text-sm text-slate-500">No courts added yet.</p>
          ) : (
            <div className="space-y-3">
              {courts.map((c) => {
                const active = c.playingIds.length > 0;
                const duration = active && c.startedAt ? fmtDuration(now - c.startedAt) : "";
                return (
                  <div key={c.id} className="rounded-2xl border p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold">{c.name}</h3>
                        {active ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs text-emerald-700 ring-1 ring-emerald-200">
                            <Clock size={12} /> {duration}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-0.5 text-xs text-slate-600 ring-1 ring-slate-200">
                            Idle
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {active && (
                          <button
                            onClick={() => endMatch(c.id)}
                            className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-rose-700"
                          >
                            <Stop size={16} /> Done
                          </button>
                        )}
                        <button
                          onClick={() => removeCourt(c.id)}
                          className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-sm font-medium ring-1 ring-slate-200 hover:bg-slate-50"
                          title="Remove court"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    {active ? (
                      <ReadyTile ids={c.playingIds} />
                    ) : (
                      <div className="rounded-xl border border-dashed p-3 text-center text-xs text-slate-500">Use <b>Play</b> from a set to assign here.</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Footer / Legend */}
      <div className="mx-auto mt-4 max-w-6xl text-xs text-slate-500">
        <p>
          Rules in this MVP: Doubles only (4 players per court). Click a player in the pool to edit/delete. In Ready, create multiple sets with <b>+</b>, auto-fill from pool (least matches first), then choose a court.
        </p>
      </div>

      {/* Add Player modal */}
      <AnimatePresence>
        {addOpen && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-sm rounded-2xl bg-white p-4 shadow-xl ring-1 ring-slate-200">
              <h3 className="mb-3 text-base font-semibold">Add player</h3>
              <div className="mb-3">
                <label className="text-xs text-slate-500">Name</label>
                <input className="mt-1 w-full rounded-xl border px-3 py-2 text-sm ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" value={addForm.name} onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g., Alex Cruz" />
              </div>
              <div className="mb-3 grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-500">Gender</label>
                  <select className="mt-1 w-full rounded-xl border px-3 py-2 text-sm ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" value={addForm.gender} onChange={(e) => setAddForm((f) => ({ ...f, gender: e.target.value as Gender }))}>
                    {(["Male", "Female", "Other"] as const).map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500">Skill</label>
                  <select className="mt-1 w-full rounded-xl border px-3 py-2 text-sm ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" value={addForm.skill} onChange={(e) => setAddForm((f) => ({ ...f, skill: e.target.value as Skill }))}>
                    {(["Novice", "Intermediate", "Advance"] as const).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button className="rounded-xl bg-white px-3 py-2 text-sm ring-1 ring-slate-200 hover:bg-slate-50" onClick={() => setAddOpen(false)}>Cancel</button>
                <button className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800" onClick={confirmAddPlayer}>Add Player</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Player modal */}
      <AnimatePresence>
        {editTargetId && (
          <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-sm rounded-2xl bg-white p-4 shadow-xl ring-1 ring-slate-200">
              <h3 className="mb-3 text-base font-semibold">Edit player</h3>
              {(() => {
                const p = players.find((x) => x.id === editTargetId)!;
                return (
                  <>
                    <div className="mb-3">
                      <label className="text-xs text-slate-500">Name</label>
                      <input className="mt-1 w-full rounded-xl border px-3 py-2 text-sm ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" value={p.name} onChange={(e) => setPlayers((prev) => prev.map((pp) => (pp.id === p.id ? { ...pp, name: e.target.value } : pp)))} />
                    </div>
                    <div className="mb-3 grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-slate-500">Gender</label>
                        <select className="mt-1 w-full rounded-xl border px-3 py-2 text-sm ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" value={p.gender} onChange={(e) => setPlayers((prev) => prev.map((pp) => (pp.id === p.id ? { ...pp, gender: e.target.value as Gender } : pp)))}>
                          {(["Male", "Female", "Other"] as const).map((g) => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-500">Skill</label>
                        <select className="mt-1 w-full rounded-xl border px-3 py-2 text-sm ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" value={p.skill} onChange={(e) => setPlayers((prev) => prev.map((pp) => (pp.id === p.id ? { ...pp, skill: e.target.value as Skill } : pp)))}>
                          {(["Novice", "Intermediate", "Advance"] as const).map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-between gap-2">
                      <button className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700" onClick={() => deletePlayer(p.id)}>Delete</button>
                      <div className="flex gap-2">
                        <button className="rounded-xl bg-white px-3 py-2 text-sm ring-1 ring-slate-200 hover:bg-slate-50" onClick={() => setEditTargetId(null)}>Cancel</button>
                        <button className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800" onClick={saveEditPlayer}>Save</button>
                      </div>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Swap modal */}
      <SwapModal
        open={swapOpen}
        onClose={() => setSwapOpen(false)}
        players={poolPlayers}
        onChoose={(poolId) => {
          if (swapIndex !== null && swapSetIndex !== null) swapReadyWithPool(swapSetIndex, swapIndex, poolId);
          setSwapOpen(false);
        }}
      />

      {/* Assign-to-court modal */}
      <AssignCourtModal
        open={assignOpen}
        onClose={() => setAssignOpen(false)}
        courts={courts}
        onAssign={(courtId) => {
          if (assignTargetSet !== null) assignSetToCourt(assignTargetSet, courtId);
          setAssignOpen(false);
          setAssignTargetSet(null);
          if (!firstMatchDone) setFirstMatchDone(true);
        }}
      />
    </div>
  );
}

// ------------------ Swap Modal Component ------------------
function SwapModal({ open, onClose, players, onChoose }: { open: boolean; onClose: () => void; players: Player[]; onChoose: (poolId: string) => void; }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-sm rounded-2xl bg-white p-4 shadow-xl ring-1 ring-slate-200">
            <h3 className="mb-3 text-base font-semibold">Swap with pool player</h3>
            {players.length === 0 ? (
              <p className="text-sm text-slate-500">No players in pool.</p>
            ) : (
              <ul className="max-h-72 space-y-2 overflow-auto pr-1">
                {players.map((p) => (
                  <li key={p.id}>
                    <button onClick={() => onChoose(p.id)} className="flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm hover:bg-slate-50">
                      <span className="flex min-w-0 items-center gap-2">
                        <SkillIcon skill={p.skill} />
                        <span className="truncate">{p.name}</span>
                        <span className="ml-2 shrink-0 text-xs text-slate-500">• {p.matches}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-3 flex justify-end">
              <button onClick={onClose} className="rounded-xl bg-white px-3 py-2 text-sm ring-1 ring-slate-200 hover:bg-slate-50">Close</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ------------------ Assign Court Modal ------------------
function AssignCourtModal({ open, onClose, courts, onAssign }: { open: boolean; onClose: () => void; courts: Court[]; onAssign: (courtId: string) => void; }) {
  const idleCourts = courts.filter((c) => c.playingIds.length === 0);
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-sm rounded-2xl bg-white p-4 shadow-xl ring-1 ring-slate-200">
            <h3 className="mb-3 text-base font-semibold">Choose a court</h3>
            {idleCourts.length === 0 ? (
              <p className="text-sm text-slate-500">No idle courts available. Add a court or end a match.</p>
            ) : (
              <ul className="max-h-72 space-y-2 overflow-auto pr-1">
                {idleCourts.map((c) => (
                  <li key={c.id}>
                    <button onClick={() => onAssign(c.id)} className="flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm hover:bg-slate-50">
                      <span className="truncate font-medium">{c.name}</span>
                      <span className="text-xs text-slate-500">Idle</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-3 flex justify-end">
              <button onClick={onClose} className="rounded-xl bg-white px-3 py-2 text-sm ring-1 ring-slate-200 hover:bg-slate-50">Close</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
