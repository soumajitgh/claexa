import React, { useState, useEffect, useRef, useCallback } from "react";
import { SearchIcon, Loader2, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { datamuseService } from "@/api/datamuse";
import { cn } from "@/lib/utils";

interface DatamuseMultiAutocompleteInputProps {
  value: string[];
  onValueChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  maxSuggestions?: number;
  debounceMs?: number;
  minQueryLength?: number;
  allowCustomValues?: boolean;
  onCustomValueAdd?: (value: string) => void;
  emptyText?: string;
}

export function DatamuseMultiAutocompleteInput({
  value = [],
  onValueChange,
  placeholder = "Search and add items...",
  className,
  disabled = false,
  maxSuggestions = 8,
  debounceMs = 300,
  minQueryLength = 1,
  allowCustomValues = false,
  onCustomValueAdd,
  emptyText = "No suggestions found",
}: DatamuseMultiAutocompleteInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounced search function
  const debouncedSearch = useCallback(
    (query: string) => {
      const timeoutId = setTimeout(async () => {
        if (query.trim().length < minQueryLength) {
          setSuggestions([]);
          setIsLoading(false);
          return;
        }

        setIsLoading(true);

        // Cancel previous request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        // Create new abort controller
        abortControllerRef.current = new AbortController();

        try {
          const results = await datamuseService.suggest(
            query,
            maxSuggestions,
            abortControllerRef.current.signal
          );

          // Filter out already selected values
          const filteredResults = results.filter(
            (result) => !value.includes(result)
          );
          setSuggestions(filteredResults);
        } catch (error) {
          if (error instanceof Error && error.name !== "AbortError") {
            console.error("Datamuse API error:", error);
            setSuggestions([]);
          }
        } finally {
          setIsLoading(false);
        }
      }, debounceMs);

      return () => clearTimeout(timeoutId);
    },
    [maxSuggestions, debounceMs, minQueryLength, value]
  );

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    if (newValue.trim().length >= minQueryLength) {
      setIsOpen(true);
      debouncedSearch(newValue);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
    setSelectedIndex(-1);
  };

  // Add value to selection
  const addValue = useCallback(
    (newValue: string) => {
      const trimmedValue = newValue.trim();
      if (trimmedValue && !value.includes(trimmedValue)) {
        onValueChange([...value, trimmedValue]);
        setInputValue("");
        setIsOpen(false);
        setSuggestions([]);
        setSelectedIndex(-1);
      }
    },
    [value, onValueChange]
  );

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: string) => {
    addValue(suggestion);
  };

  // Handle custom value addition
  const handleAddCustomValue = () => {
    if (inputValue.trim() && allowCustomValues) {
      addValue(inputValue);
      onCustomValueAdd?.(inputValue);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      !isOpen &&
      inputValue.trim() &&
      e.key === "Enter" &&
      allowCustomValues
    ) {
      e.preventDefault();
      handleAddCustomValue();
      return;
    }

    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        } else if (inputValue.trim() && allowCustomValues) {
          handleAddCustomValue();
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <div className={cn("space-y-2", className)}>
      {/* Input with suggestions */}
      <div className="relative">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) {
                setIsOpen(true);
              }
            }}
            placeholder={placeholder}
            disabled={disabled}
            className="pl-10 pr-10"
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Suggestions dropdown */}
        {isOpen &&
          (suggestions.length > 0 ||
            (inputValue.trim() && allowCustomValues)) && (
            <div
              ref={suggestionsRef}
              className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md"
            >
              <div className="max-h-60 overflow-auto">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={suggestion}
                    type="button"
                    className={cn(
                      "w-full px-4 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                      "first:rounded-t-md last:rounded-b-md",
                      selectedIndex === index &&
                        "bg-accent text-accent-foreground"
                    )}
                    onClick={() => handleSuggestionSelect(suggestion)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="flex items-center gap-2">
                      <SearchIcon className="h-3 w-3 text-muted-foreground" />
                      <span>{suggestion}</span>
                    </div>
                  </button>
                ))}

                {/* Custom value option */}
                {inputValue.trim() &&
                  allowCustomValues &&
                  !suggestions.includes(inputValue.trim()) && (
                    <button
                      type="button"
                      className={cn(
                        "w-full px-4 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
                        "border-t first:rounded-t-md last:rounded-b-md",
                        selectedIndex === suggestions.length &&
                          "bg-accent text-accent-foreground"
                      )}
                      onClick={handleAddCustomValue}
                      onMouseEnter={() => setSelectedIndex(suggestions.length)}
                    >
                      <div className="flex items-center gap-2">
                        <Plus className="h-3 w-3 text-muted-foreground" />
                        <span>Add "{inputValue.trim()}"</span>
                      </div>
                    </button>
                  )}
              </div>
            </div>
          )}

        {/* No results message */}
        {isOpen &&
          !isLoading &&
          suggestions.length === 0 &&
          inputValue.trim().length >= minQueryLength &&
          !allowCustomValues && (
            <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md">
              <div className="px-4 py-3 text-center text-sm text-muted-foreground">
                {emptyText}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}

export default DatamuseMultiAutocompleteInput;
