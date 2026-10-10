import { useState, useEffect, useCallback } from 'react';
import { historyService } from '../services/historyService';
import { soundFx } from '../utils/audio';

export function useHistory(onStateChange?: () => void) {
  const [canUndo, setCanUndo] = useState(historyService.canUndo());
  const [canRedo, setCanRedo] = useState(historyService.canRedo());
  const [undoDesc, setUndoDesc] = useState<string | null>(historyService.getUndoDescription());
  const [redoDesc, setRedoDesc] = useState<string | null>(historyService.getRedoDescription());

  useEffect(() => {
    const unsub = historyService.subscribe(() => {
      setCanUndo(historyService.canUndo());
      setCanRedo(historyService.canRedo());
      setUndoDesc(historyService.getUndoDescription());
      setRedoDesc(historyService.getRedoDescription());
      if (onStateChange) onStateChange();
    });
    return unsub;
  }, [onStateChange]);

  const undo = useCallback((): string | null => {
    const cmd = historyService.undo();
    if (cmd) {
      soundFx.playUndo();
      return cmd.description;
    }
    return null;
  }, []);

  const redo = useCallback((): string | null => {
    const cmd = historyService.redo();
    if (cmd) {
      soundFx.playRedo();
      return cmd.description;
    }
    return null;
  }, []);

  // Keyboard shortcuts Ctrl/Cmd+Z and Ctrl/Cmd+Shift+Z
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      const isMeta = e.metaKey || e.ctrlKey;
      if (isMeta && e.key === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
      } else if (isMeta && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return {
    canUndo,
    canRedo,
    undoDesc,
    redoDesc,
    undo,
    redo,
  };
}
