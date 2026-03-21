import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type { Gender, Player } from "../../types";
import { ConfirmDialog } from "./ConfirmDialog";

interface EditPlayerModalProps {
  open: boolean;
  editTargetId: string | null;
  players: Player[];
  onClose: () => void;
  onPlayerChange: (player: Player) => void;
  onDelete: (id: string) => void;
  onSave: () => void;
  onResetMatches?: (id: string) => void;
}

export function EditPlayerModal({
  open,
  editTargetId,
  players,
  onClose,
  onPlayerChange,
  onDelete,
  onSave,
  onResetMatches,
}: EditPlayerModalProps) {
  const [shouldResetMatches, setShouldResetMatches] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const player = players.find((x) => x.id === editTargetId);
  if (!player) return null;

  const displayMatches = shouldResetMatches ? 0 : player.matches;

  const handleCancel = () => {
    setShouldResetMatches(false);
    onClose();
  };

  const handleSave = () => {
    if (shouldResetMatches) {
      onPlayerChange({ ...player, matches: 0 });
      if (onResetMatches) onResetMatches(player.id);
    }
    setShouldResetMatches(false);
    onSave();
  };

  const handleDeleteClick = () => {
    if (player.matches > 0) {
      setDeleteConfirmOpen(true);
    } else {
      onDelete(player.id);
    }
  };

  const handleConfirmDelete = () => {
    setDeleteConfirmOpen(false);
    onDelete(player.id);
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl bg-white p-4 shadow-xl ring-1 ring-slate-200"
            >
              <h3 className="mb-3 text-base font-semibold">Edit player</h3>
              <div className="mb-3">
                <label className="text-xs text-slate-500">Name</label>
                <input
                  className="mt-1 w-full rounded-xl border px-3 py-2 text-sm ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={player.name}
                  onChange={(e) => onPlayerChange({ ...player, name: e.target.value })}
                />
              </div>
              <div className="mb-3 grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-slate-500">Gender</label>
                  <select
                    className="mt-1 w-full rounded-xl border px-3 py-2 text-sm ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={player.gender}
                    onChange={(e) => onPlayerChange({ ...player, gender: e.target.value as Gender })}
                  >
                    {(["Male", "Female", "Other"] as const).map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-500">Skill</label>
                  <select
                    className="mt-1 w-full rounded-xl border px-3 py-2 text-sm ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={player.skill}
                    onChange={(e) => onPlayerChange({ ...player, skill: e.target.value as any })}
                  >
                    {(["Novice", "Intermediate", "Advance"] as const).map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mb-3 flex items-center justify-between rounded-xl bg-slate-50 p-3">
                <div>
                  <label className="text-xs text-slate-500">Matches Played</label>
                  <p className="text-lg font-semibold text-slate-900">{displayMatches}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShouldResetMatches(true)}
                  className="rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium text-amber-600 ring-1 ring-amber-200 hover:bg-amber-100"
                  title="Reset match count to 0"
                >
                  Reset
                </button>
              </div>
              <div className="flex justify-between gap-2">
                <button
                  className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700"
                  onClick={handleDeleteClick}
                >
                  Delete
                </button>
                <div className="flex gap-2">
                  <button
                    className="rounded-xl bg-white px-3 py-2 text-sm ring-1 ring-slate-200 hover:bg-slate-50"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                  <button
                    className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                    onClick={handleSave}
                  >
                    Save
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Player"
        message={`Are you sure you want to delete ${player.name}? This player has ${player.matches} match${player.matches !== 1 ? "es" : ""} recorded.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </>
  );
}
