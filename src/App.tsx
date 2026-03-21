import { Swords } from "lucide-react";
import React, { useMemo, useState } from "react";
import { CourtsPanel } from "./components/CourtsPanel";
import { GroupsScreen } from "./components/GroupsScreen";
import { AddPlayerModal } from "./components/modals/AddPlayerModal";
import { AssignCourtModal } from "./components/modals/AssignCourtModal";
import { EditPlayerModal } from "./components/modals/EditPlayerModal";
import { SaveGroupModal } from "./components/modals/SaveGroupModal";
import { SwapModal } from "./components/modals/SwapModal";
import { PlayersPanel } from "./components/PlayersPanel";
import { ReadyPanel } from "./components/ReadyPanel";
import {
  useCourtActions,
  useCurrentTime,
  useGroupActions,
  useModalState,
  usePersistence,
  usePlayerActions,
  useReadySetActions,
} from "./hooks";
import type { Court, Gender, Player, PlayerGroup } from "./types";
import {
  LS_KEYS,
  SKILL_ORDER,
  fmtDuration,
  loadLS,
  shiftSetsAfterAssign,
} from "./utils";

// Main App Component
export default function QueueMasterApp() {
  // ===== STATE INITIALIZATION =====
  const [players, setPlayers] = useState<Player[]>(() =>
    loadLS<Player[]>(LS_KEYS.players, [])
  );
  const [courts, setCourts] = useState<Court[]>(() =>
    loadLS<Court[]>(LS_KEYS.courts, [])
  );
  const [readySets, setReadySets] = useState<string[][]>(() => {
    const fromLS = loadLS<string[][]>(LS_KEYS.readySets, [[]]);
    return fromLS.length ? fromLS : [[]];
  });
  const [firstMatchDone, setFirstMatchDone] = useState<boolean>(() =>
    loadLS<boolean>(LS_KEYS.firstMatchDone, false)
  );
  const [groups, setGroups] = useState<PlayerGroup[]>(() =>
    loadLS<PlayerGroup[]>(LS_KEYS.playerGroups, [])
  );
  const [addForm, setAddForm] = useState<{
    name: string;
    gender: Gender;
    skill: any;
  }>({
    name: "",
    gender: "Male",
    skill: "Novice",
  });
  const [search, setSearch] = useState("");
  const [startArmed, setStartArmed] = useState(false);
  const [assignTargetSet, setAssignTargetSet] = useState<number | null>(null);

  // ===== CUSTOM HOOKS =====
  const modals = useModalState();
  const now = useCurrentTime();

  usePersistence(players, courts, readySets, firstMatchDone, groups);

  const playerActions = usePlayerActions({
    setPlayers,
    editTargetId: modals.editTargetId,
    setEditTargetId: modals.setEditTargetId,
    readySets,
    setReadySets,
    setCourts,
  });

  const courtActions = useCourtActions({
    courts,
    setCourts,
    setPlayers,
    readySets,
    setReadySets,
    shiftSetsAfterAssign,
  });

  const readySetActions = useReadySetActions({
    readySets,
    setReadySets,
    players,
    setPlayers,
    skillOrder: SKILL_ORDER,
  });

  const groupActions = useGroupActions();

  const [groupsScreenOpen, setGroupsScreenOpen] = useState(false);

  // ===== DERIVED STATE =====
  const poolPlayers = useMemo(
    () => players.filter((p) => p.status === "pool"),
    [players]
  );

  const filteredPoolPlayers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return poolPlayers;
    return poolPlayers.filter((p) => p.name.toLowerCase().includes(q));
  }, [poolPlayers, search]);

  // ===== SANITIZATION EFFECT =====
  // Prevent orphaned player references in sets when a player is deleted
  const prevPlayersRef = React.useRef(players);
  React.useEffect(() => {
    if (prevPlayersRef.current.length > players.length) {
      setReadySets((sets) =>
        sets.map((s) => s.filter((id) => players.some((p) => p.id === id)))
      );
    }
    prevPlayersRef.current = players;
  }, [players]);

  // ===== AUTO-FILL EFFECT =====
  React.useEffect(() => {
    if (!startArmed) return;
    readySetActions.fillAllSets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [players, readySets, startArmed]);

  // ===== ACTION WRAPPERS =====
  const openAddModal = () => {
    setAddForm({ name: "", gender: "Male", skill: "Novice" });
    modals.setAddOpen(true);
  };

  const confirmAddPlayer = () => {
    const name = addForm.name.trim();
    if (!name) return;
    playerActions.confirmAddPlayer(addForm);
    modals.setAddOpen(false);
    setAddForm({ name: "", gender: "Male", skill: "Novice" });
  };

  const openEditPlayer = modals.setEditTargetId;

  const saveEditPlayer = playerActions.saveEditPlayer;

  const deletePlayer = playerActions.deletePlayer;

  const addToReady = playerActions.addToReady;

  const updatePlayerInEdit = playerActions.updatePlayerInEdit;

  const resetPlayerMatches = playerActions.resetPlayerMatches;

  const resetAllPlayersMatches = playerActions.resetAllPlayersMatches;

  const fillAllSets = readySetActions.fillAllSets;

  const removeSet = readySetActions.removeSet;

  const swapReadyWithPool = readySetActions.swapReadyWithPool;

  const addCourt = courtActions.addCourt;

  const removeCourt = courtActions.removeCourt;

  const assignSetToCourt = (setIndex: number, courtId: string) => {
    courtActions.assignSetToCourt(setIndex, courtId);
    setAssignTargetSet(null);
    setFirstMatchDone(true);
  };

  const endMatch = courtActions.endMatch;

  const swapPlayerInCourt = courtActions.swapPlayerInCourt;

  const saveGroupHandler = (groupName: string, groupIdToUpdate?: string) => {
    const updatedGroups = groupActions.saveGroup(players, groupName, groups, groupIdToUpdate);
    setGroups(updatedGroups);
    modals.setSaveGroupOpen(false);
  };

  const loadGroupHandler = (group: PlayerGroup, selectedIndices: number[]) => {
    const allPlayers = groupActions.loadGroup(group);
    // Filter to only selected players
    const selectedPlayers = selectedIndices
      .map((idx) => allPlayers[idx])
      .filter(Boolean);
    setPlayers(selectedPlayers);
    setReadySets([[]]);
    setGroupsScreenOpen(false);
  };

  const deleteGroupHandler = (groupId: string) => {
    const updatedGroups = groupActions.deleteGroup(groupId, groups);
    setGroups(updatedGroups);
  };

  const clearQueue = () => {
    setPlayers([]);
    setReadySets([[]]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 text-slate-900">
      {/* Header */}
      <div className="mx-auto mb-4 flex max-w-6xl items-center justify-between">
        <div className="flex items-center gap-2">
          <Swords className="text-indigo-600" />
          <h1 className="text-2xl font-extrabold tracking-tight">Queue Master</h1>
        </div>
        <div className="text-sm text-slate-500">by <span className="font-bold">CockBlockers</span></div>
      </div>

      {/* Main Grid */}
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 md:grid-cols-3">
        {/* Players Panel */}
        <PlayersPanel
          filteredPoolPlayers={filteredPoolPlayers}
          search={search}
          onSearchChange={setSearch}
          onAddClick={openAddModal}
          onEditClick={openEditPlayer}
          onReadyClick={addToReady}
          hasAvailableSet={readySets.some((s) => s.length < 4)}
          onResetAllMatches={resetAllPlayersMatches}
          onSaveGroupClick={() => modals.setSaveGroupOpen(true)}
          onLoadGroupClick={() => setGroupsScreenOpen(true)}
          onClearQueue={clearQueue}
        />

        {/* Ready Panel */}
        <ReadyPanel
          readySets={readySets}
          players={players}
          isArmed={startArmed}
          onStartClick={() => {
            setStartArmed(true);
            fillAllSets();
          }}
          onEndClick={() => {
            setStartArmed(false);
          }}
          onAddSetClick={() =>
            setReadySets((sets) => [...sets, []])
          }
          onPlayClick={() => {
            if ((readySets[0] || []).length === 4) {
              setAssignTargetSet(0);
              modals.setAssignOpen(true);
              if (!firstMatchDone) setFirstMatchDone(true);
            }
          }}
          onRemoveSetClick={removeSet}
          onPlayerSwapClick={(setIndex, playerIndex) => {
            modals.setSwapSetIndex(setIndex);
            modals.setSwapIndex(playerIndex);
            modals.setSwapOpen(true);
          }}
        />

        {/* Courts Panel */}
        <CourtsPanel
          courts={courts}
          players={players}
          now={now}
          onAddCourtClick={addCourt}
          onRemoveCourtClick={removeCourt}
          onEndMatchClick={endMatch}
          onPlayerSwapClick={(courtId, playerIndex) => {
            modals.setCourtSwapId(courtId);
            modals.setCourtSwapPlayerIndex(playerIndex);
            modals.setCourtSwapOpen(true);
          }}
          fmtDuration={fmtDuration}
        />
      </div>

      {/* Footer */}
      <div className="mx-auto mt-4 max-w-6xl text-xs text-slate-500">
        <p>
          Rules in this MVP: Doubles only (4 players per court). Click a player
          in the pool to edit/delete. In Ready, create multiple sets with{" "}
          <b>+</b>, auto-fill from pool (least matches first), then choose a
          court.
        </p>
      </div>

      {/* Modals */}
      <AddPlayerModal
        open={modals.addOpen}
        onClose={() => modals.setAddOpen(false)}
        form={addForm}
        onFormChange={setAddForm}
        onConfirm={confirmAddPlayer}
        existingPlayers={players}
      />

      <EditPlayerModal
        open={modals.editTargetId !== null}
        editTargetId={modals.editTargetId}
        players={players}
        onClose={() => modals.setEditTargetId(null)}
        onPlayerChange={updatePlayerInEdit}
        onDelete={deletePlayer}
        onSave={saveEditPlayer}
        onResetMatches={resetPlayerMatches}
      />

      <SwapModal
        open={modals.swapOpen}
        onClose={() => modals.setSwapOpen(false)}
        players={poolPlayers}
        onChoose={(poolId) => {
          if (modals.swapIndex !== null && modals.swapSetIndex !== null) {
            swapReadyWithPool(modals.swapSetIndex, modals.swapIndex, poolId);
          }
          modals.setSwapOpen(false);
        }}
      />

      <SwapModal
        open={modals.courtSwapOpen}
        onClose={() => modals.setCourtSwapOpen(false)}
        players={poolPlayers}
        onChoose={(poolId) => {
          if (modals.courtSwapId !== null && modals.courtSwapPlayerIndex !== null) {
            swapPlayerInCourt(modals.courtSwapId, modals.courtSwapPlayerIndex, poolId);
          }
          modals.setCourtSwapOpen(false);
        }}
      />

      <AssignCourtModal
        open={modals.assignOpen}
        onClose={() => modals.setAssignOpen(false)}
        courts={courts}
        onAssign={(courtId) => {
          if (assignTargetSet !== null) {
            assignSetToCourt(assignTargetSet, courtId);
          }
          modals.setAssignOpen(false);
        }}
      />

      <SaveGroupModal
        open={modals.saveGroupOpen}
        onClose={() => modals.setSaveGroupOpen(false)}
        players={filteredPoolPlayers}
        groups={groups}
        onSave={saveGroupHandler}
      />

      {groupsScreenOpen && (
        <GroupsScreen
          groups={groups}
          onLoadGroup={loadGroupHandler}
          onDeleteGroup={deleteGroupHandler}
          onClose={() => setGroupsScreenOpen(false)}
        />
      )}
    </div>
  );
}
