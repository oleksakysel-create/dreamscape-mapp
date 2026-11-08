import type { Fills } from "./types";

export interface FillOp {
  regionId: string;
  prev: string | undefined;
  next: string | undefined;
}

export interface History {
  past: FillOp[];
  future: FillOp[];
}

export const MAX_HISTORY = 300;
export const emptyHistory = (): History => ({ past: [], future: [] });

export function applyFill(fills: Fills, regionId: string, color: string | undefined): Fills {
  const next = { ...fills };
  if (color === undefined) delete next[regionId];
  else next[regionId] = color;
  return next;
}

/** Paint a region. Returns null when the op is a no-op (same color). */
export function paint(fills: Fills, history: History, regionId: string, color: string | undefined) {
  const prev = fills[regionId];
  if (prev === color) return null;
  const op: FillOp = { regionId, prev, next: color };
  const past = [...history.past, op];
  if (past.length > MAX_HISTORY) past.shift();
  return { fills: applyFill(fills, regionId, color), history: { past, future: [] } };
}

export function undo(fills: Fills, history: History) {
  const op = history.past[history.past.length - 1];
  if (!op) return null;
  return {
    fills: applyFill(fills, op.regionId, op.prev),
    history: { past: history.past.slice(0, -1), future: [op, ...history.future] },
  };
}

export function redo(fills: Fills, history: History) {
  const [op, ...rest] = history.future;
  if (!op) return null;
  return {
    fills: applyFill(fills, op.regionId, op.next),
    history: { past: [...history.past, op], future: rest },
  };
}

export function progressOf(fills: Fills, regionIds: readonly string[]): number {
  if (regionIds.length === 0) return 0;
  const filled = regionIds.filter((id) => fills[id] !== undefined).length;
  return filled / regionIds.length;
}
