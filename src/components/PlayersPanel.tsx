import { FolderOpen, Plus, Save } from "lucide-react";
import { useState } from "react";
import type { Player } from "../types";
import { SkillIcon } from "./SkillIcon";
import { ConfirmDialog } from "./modals/ConfirmDialog";

interface PlayersPanelProps {
  filteredPoolPlayers: Player[];
  search: string;
  onSearchChange: (search: string) => void;
  onAddClick: () => void;
  onEditClick: (id: string) => void;
  onReadyClick: (id: string) => void;
  hasAvailableSet: boolean;
  onResetAllMatches?: () => void;
  onSaveGroupClick?: () => void;
  onLoadGroupClick?: () => void;
  onClearQueue?: () => void;
}

export function PlayersPanel({
  filteredPoolPlayers,
  search,
  onSearchChange,
  onAddClick,
  onEditClick,
  onReadyClick,
  hasAvailableSet,
  onResetAllMatches,
  onSaveGroupClick,
  onLoadGroupClick,
  onClearQueue,
}: PlayersPanelProps) {
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

  const handleResetConfirmed = () => {
    if (onResetAllMatches) onResetAllMatches();
    setResetConfirmOpen(false);
  };

  const handleClearConfirmed = () => {
    if (onClearQueue) onClearQueue();
    setClearConfirmOpen(false);
  };

  return (
    <section className="rounded-2xl bg-rose-50 p-4 shadow-sm ring-1 ring-rose-200">
      {/* Header with Players title and Reset All button */}
      <div className="mb-3 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <svg className="text-slate-600" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg> Players
          </h2>
          {onResetAllMatches && (
            <button
              onClick={() => setResetConfirmOpen(true)}
              className="inline-flex items-center justify-center rounded-xl bg-indigo-50 px-2 py-1 text-sm font-medium text-indigo-600 ring-1 ring-indigo-200 hover:bg-indigo-100"
              title="Reset match count for all players"
            >
              Reset Count
            </button>
          )}
        </div>

        {/* Group buttons */}
        <div className="flex gap-2">
          {onLoadGroupClick && (
            <button
              onClick={onLoadGroupClick}
              className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl bg-blue-50 px-2 py-2 text-sm font-medium text-blue-600 ring-1 ring-blue-200 hover:bg-blue-100"
              title="Load a saved player group"
            >
              <FolderOpen size={16} /> Load Group
            </button>
          )}
          {onSaveGroupClick && (
            <button
              onClick={onSaveGroupClick}
              disabled={filteredPoolPlayers.length === 0}
              className="flex-1 inline-flex items-center justify-center gap-1 rounded-xl bg-green-50 px-2 py-2 text-sm font-medium text-green-600 ring-1 ring-green-200 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-50"
              title={filteredPoolPlayers.length === 0 ? "Add players to save a group" : "Save current players as a group"}
            >
              <Save size={16} /> Save Group
            </button>
          )}
        </div>
      </div>

      {/* Search + Add */}
      <div className="mb-3 flex items-center gap-2">
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search players..."
          className="flex-1 rounded-xl border bg-white px-3 py-2 text-sm ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500"
        />
        <button
          onClick={onAddClick}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          <Plus size={16} /> Add Player
        </button>
      </div>

      {/* Pool list */}
      <div className="mb-2 flex items-center justify-between">
        <div className="text-xs text-slate-500">
          Players: <b>{filteredPoolPlayers.length}</b>
        </div>
        {onClearQueue && filteredPoolPlayers.length > 0 && (
          <button
            onClick={() => setClearConfirmOpen(true)}
            className="text-xs font-medium text-red-600 hover:text-red-700 ring-1 ring-red-200 hover:ring-red-300 rounded px-2 py-1 transition-colors"
            title="Remove all players from queue"
          >
            Clear Queue
          </button>
        )}
      </div>

      <div className="max-h-80 overflow-auto pr-1">
        {filteredPoolPlayers.length === 0 ? (
          <p className="text-sm text-slate-500">No players in pool. Add players or finish a match.</p>
        ) : (
          <ul className="space-y-2">
            {filteredPoolPlayers.map((p) => (
              <li
                key={p.id}
                className="flex cursor-pointer items-center justify-between rounded-xl border bg-white px-3 py-2 text-sm hover:bg-slate-100"
                onClick={() => onEditClick(p.id)}
                title="Edit / Delete"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <SkillIcon skill={p.skill} />
                  <span className="truncate font-medium">{p.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="mr-1 text-xs text-slate-500">{p.matches}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onReadyClick(p.id);
                    }}
                    disabled={!hasAvailableSet}
                    title={!hasAvailableSet ? "All sets are full" : "Add to a set"}
                    className="rounded-lg bg-emerald-600 px-2 py-1 text-white hover:bg-emerald-700 disabled:opacity-40"
                  >
                    Ready
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={resetConfirmOpen}
        title="Reset Match Counts?"
        message="This will reset the match count for all players. This action cannot be undone."
        confirmText="Reset All"
        cancelText="Cancel"
        isDangerous={false}
        onConfirm={handleResetConfirmed}
        onCancel={() => setResetConfirmOpen(false)}
      />

      <ConfirmDialog
        open={clearConfirmOpen}
        title="Clear All Players?"
        message="This will remove all players from the queue. This action cannot be undone."
        confirmText="Clear Queue"
        cancelText="Cancel"
        isDangerous={true}
        onConfirm={handleClearConfirmed}
        onCancel={() => setClearConfirmOpen(false)}
      />
    </section>
  );
}
