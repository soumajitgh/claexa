import { useEffect, useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { useFuzzyTypeahead } from "@/hooks/useFuzzyTypeahead";

import SUBJECTS_LIST from "../subjects.json";

const FUZZY_OPTIONS = {
  threshold: 0.35,
  limit: 5, // Top 5 suggestions
};

export type SubjectInputProps = {
  placeholder?: string;
  helperText?: string;
  value: string;
  onChange: (value: string) => void;
};

export default function SubjectInput({
  placeholder = "e.g., Computer Science",
  helperText = "",
  value,
  onChange,
}: SubjectInputProps) {
  const subjectQuery = value.trim();
  const {
    suggestions: subjectSuggestions,
    isOpen: isSubjectOpen,
    setIsOpen: setIsSubjectOpen,
    activeIndex: activeSubjectIndex,
    setActiveIndex: setActiveSubjectIndex,
  } = useFuzzyTypeahead(SUBJECTS_LIST, subjectQuery, FUZZY_OPTIONS);

  const [hasNavigatedSubject, setHasNavigatedSubject] = useState(false);

  const lowerSubject = subjectQuery.toLowerCase();
  const filteredSubjectSuggestions = useMemo(
    () =>
      subjectSuggestions.filter(
        (suggestion: string) => suggestion.toLowerCase() !== lowerSubject
      ),
    [subjectSuggestions, lowerSubject]
  );

  // Always show user's typed value as first option, followed by top 5 matches
  const displaySubjectSuggestions = subjectQuery
    ? [subjectQuery, ...filteredSubjectSuggestions]
    : subjectSuggestions;

  useEffect(() => {
    if (isSubjectOpen && displaySubjectSuggestions.length > 0) {
      setActiveSubjectIndex(0);
    }
  }, [displaySubjectSuggestions.length, isSubjectOpen, setActiveSubjectIndex]);

  const closeSuggestions = () => {
    setIsSubjectOpen(false);
    setHasNavigatedSubject(false);
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          placeholder={placeholder}
          value={value}
          onFocus={() => setIsSubjectOpen(!!subjectQuery)}
          onChange={(event) => {
            const nextValue = event.target.value;
            onChange(nextValue);
            setIsSubjectOpen(!!nextValue.trim());
            setHasNavigatedSubject(false);
          }}
          onKeyDown={(event) => {
            const total = displaySubjectSuggestions.length;

            if (event.key === "ArrowDown" && isSubjectOpen && total > 0) {
              event.preventDefault();
              setActiveSubjectIndex((prev) => (prev + 1) % total);
              setHasNavigatedSubject(true);
            } else if (event.key === "ArrowUp" && isSubjectOpen && total > 0) {
              event.preventDefault();
              setActiveSubjectIndex((prev) => (prev - 1 + total) % total);
              setHasNavigatedSubject(true);
            } else if (event.key === "Enter") {
              if (!subjectQuery) return;

              event.preventDefault();
              if (isSubjectOpen && total > 0 && hasNavigatedSubject) {
                if (activeSubjectIndex === 0) {
                  onChange(subjectQuery);
                } else {
                  const picked = displaySubjectSuggestions[activeSubjectIndex];
                  if (picked) {
                    onChange(picked);
                  }
                }
              } else {
                onChange(subjectQuery);
              }

              closeSuggestions();
            } else if (event.key === "Escape" || event.key === "Tab") {
              closeSuggestions();
            }
          }}
        />
        {isSubjectOpen && subjectQuery && (
          <div className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-md border bg-background shadow-md">
            {displaySubjectSuggestions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No subjects found.
              </div>
            ) : (
              <ul
                className="py-1"
                role="listbox"
                aria-label="Subject suggestions"
              >
                {displaySubjectSuggestions.map(
                  (suggestion: string, index: number) => (
                    <li key={`${suggestion}-${index}`}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={index === activeSubjectIndex}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground ${
                          index === activeSubjectIndex
                            ? "bg-accent text-accent-foreground"
                            : ""
                        }`}
                        onMouseEnter={() => setActiveSubjectIndex(index)}
                        onMouseDown={(event) => event.preventDefault()}
                        ref={(element) => {
                          if (index === activeSubjectIndex && element) {
                            element.scrollIntoView({ block: "nearest" });
                          }
                        }}
                        onClick={() => {
                          if (index === 0) {
                            onChange(subjectQuery);
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
