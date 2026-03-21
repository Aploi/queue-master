import { Clock, Plus, Square as Stop, Trash2 } from "lucide-react";
import { useState } from "react";
import type { Court, Player } from "../types";
import { ReadyTile } from "./ReadyTile";
import { ConfirmDialog } from "./modals/ConfirmDialog";

interface CourtsPanelProps {
  courts: Court[];
  players: Player[];
  now: number;
  onAddCourtClick: () => void;
  onRemoveCourtClick: (id: string) => void;
  onEndMatchClick: (id: string) => void;
  onPlayerSwapClick?: (courtId: string, playerIndex: number) => void;
  fmtDuration: (ms?: number | null) => string;
}

export function CourtsPanel({
  courts,
  players,
  now,
  onAddCourtClick,
  onRemoveCourtClick,
  onEndMatchClick,
  onPlayerSwapClick,
  fmtDuration,
}: CourtsPanelProps) {
  const [courtToDelete, setCourtToDelete] = useState<string | null>(null);

  return (
    <section className="rounded-2xl bg-emerald-50 p-4 shadow-sm ring-1 ring-emerald-200">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-emerald-900">
        <svg className="text-emerald-600" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm3.5-9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zM6.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
        </svg> Courts
      </h2>

      <div className="mb-3 flex gap-2">
        <button
          onClick={onAddCourtClick}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          <Plus size={16} /> Add Court
        </button>
      </div>

      {courts.length === 0 ? (
        <p className="text-sm text-slate-500">No courts added yet.</p>
      ) : (
        <div className="space-y-3">
          {courts.map((c, index) => {
            const active = c.playingIds.length > 0;
            const duration = active && c.startedAt ? fmtDuration(now - c.startedAt) : "";
            return (
              <div key={c.id} className="rounded-2xl border border-emerald-200 bg-white p-3 shadow-sm">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold">Court {index + 1}</h3>
                    {active ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700 ring-1 ring-emerald-300 font-medium">
                        <Clock size={12} /> {duration}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 ring-1 ring-slate-300">
                        Idle
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {active && (
                      <button
                        onClick={() => onEndMatchClick(c.id)}
                        className="inline-flex items-center gap-2 rounded-lg bg-rose-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-rose-700"
                      >
                        <Stop size={16} /> Done
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (active) {
                          setCourtToDelete(c.id);
                        } else {
                          onRemoveCourtClick(c.id);
                        }
                      }}
                      className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium ring-1 ring-red-200 hover:bg-red-100 text-red-600"
                      title="Remove court"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                {active ? (
                  <ReadyTile
                    ids={c.playingIds}
                    players={players}
                    onClickPlayer={(idx) => onPlayerSwapClick?.(c.id, idx)}
                  />
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-white p-3 text-center text-xs text-slate-600">
                    Use <b>Play</b> from a set to assign here.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={courtToDelete !== null}
        title="Delete Court with Active Play?"
        message="This court has an ongoing game. This will NOT count as a completed match. The players will be moved back to the pool without incrementing their match count."
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        onConfirm={() => {
          if (courtToDelete) {
            onRemoveCourtClick(courtToDelete);
            setCourtToDelete(null);
          }
        }}
        onCancel={() => setCourtToDelete(null)}
      />
    </section>
  );
}
