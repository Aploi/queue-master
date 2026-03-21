import type { Player } from "../types";
import { SKILL_ORDER, distributeFill, shuffleArr } from "../utils";

interface UseReadySetActionsProps {
  readySets: string[][];
  setReadySets: (updater: (prev: string[][]) => string[][]) => void;
  players: Player[];
  setPlayers: (updater: (prev: Player[]) => Player[]) => void;
  skillOrder: typeof SKILL_ORDER;
}

export function useReadySetActions({
  readySets,
  setReadySets,
  players,
  setPlayers,
  skillOrder,
}: UseReadySetActionsProps) {
  function fillAllSets() {
    const pool = players.filter((p) => p.status === "pool");
    const anyMatches = players.some((p) => p.matches > 0);
    const queue = anyMatches
      ? [...pool].sort((a, b) => {
          if (a.matches !== b.matches) return a.matches - b.matches;
          if (skillOrder[a.skill] !== skillOrder[b.skill])
            return skillOrder[a.skill] - skillOrder[b.skill];
          return a.name.localeCompare(b.name);
        })
      : shuffleArr(pool);

    const { sets: newSets, used } = distributeFill(
      readySets,
      queue.map((p) => p.id),
      4
    );
    if (used.length === 0) return;

    setReadySets((_prev) => newSets);
    setPlayers((prev) =>
      prev.map((p) =>
        used.includes(p.id) ? { ...p, status: "ready" as const } : p
      )
    );
  }

  function removeSet(setIndex: number) {
    setReadySets((sets) => {
      const current = sets[setIndex] || [];
      if (current.length) {
        setPlayers((prev) =>
          prev.map((p) =>
            current.includes(p.id) ? { ...p, status: "pool" as const } : p
          )
        );
      }
      const copy = sets.map((s) => [...s]);
      copy.splice(setIndex, 1);
      if (copy.length === 0) copy.push([]);
      return copy;
    });
  }

  function swapReadyWithPool(
    setIndex: number,
    readyIndex: number,
    poolPlayerId: string
  ) {
    const outId = (readySets[setIndex] || [])[readyIndex];
    if (!outId) return;
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === outId ? { ...p, status: "pool" as const } : p
      )
    );
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === poolPlayerId ? { ...p, status: "ready" as const } : p
      )
    );
    setReadySets((sets) => {
      const copy = sets.map((s) => [...s]);
      copy[setIndex] = (copy[setIndex] || []).map((id, idx) =>
        idx === readyIndex ? poolPlayerId : id
      );
      return copy;
    });
  }

  return {
    fillAllSets,
    removeSet,
    swapReadyWithPool,
  };
}
