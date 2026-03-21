import { AnimatePresence, motion } from "framer-motion";
import type { Player } from "../../types";
import { SkillIcon } from "../SkillIcon";

interface SwapModalProps {
  open: boolean;
  onClose: () => void;
  players: Player[];
  onChoose: (poolId: string) => void;
}

export function SwapModal({ open, onClose, players, onChoose }: SwapModalProps) {
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
            <h3 className="mb-3 text-base font-semibold">Swap with player in pool</h3>
            {players.length === 0 ? (
              <p className="text-sm text-slate-500">No players in pool.</p>
            ) : (
              <ul className="max-h-72 space-y-2 overflow-auto pr-1">
                {players.map((p) => (
                  <li key={p.id}>
                    <button
                      onClick={() => onChoose(p.id)}
                      className="flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm hover:bg-slate-50"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <SkillIcon skill={p.skill} />
                        <span className="truncate">{p.name}</span>
                        <span className="ml-2 shrink-0 text-xs text-slate-500">• {p.matches}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-3 flex justify-end">
              <button onClick={onClose} className="rounded-xl bg-white px-3 py-2 text-sm ring-1 ring-slate-200 hover:bg-slate-50">
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
