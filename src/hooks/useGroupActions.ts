import type { Player, PlayerGroup, PlayerSnapshot } from "../types";
import { uid } from "../utils";

export function useGroupActions() {
  const createGroupFromPlayers = (players: Player[]): PlayerSnapshot[] => {
    return players.map((p) => ({
      name: p.name,
      gender: p.gender,
      skill: p.skill,
      matches: 0, // Reset matches to 0 when creating snapshot
    }));
  };

  const saveGroup = (players: Player[], groupName: string, groups: PlayerGroup[], groupIdToUpdate?: string): PlayerGroup[] => {
    const snapshot = createGroupFromPlayers(players);
    const now = Date.now();

    if (groupIdToUpdate) {
      // Update existing group
      return groups.map((g) =>
        g.id === groupIdToUpdate
          ? { ...g, name: groupName, players: snapshot, updatedAt: now }
          : g
      );
    } else {
      // Create new group
      const newGroup: PlayerGroup = {
        id: uid("pg"),
        name: groupName,
        players: snapshot,
        createdAt: now,
        updatedAt: now,
      };
      return [...groups, newGroup];
    }
  };

  const loadGroup = (group: PlayerGroup): Player[] => {
    return group.players.map((snapshot) => ({
      id: uid("p"),
      name: snapshot.name,
      gender: snapshot.gender,
      skill: snapshot.skill,
      matches: snapshot.matches ?? 0,
      status: "pool" as const,
    }));
  };

  const deleteGroup = (groupId: string, groups: PlayerGroup[]): PlayerGroup[] => {
    return groups.filter((g) => g.id !== groupId);
  };

  return {
    saveGroup,
    loadGroup,
    deleteGroup,
    createGroupFromPlayers,
  };
}
