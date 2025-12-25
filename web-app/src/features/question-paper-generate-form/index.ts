// Main entry point for the Question Paper Form feature
export { default } from './QuestionPaperForm';

// Export types for external use
export type { FormData, QuestionPattern, FormStep } from './types';

// Export hooks for external use
export { useQuestionPaperForm } from './hooks/useQuestionPaperForm';

// Export individual components if needed elsewhere
export { default as FormDetailsSection } from './components/FormDetailsSection';
export { default as FormTopicsSection } from './components/FormTopicsSection';
export { default as FormQuestionsSection } from './components/FormQuestionsSection';
