import React, { useState, useEffect, useRef, useCallback } from "react";
import { SearchIcon, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { datamuseService } from "@/api/datamuse";
import { cn } from "@/lib/utils";

interface DatamuseAutocompleteProps {
  value?: string;
  onChange?: (value: string) => void;
  onSelect?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  maxSuggestions?: number;
  debounceMs?: number;
}

export function DatamuseAutocomplete({
  value = "",
  onChange,
  onSelect,
  placeholder = "Search for words...",
  className,
  disabled = false,
  maxSuggestions = 8,
  debounceMs = 300,
}: DatamuseAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
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
        if (query.trim().length === 0) {
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
          setSuggestions(results);
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
    [maxSuggestions, debounceMs]
  );

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange?.(newValue);

    if (newValue.trim().length > 0) {
      setIsOpen(true);
      debouncedSearch(newValue);
    } else {
      setSuggestions([]);
      setIsOpen(false);
    }
    setSelectedIndex(-1);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: string) => {
    setInputValue(suggestion);
    onChange?.(suggestion);
    onSelect?.(suggestion);
    setIsOpen(false);
    setSuggestions([]);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
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

  // Update input value when value prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <div className={cn("relative w-full", className)}>
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
      {isOpen && suggestions.length > 0 && (
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
                  selectedIndex === index && "bg-accent text-accent-foreground"
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
          </div>
        </div>
      )}

      {/* No results message */}
      {isOpen &&
        !isLoading &&
        suggestions.length === 0 &&
        inputValue.trim().length > 0 && (
          <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md">
            <div className="px-4 py-3 text-center text-sm text-muted-foreground">
              No suggestions found
            </div>
          </div>
        )}
    </div>
  );
}

export default DatamuseAutocomplete;
