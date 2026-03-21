import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, Trash2, X } from "lucide-react";
import { useState } from "react";
import type { PlayerGroup, PlayerSnapshot } from "../types";

interface GroupsScreenProps {
  groups: PlayerGroup[];
  onLoadGroup: (group: PlayerGroup, selectedPlayerIndices: number[]) => void;
  onDeleteGroup: (groupId: string) => void;
  onClose: () => void;
}

export function GroupsScreen({ groups, onLoadGroup, onDeleteGroup, onClose }: GroupsScreenProps) {
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const [selectedPlayers, setSelectedPlayers] = useState<Record<string, Set<number>>>(() => {
    const initial: Record<string, Set<number>> = {};
    groups.forEach((group) => {
      initial[group.id] = new Set(group.players.map((_, idx) => idx));
    });
    return initial;
  });

  const togglePlayerSelection = (groupId: string, playerIndex: number) => {
    setSelectedPlayers((prev) => {
      const newSelected = new Set(prev[groupId] || []);
      if (newSelected.has(playerIndex)) {
        newSelected.delete(playerIndex);
      } else {
        newSelected.add(playerIndex);
      }
      return { ...prev, [groupId]: newSelected };
    });
  };

  const selectAllPlayers = (groupId: string, total: number) => {
    setSelectedPlayers((prev) => ({
      ...prev,
      [groupId]: new Set(Array.from({ length: total }, (_, i) => i)),
    }));
  };

  const deselectAllPlayers = (groupId: string) => {
    setSelectedPlayers((prev) => ({
      ...prev,
      [groupId]: new Set(),
    }));
  };

  const handleLoadGroup = (group: PlayerGroup) => {
    const selected = Array.from(selectedPlayers[group.id] || []);
    if (selected.length > 0) {
      onLoadGroup(group, selected);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-40 flex items-end md:items-center justify-center bg-black/40 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ y: 500, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 500, opacity: 0 }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="w-full md:max-w-md rounded-t-3xl md:rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-4 md:px-6 py-4 sticky top-0 bg-white">
            <h2 className="text-lg md:text-base font-semibold">Load Group</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-auto flex-1 px-4 md:px-6 py-3">
            {groups.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500">No saved groups yet.</p>
                <p className="text-sm text-slate-400 mt-1">Save your first group from the home screen!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {groups.map((group) => {
                  const isExpanded = expandedGroupId === group.id;
                  const selectedCount = selectedPlayers[group.id]?.size || 0;

                  return (
                    <div
                      key={group.id}
                      className="rounded-lg border border-slate-200 overflow-hidden transition-all"
                    >
                      {/* Group Header */}
                      <button
                        onClick={() =>
                          setExpandedGroupId(isExpanded ? null : group.id)
                        }
                        className="w-full text-left px-4 md:px-3 py-3 md:py-2.5 hover:bg-slate-50 flex items-center justify-between transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-slate-900 truncate">
                            {group.name}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {selectedCount} of {group.players.length} selected •{" "}
                            {new Date(group.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="ml-2 flex-shrink-0 text-slate-400" size={20} />
                        ) : (
                          <ChevronDown className="ml-2 flex-shrink-0 text-slate-400" size={20} />
                        )}
                      </button>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="border-t border-slate-200 bg-slate-50">
                          {/* Select All / Deselect All */}
                          <div className="flex gap-2 px-4 md:px-3 py-2 border-b border-slate-200">
                            <button
                              onClick={() =>
                                selectAllPlayers(group.id, group.players.length)
                              }
                              className="flex-1 text-xs font-medium text-blue-600 hover:text-blue-700 px-2 py-1.5 rounded hover:bg-blue-50 transition-colors"
                            >
                              Select All
                            </button>
                            <button
                              onClick={() => deselectAllPlayers(group.id)}
                              className="flex-1 text-xs font-medium text-slate-600 hover:text-slate-700 px-2 py-1.5 rounded hover:bg-slate-200 transition-colors"
                            >
                              Clear
                            </button>
                          </div>

                          {/* Player List */}
                          <div className="space-y-1 p-3 md:p-2 max-h-48 overflow-y-auto">
                            {group.players.map((player: PlayerSnapshot, idx: number) => {
                              const isSelected =
                                selectedPlayers[group.id]?.has(idx) ?? false;
                              return (
                                <label
                                  key={idx}
                                  className="flex items-center gap-3 p-2 md:p-1.5 rounded hover:bg-slate-100 cursor-pointer transition-colors"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() =>
                                      togglePlayerSelection(group.id, idx)
                                    }
                                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-slate-900 truncate">
                                      {player.name}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                      {player.skill} • {player.gender}
                                    </div>
                                  </div>
                                </label>
                              );
                            })}
                          </div>

                          {/* Load Button */}
                          <div className="px-4 md:px-3 py-2 border-t border-slate-200 flex gap-2">
                            <button
                              onClick={() => onDeleteGroup(group.id)}
                              className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete group"
                            >
                              <Trash2 size={16} /> Delete
                            </button>
                            <button
                              onClick={() => handleLoadGroup(group)}
                              disabled={selectedCount === 0}
                              className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Load ({selectedCount})
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 px-4 md:px-6 py-3 bg-slate-50 sticky bottom-0">
            <button
              onClick={onClose}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 md:py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
