import { useEffect, useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { useFuzzyTypeahead } from "@/hooks/useFuzzyTypeahead";

const FUZZY_OPTIONS = {
  threshold: 0.35,
  limit: 5, // Top 5 suggestions
};

export type DegreeInputProps = {
  placeholder?: string;
  helperText?: string;
  value: string;
  onChange: (value: string) => void;
  degreeList: readonly { value: string; label: string }[];
};

export default function DegreeInput({
  placeholder = "e.g., B.Tech",
  helperText = "",
  value,
  onChange,
  degreeList,
}: DegreeInputProps) {
  // Convert degree list to searchable strings with keywords
  const degreeSearchData = useMemo(
    () => degreeList.map((deg) => {
      // Extract keywords from the label for better search
      // e.g., "B.Tech - Computer Science (CSE)" -> includes "btech", "cse", "computer science"
      const keywords = deg.label
        .toLowerCase()
        .replace(/\./g, '') // Remove dots
        .replace(/[()]/g, ' ') // Replace parentheses with spaces
        .split(/[-\s]+/) // Split by dash and spaces
        .filter(word => word.length > 0)
        .join(' ');
      
      return {
        label: deg.label,
        searchText: `${deg.label.toLowerCase()} ${keywords}`,
      };
    }),
    [degreeList]
  );

  const degreeLabels = useMemo(
    () => degreeSearchData.map((d) => d.searchText),
    [degreeSearchData]
  );

  const degreeQuery = value.trim();
  const {
    suggestions: degreeSuggestions,
    isOpen: isDegreeOpen,
    setIsOpen: setIsDegreeOpen,
    activeIndex: activeDegreeIndex,
    setActiveIndex: setActiveDegreeIndex,
  } = useFuzzyTypeahead(degreeLabels, degreeQuery, FUZZY_OPTIONS);

  const [hasNavigatedDegree, setHasNavigatedDegree] = useState(false);

  // Map fuzzy search results back to original labels
  const mappedSuggestions = useMemo(
    () => degreeSuggestions.map((suggestion: string) => {
      const found = degreeSearchData.find(d => d.searchText === suggestion);
      return found ? found.label : suggestion;
    }),
    [degreeSuggestions, degreeSearchData]
  );

  const lowerDegree = degreeQuery.toLowerCase();
  const filteredDegreeSuggestions = useMemo(
    () =>
      mappedSuggestions.filter(
        (suggestion: string) => suggestion.toLowerCase() !== lowerDegree
      ),
    [mappedSuggestions, lowerDegree]
  );

  // Always show user's typed value as first option, followed by top 5 matches
  const displayDegreeSuggestions = degreeQuery
    ? [degreeQuery, ...filteredDegreeSuggestions]
    : mappedSuggestions;

  useEffect(() => {
    if (isDegreeOpen && displayDegreeSuggestions.length > 0) {
      setActiveDegreeIndex(0);
    }
  }, [displayDegreeSuggestions.length, isDegreeOpen, setActiveDegreeIndex]);

  const closeSuggestions = () => {
    setIsDegreeOpen(false);
    setHasNavigatedDegree(false);
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          placeholder={placeholder}
          value={value}
          onFocus={() => setIsDegreeOpen(!!degreeQuery)}
          onChange={(event) => {
            const nextValue = event.target.value;
            onChange(nextValue);
            setIsDegreeOpen(!!nextValue.trim());
            setHasNavigatedDegree(false);
          }}
          onKeyDown={(event) => {
            const total = displayDegreeSuggestions.length;

            if (event.key === "ArrowDown" && isDegreeOpen && total > 0) {
              event.preventDefault();
              setActiveDegreeIndex((prev) => (prev + 1) % total);
              setHasNavigatedDegree(true);
            } else if (event.key === "ArrowUp" && isDegreeOpen && total > 0) {
              event.preventDefault();
              setActiveDegreeIndex((prev) => (prev - 1 + total) % total);
              setHasNavigatedDegree(true);
            } else if (event.key === "Enter") {
              if (!degreeQuery) return;

              event.preventDefault();
              if (isDegreeOpen && total > 0 && hasNavigatedDegree) {
                if (activeDegreeIndex === 0) {
                  onChange(degreeQuery);
                } else {
                  const picked = displayDegreeSuggestions[activeDegreeIndex];
                  if (picked) {
                    onChange(picked);
                  }
                }
              } else {
                onChange(degreeQuery);
              }

              closeSuggestions();
            } else if (event.key === "Escape" || event.key === "Tab") {
              closeSuggestions();
            }
          }}
        />
        {isDegreeOpen && degreeQuery && (
          <div className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-md border bg-background shadow-md">
            {displayDegreeSuggestions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No degrees found.
              </div>
            ) : (
              <ul
                className="py-1"
                role="listbox"
                aria-label="Degree suggestions"
              >
                {displayDegreeSuggestions.map(
                  (suggestion: string, index: number) => (
                    <li key={`${suggestion}-${index}`}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={index === activeDegreeIndex}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground ${
                          index === activeDegreeIndex
                            ? "bg-accent text-accent-foreground"
                            : ""
                        }`}
                        onMouseEnter={() => setActiveDegreeIndex(index)}
                        onMouseDown={(event) => event.preventDefault()}
                        ref={(element) => {
                          if (index === activeDegreeIndex && element) {
                            element.scrollIntoView({ block: "nearest" });
                          }
                        }}
                        onClick={() => {
                          if (index === 0) {
                            onChange(degreeQuery);
                          } else {
                            onChange(suggestion);
                          }
                          closeSuggestions();
                        }}
                      >
                        {suggestion}
                      </button>
                    </li>
                  )
                )}
              </ul>
            )}
          </div>
        )}
      </div>
      {helperText && (
        <div className="text-sm text-muted-foreground">{helperText}</div>
      )}
    </div>
  );
}
