import type { Court, Player } from "../types";
import { uid } from "../utils";

interface UseCourtActionsProps {
  courts: Court[];
  setCourts: (updater: (prev: Court[]) => Court[]) => void;
  setPlayers: (updater: (prev: Player[]) => Player[]) => void;
  readySets: string[][];
  setReadySets: (updater: (prev: string[][]) => string[][]) => void;
  shiftSetsAfterAssign: (sets: string[][], index: number) => string[][];
}

export function useCourtActions({
  courts,
  setCourts,
  setPlayers,
  readySets,
  setReadySets,
  shiftSetsAfterAssign,
}: UseCourtActionsProps) {
  function addCourt() {
    const name = `Court ${courts.length + 1}`;
    const newCourt: Court = {
      id: uid("c"),
      name,
      playingIds: [],
      startedAt: null,
    };
    setCourts((prev) => [...prev, newCourt]);
  }

  function removeCourt(id: string, incrementMatches = false) {
    const court = courts.find((c) => c.id === id);
    if (court && court.playingIds.length) {
      setPlayers((prev) =>
        prev.map((p) =>
          court.playingIds.includes(p.id)
            ? {
                ...p,
                status: "pool" as const,
                matches: incrementMatches ? p.matches + 1 : p.matches,
              }
            : p
        )
      );
    }
    setCourts((prev) => prev.filter((c) => c.id !== id));
  }

  function assignSetToCourt(setIndex: number, courtId: string) {
    const ids = readySets[setIndex] || [];
    if (ids.length !== 4) return;
    setCourts((prev) =>
      prev.map((c) =>
        c.id === courtId
          ? { ...c, playingIds: [...ids], startedAt: Date.now() }
          : c
      )
    );
    setPlayers((prev) =>
      prev.map((p) =>
        ids.includes(p.id) ? { ...p, status: "playing" as const } : p
      )
    );
    setReadySets((sets) => shiftSetsAfterAssign(sets, setIndex));
  }

  function endMatch(courtId: string) {
    const court = courts.find((c) => c.id === courtId);
    if (!court) return;
    const ids = court.playingIds;
    if (ids.length) {
      setPlayers((prev) =>
        prev.map((p) =>
          ids.includes(p.id)
            ? { ...p, matches: p.matches + 1, status: "pool" as const }
            : p
        )
      );
    }
    setCourts((prev) =>
      prev.map((c) =>
        c.id === courtId
          ? { ...c, playingIds: [], startedAt: null }
          : c
      )
    );
  }

  function swapPlayerInCourt(
    courtId: string,
    playerIndex: number,
    poolPlayerId: string
  ) {
    const court = courts.find((c) => c.id === courtId);
    if (!court) return;

    const outId = court.playingIds[playerIndex];
    if (!outId) return;

    setPlayers((prev) =>
      prev.map((p) =>
        p.id === outId ? { ...p, status: "pool" as const } : p
      )
    );
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === poolPlayerId ? { ...p, status: "playing" as const } : p
      )
    );
    setCourts((prevCourts) =>
      prevCourts.map((c) =>
        c.id === courtId
          ? {
              ...c,
              playingIds: c.playingIds.map((id, idx) =>
                idx === playerIndex ? poolPlayerId : id
              ),
            }
          : c
      )
    );
  }

  return {
    addCourt,
    removeCourt,
    assignSetToCourt,
    endMatch,
    swapPlayerInCourt,
  };
}
