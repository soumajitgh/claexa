import { useCallback, useEffect, useMemo, useState } from "react";
import { fuzzySearch } from "@/lib/search/fuzzy";

export type UseFuzzyTypeaheadOptions = {
  limit?: number;
  threshold?: number;
};

export function useFuzzyTypeahead(
  items: string[],
  query: string,
  options?: UseFuzzyTypeaheadOptions
) {
  const threshold = options?.threshold ?? 0.35;
  const limit = options?.limit ?? 8;

  const suggestions = useMemo(
    () => (query ? fuzzySearch(items, query, { threshold, limit }) : []),
    [items, query, threshold, limit]
  );

  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  useEffect(() => {
    if (isOpen && suggestions.length > 0) setActiveIndex(0);
    else setActiveIndex(-1);
  }, [isOpen, suggestions.length]);

  const handleKeyDown = useCallback(
    (
      e: React.KeyboardEvent,
      handlers?: { onPick?: (value: string) => void; onDismiss?: () => void }
    ) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (!isOpen && query) setIsOpen(true);
        if (suggestions.length > 0)
          setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (!isOpen && query) setIsOpen(true);
        if (suggestions.length > 0)
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
      } else if (e.key === "Enter") {
        if (isOpen && activeIndex >= 0 && suggestions[activeIndex]) {
          e.preventDefault();
          handlers?.onPick?.(suggestions[activeIndex]);
          setIsOpen(false);
        }
      } else if (e.key === "Escape" || e.key === "Tab") {
        setIsOpen(false);
        handlers?.onDismiss?.();
      }
    },
    [activeIndex, isOpen, query, suggestions]
  );

  return {
    suggestions,
    isOpen,
    setIsOpen,
    activeIndex,
    setActiveIndex,
    handleKeyDown,
  } as const;
}
