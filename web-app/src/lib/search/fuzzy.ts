import Fuse from "fuse.js";
import type { IFuseOptions } from "fuse.js";

export type FuzzyOptions<T> = Partial<IFuseOptions<T>> & {
  limit?: number;
};

export function fuzzySearch<T>(items: T[], query: string, options?: FuzzyOptions<T>): T[] {
  const q = (query || "").trim();
  if (!q) return [];

  const fuse = new Fuse<T>(items, {
    includeScore: true,
    threshold: 0.3,
    distance: 100,
    // When T is a string array, no keys are needed. For objects, pass keys in options.
    ...(options as IFuseOptions<T> | undefined),
  });

  const limit = options?.limit ?? 8;
  return fuse.search(q, { limit }).map((r) => r.item);
}
