import { AnimatePresence, motion } from "framer-motion";
import type { Gender, Player, Skill } from "../../types";

interface AddPlayerModalProps {
  open: boolean;
  onClose: () => void;
  form: { name: string; gender: Gender; skill: Skill };
  onFormChange: (form: { name: string; gender: Gender; skill: Skill }) => void;
  onConfirm: () => void;
  existingPlayers?: Player[];
}

export function AddPlayerModal({ open, onClose, form, onFormChange, onConfirm, existingPlayers = [] }: AddPlayerModalProps) {
  const isDuplicate = existingPlayers.some(
    (p) => p.name.toLowerCase() === form.name.toLowerCase() && 
           p.gender === form.gender && 
           p.skill === form.skill
  );
  const isFormValid = form.name.trim() !== "" && !isDuplicate;
  return (
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
            <h3 className="mb-3 text-base font-semibold">Add Player</h3>
            <div className="mb-3">
              <label className="text-xs text-slate-500">Name</label>
              <input
                className="mt-1 w-full rounded-xl border px-3 py-2 text-sm ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={form.name}
                onChange={(e) => onFormChange({ ...form, name: e.target.value })}
                placeholder="e.g., Alex Cruz"
              />
            </div>
            <div className="mb-3 grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-slate-500">Gender</label>
                <select
                  className="mt-1 w-full rounded-xl border px-3 py-2 text-sm ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={form.gender}
                  onChange={(e) => onFormChange({ ...form, gender: e.target.value as Gender })}
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
                  value={form.skill}
                  onChange={(e) => onFormChange({ ...form, skill: e.target.value as Skill })}
                >
                  {(["Novice", "Intermediate", "Advance"] as const).map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {isDuplicate && (
              <div className="mb-3 rounded-lg bg-red-50 p-2 text-xs text-red-700">
                A player with this name, gender, and skill already exists.
              </div>
            )}
            <div className="flex justify-end gap-2">
              <button
                className="rounded-xl bg-white px-3 py-2 text-sm ring-1 ring-slate-200 hover:bg-slate-50"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className={`rounded-xl px-3 py-2 text-sm font-semibold text-white ${
                  isFormValid
                    ? "bg-slate-900 hover:bg-slate-800"
                    : "bg-slate-300 cursor-not-allowed"
                }`}
                onClick={onConfirm}
                disabled={!isFormValid}
              >
                Add Player
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
