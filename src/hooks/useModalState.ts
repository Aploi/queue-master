import { useState } from "react";

export function useModalState() {
  const [addOpen, setAddOpen] = useState(false);
  const [editTargetId, setEditTargetId] = useState<string | null>(null);
  const [swapOpen, setSwapOpen] = useState(false);
  const [swapIndex, setSwapIndex] = useState<number | null>(null);
  const [swapSetIndex, setSwapSetIndex] = useState<number | null>(null);
  const [courtSwapOpen, setCourtSwapOpen] = useState(false);
  const [courtSwapId, setCourtSwapId] = useState<string | null>(null);
  const [courtSwapPlayerIndex, setCourtSwapPlayerIndex] = useState<number | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [saveGroupOpen, setSaveGroupOpen] = useState(false);

  return {
    addOpen,
    setAddOpen,
    editTargetId,
    setEditTargetId,
    swapOpen,
    setSwapOpen,
    swapIndex,
    setSwapIndex,
    swapSetIndex,
    setSwapSetIndex,
    courtSwapOpen,
    setCourtSwapOpen,
    courtSwapId,
    setCourtSwapId,
    courtSwapPlayerIndex,
    setCourtSwapPlayerIndex,
    assignOpen,
    setAssignOpen,
    saveGroupOpen,
    setSaveGroupOpen,
  };
}
