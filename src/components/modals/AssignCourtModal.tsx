import { AnimatePresence, motion } from "framer-motion";
import type { Court } from "../../types";

interface AssignCourtModalProps {
  open: boolean;
  onClose: () => void;
  courts: Court[];
  onAssign: (courtId: string) => void;
}

export function AssignCourtModal({ open, onClose, courts, onAssign }: AssignCourtModalProps) {
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
            <h3 className="mb-3 text-base font-semibold">Choose a court</h3>
            {courts.every((c) => c.playingIds.length > 0) ? (
              <p className="text-sm text-slate-500">No idle courts available. Add a court or end a match.</p>
            ) : (
              <ul className="max-h-72 space-y-2 overflow-auto pr-1">
                {courts.map((c, index) =>
                  c.playingIds.length === 0 ? (
                    <li key={c.id}>
                      <button
                        onClick={() => onAssign(c.id)}
                        className="flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm hover:bg-slate-50"
                      >
                        <span className="truncate font-medium">Court {index + 1}</span>
                        <span className="text-xs text-slate-500">Idle</span>
                      </button>
                    </li>
                  ) : null
                )}
              </ul>
            )}
            <div className="mt-3 flex justify-end">
              <button
                onClick={onClose}
                className="rounded-xl bg-white px-3 py-2 text-sm ring-1 ring-slate-200 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
