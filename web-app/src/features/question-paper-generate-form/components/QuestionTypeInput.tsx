import { useEffect, useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { useFuzzyTypeahead } from "@/hooks/useFuzzyTypeahead";

import { QUESTION_TYPES, TYPEAHEAD_DEFAULTS } from "../constants";

export type QuestionTypeInputProps = {
  placeholder?: string;
  helperText?: string;
  value: string;
  onChange: (value: string) => void;
  options?: string[];
};

export default function QuestionTypeInput({
  placeholder = "e.g., Fill in the Blank Question",
  helperText = "Type the question format",
  value,
  onChange,
  options = QUESTION_TYPES,
}: QuestionTypeInputProps) {
  const typeQuery = value.trim();
  const {
    suggestions: typeSuggestions,
    isOpen: isTypeOpen,
    setIsOpen: setIsTypeOpen,
    activeIndex: activeTypeIndex,
    setActiveIndex: setActiveTypeIndex,
  } = useFuzzyTypeahead(options, typeQuery, TYPEAHEAD_DEFAULTS);

  const [hasNavigatedType, setHasNavigatedType] = useState(false);

  const lowerType = typeQuery.toLowerCase();
  const filteredTypeSuggestions = useMemo(
    () =>
      typeSuggestions.filter(
        (suggestion: string) => suggestion.toLowerCase() !== lowerType
      ),
    [typeSuggestions, lowerType]
  );

  const displayTypeSuggestions = typeQuery
    ? [typeQuery, ...filteredTypeSuggestions]
    : typeSuggestions;

  useEffect(() => {
    if (isTypeOpen && displayTypeSuggestions.length > 0) {
      setActiveTypeIndex(0);
    }
  }, [displayTypeSuggestions.length, isTypeOpen, setActiveTypeIndex]);

  const closeSuggestions = () => {
    setIsTypeOpen(false);
    setHasNavigatedType(false);
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          placeholder={placeholder}
          value={value}
          onFocus={() => setIsTypeOpen(!!typeQuery)}
          onChange={(event) => {
            const nextValue = event.target.value;
            onChange(nextValue);
            setIsTypeOpen(!!nextValue.trim());
            setHasNavigatedType(false);
          }}
          onKeyDown={(event) => {
            const total = displayTypeSuggestions.length;

            if (event.key === "ArrowDown" && isTypeOpen && total > 0) {
              event.preventDefault();
              setActiveTypeIndex((prev) => (prev + 1) % total);
              setHasNavigatedType(true);
            } else if (event.key === "ArrowUp" && isTypeOpen && total > 0) {
              event.preventDefault();
              setActiveTypeIndex((prev) => (prev - 1 + total) % total);
              setHasNavigatedType(true);
            } else if (event.key === "Enter") {
              if (!typeQuery) return;

              event.preventDefault();
              if (isTypeOpen && total > 0 && hasNavigatedType) {
                if (activeTypeIndex === 0) {
                  onChange(typeQuery);
                } else {
                  const picked = displayTypeSuggestions[activeTypeIndex];
                  if (picked) {
                    onChange(picked);
                  }
                }
              } else {
                onChange(typeQuery);
              }

              closeSuggestions();
            } else if (event.key === "Escape" || event.key === "Tab") {
              closeSuggestions();
            }
          }}
        />
        {isTypeOpen && typeQuery && (
          <div className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-md border bg-background shadow-md">
            {displayTypeSuggestions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No types found.
              </div>
            ) : (
              <ul
                className="py-1"
                role="listbox"
                aria-label="Question type suggestions"
              >
                {displayTypeSuggestions.map(
                  (suggestion: string, index: number) => (
                    <li key={`${suggestion}-${index}`}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={index === activeTypeIndex}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground ${
                          index === activeTypeIndex
                            ? "bg-accent text-accent-foreground"
                            : ""
                        }`}
                        onMouseEnter={() => setActiveTypeIndex(index)}
                        onMouseDown={(event) => event.preventDefault()}
                        ref={(element) => {
                          if (index === activeTypeIndex && element) {
                            element.scrollIntoView({ block: "nearest" });
                          }
                        }}
                        onClick={() => {
                          if (index === 0) {
                            onChange(typeQuery);
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
