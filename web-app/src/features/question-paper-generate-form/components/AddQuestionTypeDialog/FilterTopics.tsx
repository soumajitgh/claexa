import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface FilterTopicsProps {
  topics: string[];
  selectedTopics: string[];
  onTopicsChange: (selectedTopics: string[]) => void;
}

export default function FilterTopics({
  topics,
  selectedTopics,
  onTopicsChange,
}: FilterTopicsProps) {
  const handleTopicToggle = (topic: string, checked: boolean) => {
    if (checked) {
      onTopicsChange([...selectedTopics, topic]);
    } else {
      onTopicsChange(selectedTopics.filter(t => t !== topic));
    }
  };

  return (
    <div className="space-y-3">
      <Label>Filter Topics</Label>
      <div className="border rounded-lg p-4 bg-muted/20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-40 overflow-y-auto"
             style={{ scrollbarWidth: 'thin' }}
        >
          {topics.map((topic) => (
            <div key={topic} className="flex items-center space-x-2">
              <Checkbox
                id={`topic-${topic}`}
                checked={selectedTopics.includes(topic)}
                onCheckedChange={(checked) => handleTopicToggle(topic, !!checked)}
                className="flex-shrink-0"
              />
              <Label
                htmlFor={`topic-${topic}`}
                className="text-sm font-normal cursor-pointer leading-tight"
              >
                {topic}
              </Label>
            </div>
          ))}
        </div>

        {selectedTopics.length === 0 && (
          <div className="text-xs text-muted-foreground mt-3 text-center">
            No topics selected - questions will cover all topics
          </div>
        )}

        {selectedTopics.length > 0 && (
          <div className="text-xs text-muted-foreground mt-3">
            {selectedTopics.length} of {topics.length} topics selected
          </div>
        )}
      </div>
    </div>
  );
}
