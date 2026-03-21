import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";
import type { Player, PlayerGroup } from "../../types";

interface SaveGroupModalProps {
  open: boolean;
  onClose: () => void;
  players: Player[];
  groups: PlayerGroup[];
  onSave: (groupName: string, groupIdToUpdate?: string) => void;
}

export function SaveGroupModal({ open, onClose, players, groups, onSave }: SaveGroupModalProps) {
  const [groupName, setGroupName] = useState("");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const handleSave = () => {
    if (!groupName.trim()) return;
    onSave(groupName.trim(), selectedGroupId || undefined);
    setGroupName("");
    setSelectedGroupId(null);
    onClose();
  };

  const toggleGroupSelection = (groupId: string) => {
    setSelectedGroupId(selectedGroupId === groupId ? null : groupId);
    if (selectedGroupId === groupId) {
      setGroupName("");
    } else {
      const group = groups.find((g) => g.id === groupId);
      if (group) {
        setGroupName(group.name);
      }
    }
  };

  const isUpdating = selectedGroupId !== null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/40 p-4"
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
              <h3 className="text-lg md:text-base font-semibold">
                {isUpdating ? "Update Group" : "Save New Group"}
              </h3>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-auto flex-1 px-4 md:px-6 py-4 space-y-4">
              {players.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-8">No players to save.</p>
              )}

              {players.length > 0 && (
                <>
                  {/* Group Name Input */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Group Name
                    </label>
                    <input
                      type="text"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="e.g. Monday Regulars"
                      className="w-full rounded-lg border border-slate-300 px-3 py-3 text-base md:text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      onKeyDown={(e) => e.key === "Enter" && handleSave()}
                      autoFocus
                    />
                  </div>

                  {/* Existing Groups */}
                  {groups.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Update Existing Group {selectedGroupId && "(click to deselect)"}
                      </label>
                      <div className="space-y-2 max-h-40 md:max-h-32 overflow-y-auto">
                        {groups.map((group) => (
                          <button
                            key={group.id}
                            onClick={() => toggleGroupSelection(group.id)}
                            className={`w-full text-left rounded-lg border-2 px-3 py-3 md:py-2 text-sm transition-all ${
                              selectedGroupId === group.id
                                ? "border-blue-500 bg-blue-50"
                                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                            }`}
                          >
                            <div className="font-medium text-slate-900">{group.name}</div>
                            <div className="text-xs text-slate-500 mt-1">
                              {group.players.length} players • {new Date(group.updatedAt).toLocaleDateString()}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Players Preview */}
                  <div className="rounded-lg bg-slate-50 p-3 md:p-2">
                    <div className="text-xs font-medium text-slate-700 mb-2">
                      Players to save ({players.length}):
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {players.map((p) => (
                        <div
                          key={p.id}
                          className="text-xs bg-white border border-slate-200 rounded px-2 py-2 truncate"
                        >
                          <div className="font-medium truncate">{p.name}</div>
                          <div className="text-slate-500 text-xs">
                            {p.skill[0]} {p.gender[0]}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 px-4 md:px-6 py-3 bg-slate-50 flex gap-2 sticky bottom-0">
              <button
                onClick={onClose}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-3 md:py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!groupName.trim() || players.length === 0}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-3 md:py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isUpdating ? "Update" : "Save"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
