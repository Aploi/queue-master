import { useEffect } from "react";
import type { Court, Player, PlayerGroup } from "../types";
import { LS_KEYS, saveLS } from "../utils";

export function usePersistence(
  players: Player[],
  courts: Court[],
  readySets: string[][],
  firstMatchDone: boolean,
  groups?: PlayerGroup[]
) {
  useEffect(() => {
    saveLS(LS_KEYS.players, players);
  }, [players]);

  useEffect(() => {
    saveLS(LS_KEYS.courts, courts);
  }, [courts]);

  useEffect(() => {
    saveLS(LS_KEYS.readySets, readySets);
  }, [readySets]);

  useEffect(() => {
    saveLS(LS_KEYS.firstMatchDone, firstMatchDone);
  }, [firstMatchDone]);

  useEffect(() => {
    if (groups) {
      saveLS(LS_KEYS.playerGroups, groups);
    }
  }, [groups]);
}
