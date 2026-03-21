import type { Player } from "../types";
import { uid } from "../utils";

interface UsePlayerActionsProps {
  setPlayers: (updater: (prev: Player[]) => Player[]) => void;
  editTargetId: string | null;
  setEditTargetId: (id: string | null) => void;
  readySets: string[][];
  setReadySets: (updater: (prev: string[][]) => string[][]) => void;
  setCourts: (updater: (prev: any[]) => any[]) => void;
}

export function usePlayerActions({
  setPlayers,
  editTargetId,
  setEditTargetId,
  readySets,
  setReadySets,
  setCourts,
}: UsePlayerActionsProps) {
  function openAddModal() {
    return { name: "", gender: "Male" as const, skill: "Novice" as const };
  }

  function confirmAddPlayer(addForm: { name: string; gender: any; skill: any }) {
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
  }

  function openEditPlayer(id: string) {
    setEditTargetId(id);
  }

  function saveEditPlayer() {
    if (!editTargetId) return;
    setPlayers((prev) =>
      prev.map((p) => (p.id === editTargetId ? { ...p } : p))
    );
    setEditTargetId(null);
  }

  function deletePlayer(id: string) {
    setReadySets((sets) =>
      sets.map((s) => s.filter((pid) => pid !== id))
    );
    setCourts((prev: any[]) =>
      prev.map((c: any) =>
        c.playingIds.includes(id)
          ? { ...c, playingIds: c.playingIds.filter((x: string) => x !== id) }
          : c
      )
    );
    setPlayers((prev) => prev.filter((p) => p.id !== id));
    if (editTargetId === id) setEditTargetId(null);
  }

  function addToReady(id: string) {
    const targetIndex = readySets.findIndex((s) => s.length < 4);
    if (targetIndex === -1) return;
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "ready" } : p))
    );
    setReadySets((sets) => {
      const copy = sets.map((s) => [...s]);
      copy[targetIndex] = [...copy[targetIndex], id];
      return copy;
    });
  }

  function updatePlayerInEdit(player: Player) {
    setPlayers((prev) =>
      prev.map((p) => (p.id === player.id ? player : p))
    );
  }

  function resetPlayerMatches(id: string) {
    setPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, matches: 0 } : p))
    );
  }

  function resetAllPlayersMatches() {
    setPlayers((prev) => prev.map((p) => ({ ...p, matches: 0 })));
  }

  return {
    openAddModal,
    confirmAddPlayer,
    openEditPlayer,
    saveEditPlayer,
    deletePlayer,
    addToReady,
    updatePlayerInEdit,
    resetPlayerMatches,
    resetAllPlayersMatches,
  };
}
