export interface HistoryCommand {
  id: string;
  description: string;
  execute: () => void;
  undo: () => void;
  timestamp: number;
}

type HistoryListener = () => void;

class HistoryService {
  private past: HistoryCommand[] = [];
  private future: HistoryCommand[] = [];
  private listeners: Set<HistoryListener> = new Set();
  private maxDepth = 50;

  subscribe(listener: HistoryListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  execute(command: Omit<HistoryCommand, 'id' | 'timestamp'>) {
    const fullCmd: HistoryCommand = {
      ...command,
      id: `cmd-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
    };
    fullCmd.execute();
    this.past.push(fullCmd);
    if (this.past.length > this.maxDepth) {
      this.past.shift();
    }
    this.future = []; // Clear redo stack on new action
    this.notify();
    return fullCmd;
  }

  canUndo(): boolean {
    return this.past.length > 0;
  }

  canRedo(): boolean {
    return this.future.length > 0;
  }

  getUndoDescription(): string | null {
    if (this.past.length === 0) return null;
    return this.past[this.past.length - 1].description;
  }

  getRedoDescription(): string | null {
    if (this.future.length === 0) return null;
    return this.future[this.future.length - 1].description;
  }

  undo(): HistoryCommand | null {
    const cmd = this.past.pop();
    if (!cmd) return null;
    cmd.undo();
    this.future.push(cmd);
    this.notify();
    return cmd;
  }

  redo(): HistoryCommand | null {
    const cmd = this.future.pop();
    if (!cmd) return null;
    cmd.execute();
    this.past.push(cmd);
    this.notify();
    return cmd;
  }

  clear() {
    this.past = [];
    this.future = [];
    this.notify();
  }
}

export const historyService = new HistoryService();
