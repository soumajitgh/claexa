import { useCallback } from 'react';
import { Edit, Trash2, Settings, Plus } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import { QuestionPattern } from '../types';

interface QuestionPatternsListProps {
  patterns: QuestionPattern[];
  onEditPattern: (pattern: QuestionPattern) => void;
  onDeletePattern: (patternId: string) => void;
  onAddPattern: () => void;
}

export default function QuestionPatternsList({
  patterns,
  onEditPattern,
  onDeletePattern,
  onAddPattern,
}: QuestionPatternsListProps) {
  const handleEdit = useCallback((pattern: QuestionPattern) => {
    onEditPattern(pattern);
  }, [onEditPattern]);

  const handleDelete = useCallback((patternId: string) => {
    onDeletePattern(patternId);
  }, [onDeletePattern]);

  if (patterns.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 border-4 border-dashed rounded-lg border-muted-foreground/20">
        <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p className="text-lg font-medium mb-2">No question types defined yet</p>
        <p className="text-sm text-muted-foreground mb-4">
          Add question types to structure your paper
        </p>
        <Button onClick={onAddPattern} variant="default">
          <Plus className="h-4 w-4 mr-2" />
          Add Question Pattern
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-foreground">
        Question Patterns ({patterns.length})
      </div>
      <div className="space-y-3">
        {patterns.map((pattern) => (
          <Card key={pattern.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-medium">{pattern.type}</h4>
                  <Badge variant="outline">
                    {pattern.count} × {pattern.marksEach} marks
                  </Badge>
                  <Badge
                    variant={
                      pattern.difficulty === 'hard' || pattern.difficulty === 'very-hard'
                        ? 'destructive'
                        : pattern.difficulty === 'medium'
                        ? 'default'
                        : 'secondary'
                    }
                  >
                    {pattern.difficulty === 'very-easy' ? 'Very Easy' :
                     pattern.difficulty === 'very-hard' ? 'Very Hard' :
                     pattern.difficulty.charAt(0).toUpperCase() + pattern.difficulty.slice(1)}
                  </Badge>
                  {pattern.imageRequired && (
                    <Badge variant="secondary">Images</Badge>
                  )}
                </div>

                <div className="text-sm text-muted-foreground flex gap-4">
                  {pattern.targetTopic && (
                    <span>Topic: {pattern.targetTopic}</span>
                  )}
                  {pattern.bloomLevel && (
                    <span>Bloom's Level: {pattern.bloomLevel}</span>
                  )}
                  <span>Total: {pattern.count * pattern.marksEach} marks</span>
                </div>

                {pattern.subQuestions && pattern.subQuestions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Sub-questions
                    </div>
                    <div className="space-y-1">
                      {pattern.subQuestions.map((sub, subIndex) => (
                        <div
                          key={`${pattern.id}-sub-${subIndex}`}
                          className="flex items-center justify-between rounded-md border bg-muted/30 px-3 py-2 text-xs"
                        >
                          <span className="font-medium text-foreground">{sub.type}</span>
                          <span className="text-muted-foreground">
                            {sub.count} × {sub.marksEach} marks
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(pattern)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(pattern.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {/* Persistent add button (especially for mobile view) */}
      <div className="pt-2">
        <Button onClick={onAddPattern} variant="outline" size="sm" className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" /> Add Question Pattern
        </Button>
      </div>
    </div>
  );
}
