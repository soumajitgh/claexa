import { useCallback, useMemo } from "react";
import { X, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DatamuseMultiAutocompleteInput } from "@/features/common/DatamuseMultiAutocompleteInput";

import { FormData } from "../types";

interface FormTopicsSectionProps {
  data: Partial<FormData>;
  onUpdate: (updates: Partial<FormData>) => void;
}

export default function FormTopicsSection({
  data,
  onUpdate,
}: FormTopicsSectionProps) {
  const topics = useMemo(() => data.topics || [], [data.topics]);

  const handleTopicsChange = useCallback(
    (newTopics: string[]) => {
      onUpdate({ topics: newTopics });
    },
    [onUpdate]
  );

  const removeTopic = useCallback(
    (topicToRemove: string) => {
      onUpdate({ topics: topics.filter((topic) => topic !== topicToRemove) });
    },
    [topics, onUpdate]
  );

  return (
    <div className="">
      <div className="">
        <div className="space-y-4">
          <Label>Add Topics</Label>

          <DatamuseMultiAutocompleteInput
            value={topics}
            onValueChange={handleTopicsChange}
            placeholder="e.g., Algebra, Trigonometry"
            allowCustomValues={true}
            onCustomValueAdd={(value) => {
              console.log("Custom topic added:", value);
            }}
            maxSuggestions={8}
            minQueryLength={2}
            debounceMs={300}
            emptyText="No topics found. Start typing to add a new one."
          />

          {/* Topics Display with individual remove buttons */}
          {topics.length > 0 && (
            <div className="space-y-3">
              <Label>Selected Topics</Label>
              <div className="flex flex-wrap gap-2 border rounded-lg p-4 bg-muted/20">
                {topics.map((topic) => (
                  <Badge key={topic} variant="secondary" className="px-3 py-1">
                    {topic}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-auto p-0 text-muted-foreground hover:text-destructive"
                      onClick={() => removeTopic(topic)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {topics.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No topics added yet</p>
              <p className="text-xs text-muted-foreground">
                Add topics to structure your question paper
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
