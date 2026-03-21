import { Play, Plus, Trash2 } from "lucide-react";
import type { Player } from "../types";
import { ReadyTile } from "./ReadyTile";

interface ReadyPanelProps {
  readySets: string[][];
  players: Player[];
  onStartClick: () => void;
  onEndClick: () => void;
  isArmed: boolean;
  onAddSetClick: () => void;
  onPlayClick: (setIndex: number) => void;
  onRemoveSetClick: (setIndex: number) => void;
  onPlayerSwapClick: (setIndex: number, playerIndex: number) => void;
}

export function ReadyPanel({
  readySets,
  players,
  onStartClick,
  onEndClick,
  isArmed,
  onAddSetClick,
  onPlayClick,
  onRemoveSetClick,
  onPlayerSwapClick,
}: ReadyPanelProps) {
  return (
    <section className="rounded-2xl bg-amber-50 p-4 shadow-sm ring-1 ring-amber-200">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-bold text-amber-900">
          <svg className="text-amber-600" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg> Ready to Play
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={isArmed ? onEndClick : onStartClick}
            className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-white ${
              isArmed
                ? "bg-rose-600 hover:bg-rose-700"
                : "bg-slate-900 hover:bg-slate-800"
            }`}
            title={isArmed ? "Stop auto-fill" : "Fill empty slots across ALL sets"}
          >
            {isArmed ? "End" : "Start"}
          </button>
          <button
            onClick={onAddSetClick}
            className="inline-flex items-center justify-center rounded-xl bg-slate-100 px-3 py-2 text-sm ring-1 ring-slate-300 hover:bg-slate-200 text-slate-700"
            title="Create another set"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Stacked sets */}
      <div className="space-y-3">
        {readySets.map((setIds, i) => (
          <div key={i} className="rounded-2xl border border-amber-200 bg-white p-3 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="rounded-full px-2 py-0.5 text-xs ring-1 bg-slate-100 text-slate-700 ring-slate-300 font-medium">
                  Set {i + 1}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {i === 0 && (
                  <button
                    onClick={() => onPlayClick(0)}
                    disabled={(readySets[0] || []).length !== 4}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-40"
                    title="Assign Set 1 to a court"
                  >
                    <Play size={16} /> Play
                  </button>
                )}
                <button
                  onClick={() => onRemoveSetClick(i)}
                  className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium ring-1 ring-red-200 hover:bg-red-100 text-red-600"
                  title="Delete this set"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <ReadyTile
              ids={setIds}
              players={players}
              onClickPlayer={(idx) => onPlayerSwapClick(i, idx)}
            />
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-xl bg-slate-100 p-3 text-xs text-slate-700 border border-slate-200">
        Tip: Tap a player to swap them with someone from the pool. Use <b>Start</b> (top) to fill every set, then press <b>Play</b> on a set to choose a court.
      </div>
    </section>
  );
}
