import type { Player } from "../types";
import { SkillIcon } from "./SkillIcon";

export function ReadyTile({ ids, players, onClickPlayer }: { ids: string[]; players: Player[]; onClickPlayer?: (idx: number) => void }) {
  return (
    <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
      <div className="grid grid-cols-2 gap-2">
        {ids.map((id, i) => {
          const p = players.find((pp) => pp.id === id);
          if (!p) {
            return (
              <div key={`loading-${id}-${i}`} className="flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-xs text-slate-400">
                Loading…
              </div>
            );
          }
          return (
            <button
              key={p.id}
              onClick={() => onClickPlayer && onClickPlayer(i)}
              className={`flex w-full items-center gap-2 truncate rounded-lg px-3 py-2 ring-1 ring-slate-200 bg-white font-medium ${
                onClickPlayer ? "hover:bg-emerald-50 hover:ring-emerald-300 cursor-pointer" : ""
              }`}
              title={onClickPlayer ? "Swap with a player from pool" : undefined}
            >
              <SkillIcon skill={p.skill} />
              <span className="truncate text-sm">{p.name}</span>
            </button>
          );
        })}
        {Array.from({ length: Math.max(0, 4 - ids.length) }).map((_, i) => (
          <div key={`empty-${i}`} className="flex h-10 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-400">
            Empty
          </div>
        ))}
      </div>
    </div>
  );
}
